# DataGrid benchmark artifacts

Source data for the blog post `content/posts/optimizing-virtualized-react-grid.md`.

- `grid-bench.test.tsx`: Vitest harness. Runs unchanged on both the pre-memoization
  commit (`61794dc2^` in the tabularis repo) and current main. Drop it into `tests/`,
  then: `NODE_OPTIONS=--max-old-space-size=8192 BENCH_VARIANT=<old|new> BENCH_OUT=<file> npx vitest run tests/grid-bench.test.tsx`
- `results.jsonl`: raw measurements used in the post (run 2026-07-14, React 19.2.4 on both sides).
- `make-charts.mjs`: generates the three SVGs in `public/img/posts/` from the numbers:
  `node make-charts.mjs <output-dir>`
