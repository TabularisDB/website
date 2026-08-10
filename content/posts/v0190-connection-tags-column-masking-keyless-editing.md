---
title: "v0.19.0: Connections That Know They're Production, Columns That Keep Secrets, and Tables Without a Primary Key You Can Finally Edit"
date: "2026-08-10T11:00:00"
release: "v0.19.0"
tags: ["release", "feature", "bugfix", "mysql", "postgres", "sqlite", "ui", "ux", "data-grid", "plugin", "community"]
excerpt: "v0.19.0 adds colored tags and environment classification with a production write guard, masks sensitive columns in the results grid, makes tables without a primary key editable, closes the plugin driver feature gap with BLOB and materialized-view forwarding plus plugin-owned connection fields, validates plugin archives before they can touch an existing install, and stops bundling libwayland in the Linux AppImage."
og:
  template: "screenshot-split"
  title: "v0.19.0:"
  accent: "Tag. Mask. Edit."
  claim: "Colored connection tags and environment classification with a production write guard, masked sensitive columns with per-cell reveal, editing for tables without a primary key, plugin driver parity for BLOBs and materialized views, and an AppImage that finally behaves on modern Mesa."
  image: "/img/tabularis-connection-tags-environments.png"
  appLabel: "tabularis"
---

# v0.19.0: Connections That Know They're Production, Columns That Keep Secrets, and Tables Without a Primary Key You Can Finally Edit

**v0.19.0** follows [v0.18.0](/blog/v0180-user-privileges-connection-diagnostics-grid-selection) and is a release about guardrails. The headline teaches connections which environment they belong to — with a permanent red banner and a confirmation before any write while you're on production — and adds free-form colored tags for organizing everything else. The results grid learns to render password, token and email columns as `••••••` until you deliberately reveal them. The oldest editing limitation in the data grid falls: tables without a primary key accept cell edits, NULLs and row deletions instead of silently ignoring you. Underneath, the plugin pipeline closes most of its feature gap with the built-in drivers, plugin installs stop being able to clobber a working installation with a corrupt archive, and the Linux AppImage stops shipping the stale libwayland that produced black windows on up-to-date distros.

---

## Tags, Environments, and a Warning Before You Write to Production

Every connection list eventually turns into a minefield: the local scratch database and the customer-facing one sit two rows apart, distinguished by nothing but a name. PR [#473](https://github.com/TabularisDB/tabularis/pull/473), from [@pokertour](https://github.com/pokertour), closes [#472](https://github.com/TabularisDB/tabularis/issues/472) with two complementary features, following the DBeaver model.

**Free-form colored tags.** Tags live in `connections.json` alongside groups; connections carry a list of tag ids. The connection modal's appearance tab gets a tag picker with inline creation on the shared accent palette and a manage mode to rename, recolor or delete. Tags render as colored chips on connection cards and list rows, and tag names participate in the connection search filter. They also ride along in export, import and backups — selective exports only include the tags actually used, and imports merge by id first, then by name, remapping `tag_ids` onto the existing tag. Re-creating "prod" on another machine never duplicates it.

**Environment classification.** Each connection can optionally declare itself `development`, `staging` or `production`, picked in the modal title bar and preserved across duplicate and import. Production identity is loud on purpose: a **PROD** badge on cards and rows, a red ring on open sidebar entries, and a permanent red banner while the active connection is production.

![The Connections page with colored tag chips and environment badges on the cards: a red "work" tag next to STAGING and DEV badges, two connections marked PROD in red, and connections with no environment set](/img/tabularis-connection-tags-environments.png)

**The write guard.** Any statement that isn't provably read-only prompts for confirmation on a production connection, with a SQL preview and a per-connection "don't ask again" that lasts for the session. Detection is deliberately conservative — only `SELECT`, `SHOW`, `DESCRIBE`, `PRAGMA` and `EXPLAIN` of a `SELECT` count as read-only. Data-modifying CTEs, `EXPLAIN ANALYZE <write>` (which executes the write on PostgreSQL) and unknown statement types like `CALL` or `SET` all prompt. The guard covers editor runs, staged grid-edit commits, immediate cell edits, row insertion and notebook cells, and it stacks with the [destructive-query guard from v0.14.0](/blog/v0140-stored-routines-connection-windows-destructive-query-guard) rather than replacing it.

---

## Sensitive Columns Come Up Masked

Screen-sharing a results grid used to mean hoping nobody could read fast. PR [#587](https://github.com/TabularisDB/tabularis/pull/587), from [@iamthenuggetman](https://github.com/iamthenuggetman), closes [#485](https://github.com/TabularisDB/tabularis/issues/485): columns whose name matches a sensitive pattern — password, email, token, ssn and friends — now render as a `••••••` placeholder in the results grid.

- **Per-cell reveal.** A masked cell shows an eye button that reveals just that cell; revealed cells get an eye-off to re-mask. Column headers carry the same toggle for the whole column. Reveal state is grid-local and resets when the result data changes.
- **The mask actually holds.** Masked cells can't be edited — double-click, Enter and F2 are guarded until you reveal — and the hover tooltip is suppressed so it can't leak the value.
- **Display-only, by design.** Copy and export keep the real values, as the issue requested; write-path anonymization for exports is tracked separately in [#483](https://github.com/TabularisDB/tabularis/issues/483).

Configuration lives in a new **Settings → Privacy** tab: an on/off toggle (default on), the column-name patterns as an editable list of case-insensitive substring matches, and per-connection overrides as `table.column` entries — **Always mask** and **Never mask** lists per connection, where never-mask wins over always-mask, which wins over the name patterns. A review round moved the per-connection overrides into the connection modal as well, so a saved connection can manage its own exceptions from a Privacy tab in edit mode. Strings are translated across all eleven locales.

![The Settings Privacy tab: the Mask sensitive columns toggle, the sensitive column name patterns list, and per-connection Always mask / Never mask overrides with a connection picker](/img/tabularis-privacy-settings.png)

---

## Tables Without a Primary Key Are Now Editable

A table with no primary key refused every edit and never said why: double-click did nothing, the row-editor sidebar accepted input but never showed a submit button, and Set NULL, Set EMPTY and Delete Row were silent no-ops. This wasn't a regression — row addressing has always required primary-key columns, and every path that needed them bailed out silently. PR [#600](https://github.com/TabularisDB/tabularis/pull/600) (closes [#598](https://github.com/TabularisDB/tabularis/issues/598)) makes keyless tables editable, carefully.

Rows of a keyless table are now identified by the values of **all their comparable columns**. Binary, geometric, json and hstore columns are excluded — their grid representations wouldn't survive an equality comparison — and so are approximate numerics (`FLOAT`, `DOUBLE`, `REAL`), whose stored values may not match the grid's decimal rendering. Excluded columns stay editable; they just don't take part in addressing. The fallback only activates when the result set exposes every physical column of the table: a partial `SELECT a, b FROM t` stays non-editable, because it couldn't distinguish rows that differ only in the omitted columns — and the grid now says so in an explanatory alert instead of ignoring the double-click.

The mechanics are fussy and worth getting right. Without a key, each UPDATE invalidates the value its own WHERE clause will need next time, so updates to the same row run sequentially with already-applied values threaded into each step. Columns set to DEFAULT — whose stored result the client can't know — are ordered last and dropped from later WHERE maps, so applying DEFAULT to two columns of one row works instead of failing halfway. Deletions repeat until every duplicate the grid marked is gone: MySQL and MariaDB delete one copy per statement with `LIMIT 1`, PostgreSQL and SQLite sweep identical rows in one statement, and every driver converges on the state the grid displayed. And when the row no longer matches — someone changed the data underneath you — a zero affected-rows result raises a clear error instead of pretending it worked.

On the driver side, the pk map can now legitimately carry a whole row: NULL entries render as `IS NULL` instead of being rejected, booleans bind natively across MySQL, PostgreSQL and SQLite, and MySQL updates and deletes by pk map carry `LIMIT 1` so duplicate rows are never swept by a single statement. The changes were verified live against MySQL 8.4, PostgreSQL 16, SQLite, and a MariaDB 11 container loaded with the reporter's actual dump.

:::newsletter:::

---

## The Plugin Pipeline Closes the Gap

Five threads landed this cycle that together move plugin drivers from "supported" toward "indistinguishable from built-in".

**BLOB, materialized views and type mappings reach plugin drivers** ([@aesslinger](https://github.com/aesslinger), PR [#576](https://github.com/TabularisDB/tabularis/pull/576)). The RPC adapter now forwards `save_blob_to_file` and `fetch_blob_as_data_url` — the plugin writes the file directly, since it runs on the host machine — plus all four materialized-view methods. A plugin that doesn't implement a method returns JSON-RPC `-32601` and the host falls back to the existing "not supported" error, so nothing changes for current plugins. A new optional `type_mappings` manifest field lets a plugin resolve `map_inferred_type()` locally, which matters because that method is synchronous and can't issue an RPC call. These are the prerequisites for migrating the PostgreSQL driver itself to a plugin ([#16](https://github.com/TabularisDB/tabularis/issues/16)).

**Plugins get their own connection fields** ([@fuleinist](https://github.com/fuleinist), PR [#596](https://github.com/TabularisDB/tabularis/pull/596)). `ConnectionParams` gains an opaque `extra` string map — persisted verbatim, forwarded to the driver, absent from JSON when empty — and a new `connection-modal.extra_fields` slot renders plugin UI below the host/port section, with `setExtraField(key, value)` to edit the map. The concrete beneficiary is the DynamoDB plugin, which needs an AWS region without asking core for a schema change. The host API version moves to 0.2.0.

![The DynamoDB plugin's page in Settings → Plugins, with a Default AWS region setting that acts as the fallback when a connection doesn't specify its own region through the new per-connection extra fields](/img/tabularis-dynamodb-plugin-settings.png)

**Plugin READMEs open in the app** (PR [#615](https://github.com/TabularisDB/tabularis/pull/615)). Deciding whether to install a plugin used to mean a detour to GitHub. A WordPress-style details modal now shows the plugin's README — from the connection install gate and from every Plugin Center card the registry knows. The registry serves the README locale-aware, relative image and link paths are resolved against the plugin's repository, the HTML is sanitized with DOMPurify, and links open in the OS browser. The install gate also declutters: while the driver isn't installed yet, the connection-name input and environment selector stay out of the way.

![The plugin README modal open over the install gate, showing the ClickHouse plugin's README with release, downloads and CI badges, description and table of contents](/img/tabularis-plugin-readme-modal.png)

**A bad archive can no longer eat a good install** (PR [#609](https://github.com/TabularisDB/tabularis/pull/609)). The manifest id and version are now verified against what the registry advertised *while the bundle is still in the temp directory* — previously the check ran after the archive had already replaced the plugin folder, so a corrupt download could wipe out a working installation. Uninstall resolves plugins by manifest id even when the folder name differs, and the install-error modal gains "Open plugins folder" and "Reload plugins" buttons, so a broken half-install is recoverable from the UI instead of requiring a restart and a file manager safari.

**`.tabularium` is the canonical manifest, and the scaffold finally validates** ([@NewtTheWolf](https://github.com/NewtTheWolf), PRs [#594](https://github.com/TabularisDB/tabularis/pull/594) and [#595](https://github.com/TabularisDB/tabularis/pull/595)). The manifest `create-plugin` scaffolded failed live registry validation on four counts — missing `engine` and `paradigms`, a forbidden `id` field, and a display name where the slug belongs. It now renders a manifest the registry accepts, and the in-repo plugin docs stop describing the old `manifest.json` world: slug `name`, optional legacy `id`, publishing pointed at `registry.tabularis.dev/submit`. Relatedly, the twelve plugins already migrated to the hosted Tabularium registry were removed from the legacy `registry.json`, which keeps only the five not yet migrated — and the MongoDB Atlas entry now points at the official TabularisDB repository and its published v0.1.0 release ([@Robbyfuu](https://github.com/Robbyfuu), [#496](https://github.com/TabularisDB/tabularis/pull/496)).

---

## The AppImage Stops Bundling a Time Bomb

If Tabularis gave you a black window on Arch or Solus since v0.13.3, this is the fix. The AppImage bundled the build container's libwayland (Ubuntu 22.04, ~1.20); on distros with a recent Mesa, the host libEGL bound to that stale `libwayland-client`, protocol marshalling mismatched, and WebKitWebProcess aborted with `EGL_BAD_PARAMETER`. This is a known-enough failure class that the upstream AppImage excludelist added `libwayland-client.so.0` for exactly this reason — but the linuxdeploy binary pinned by tauri-cli predates that entry, and upstream has declared the linuxdeploy bundler unmaintained.

PR [#599](https://github.com/TabularisDB/tabularis/pull/599) (fixes [#423](https://github.com/TabularisDB/tabularis/issues/423)) attacks the root cause and the process failure behind it. The stable build path pre-seeds a patched `linuxdeploy-plugin-gtk.sh` that strips `libwayland-*.so*` from the AppDir before the squashfs is packed — the produced AppImage contains zero libwayland files where v0.18.0 shipped four. And `release.yml` is rewritten as a thin dispatcher over the same reusable `build.yml` matrix the nightlies use, because the regression existed at all only because the two workflows had drifted apart: nightlies kept a working configuration for months while releases shipped the broken one. Two channels, one build definition, no more drift.

---

## Smaller Things

- **The MySQL Visual Query Builder qualifies its tables** ([@DhruvShah-Dev](https://github.com/DhruvShah-Dev), PR [#582](https://github.com/TabularisDB/tabularis/pull/582), fixes [#480](https://github.com/TabularisDB/tabularis/issues/480)) — tables dragged from the sidebar keep their schema, and generated `FROM` and `JOIN` clauses are schema-qualified, so a query built against a non-default database runs instead of erroring on the wrong one.
- **Visual EXPLAIN understands parameterized queries** ([@DhruvShah-Dev](https://github.com/DhruvShah-Dev), PR [#580](https://github.com/TabularisDB/tabularis/pull/580), fixes [#565](https://github.com/TabularisDB/tabularis/issues/565)) — explaining SQL with `@params` now opens the same parameter modal the editor uses, reuses saved tab values when complete, and saves submitted values back to the tab. A follow-up fix gave the modal's submit button a label that exists in the locale files instead of a raw i18n key.
- **SQLite paths starting with `~` work** ([@DhruvShah-Dev](https://github.com/DhruvShah-Dev), PR [#579](https://github.com/TabularisDB/tabularis/pull/579)) — `~/` and `~\` are expanded before file validation, shared between pool creation and new-database creation, so a home-relative path no longer fails as "file not found".
- **Closing your last connection sticks** ([@fuleinist](https://github.com/fuleinist), PR [#578](https://github.com/TabularisDB/tabularis/pull/578), closes [#548](https://github.com/TabularisDB/tabularis/issues/548)) — the persistence effect skipped empty states, so disconnecting everything and quitting brought the connections back on next launch. Empty is now a state worth saving too.
- **Engine cards in the connection catalogue got a cleanup** (PR [#605](https://github.com/TabularisDB/tabularis/pull/605)) — cards are titled after the engine with proper spellings (PostgreSQL, MongoDB Atlas, SQL Server) instead of whichever plugin sorts first, the layout stops truncating names and clipping the meta line mid-word, the unavailable badge shrinks to one word with the full sentence in a tooltip, and a registry icon that fails to load falls back to the generic database icon.
- **The DynamoDB plugin reached v0.1.5** ([@fuleinist](https://github.com/fuleinist), PR [#607](https://github.com/TabularisDB/tabularis/pull/607)) — two registry bumps this cycle, the latest adding the official DynamoDB brand icon to the manifest.

---

## Thanks

Seven external contributors land in v0.19.0.

**[@pokertour](https://github.com/pokertour)** built the headline feature for the second release running: colored tags, environment classification and the production write guard ([#473](https://github.com/TabularisDB/tabularis/pull/473)). **[@iamthenuggetman](https://github.com/iamthenuggetman)** gave the results grid column masking with per-cell reveal and a Privacy settings tab ([#587](https://github.com/TabularisDB/tabularis/pull/587)). **[@fuleinist](https://github.com/fuleinist)** added plugin-owned connection fields to `ConnectionParams` ([#596](https://github.com/TabularisDB/tabularis/pull/596)), fixed disconnects that didn't persist ([#578](https://github.com/TabularisDB/tabularis/pull/578)), and kept the DynamoDB plugin moving ([#607](https://github.com/TabularisDB/tabularis/pull/607)).

**[@aesslinger](https://github.com/aesslinger)** closed the plugin driver feature gap with BLOB, materialized-view and type-mapping forwarding ([#576](https://github.com/TabularisDB/tabularis/pull/576)). **[@DhruvShah-Dev](https://github.com/DhruvShah-Dev)** landed three fixes: schema-qualified MySQL visual queries ([#582](https://github.com/TabularisDB/tabularis/pull/582)), parameters in Visual EXPLAIN ([#580](https://github.com/TabularisDB/tabularis/pull/580)), and SQLite home-path expansion ([#579](https://github.com/TabularisDB/tabularis/pull/579)). **[@NewtTheWolf](https://github.com/NewtTheWolf)** made the plugin scaffold pass registry validation and rewrote the manifest docs around `.tabularium` ([#594](https://github.com/TabularisDB/tabularis/pull/594), [#595](https://github.com/TabularisDB/tabularis/pull/595)). **[@Robbyfuu](https://github.com/Robbyfuu)** pointed the MongoDB Atlas registry entry at the official release ([#496](https://github.com/TabularisDB/tabularis/pull/496)).

If you've ever run a script against production that you meant for staging, screen-shared a grid full of email addresses, or double-clicked a cell in a keyless table and watched nothing happen — this is the upgrade.

:::contributors:::

---

_v0.19.0 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.19.0)._
