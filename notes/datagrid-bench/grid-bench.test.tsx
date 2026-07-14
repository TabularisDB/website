/**
 * DataGrid scroll/typing benchmark. Runs unchanged on both the pre-memoization
 * commit (61794dc2^) and current main. Metrics per scenario:
 *  - React render duration (Profiler actualDuration, ms)
 *  - formatCellValue calls (= cell render work actually executed)
 * Results are appended as JSON lines to the file in BENCH_OUT.
 */
import { describe, it, vi, beforeAll } from "vitest";
import * as React from "react";
import { Profiler } from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import * as fs from "node:fs";

// ---- counters ----------------------------------------------------------
let fmtCalls = 0;
let commitMs = 0;
let commits = 0;

vi.mock("../src/utils/dataGrid", async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  const orig = mod.formatCellValue as (...a: unknown[]) => unknown;
  return {
    ...mod,
    formatCellValue: (...a: unknown[]) => {
      fmtCalls++;
      return orig(...a);
    },
  };
});

// All hook mocks return IDENTITY-STABLE singletons: a fresh function per call
// (like setup.ts's react-i18next mock does) invalidates rowCtx every render and
// would make the memoized variant look as slow as the unmemoized one.
vi.mock("../src/hooks/useDatabase", () => {
  const value = { activeSchema: "public", connections: [], activeConnection: null };
  return { useDatabase: () => value };
});
vi.mock("../src/hooks/useAlert", () => {
  const value = { showAlert: () => {}, showConfirm: () => {} };
  return { useAlert: () => value };
});
vi.mock("../src/hooks/useSettings", () => {
  const value = { settings: {}, updateSettings: () => {} };
  return { useSettings: () => value };
});
vi.mock("react-i18next", () => {
  const t = (key: string) => key;
  const ret = { t, i18n: { language: "en", changeLanguage: () => {} } };
  return {
    useTranslation: () => ret,
    initReactI18next: { type: "3rdParty", init: () => {} },
  };
});
vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn(),
}));

import { DataGrid } from "../src/components/ui/DataGrid";

// ---- jsdom geometry ----------------------------------------------------
const VIEWPORT_H = 600;
const VIEWPORT_W = 1200;
const ROW_H = 35;

beforeAll(() => {
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const rect = (w: number, h: number) =>
    ({ width: w, height: h, top: 0, left: 0, bottom: h, right: w, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  Element.prototype.getBoundingClientRect = function () {
    if (this.tagName === "TR") return rect(VIEWPORT_W, ROW_H);
    if ((this as Element).classList?.contains("overflow-auto"))
      return rect(VIEWPORT_W, VIEWPORT_H);
    return rect(0, 0);
  };
  // TanStack virtual's getRect() reads offsetWidth/offsetHeight, jsdom returns 0
  const heightFor = (el: HTMLElement) =>
    el.tagName === "TR" ? ROW_H : el.classList.contains("overflow-auto") ? VIEWPORT_H : 0;
  const widthFor = (el: HTMLElement) =>
    el.tagName === "TR" || el.classList.contains("overflow-auto") ? VIEWPORT_W : 0;
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return heightFor(this);
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return widthFor(this);
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return heightFor(this);
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return widthFor(this);
    },
  });
});

// ---- deterministic data ------------------------------------------------
const dataCache = new Map<string, { columns: string[]; data: unknown[][] }>();
function makeData(rows: number, cols: number) {
  const cached = dataCache.get(`${rows}x${cols}`);
  if (cached) return cached;
  const columns = ["id", ...Array.from({ length: cols - 1 }, (_, i) => `col_${i + 1}`)];
  const data: unknown[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: unknown[] = [r + 1];
    for (let c = 1; c < cols; c++) {
      // mix of types like a real wide table
      row.push(c % 4 === 0 ? r * c : c % 4 === 1 ? `value_${r}_${c}` : c % 4 === 2 ? (r + c) / 7 : `text field ${r % 97}`);
    }
    data.push(row);
  }
  const result = { columns, data };
  dataCache.set(`${rows}x${cols}`, result);
  return result;
}

const out: Record<string, unknown>[] = [];
const OUT_FILE = process.env.BENCH_OUT ?? "/tmp/grid-bench-results.jsonl";
const VARIANT = process.env.BENCH_VARIANT ?? "unknown";

function resetCounters() {
  fmtCalls = 0;
  commitMs = 0;
  commits = 0;
}

function onRender(
  _id: string,
  _phase: string,
  actualDuration: number,
) {
  commitMs += actualDuration;
  commits++;
}

function mountGrid(rows: number, cols: number) {
  const { columns, data } = makeData(rows, cols);
  const props: Record<string, unknown> = {
    columns,
    data,
    tableName: "bench_table",
    // old build wants pkColumn, new build wants pkColumns; each ignores the other
    pkColumn: "id",
    pkColumns: ["id"],
    connectionId: "bench-conn",
  };
  const utils = render(
    <Profiler id="grid" onRender={onRender}>
      {React.createElement(DataGrid as unknown as React.ComponentType<Record<string, unknown>>, props)}
    </Profiler>,
  );
  const scroller = utils.container.querySelector(".overflow-auto") as HTMLElement;
  return { ...utils, scroller };
}

function record(scenario: string, rows: number, cols: number, extra: Record<string, unknown>) {
  out.push({ variant: VARIANT, scenario, rows, cols, ...extra });
}

// median over runs
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const RUNS = 7;
const SCROLL_TICKS = 30;
const TICK_PX = 105; // 3 rows per tick

describe(`DataGrid bench [${VARIANT}]`, () => {
  it("mount cost by table size", { timeout: 180000 }, () => {
    for (const [rows, cols] of [
      [1_000, 30],
      [10_000, 30],
      [100_000, 30],
      [1_000, 50],
    ] as const) {
      const durs: number[] = [];
      const calls: number[] = [];
      for (let i = 0; i < 3; i++) {
        resetCounters();
        const t0 = performance.now();
        const { unmount } = mountGrid(rows, cols);
        const wall = performance.now() - t0;
        durs.push(wall);
        calls.push(fmtCalls);
        unmount();
        cleanup();
      }
      record("mount", rows, cols, {
        wallMsMedian: +median(durs).toFixed(2),
        fmtCallsMedian: median(calls),
      });
    }
  });

  it("scroll ticks", { timeout: 180000 }, () => {
    for (const [rows, cols] of [
      [1_000, 10],
      [1_000, 30],
      [1_000, 50],
    ] as const) {
      const perTickMs: number[] = [];
      const perTickCalls: number[] = [];
      const perTickCommitMs: number[] = [];
      for (let run = 0; run < RUNS; run++) {
        const { scroller, unmount } = mountGrid(rows, cols);
        // warmup tick
        act(() => {
          scroller.scrollTop = 1;
          fireEvent.scroll(scroller);
        });
        const tickMs: number[] = [];
        const tickCalls: number[] = [];
        const tickCommitMs: number[] = [];
        for (let tick = 1; tick <= SCROLL_TICKS; tick++) {
          resetCounters();
          const t0 = performance.now();
          act(() => {
            scroller.scrollTop = tick * TICK_PX;
            fireEvent.scroll(scroller);
          });
          tickMs.push(performance.now() - t0);
          tickCalls.push(fmtCalls);
          tickCommitMs.push(commitMs);
        }
        perTickCommitMs.push(median(tickCommitMs));
        perTickMs.push(median(tickMs));
        perTickCalls.push(median(tickCalls));
        unmount();
        cleanup();
      }
      record("scroll", rows, cols, {
        perTickWallMsMedian: +median(perTickMs).toFixed(3),
        perTickCommitMsMedian: +median(perTickCommitMs).toFixed(3),
        perTickFmtCallsMedian: median(perTickCalls),
        ticks: SCROLL_TICKS,
      });
    }
  });

  it("typing in an editing cell", { timeout: 180000 }, () => {
    for (const [rows, cols] of [[1_000, 30], [1_000, 50]] as const) {
      const perKeyMs: number[] = [];
      const perKeyCalls: number[] = [];
      for (let run = 0; run < RUNS; run++) {
        const { container, scroller, unmount } = mountGrid(rows, cols);
        act(() => {
          scroller.scrollTop = 1;
          fireEvent.scroll(scroller);
        });
        // second data cell of the first rendered row (skip the # cell)
        const td = container.querySelector("tbody tr td:nth-child(3)") as HTMLElement;
        act(() => {
          fireEvent.doubleClick(td);
        });
        const input = container.querySelector("tbody input, tbody textarea") as HTMLInputElement | null;
        if (!input) {
          const rowHtml = container.querySelector("tbody tr")?.outerHTML?.slice(0, 600);
          record("typing", rows, cols, { error: "no input after doubleclick", rowHtml });
          unmount();
          cleanup();
          break;
        }
        const keyMs: number[] = [];
        const keyCalls: number[] = [];
        for (let k = 0; k < 10; k++) {
          resetCounters();
          const t0 = performance.now();
          act(() => {
            fireEvent.change(input, { target: { value: `edited_${k}` } });
          });
          keyMs.push(performance.now() - t0);
          keyCalls.push(fmtCalls);
        }
        perKeyMs.push(median(keyMs));
        perKeyCalls.push(median(keyCalls));
        unmount();
        cleanup();
      }
      if (perKeyMs.length)
        record("typing", rows, cols, {
          perKeyWallMsMedian: +median(perKeyMs).toFixed(3),
          perKeyFmtCallsMedian: median(perKeyCalls),
        });
    }
  });

  it("flush results", () => {
    fs.appendFileSync(OUT_FILE, out.map((o) => JSON.stringify(o)).join("\n") + "\n");
  });
});
