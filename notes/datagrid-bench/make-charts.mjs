// Generates the three benchmark charts for the DataGrid deep-dive post.
// Fixed dark theme matching tabularis.dev (surface #111214).
import fs from "node:fs";

const OUT = process.argv[2] ?? ".";

// palette (validated: node validate_palette.js "#3987e5,#199e70" --mode dark --surface "#111214")
const C = {
  surface: "#111214",
  border: "rgba(255,255,255,0.10)",
  grid: "#26282c",
  baseline: "#383835",
  inkPrimary: "#ffffff",
  inkSecondary: "#c3c2b7",
  inkMuted: "#898781",
  before: "#3987e5", // slot 1 (first in legend order)
  after: "#199e70", // slot 2
  budget: "#e66767",
};
const FONT = `system-ui,-apple-system,'Segoe UI',sans-serif`;

function chart({ title, subtitle, unit, groups, budget, budgetLabel, fmt, file, yMaxOverride }) {
  const W = 760, H = 400;
  const M = { top: 92, right: 24, bottom: 56, left: 64 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const allVals = groups.flatMap((g) => [g.before, g.after]);
  const yMax = yMaxOverride ?? Math.max(...allVals, budget ?? 0) * 1.12;
  const y = (v) => M.top + plotH - (v / yMax) * plotH;

  // nice ticks: 4-5 gridlines
  const rawStep = yMax / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => yMax / s <= 5.2);
  const ticks = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);

  const groupW = plotW / groups.length;
  const barW = Math.min(56, groupW / 3.2);
  const gap = 6;

  let bars = "";
  groups.forEach((g, i) => {
    const cx = M.left + groupW * i + groupW / 2;
    for (const [key, color] of [["before", C.before], ["after", C.after]]) {
      const v = g[key];
      const x = key === "before" ? cx - barW - gap / 2 : cx + gap / 2;
      const top = y(v);
      const h = Math.max(M.top + plotH - top, 2);
      const yTop = M.top + plotH - h;
      // 4px rounded data end, square baseline end
      bars += `<path d="M${x},${(M.top + plotH).toFixed(1)} L${x},${(yTop + 4).toFixed(1)} Q${x},${yTop.toFixed(1)} ${x + 4},${yTop.toFixed(1)} L${x + barW - 4},${yTop.toFixed(1)} Q${x + barW},${yTop.toFixed(1)} ${x + barW},${(yTop + 4).toFixed(1)} L${x + barW},${(M.top + plotH).toFixed(1)} Z" fill="${color}"/>`;
      bars += `<text x="${x + barW / 2}" y="${(yTop - 7).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="${C.inkPrimary}" font-family="${FONT}">${fmt(v)}</text>`;
    }
    bars += `<text x="${cx}" y="${M.top + plotH + 22}" text-anchor="middle" font-size="12.5" fill="${C.inkSecondary}" font-family="${FONT}">${g.label}</text>`;
  });

  const gridLines = ticks
    .map((v) => {
      const yy = y(v).toFixed(1);
      return `<line x1="${M.left}" x2="${W - M.right}" y1="${yy}" y2="${yy}" stroke="${v === 0 ? C.baseline : C.grid}" stroke-width="1"/>` +
        `<text x="${M.left - 10}" y="${+yy + 4}" text-anchor="end" font-size="11.5" fill="${C.inkMuted}" font-family="${FONT}" style="font-variant-numeric:tabular-nums">${v >= 1000 ? v / 1000 + "k" : +v.toFixed(2)}</text>`;
    })
    .join("");

  const budgetLine = budget
    ? `<line x1="${M.left}" x2="${W - M.right}" y1="${y(budget).toFixed(1)}" y2="${y(budget).toFixed(1)}" stroke="${C.budget}" stroke-width="1.5" stroke-dasharray="5 4"/>` +
      (budgetLabel === "right"
        ? `<text x="${W - M.right - 2}" y="${(y(budget) - 7).toFixed(1)}" text-anchor="end" font-size="11.5" fill="${C.budget}" font-family="${FONT}">16.7 ms frame budget (60 fps)</text>`
        : `<text x="${M.left + 6}" y="${(y(budget) - 7).toFixed(1)}" text-anchor="start" font-size="11.5" fill="${C.budget}" font-family="${FONT}">16.7 ms frame budget (60 fps)</text>`)
    : "";

  const legend =
    `<g font-family="${FONT}" font-size="12.5">` +
    `<rect x="${M.left}" y="58" width="11" height="11" rx="2.5" fill="${C.before}"/>` +
    `<text x="${M.left + 17}" y="68" fill="${C.inkSecondary}">before PR #287 (v0.13.1)</text>` +
    `<rect x="${M.left + 208}" y="58" width="11" height="11" rx="2.5" fill="${C.after}"/>` +
    `<text x="${M.left + 225}" y="68" fill="${C.inkSecondary}">after (v0.15.0)</text>` +
    `</g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
<rect width="${W}" height="${H}" fill="${C.surface}" rx="10"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${C.border}" rx="10"/>
<text x="${M.left}" y="30" font-size="16.5" font-weight="650" fill="${C.inkPrimary}" font-family="${FONT}">${title}</text>
<text x="${M.left}" y="48" font-size="12.5" fill="${C.inkMuted}" font-family="${FONT}">${subtitle}</text>
${legend}
${gridLines}
${budgetLine}
${bars}
<text x="${M.left}" y="${H - 14}" font-size="11" fill="${C.inkMuted}" font-family="${FONT}">${unit}</text>
</svg>`;
  fs.writeFileSync(`${OUT}/${file}`, svg);
  console.log("wrote", file);
}

const fmtMs = (v) => v.toFixed(1);
const fmtInt = (v) => v.toLocaleString("en-US");

chart({
  title: "React render duration per scroll tick",
  subtitle: "1,000-row table, median of 30 ticks × 7 runs · React Profiler, headless harness",
  unit: "Bars: milliseconds of React render work per scroll event. Lower is better.",
  groups: [
    { label: "10 columns", before: 8.4, after: 2.0 },
    { label: "30 columns", before: 29.2, after: 4.4 },
    { label: "50 columns", before: 43.9, after: 10.0 },
  ],
  fmt: fmtMs,
  file: "tabularis-datagrid-scroll-commit-time.svg",
});

chart({
  title: "formatCellValue calls per scroll tick",
  subtitle: "Calls to formatCellValue() per scroll event · same harness, exact counts",
  unit: "Bars: exact function call count. Lower is better.",
  groups: [
    { label: "10 columns", before: 1140, after: 30 },
    { label: "30 columns", before: 3420, after: 90 },
    { label: "50 columns", before: 5700, after: 150 },
  ],
  fmt: fmtInt,
  file: "tabularis-datagrid-cells-per-tick.svg",
});

chart({
  title: "Cost of one keystroke while editing a cell",
  subtitle: "Typing into the inline cell editor, median of 10 keystrokes × 7 runs",
  unit: "Bars: wall-clock milliseconds in the headless harness. Lower is better.",
  groups: [
    { label: "30 columns", before: 31.5, after: 3.7 },
    { label: "50 columns", before: 54.9, after: 4.4 },
  ],
  fmt: fmtMs,
  file: "tabularis-datagrid-typing-per-keystroke.svg",
});
