---
title: "v0.13.2: Notebooks You Can Manage, Query Progress in Real Time, and a Grid That Scrolls"
date: "2026-06-16T13:01:00"
release: "v0.13.2"
tags: ["release", "feature", "notebook", "data-grid", "editor", "mysql", "postgres", "plugin", "community"]
excerpt: "v0.13.2 turns notebooks into a managed, per-connection workspace with undo and a visual history, streams query progress live while a batch runs, makes wide-table scrolling fluid again, teaches autocomplete to read your clauses across databases, and corrects the numbers in Visual EXPLAIN."
og:
  title: "v0.13.2:"
  accent: "Managed, and live."
  claim: "Per-connection notebooks with undo and a visual history, a results panel that streams progress while statements run, fluid scrolling on wide tables, clause-aware cross-database autocomplete, and honest Visual EXPLAIN numbers."
  image: "/img/posts/tabularis-notebooks-managed.png"
---

# v0.13.2: Notebooks You Can Manage, Query Progress in Real Time, and a Grid That Scrolls

**v0.13.2** follows [v0.13.1](/blog/v0131-signed-macos-postgres-explain-offset-pagination), which was a correctness pass. This one is about the surfaces you actually live in — the notebook, the results panel, the grid, the editor — and making them feel responsive and *managed* rather than write-once. Notebooks stop being files you save into the dark and become a browsable, undoable workspace; the results panel stops waiting for a whole batch to finish before telling you anything; and the grid stops stuttering when the table is wide.

Five external contributors land in this tag.

---

## Notebooks You Can Actually Manage

SQL Notebooks shipped as a powerful surface, but they were write-only: you created one, ran cells, exported it, and then it disappeared onto disk as a flat file with no way back in from the app. v0.13.2 turns them into a first-class, per-connection workspace in PR [#304](https://github.com/TabularisDB/tabularis/pull/304).

Notebooks are now stored per connection at `notebooks/<connectionId>/<id>`, with lazy migration of any legacy flat notebooks the first time their connection loads — nothing you saved before is lost. A new **Notebooks** section in the sidebar lists the active connection's notebooks with search, one-click open, and a context menu to **rename, export, import, delete** (with confirmation), and **Save as HTML**. The list refreshes live: create a notebook and it appears immediately; a rename or delete elsewhere reflects without a manual reload. You can also rename a notebook straight from its editor tab by double-clicking the title.

Editing a notebook is now undoable. Each structural change — adding, removing, reordering, or editing cells — is captured into a timeline, and a **history panel** lets you scrub back through every state and jump to any point, with each entry labeled by what changed. It's the same instinct as undo in the SQL editor, applied to the whole document.

<video src="/videos/posts/tabularis-notebooks-manage.mp4" poster="/videos/posts/tabularis-notebooks-manage.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

If you've been treating notebooks as throwaway scratchpads because there was no way to find them again, this is the release that makes them worth keeping.

---

## Query Progress, In Real Time

Run a multi-statement batch and, until now, the results panel sat blank until the *entire* batch finished — then every result tab and the timing badge appeared at once. For a script where statement 3 of 12 is slow, that's a long stretch of staring at nothing.

[@fzlee](https://github.com/fzlee) rebuilt this in PR [#296](https://github.com/TabularisDB/tabularis/pull/296). Each result tab now resolves *progressively* as its statement completes, matched by entry id so rapid back-to-back completions never overwrite each other. The summary badge updates live — succeeded and failed counts accumulate while a spinning count shows how many statements are still running — and the elapsed time ticks up on a live wall-clock timer instead of only appearing at the end. When the batch finishes, the ticking estimate snaps to the precise server-measured total. Under the hood, all three SQL drivers gained progressive result reporting and the editor context grew an `updateResultEntry` that reads the latest state rather than a stale snapshot.

You now watch a long script work through itself, statement by statement, instead of waiting blind for the whole thing.

<video src="/videos/posts/tabularis-sql-progress.mp4" poster="/videos/posts/tabularis-sql-progress.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## A Grid That Scrolls on Wide Tables

Scrolling a table with a few hundred rows and 30–40 columns was visibly laggy. The whole `<tbody>` re-rendered on every scroll tick — no row or cell memoization — and each row was dynamically re-measured as it went.

PR [#287](https://github.com/TabularisDB/tabularis/pull/287) fixes the render path. The per-row render is extracted into a `React.memo` `MemoRow`, with the stable per-grid dependencies bundled into a single memoized context object so the default shallow compare only re-renders the rows that actually changed; volatile per-row values are passed as primitives. The cell double-click, edit-commit, and keydown handlers are stabilized with `useCallback` (reading the live editing cell through a ref) so the memo holds, the cell value is formatted once per cell instead of twice, and rows use a fixed height with no per-row measurement — the same proven fixed-size pattern already used by the mini result grid. The default cell renderer moved to a `dataGridCell` helper with unit tests.

The result: scrolling stays fluid on wide, tall tables instead of dropping frames on every tick.

:::newsletter:::

---

## Autocomplete That Reads Your Clauses

Two long-standing autocomplete gaps close in PR [#295](https://github.com/TabularisDB/tabularis/pull/295), contributed by [@thomaswasle](https://github.com/thomaswasle) (Thomas Müller-Wasle).

First, clause keywords. Once you had a `FROM` clause, typing past it stopped offering `WHERE`, `ORDER BY`, `GROUP BY`, `LIMIT` and friends — a guard suppressed keyword suggestions whenever column suggestions were present. Now keyword and column completions are offered together when a `FROM` clause is in scope.

Second, columns across databases. The table parser was mistaking SQL keywords like `WHERE`, `ON`, and `HAVING` for table aliases, which corrupted the alias map and blocked column lookups. The fix replaces the keyword denylist with proper clause-boundary extraction: it isolates the `FROM`/`JOIN` section, strips `ON`/`USING` conditions, and captures `schema.table` qualified notation, so no clause keyword can ever land in the alias capture group. In multi-database mode each table is tagged with its source database, so a `db.table.` dotted completion resolves by exact `(schema, name)` pair and unqualified names fall back across every loaded database — MySQL multi-DB connections finally pass the right schema instead of falling back to `information_schema`. Empty column results are no longer cached, so a transient miss from a not-yet-ready connection can't poison later lookups.

---

## Visual EXPLAIN Gets Honest Numbers

Two fixes make the Visual EXPLAIN table view tell the truth about row counts and timing.

PR [#302](https://github.com/TabularisDB/tabularis/pull/302) (closes [#298](https://github.com/TabularisDB/tabularis/issues/298)) adds an **Actual Rows** column next to Est. Rows. The MariaDB `ANALYZE FORMAT=JSON` parser already captured actual rows from `r_rows`, but the table view only ever exposed the estimate; the column now renders whenever analyze data is present, on both MariaDB `ANALYZE` and Postgres `EXPLAIN ANALYZE`.

PR [#303](https://github.com/TabularisDB/tabularis/pull/303) (fixes [#300](https://github.com/TabularisDB/tabularis/issues/300)) corrects MySQL `EXPLAIN ANALYZE` timing. MySQL's tree-format output reports `time=first..last` as the *per-loop* timing averaged across all iterations, and the table view displayed that per-loop figure directly — so a node executed many times (an index lookup driven by a join, say) reported a tiny per-iteration cost instead of its real total. The parser now scales the per-loop end time by the loop count, so the displayed time is the node's total wall-clock cost, matching how PostgreSQL's Actual Total Time relates to Actual Loops.

---

## SSL for Plugin Drivers

The SSL/TLS tab in the connection modal was hardcoded to the `mysql` and `postgres` driver IDs, so plugin drivers — ClickHouse, for instance — could never expose SSL configuration at all.

[@Aditeya](https://github.com/Aditeya) (Adi) fixes this in PR [#309](https://github.com/TabularisDB/tabularis/pull/309) by adding a `supports_ssl` capability to `DriverCapabilities` on both the Rust and TypeScript sides. The SSL tab is now gated on that capability instead of a driver-ID allow-list: built-in Postgres and MySQL set the flag, and plugins opt in through their manifest. The tab description is now driver-agnostic, and ClickHouse `ssl_mode` options (`disable`/`require`) are wired in. Plugin authors get a documented, first-class way to surface TLS configuration.

---

## Redis (Go) Plugin: v0.4.1

[@gzamboni](https://github.com/gzamboni) (Giovani Zamboni) shipped v0.4.1 of the community [Redis (Go) plugin](https://github.com/gzamboni/tabularis-redis-plugin-go), registered in PR [#314](https://github.com/TabularisDB/tabularis/pull/314). The release fixes connecting to a Redis instance that has no username, and the registry now serves 0.4.1 across Linux, macOS, and Windows. The plugin continues to offer virtual table views for Strings, Hashes, Lists, Sets, and ZSets with native write operations. Install it from **Settings → Plugins**.

:::star:::

---

## Smaller Things

- **Scroll-bar buttons stay reachable** ([@VincentZhangy](https://github.com/VincentZhangy), PR [#315](https://github.com/TabularisDB/tabularis/pull/315)) — the Refresh and Add Table buttons were hard to click once scroll bars appeared in the panel; the layout now keeps them selectable.
- **README, restructured** (PR [#318](https://github.com/TabularisDB/tabularis/pull/318)) — the GitHub landing page got a clearer hero, a fixed `.rpm` download link, a "Why Tabularis?" comparison table, and reference material (configuration, AI providers, MCP setup) moved to the wiki. All seven translated READMEs were realigned and their stale download links refreshed.
- **Grid cleanup** — a dead cell renderer and the unused `isRawSql` plumbing were removed, and the demo seeds gained a 50-column × 50k-row `perf_demo` wide table (MySQL + Postgres) so the scroll-performance work stays reproducible.

---

## Thanks

Five external contributors land in v0.13.2.

**[@fzlee](https://github.com/fzlee)** brings the real-time query progress rework ([#296](https://github.com/TabularisDB/tabularis/pull/296)) — the change that makes a long multi-statement batch report itself live instead of finishing in one silent jump.

**[@thomaswasle](https://github.com/thomaswasle) (Thomas Müller-Wasle)** lands the autocomplete overhaul ([#295](https://github.com/TabularisDB/tabularis/pull/295)): clause keywords offered alongside columns, and column resolution that finally works across databases instead of corrupting the alias map on a stray keyword.

**[@Aditeya](https://github.com/Aditeya) (Adi)** adds the `supports_ssl` capability ([#309](https://github.com/TabularisDB/tabularis/pull/309)), giving plugin drivers a first-class path to TLS configuration that the SSL tab respects.

**[@gzamboni](https://github.com/gzamboni) (Giovani Zamboni)** shipped Redis (Go) plugin v0.4.1 ([#314](https://github.com/TabularisDB/tabularis/pull/314)), fixing usernameless Redis connections.

**[@VincentZhangy](https://github.com/VincentZhangy)** is new to the contributor list with the scroll-bar button fix ([#315](https://github.com/TabularisDB/tabularis/pull/315)). Welcome.

If you keep notebooks and could never find them again, run long scripts and want to see them progress, scroll wide tables and feel the lag, lean on autocomplete across multiple databases, or read Visual EXPLAIN and want the numbers to be honest — this is the upgrade.

:::contributors:::

---

_v0.13.2 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.13.2)._
