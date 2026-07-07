---
title: "v0.14.0: Stored Routines, Windows of Their Own, and a Guard Against the Unrecoverable"
date: "2026-07-07T15:10:00"
release: "v0.14.0"
tags: ["release", "feature", "bugfix", "postgres", "mysql", "ui", "ux", "plugin", "community"]
excerpt: "v0.14.0 opens the 0.14 line: manage stored procedures and functions from the sidebar, pop a connection into its own window, browse PostgreSQL materialized views, and get a confirmation dialog before a DELETE without a WHERE — plus typo-tolerant fuzzy search everywhere and a stack of Postgres/MySQL correctness fixes."
og:
  template: "screenshot-split"
  title: "Stored routines. Their own windows."
  accent: "A guard against disaster."
  claim: "Run, create, edit and drop stored routines; open a connection in its own window; browse PostgreSQL materialized views; and confirm before a DELETE without a WHERE — plus fuzzy search everywhere."
  image: "/img/tabularis-explorer-overview.png"
  appLabel: "tabularis"
---

# v0.14.0: Stored Routines, Windows of Their Own, and a Guard Against the Unrecoverable

**v0.14.0** bumps the minor line because it stops being a database *viewer* in a few more places and starts being a database *client*. It manages stored procedures and functions the way it already manages tables and views, it lets a connection live in its own window, it browses PostgreSQL materialized views, and — the change everyone will feel eventually — it asks before you run the query that wipes a table. It follows [v0.13.4](/blog/v0134-ssh-security-keys-detachable-results-smarter-editor), and like that release most of the surface area came from the community: [@Davydhh](https://github.com/Davydhh) alone lands six of the changes below.

---

## Manage Stored Routines, Not Just Tables

Stored procedures and functions have always been visible in the sidebar. As of v0.14.0 you can actually *do* something with them. PR [#416](https://github.com/TabularisDB/tabularis/pull/416) adds full routine management — run, create, edit, and drop — behind a new `routine_management` driver capability enabled for MySQL and PostgreSQL out of the box.

- **Run with parameters.** A modal collects each `IN`/`INOUT` value — with a NULL checkbox and a raw-value toggle that defaults on for numeric types — and the driver assembles a *reviewable* invocation script before anything executes. MySQL `OUT`/`INOUT` parameters are threaded through session variables (`SET` / `CALL` / `SELECT @var`); PostgreSQL functions run as `SELECT * FROM fn(...)`, so a set-returning function comes back as an actual result set.
- **Create from a template.** A dialect-aware starter script — `DELIMITER`-wrapped for MySQL, `CREATE OR REPLACE` with dollar-quoting for PostgreSQL — so you're editing a valid skeleton, not a blank buffer.
- **Edit the definition.** A re-runnable script: MySQL wraps `SHOW CREATE` in a `DROP IF EXISTS` + `DELIMITER` block, PostgreSQL reuses `pg_get_functiondef`.
- **Drop with confirmation.** PostgreSQL resolves the exact identity signature via `pg_get_function_identity_arguments` and refuses to guess between overloads rather than dropping the wrong one.

For plugin drivers the four new methods are *optional* JSON-RPC calls: when a plugin doesn't implement one, the host falls back to the same generic SQL, so a driver only overrides what its dialect actually needs. The manifest schema documents the capability.

<video src="/videos/posts/tabularis-run-routine.mp4" poster="/videos/posts/tabularis-run-routine.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## A Connection in Its Own Window

The results panel learned to detach in v0.13.4. In v0.14.0 the connection itself can. PR [#409](https://github.com/TabularisDB/tabularis/pull/409) adds an **Open in New Window** action to both connection context menus — the open-connections sidebar rail and the Connections page — that spins a connection out into its own standalone OS window.

The plumbing is the interesting part. Connectivity is validated *before* the window is spawned: the connection is test-connected first and the window is only created on success, so a failing connection surfaces its error in the window you're already in rather than a freshly-opened empty one. A connection opened in a new window is **owned** by that window and detached from the originating sidebar rail, though its process-global pool stays warm and is reused. Open-state is shared across every window — a connection open anywhere shows as open in every window's Connections page, broadcast via a new `connections:active-changed` event. Disconnecting closes the dedicated window (the main window is never auto-closed), and closing a dedicated window tears its connection down so nothing leaks.

<video src="/videos/posts/tabularis-open-in-window.mp4" poster="/videos/posts/tabularis-open-in-window.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Confirm Before You Wipe a Table

A `DELETE` or `UPDATE` with the `WHERE` clause forgotten is one of the oldest ways to lose data with no way back. PR [#429](https://github.com/TabularisDB/tabularis/pull/429) puts a guard in front of it. Both the SQL editor and notebook cells now detect a `DELETE`/`UPDATE` with no `WHERE`, as well as `DROP` and `TRUNCATE`, and ask for confirmation before the query is sent.

The detection isn't a naive substring match: it looks past comments and string literals (including backslash-escaped quotes), understands data-modifying CTEs, and handles multi-statement batches. The dialog shows kind-specific copy and a read-only preview of the exact statement it flagged, and the confirm button stays disabled for a five-second countdown — long enough that the warning is actually read instead of reflexively dismissed.

<video src="/videos/posts/tabularis-confirmation.mp4" poster="/videos/posts/tabularis-confirmation.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

:::newsletter:::

---

## PostgreSQL Materialized Views

[@Davydhh](https://github.com/Davydhh) added first-class **materialized view** support for PostgreSQL in PR [#342](https://github.com/TabularisDB/tabularis/pull/342). They show up as their own sidebar group (collapsed by default), gated on a driver capability so only databases that have them render the section. You get an in-flight spinner while a refresh runs, the same index-list rendering that tables use, and the view's columns — resolved against the active schema. They're read-only in the data grid, as a materialized view should be.

![PostgreSQL materialized views listed in their own sidebar group, created from CREATE MATERIALIZED VIEW statements in the console](/img/posts/tabularis-materialized-views.png)

---

## Find Things by Typo

Three changes, all from [@Davydhh](https://github.com/Davydhh), make finding an object forgiving of how you actually type.

The table and trigger filters swapped their substring match for Fuse.js fuzzy matching in PR [#417](https://github.com/TabularisDB/tabularis/pull/417), so `ordrs` still finds `orders` and the closest names rank first — applied across the schema, per-database, and flat sidebar layouts through one shared helper. The **Quick Navigator** got the same treatment in PR [#421](https://github.com/TabularisDB/tabularis/pull/421). And PR [#412](https://github.com/TabularisDB/tabularis/pull/412) adds a rebindable **focus-table-filter** shortcut (⌘⇧F / Ctrl+Shift+F) that jumps straight to the filter box in whichever layout is showing, even while another input has focus.

<video src="/videos/posts/tabularis-fuzzy-search.mp4" poster="/videos/posts/tabularis-fuzzy-search.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Know Exactly How Many Rows

The pager used to tell you which page you were on but not how big the result was. PR [#410](https://github.com/TabularisDB/tabularis/pull/410), also from [@Davydhh](https://github.com/Davydhh), displays the exact `{total} rows` next to the page indicator — and counts the *right* query. The old count ran against the base table and ignored the filter box's `WHERE`, so a filtered grid reported the unfiltered total; it now counts the reconstructed filtered query. The count resets when the query or filter changes so a stale number from a previous run never lingers, but it's preserved across pagination.

![A filtered employees grid showing 16 rows next to the page indicator, matching the WHERE id greater-than 2 filter](/img/posts/tabularis-total-row-count.png)

---

## MySQL Through Warpgate

[@pokertour](https://github.com/pokertour) added an opt-in **cleartext password plugin** toggle for MySQL/MariaDB in PR [#337](https://github.com/TabularisDB/tabularis/pull/337) (closes [#336](https://github.com/TabularisDB/tabularis/issues/336)), so connections can authenticate through bastions like Warpgate that require the `mysql_clear_password` auth plugin. Because those bastions proxy MySQL without implementing the prepared-statement protocol, any prepared query failed with server error 1047; when the toggle is on, the driver routes everything through the text protocol instead. The option is gated on an *enforced* TLS mode — cleartext credentials are refused over a link that could silently fall back to plaintext — and string literals become `sql_mode`-aware so `NO_BACKSLASH_ESCAPES` targets escape correctly. A pool cache-key collision that let two Warpgate targets behind one host:port share a pool was fixed at the same time.

:::star:::

---

## Correctness, Across the Board

- **Temporal and UUID cell edits on PostgreSQL** ([@NewtTheWolf](https://github.com/NewtTheWolf), PR [#408](https://github.com/TabularisDB/tabularis/pull/408), fixes [#401](https://github.com/TabularisDB/tabularis/issues/401)) — editing a `timestamp`/`timestamptz`/`date`/`time`/`interval` cell failed with `error serializing parameter` because the client inferred the parameter type from the cast target and rejected the bound string before PostgreSQL's own parsing ran. Every bound parameter now declares its wire type explicitly via `prepare_typed`/`execute_typed`, which also finishes the UUID-shaped-string fix that [#394](https://github.com/TabularisDB/tabularis/pull/394) only started. Verified against a live PostgreSQL 16.
- **Composite indexes in generated SQL** ([@snvtac](https://github.com/snvtac), PR [#373](https://github.com/TabularisDB/tabularis/pull/373)) — multi-column indexes are preserved in the SQL Tabularis generates instead of being flattened to single-column ones.
- **MySQL view DDL through the text protocol** ([@danielnuld](https://github.com/danielnuld), PR [#390](https://github.com/TabularisDB/tabularis/pull/390)) — view DDL is routed through the text protocol so it executes correctly.
- **MySQL routine DDL through the text protocol** ([@Stiwar0098](https://github.com/Stiwar0098), PR [#348](https://github.com/TabularisDB/tabularis/pull/348)) — the same treatment for routine DDL, and compound routines are now classified as DDL in the MCP layer ([#385](https://github.com/TabularisDB/tabularis/pull/385)).
- **Qualified view definitions on PostgreSQL** ([@debba](https://github.com/debba), PR [#400](https://github.com/TabularisDB/tabularis/pull/400)) — `pg_get_viewdef` was called with `$1::regclass` directly, which failed for a bound text value; casting through text first (`($1::text)::regclass`) resolves qualified view names correctly.
- **Plugin driver filters in the connection modal** ([@debba](https://github.com/debba), PR [#424](https://github.com/TabularisDB/tabularis/pull/424)) — a missing `driver` field made serde silently drop the filter on `ui_extensions` manifest entries, so every plugin's connection-content contribution rendered for every driver and plugins could overwrite each other's connection state. The filter is preserved now.

---

## Smaller Things

- **Node 24** ([@Davydhh](https://github.com/Davydhh), PR [#422](https://github.com/TabularisDB/tabularis/pull/422)) — the toolchain moves to Node 24.
- **Sidebar filter clear button** ([@viniciusmelocodes](https://github.com/viniciusmelocodes), PR [#403](https://github.com/TabularisDB/tabularis/pull/403)) — the clear (X) button no longer overlaps the scrollbar in the table filter.

---

## Thanks

Most of v0.14.0 is community work again.

**[@Davydhh](https://github.com/Davydhh)** carried an outsized share of this release: PostgreSQL materialized views ([#342](https://github.com/TabularisDB/tabularis/pull/342)), fuzzy matching for the table and trigger filters ([#417](https://github.com/TabularisDB/tabularis/pull/417)), fuzzy search in the Quick Navigator ([#421](https://github.com/TabularisDB/tabularis/pull/421)), the focus-table-filter shortcut ([#412](https://github.com/TabularisDB/tabularis/pull/412)), the total-row-count display ([#410](https://github.com/TabularisDB/tabularis/pull/410)), and the Node 24 upgrade ([#422](https://github.com/TabularisDB/tabularis/pull/422)).

**[@pokertour](https://github.com/pokertour)** added MySQL cleartext-auth support for Warpgate bastions ([#337](https://github.com/TabularisDB/tabularis/pull/337)). **[@NewtTheWolf](https://github.com/NewtTheWolf)** fixed temporal and UUID cell edits on PostgreSQL via explicit wire types ([#408](https://github.com/TabularisDB/tabularis/pull/408)). **[@Stiwar0098](https://github.com/Stiwar0098)** routed MySQL routine DDL through the text protocol ([#348](https://github.com/TabularisDB/tabularis/pull/348)) and classified compound routines as DDL in the MCP layer ([#385](https://github.com/TabularisDB/tabularis/pull/385)).

**[@snvtac](https://github.com/snvtac)** preserved composite indexes in generated SQL ([#373](https://github.com/TabularisDB/tabularis/pull/373)), **[@danielnuld](https://github.com/danielnuld)** routed MySQL view DDL through the text protocol ([#390](https://github.com/TabularisDB/tabularis/pull/390)), and **[@viniciusmelocodes](https://github.com/viniciusmelocodes)** fixed the sidebar filter's clear button ([#403](https://github.com/TabularisDB/tabularis/pull/403)).

If you manage stored procedures, spread work across monitors, run against PostgreSQL materialized views or a Warpgate-fronted MySQL, or have ever typed a `DELETE` faster than you meant to — this is the upgrade.

:::contributors:::

---

_v0.14.0 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.14.0)._
