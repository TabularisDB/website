---
title: "v0.20.0: A Command Palette That Knows Which Pane You're In, Paste That Works Like a Spreadsheet, and PostgreSQL Moves Out of the Core"
date: "2026-08-17T18:00:00"
release: "v0.20.0"
tags: ["release", "feature", "bugfix", "postgres", "mysql", "sqlite", "ui", "ux", "data-grid", "plugin", "community"]
excerpt: "v0.20.0 replaces the quick navigator with a scope-aware command palette, teaches the data grid to paste spreadsheet ranges as staged edits, moves PostgreSQL out of the core and into a standalone plugin at full parity with the built-in driver (the first step in migrating every built-in driver to the plugin pipeline), adds inline hex preview and editing for BLOBs, and makes rows with binary primary keys deletable on MySQL."
og:
  template: "screenshot-split"
  title: "v0.20.0:"
  accent: "Palette. Paste. Plugin."
  claim: "A Spotlight-style command palette scoped to the pane you're in, spreadsheet paste as staged edits, PostgreSQL reborn as an independent plugin at full parity with the built-in driver, and hex editing for BLOBs."
  image: "/img/tabularis-command-palette.png"
  appLabel: "tabularis"
---

# v0.20.0: A Command Palette That Knows Which Pane You're In, Paste That Works Like a Spreadsheet, and PostgreSQL Moves Out of the Core

**v0.20.0** follows [v0.19.0](/blog/v0190-connection-tags-column-masking-keyless-editing). The quick navigator grows into a real command palette that understands split view, and the data grid learns to paste: tab-separated, CSV, or a single value fanned across a range, always as staged edits you can still roll back. Underneath, the core learns to let go of its drivers. PostgreSQL, the flagship, becomes an independent plugin, developed and released in its own repository at full parity with the built-in driver, which it will most likely replace in an upcoming release. It's the first step of a migration we intend to repeat for every built-in driver. And binary data stops being a second-class citizen: small BLOBs render and edit as hex, and MySQL rows keyed by `BINARY` columns can finally be deleted.

---

## The Quick Navigator Grows Into a Command Palette

The quick navigator could find a table. It could not run a command, and in split view it quietly searched whichever connection happened to be *active* rather than the pane you were actually looking at. PR [#545](https://github.com/TabularisDB/tabularis/pull/545), from [@verbaux](https://github.com/verbaux), replaces it with a Spotlight-style palette with two modes: the familiar object search (tables, views, routines, triggers), and a new **action palette** on **Cmd/Ctrl+Shift+A**, with a visible mode label in the header so you always know which one you're in.

<video src="/videos/posts/tabularis-command-palette.mp4" poster="/videos/posts/tabularis-command-palette.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

The interesting work is under the surface. Both palettes and the explorer sidebar each used to build their own "open this in the editor" logic: assembling SQL, guessing the tab type, reading the active connection regardless of where you clicked. They now share one navigation contract, a single definition of what "open", "count rows" and "show definition" mean per object type, used by the sidebar's sixteen call sites and both palette modes alike. Each editor pane registers a **command scope**, and the palette resolves against the scope that owns the focus. In split view with two connections, the action palette from each pane targets *that pane's* connection and table. The same discipline reached the schema and generate-SQL modals, which used to inspect the active connection even when opened from a non-active pane; they now receive an explicit target. Palette strings shipped translated, including a contributed Brazilian Portuguese pass.

The action palette deliberately starts small (open settings, open the current table in the SQL console), because the point of this release is the registry, the scoping and the navigation contract; commands are now one item plus an i18n key to add. And the palette's one known data-freshness gap didn't survive the cycle: [@DhruvShah-Dev](https://github.com/DhruvShah-Dev) fixed the multi-database object list to read the provider's live database selection instead of the stale saved params, so a database dropped on the server stops haunting the palette (PR [#597](https://github.com/TabularisDB/tabularis/pull/597), fixes [#591](https://github.com/TabularisDB/tabularis/issues/591)).

---

## Paste Lands in the Data Grid

Copy has been getting steadily smarter for two releases; paste didn't exist. PR [#612](https://github.com/TabularisDB/tabularis/pull/612), from [@ymadd](https://github.com/ymadd) (closes [#611](https://github.com/TabularisDB/tabularis/issues/611)), adds spreadsheet-style **Cmd/Ctrl+V**, and every pasted value goes through the existing pending-changes flow as a staged edit, never straight to the database. You still review, apply or roll back.

<video src="/videos/posts/tabularis-grid-paste.mp4" poster="/videos/posts/tabularis-grid-paste.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

The parsing rules are chosen to round-trip real workflows. Tab-separated cells win, because that's what every spreadsheet puts on the clipboard. Multi-line text without tabs is parsed as CSV with double-quote escaping, preferring your configured CSV delimiter, so the grid's own copy formats round-trip cleanly. A single line without tabs is always one value, so `hello, world` lands in one cell instead of two. A leading header row is dropped only when it matches the grid's column names positionally from the paste anchor: the "export column names" option round-trips without swallowing external data that merely mentions a column name. A single copied value fills the whole selected range or row selection, the pasted matrix clips at the grid edges, and alias and computed columns are skipped under the same guard as inline editing. Pasting a cell's original value back clears its pending change, exactly like typing it would.

The prerequisite fix matters beyond paste: staging N cells in one tick hit a React batching bug where only the last cell survived, because the pending-changes handlers computed the next state from a snapshot. They now use functional updates, which hardens every rapid-succession staging path, not just this one.

:::newsletter:::

---

## PostgreSQL Moves Out of the Core

Tabularis has been moving toward drivers-as-plugins for several releases ([#16](https://github.com/TabularisDB/tabularis/issues/16) is the tracking issue), and this cycle the flagship makes the jump. PostgreSQL now lives as an independent plugin in its own repository, [tabularis-postgresql-plugin](https://github.com/TabularisDB/tabularis-postgresql-plugin), no longer developed inside the core. The in-tree copy is deleted; the plugin repo is the single source of truth, with its own security audit, its own CI, and its own 5-platform release builds. PR [#577](https://github.com/TabularisDB/tabularis/pull/577), from [@aesslinger](https://github.com/aesslinger), lands the migration.

This is the model we intend to apply to **every built-in driver**, and it's worth spelling out why:

- **Drivers ship on their own schedule.** A PostgreSQL fix no longer waits for a Tabularis release. It ships as a plugin release, with its own version, its own changelog, its own cadence.
- **The core gets smaller.** Every driver that moves out is code the app no longer has to carry, build, and audit in-tree.
- **Community drivers stop being second-class.** If PostgreSQL itself can run through the plugin API, the API is proven complete. An external plugin has access to exactly the same machinery the flagship uses, because the flagship uses nothing else.
- **Isolation.** Plugin drivers run as separate processes behind JSON-RPC; a driver crash is a driver crash, not an app crash.
- **Focused security surface.** A driver in its own repo gets its own audit and its own hardened release pipeline, instead of inheriting whatever the monorepo does.
- **It keeps the host honest.** Migrating PostgreSQL flushed out every place the core was quietly special-casing itself, and those fixes benefit all drivers (more below).

The plugin is **ready**, and "ready" here is not a vibe, it's a test suite. The migration built a harness that spawns the real plugin binary and runs the same operations through both drivers against the same live PostgreSQL 16, comparing results: 83 parity tests, on top of a 181-test integration suite with golden-file snapshots for schema metadata. The harness is as paranoid as the thing it tests. A `POSTGRES_PLUGIN_BIN` pointing at a missing binary now panics instead of silently degrading to builtin-only, a missing golden file fails the test instead of skipping it with a warning, and a CI job that regenerated golden files before comparing against them (an assertion that could never fail) was caught and made opt-in. The manual sign-off ran a 24-item smoke test against the real plugin binary in the actual desktop UI, cross-checking every result directly via `psql`. It even shook out a real plugin bug along the way (`execute_query` returned `null` for enum values instead of the label), fixed upstream and pinned with a new parity test.

The honesty part is the piece built-in-driver users feel too. Several core checks were hardcoded on `driver === "postgres"`, so the plugin's `"postgresql"` driver id silently fell through to wrong behavior, and issue [#614](https://github.com/TabularisDB/tabularis/issues/614) catalogs the damage: broken identifier quoting, wrong MCP schema defaults, a connection form that lost its host/port layout, and an SSL-mode dropdown that could leave a plugin connection in cleartext without saying so. All of these now key off the driver's declared **SQL dialect and capabilities** instead of its id, with a migration for already-persisted stale `ssl_mode` values, and `sql_dialect` made a true `Option` so an absent value is no longer silently treated as PostgreSQL. The host stops special-casing its own driver, which is the real architectural milestone: every future driver migration inherits these fixes for free.

Where this goes: the plugin will most likely **replace the built-in PostgreSQL driver in an upcoming release**. The removal is tracked in [#631](https://github.com/TabularisDB/tabularis/issues/631) and will happen deliberately, not by surprise. In v0.20.0 nothing changes for existing connections: the built-in driver is untouched and remains the default. But you can already try the plugin today: grab a release build from the [plugin repository](https://github.com/TabularisDB/tabularis-postgresql-plugin/releases) (Linux, macOS, and Windows builds are published per release); one-click install from the Plugin Center is the follow-up. Feedback from real databases now is what makes the eventual switch a non-event.

---

## Binary Data: Hex You Can Read, Keys You Can Delete

Three threads landed on the same theme: binary and keyless data used to fail in opaque ways, and now doesn't.

**BLOBs get an inline hex preview and editor** (PR [#648](https://github.com/TabularisDB/tabularis/pull/648)). Small generic binary values, think `BINARY(16)` identifiers, now render in the grid as a compact `0x…` hex string (up to 64 bytes, then an ellipsis) instead of opaque Base64 transport metadata. In the row-editor sidebar, any complete BLOB up to 10 KiB opens in a monospaced hex editor: uppercase space-separated pairs, whitespace and an optional `0x` prefix accepted, odd-length or non-hex input rejected, invalid edits reverted on blur, and the original MIME type preserved on write-back. Larger or truncated BLOBs keep the existing download/file editor, and the backend preview boundary moves from 4 KiB to 10 KiB so everything in the editable range arrives complete, with the truncation check corrected to account for Base64 padding so a truncated value can never sneak into the hex editor.

![A table with BINARY(16) primary keys rendered as compact 0x hex strings in the grid, and the Edit Row sidebar showing the binary id and varbinary token columns open in monospaced hex editors](/img/tabularis-blob-hex-editor.png)

**Rows with binary primary keys can be deleted on MySQL** (PR [#647](https://github.com/TabularisDB/tabularis/pull/647), fixes [#646](https://github.com/TabularisDB/tabularis/issues/646)). MySQL `BINARY` values reach the frontend in Tabularis' BLOB wire format, and row deletion passed that representation straight back into the primary-key predicate as a string, which matched nothing. The driver now decodes the wire value first, binds raw bytes on prepared statements, renders hex literals on the text protocol, and carries a Docker-backed regression test against MySQL 8.4.

**Keyless-table edits stop tripping over PostgreSQL's type strictness** (PR [#618](https://github.com/TabularisDB/tabularis/pull/618)). The keyless editing shipped in v0.19.0 identifies rows by all their columns, so the WHERE predicate can target numeric and temporal columns, whose values arrive as JSON strings and were bound as plain TEXT, which PostgreSQL rejects with `operator does not exist: numeric = text`. The predicate builder now routes known column types through the same numeric and temporal coercions the SET path already used. The same PR adds a small mercy to every failure after this one: the error modal gains a **Copy** button.

---

## Package-Managed Builds Stop Fighting Their Package Manager

If a distribution packages Tabularis, the in-app updater is at best noise and at worst a fight over who owns the binary. PR [#621](https://github.com/TabularisDB/tabularis/pull/621) (closes [#617](https://github.com/TabularisDB/tabularis/issues/617)) lets package maintainers set `PACKAGE_MANAGER_SRC` and `PACKAGE_MANAGER_NAME` at build time: the build then skips automatic update checks, disables the built-in installer, and names the managing package manager in the Info settings page, joining the existing Snap and Flatpak detection.

The concrete occasion is a happy one: this was built for **[Solus](https://getsol.us/)**, which plans to integrate Tabularis into its own repositories. Solus is an independent, curated rolling-release Linux distribution ("The Personal OS for Personal Computers") with its own package manager, `eopkg`, and a philosophy of shipping software that works out of the box with sensible defaults. A distribution with that level of curation choosing to package Tabularis natively is exactly the kind of adoption we hoped for, and we're glad to meet them halfway. The feature was tested end-to-end with a real Solus `eopkg` build, and any other distribution can use the same two variables to ship a build that behaves like a proper citizen of its package manager.

---

## Smaller Things

- **Query results survive switching connections** ([@iamthenuggetman](https://github.com/iamthenuggetman), PR [#586](https://github.com/TabularisDB/tabularis/pull/586), closes [#292](https://github.com/TabularisDB/tabularis/issues/292)): switching to another connection and back replaced live tabs with their persisted copies, which are saved result-stripped; the grid came back empty. The storage reload is now skipped when a connection's tabs are already live in memory, which also kills the loading flash on the way back.
- **macOS stops autocorrecting your SQL** ([@iamthenuggetman](https://github.com/iamthenuggetman), PR [#634](https://github.com/TabularisDB/tabularis/pull/634), closes [#633](https://github.com/TabularisDB/tabularis/issues/633)): WKWebView inherits Safari's autofill pill, predictive text, autocorrect and spellcheck, and 102 technical fields across 57 files were still exposed. All of them now opt out; the three natural-language prose fields (AI prompts, markdown cells) deliberately keep their spellcheck.
- **One failing metadata query no longer takes down a database's tree** (PR [#638](https://github.com/TabularisDB/tabularis/pull/638), closes [#637](https://github.com/TabularisDB/tabularis/issues/637)): when a server rejects the `information_schema.routines` lookup, the explorer used to treat the whole expand as failed and retry it forever in a loop. Routine metadata is now optional: tables, views and triggers load, **Routines** gets an error indicator with the full copyable server error, and failed loads stop auto-retrying unboundedly.
  ![The explorer sidebar with tables, views and triggers loaded normally while the Routines section shows a red error indicator, reproduced against a proxy that rejects only the routines metadata query](/img/tabularis-routines-error-indicator.png)
- **SQLite generated columns appear, and stay read-only** ([@DhruvShah-Dev](https://github.com/DhruvShah-Dev), PR [#581](https://github.com/TabularisDB/tabularis/pull/581), fixes [#162](https://github.com/TabularisDB/tabularis/issues/162)): column metadata moves to `table_xinfo`, so generated columns show up in table grids, flagged as generated and excluded from insert and update paths.
- **PostgreSQL Visual Query Builder follow-ups** ([@DhruvShah-Dev](https://github.com/DhruvShah-Dev), PR [#588](https://github.com/TabularisDB/tabularis/pull/588)): the table list routes through the same reference formatter as `FROM` generation, `HAVING` aggregate references are formatted correctly, `SELECT` aliases are quoted when they need it, and all of it applies to both the `postgres` and `postgresql` driver ids.
- **Notebook parameters accept `${name}`** ([@fuleinist](https://github.com/fuleinist), PR [#602](https://github.com/TabularisDB/tabularis/pull/602), closes [#550](https://github.com/TabularisDB/tabularis/issues/550)): alongside the existing `@name`, and both syntaxes can mix in one query.
- **URI-first connection forms, and FK creation params for plugins** ([@jonaspm](https://github.com/jonaspm), PR [#619](https://github.com/TabularisDB/tabularis/pull/619)): the connection modal optimizes its layout when a driver declares raw-URI connections, and `get_create_foreign_key_sql` now receives `ConnectionParams` through the driver trait and the RPC layer, unblocking foreign-key creation in plugins like libSQL.
- **Add Row survives an empty table** (PR [#642](https://github.com/TabularisDB/tabularis/pull/642), closes [#641](https://github.com/TabularisDB/tabularis/issues/641)): an empty result without column metadata used to drop the tab out of data mode, taking the manipulation toolbar and **Add Row** with it, which made an empty table impossible to fill from the grid.
- **Plugin icons finally render** ([@aesslinger](https://github.com/aesslinger), PR [#645](https://github.com/TabularisDB/tabularis/pull/645), closes [#632](https://github.com/TabularisDB/tabularis/issues/632)): `getDriverIcon` never checked for a URL or `data:` manifest icon, so every external plugin fell back to the generic plug glyph in 7 of the 8 places icons render. The check now runs first, scheme-matched case-insensitively, and the documented priority holds: connection custom icon, then manifest icon, then built-in fallback.
- **Plugins live in the same data directory as everything else** (PR [#258](https://github.com/TabularisDB/tabularis/pull/258), closes [#257](https://github.com/TabularisDB/tabularis/issues/257)): on macOS and Windows, plugins were stored under a legacy `com.debba.tabularis` path that contradicted the documented location, so a plugin placed where the docs said was never discovered. Storage is unified under `tabularis` with a one-time, non-clobbering migration at startup.
- **CI stops recompiling the world** ([@aesslinger](https://github.com/aesslinger), PR [#644](https://github.com/TabularisDB/tabularis/pull/644), closes [#640](https://github.com/TabularisDB/tabularis/issues/640)): the test job spent ~6.5 of its ~10 minutes cold-compiling the Rust dependency graph to run 19 seconds of tests; it now reuses the same pinned rust-cache step the release build already trusted.

---

## Thanks

Seven external contributors land in v0.20.0.

**[@aesslinger](https://github.com/aesslinger)** carried the biggest change: the PostgreSQL driver's move out of the core, at full parity, plus the host-side dialect and capability fixes ([#577](https://github.com/TabularisDB/tabularis/pull/577)), the plugin manifest icon fix ([#645](https://github.com/TabularisDB/tabularis/pull/645)), and a CI test job that stopped recompiling everything ([#644](https://github.com/TabularisDB/tabularis/pull/644)). **[@verbaux](https://github.com/verbaux)** built the command palette and the unified navigation contract underneath it ([#545](https://github.com/TabularisDB/tabularis/pull/545)). **[@ymadd](https://github.com/ymadd)** gave the data grid paste, with the pending-changes batching fix it needed ([#612](https://github.com/TabularisDB/tabularis/pull/612)).

**[@iamthenuggetman](https://github.com/iamthenuggetman)** kept query results alive across connection switches ([#586](https://github.com/TabularisDB/tabularis/pull/586)) and silenced macOS text assistance on every technical field ([#634](https://github.com/TabularisDB/tabularis/pull/634)). **[@DhruvShah-Dev](https://github.com/DhruvShah-Dev)** landed three fixes: SQLite generated-column metadata ([#581](https://github.com/TabularisDB/tabularis/pull/581)), PostgreSQL Visual Query Builder follow-ups ([#588](https://github.com/TabularisDB/tabularis/pull/588)), and the palette's live database selection ([#597](https://github.com/TabularisDB/tabularis/pull/597)). **[@fuleinist](https://github.com/fuleinist)** added `${name}` notebook parameters ([#602](https://github.com/TabularisDB/tabularis/pull/602)), and **[@jonaspm](https://github.com/jonaspm)** threaded connection params through foreign-key SQL generation for plugin drivers and made URI-first connection forms possible ([#619](https://github.com/TabularisDB/tabularis/pull/619)).

If you've ever hit Cmd+V on a grid out of spreadsheet habit and watched nothing happen, worked in split view and had the palette search the wrong connection, or stared at a Base64 blob that you knew was just sixteen bytes, this is the upgrade.

:::contributors:::

---

_v0.20.0 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.20.0)._
