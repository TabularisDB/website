---
title: "Optimizing a Virtualized React Grid: 3,420 Formatter Calls Down to 90"
date: "2026-07-14T17:43:00"
authors: ["debba"]
tags: ["react", "performance", "data-grid", "frontend", "deep-dive"]
excerpt: "The Tabularis data grid was already virtualized, but wide tables still took 29 ms of React render work per scroll tick. The bottleneck was the visible rows, not the total row count."
og:
  template: "code-terminal"
  title: "Optimizing a virtualized React grid"
  accent: "3,420 calls down to 90."
  claim: "The grid mounted only 28 rows, then re-rendered every visible cell and called the formatter three times per cell on every scroll tick."
  image: "/img/tabularis-sql-editor-data-grid.png"
  codeTitle: "tabularis · DataGridRow.tsx"
  codeLines:
    - '// one memo boundary per row'
    - ''
    - 'const rowCtx = useMemo(() => ({'
    - '  columns, pkColumns, handlers,'
    - '}), [/* stable deps only */]);'
    - ''
    - '<MemoRow ctx={rowCtx} … />'
---

# Optimizing a Virtualized React Grid: 3,420 Formatter Calls Down to 90

Our React data grid was already virtualized, but it still stuttered on wide tables. In a headless benchmark, a 30-column table took 29.2 ms of React render work on each scroll tick. After the fix, the same test took 4.4 ms.

The problem was not the 1,000 rows in the result set. It was the 38 rows in the virtual window. Every scroll update rendered all of them again, including cells that had not moved.

I fixed this in June for [v0.13.2](/blog/v0132-managed-notebooks-live-query-progress-faster-grid), initially based on the very scientific observation that it felt smoother. For this post I went back, ran the old and new code through the same benchmark, and published the [harness](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/grid-bench.test.tsx) and [raw results](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/results.jsonl).

The short version: at 30 columns, the old grid called `formatCellValue` 3,420 times per tick. After [PR #287](https://github.com/TabularisDB/tabularis/pull/287), the same tick calls it 90 times.

## Virtualized, and still janky

The Tabularis results grid has used [TanStack Virtual](https://tanstack.com/virtual) since its early versions. With a 600px-tall viewport, 35px rows, and overscan, the DOM holds roughly 28 rows at rest, whether the result set has 500 rows or 100,000. Total row count was not the source of the scrolling problem, and this fix did not change the windowing strategy.

The problem showed up on *wide* tables. A few hundred rows and 30 to 40 columns is a normal shape for a denormalized reporting table, and scrolling visibly dropped frames. That was confusing at first because "virtualize your list" is the standard answer to slow grids, and we had already done it.

Virtualization limits how much UI exists at once. It does not make the visible subtree cheap. We had bounded the number of rows, but the work per visible row was still too high.

## Where the work was going

The old [`DataGrid.tsx`](https://github.com/TabularisDB/tabularis/blob/7def318b8de70fdb365e5032da4ae94359749070/src/components/ui/DataGrid.tsx#L1203-L1228) rendered rows inline, right inside the component body:

```tsx
{rowVirtualizer.getVirtualItems().map((virtualRow) => {
  // ~560 lines of row and cell JSX, inline in DataGrid
})}
```

Scrolling updates the virtualizer, the virtualizer re-renders `DataGrid`, and because the row JSX is inline, re-rendering `DataGrid` re-executes the render of every visible row and cell. There was no memo boundary anywhere between "the scroll offset changed" and "re-run the JSX for cell 37 of row 214, which did not change."

There was more work inside each cell. The old code reached `formatCellValue`, which turns a raw database value into display text, through three call sites per normal cell render:

1. the TanStack Table [`cell:` renderer](https://github.com/TabularisDB/tabularis/blob/7def318b8de70fdb365e5032da4ae94359749070/src/components/ui/DataGrid.tsx#L701-L720),
2. the [`title` attribute](https://github.com/TabularisDB/tabularis/blob/7def318b8de70fdb365e5032da4ae94359749070/src/components/ui/DataGrid.tsx#L1369-L1381) used for the hover preview,
3. the [main display path](https://github.com/TabularisDB/tabularis/blob/7def318b8de70fdb365e5032da4ae94359749070/src/components/ui/DataGrid.tsx#L1509-L1515), which eventually called the column renderer again.

I originally described this as three direct calls in the row loop. That was imprecise. Two calls were explicit in the row loop; the third came through `flexRender` and the column renderer. The benchmark sees all three because it wraps `formatCellValue` itself. The duplication accumulated across separate features, and each call site looked reasonable in isolation.

There was another cost too. Every row carried [`data-index` and `ref={rowVirtualizer.measureElement}`](https://github.com/TabularisDB/tabularis/blob/7def318b8de70fdb365e5032da4ae94359749070/src/components/ui/DataGrid.tsx#L1224-L1229), asking the virtualizer to measure rows dynamically even though normal data rows have a fixed 35px height. `MiniResultGrid`, the smaller grid in the visual query builder, already used fixed sizes.

## The fix is one memo boundary

The main change in [PR #287](https://github.com/TabularisDB/tabularis/pull/287) was conceptually small: extract the row into [`DataGridRow.tsx`](https://github.com/TabularisDB/tabularis/blob/61794dc21f6618f9e8a1fa9687f445423ba38a00/src/components/ui/DataGridRow.tsx) and make `React.memo` actually hold. You can read the [GitHub diff](https://github.com/TabularisDB/tabularis/compare/7def318b8de70fdb365e5032da4ae94359749070...61794dc21f6618f9e8a1fa9687f445423ba38a00) or the [raw `.diff`](https://github.com/TabularisDB/tabularis/commit/61794dc21f6618f9e8a1fa9687f445423ba38a00.diff).

```tsx
export const MemoRow = React.memo(function MemoRow(rowCtx: MemoRowProps) {
  // renders one <tr>
});
```

The second half of that sentence is the difficult part. `React.memo` with the default shallow comparison is only as good as the identity of the props you pass. A row needs column metadata, pending edits, handlers, foreign keys, and a translation function. If any one of those props gets a new identity on every parent render, the memo silently does nothing and you are back to rendering everything.

So the props are split by volatility.

Everything that is stable *for the whole grid* goes into one object, memoized once in `DataGrid`:

```tsx
/**
 * Stable, per-grid dependencies shared by every row. Bundled into a single
 * object that is memoized in DataGrid so React.memo's default shallow compare
 * on MemoRow only sees a new `ctx` reference when one of these actually changes.
 */
const rowCtx: RowCtx = useMemo(
  () => ({ columns, pkColumns, pendingChanges, columnTypeMap, /* … */ }),
  [columns, pkColumns, pendingChanges, columnTypeMap, /* … */],
);
```

Everything that varies *per row* is computed in the parent's `.map` and passed as primitives:

```tsx
<MemoRow
  ctx={rowCtx}
  rowIndex={rowIndex}
  isSelected={isSelected}
  isPendingDelete={isPendingDelete}
  editingColIndex={isRowEditing ? editingCell!.colIndex : null}
  focusedColIndex={isRowFocused ? focusedCell!.colIndex : null}
/>
```

The primitive part matters more than it looks. The obvious thing to do is pass `editingCell`, the `{rowIndex, colIndex, value}` object from state, straight down. But that object gets a new identity on every keystroke, and shallow compare would then invalidate *every* row, not just the one being edited. Passing `editingColIndex` as a number means row 214 receives `null` before the keystroke and `null` after it, so the memo holds. The row selection set and pending-deletion map stay out of `rowCtx` for the same reason: they change identity when one row changes, so each row instead receives its own `isSelected` and `isPendingDelete` booleans. The [actual `MemoRow` call site](https://github.com/TabularisDB/tabularis/blob/61794dc21f6618f9e8a1fa9687f445423ba38a00/src/components/ui/DataGrid.tsx#L1320-L1335) shows the full prop split.

Handlers needed one more trick. `handleEditCommit` and `handleKeyDown` read the current editing state. Putting `editingCell` in their `useCallback` dependencies would give them a new identity per keystroke and invalidate `rowCtx`, which contains them. I used a ref:

```tsx
// Mirror of editingCell so the commit/keydown callbacks can read the latest
// value without listing editingCell in their deps; this keeps their identity
// stable so the memoized rows don't re-render on every keystroke/scroll.
const editingCellRef = useRef(editingCell);
useEffect(() => {
  editingCellRef.current = editingCell;
}, [editingCell]);
```

The callbacks read `editingCellRef.current` and keep a stable identity for the life of the grid.

While the row render was being extracted, the three formatter paths collapsed into [one call per cell](https://github.com/TabularisDB/tabularis/blob/61794dc21f6618f9e8a1fa9687f445423ba38a00/src/components/ui/DataGridRow.tsx#L306-L313). Dynamic measurement also went away: the data `<tr>` gets `style={{ height: 35 }}`, `measureElement` and `data-index` are gone, and the virtualizer keeps its [`estimateSize: () => 35`](https://github.com/TabularisDB/tabularis/blob/61794dc21f6618f9e8a1fa9687f445423ba38a00/src/components/ui/DataGrid.tsx#L799-L804).

:::newsletter:::

## Proving it, not vibing it

At the time, I verified this the way most frontend performance work gets verified: opened a wide table, scrolled, said "yeah, that's better." For this post I wanted actual numbers, so I built the benchmark I should have built in June.

The setup uses a git worktree pinned to [`7def318b`](https://github.com/TabularisDB/tabularis/commit/7def318b8de70fdb365e5032da4ae94359749070), the commit immediately before the memoization change, and another worktree on `main` at v0.15.0. Both run the [same Vitest file](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/grid-bench.test.tsx). The harness renders the real `DataGrid`, TanStack virtualizer, and cell components in jsdom, wraps the grid in a React `<Profiler>`, then drives it with synthetic scroll events and keystrokes.

`main` has picked up smaller grid changes since the original fix, including [precomputed result-color classes](https://github.com/TabularisDB/tabularis/commit/f664cd8c31aa9441c6922883e942bd27c4a064c4). The after numbers therefore describe v0.15.0, not commit `61794dc2` in isolation. For the original code change, use the [before/after diff](https://github.com/TabularisDB/tabularis/compare/7def318b8de70fdb365e5032da4ae94359749070...61794dc21f6618f9e8a1fa9687f445423ba38a00).

The harness records two metrics:

- **React render duration** per scroll tick, from the Profiler's `actualDuration`. I called this "commit time" in the first draft, but that was wrong. React documents it as the time spent rendering the committed update, not the duration of the commit phase.
- **Calls to `formatCellValue`** per tick, counted by wrapping the real function. In the new code this equals the number of rendered cells because each cell calls it once. In the old code each normally displayed cell called it three times, so this metric is an exact call count, not a direct cell-render count.

Both sides run React 19.2.4 on the same machine and Node version. The figures are medians over 7 runs of 30 scroll ticks each. Every tick scrolls 105px, or three rows.

There are important limits. jsdom has no real layout, paint, or GPU. The Profiler figures measure React render work, not browser frame time, style recalculation, or compositing. The dynamic-measurement change is therefore not represented faithfully by this harness. The test also uses React's development build, so the absolute timings should not be read as production timings. Both variants run in the same environment, which makes the comparison useful, but this is still a bundled before/after benchmark. It does not isolate how many milliseconds came from row memoization, formatter deduplication, fixed row height, or the smaller changes added after PR #287.

Getting jsdom to virtualize at all took some digging. TanStack Virtual measures the scroll container via `offsetWidth` and `offsetHeight`, which jsdom reports as zero, so the virtualizer rendered no rows. The harness stubs those getters with a 1200 by 600px viewport and 35px rows. That produces about 38 rendered rows including overscan. It reproduces the windowing behavior needed for this test, but it is not a substitute for a browser benchmark.

## The numbers

Scrolling, 1,000-row table:

![Grouped bar chart comparing React render duration per scroll tick before and after the fix, at 10, 30 and 50 columns. Before: 8.4, 29.2 and 43.9 milliseconds. After: 2.0, 4.4 and 10.0 milliseconds.](/img/posts/tabularis-datagrid-scroll-commit-time.svg)

At 30 columns, React's `actualDuration` fell from 29.2 ms to 4.4 ms per scroll update. At 50 columns it fell from 43.9 ms to 10.0 ms. These are development-build figures from the headless harness, so the comparison matters more than the absolute values.

The call counts explain the ratio:

![Grouped bar chart of formatCellValue calls per scroll tick. Before: 1,140 calls at 10 columns, 3,420 at 30, 5,700 at 50. After: 30, 90 and 150, a 38-fold reduction at every width.](/img/posts/tabularis-datagrid-cells-per-tick.svg)

The call counts decompose exactly. The old result is 38 rendered rows × 30 columns × 3 formatter calls per cell = 3,420. A 105px tick brings 3 rows into the new render window, so the new result is 3 × 30 × 1 = 90. The other 35 rows do not render again. The 38-fold reduction combines two changes: unchanged rows now bail out, and each rendered cell formats its value once instead of three times.

Typing is the case I find more satisfying, because it's where the `editingCellRef` trick earns its keep:

![Grouped bar chart of headless update time per keystroke while editing a cell inline. Before: 31.5 milliseconds at 30 columns and 54.9 at 50. After: 3.7 and 4.4 milliseconds.](/img/posts/tabularis-datagrid-typing-per-keystroke.svg)

Before the fix, every keystroke in the inline editor re-rendered all 28 rows in the window. That produced 2,517 formatter calls to display one character: 28 × 30 × 3, minus the three calls for the cell showing an `<input>`. In the headless test, a 50-column table took 54.9 ms per keystroke. After the fix, only the edited row re-renders, producing 30 formatter calls and a 3.7 ms update at 30 columns.

One mount-time number is also useful. The old grid made 2,520 formatter calls on mount, three per rendered cell. The new grid made 840. Both call counts were identical with 1,000 and 100,000 result rows, confirming that virtualization bounded the rendered window. Total mount time still grew with the result set because TanStack Table had to build its row model, which is a separate cost this change did not address.

## A bad mock invalidated every row

The first benchmark run exposed a mistake in my setup: **the memoized grid re-rendered all 38 rows on every tick, exactly like the old one.** It made 1,140 formatter calls where I expected 90. There was no error and the test still passed.

The cause was one line in the [shared Vitest setup](https://github.com/TabularisDB/tabularis/blob/810badaf9e1e4ae2e91f15225d8c81cd7a1a3720/tests/setup.ts#L69-L86). It mocked `react-i18next` like this:

```ts
useTranslation: () => ({
  t: (key: string) => key,   // a NEW function on every call
}),
```

A fresh `t` function was created on every render. `t` is a member of `rowCtx` because the row uses it for `NULL` labels. A new `t` produced a new `rowCtx`, the shallow comparison failed, and every row rendered again. The application did not show this behavior because its `t` reference remained stable in this scenario. I changed the harness to return a singleton mock, then the expected gap appeared.

A context-object memo is only as strong as its least stable member. One prop with per-render identity, such as a translation function, inline callback, or freshly filtered array, can turn the memo into a no-op. Nothing breaks and React does not warn you. I wrote the component and still got the benchmark wrong on the first run, so reading the code was not enough. The corrected singleton mock is in the [published harness](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/grid-bench.test.tsx#L50-L58).

## What's deliberately not done

Column virtualization. The grid renders every column of every visible row, so a 200-column table still does 200 columns' worth of cell work per new row. At 50 columns, the headless result was 10.0 ms per tick. The demo stack includes `perf_demo.wide_table`, with 50 columns and 50,000 rows, seeded for MySQL and Postgres by [`demo/generate-perf-sql.py`](https://github.com/TabularisDB/tabularis/blob/810badaf9e1e4ae2e91f15225d8c81cd7a1a3720/demo/generate-perf-sql.py), so the case is easy to test in a real browser.

Horizontal virtualization has to coexist with a sticky header, a sticky row-number column, and an expansion row that uses `colSpan`. Virtualizing columns would break that expansion layout unless the editor became an overlay. I have left it out until a real workload justifies that complexity. If you have one, [open an issue](https://github.com/TabularisDB/tabularis/issues).

## If you have a slow virtualized grid

The checklist I wish I'd had before shipping the janky version, in the order I'd apply it:

1. **Count renders before timing them.** Wrap something every cell calls and count invocations per scroll event. If the count tracks *visible cells* instead of *newly visible cells*, inspect component invalidation before changing the virtualizer.
2. **Put the memo boundary at the row**, not the cell (too many boundaries) and not the body (too few).
3. **Split props by volatility.** Grid-stable values go in one memoized context object; per-row volatile values go in as primitives, computed in the parent. Never pass the raw `editingCell`/`focusedCell` state objects into memoized children.
4. **Stabilize handlers with refs**, not by widening dependency arrays.
5. **If your rows are a fixed height, tell the virtualizer** and delete `measureElement`. Measurement is for content that actually varies.
6. **Re-verify after refactors.** The memo is invisible when it stops working. A render-count assertion is cheap insurance.

## Source and reproduction

- [PR #287](https://github.com/TabularisDB/tabularis/pull/287) and its [Files changed view](https://github.com/TabularisDB/tabularis/pull/287/files)
- [Before/after GitHub diff](https://github.com/TabularisDB/tabularis/compare/7def318b8de70fdb365e5032da4ae94359749070...61794dc21f6618f9e8a1fa9687f445423ba38a00) and [raw diff](https://github.com/TabularisDB/tabularis/commit/61794dc21f6618f9e8a1fa9687f445423ba38a00.diff)
- Old [`DataGrid.tsx`](https://github.com/TabularisDB/tabularis/blob/7def318b8de70fdb365e5032da4ae94359749070/src/components/ui/DataGrid.tsx) and extracted [`DataGridRow.tsx`](https://github.com/TabularisDB/tabularis/blob/61794dc21f6618f9e8a1fa9687f445423ba38a00/src/components/ui/DataGridRow.tsx)
- Benchmark [README](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/README.md), [test harness](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/grid-bench.test.tsx), [raw results](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/results.jsonl), and [chart generator](https://github.com/TabularisDB/website/blob/main/notes/datagrid-bench/make-charts.mjs)

:::star:::
