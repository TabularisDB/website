---
title: "v0.13.1: Signed macOS Builds, a Postgres Explain That Finally Runs, and Pagination That Honors Your OFFSET"
date: "2026-06-05T11:00:00"
release: "v0.13.1"
tags: ["release", "bugfix", "macos", "postgres", "mcp", "data-grid", "editor", "ai", "community"]
excerpt: "v0.13.1 is a correctness pass on v0.13.0: macOS builds are now code-signed and notarized, the Postgres Explain Plan that never worked now runs, paginated queries stop dropping your OFFSET, postgresql:// and mariadb:// connection strings are accepted, the MCP read-only gate stops misreading a parenthesized SELECT as a write, the grid no longer freezes on giant JSON cells, and the macOS Keychain stops prompting on every AI-tab open."
og:
  title: "v0.13.1:"
  accent: "Signed, and corrected."
  claim: "Code-signed and notarized macOS builds, a Postgres Explain Plan that finally runs, pagination that honors your OFFSET, connection-string scheme aliases, a tightened MCP read-only gate, and a grid that no longer freezes on giant JSON."
  image: "/img/tabularis-macos-dock-icon.png"
---

# v0.13.1: Signed macOS Builds, a Postgres Explain That Finally Runs, and Pagination That Honors Your OFFSET

**v0.13.1** is a short follow-up to [v0.13.0](/blog/v0130-kubernetes-tunnels-quick-navigator-dml-tabs). Where the last release was about *reach* — Kubernetes tunnels, a Quick Navigator, MCP into plugin drivers — this one is about *correctness*: a sweep of features that shipped but quietly didn't work, plus the distribution-level fix Mac users have been asking for since the first DMG.

No new surface area. Several things that were broken, fixed. Four external contributors land in this tag.

---

## Signed and Notarized on macOS

Until now, opening Tabularis on macOS meant a trip through Gatekeeper: the "tabularis cannot be opened because the developer cannot be verified" dialog, or an `xattr -c` incantation copied from the install docs. The app was never signed, so every Mac treated it as quarantined.

PR [#289](https://github.com/TabularisDB/tabularis/pull/289) wires the release workflow to sign and notarize the macOS build. The `.app` and `.dmg` are now signed with a Developer ID Application certificate and submitted to Apple's notarization service during the release build — the App Store Connect API key is decoded from a secret into a temp file on the macOS runners only, and the Apple env vars are inert on the Linux and Windows jobs since Tauri only consumes them when bundling for macOS.

What this means for you: a notarized `.dmg` opens with the normal "downloaded from the internet" confirmation and nothing more. No `xattr`, no Privacy & Security override, no "unverified developer" wall. If you've been keeping the workaround command in a note, you can delete it.

---

## Postgres Explain Plan, Now Actually Running

The [Visual Explain](/wiki/visual-explain) feature has worked on MySQL, MariaDB, and SQLite since it shipped. On PostgreSQL it failed every single time with `error deserializing column 0` — and it turns out it never worked on any Postgres version.

[@NewtTheWolf](https://github.com/NewtTheWolf) (Dominik Spitzli) and the maintainer track it down in PR [#279](https://github.com/TabularisDB/tabularis/pull/279) (closes [#276](https://github.com/TabularisDB/tabularis/issues/276)). `EXPLAIN (FORMAT JSON)` returns the plan in a single column, and on Postgres that column is typed as `json` (OID 114), not `text`. The code read it straight into a `String`, and `tokio-postgres` refuses to deserialize a `json` column into a `String` — so the call errored out before the plan was ever parsed. This is server-side behavior that's been stable since the `FORMAT` option landed in PG 9.0, which is why the report reproduced on both PG 16 and PG 18.

The fix reads the column as a `serde_json::Value` and re-serializes it for the existing parser, with a `String` fallback for Postgres-compatible engines that hand the plan back as plain text. If you've ever clicked "Explain Plan" on a Postgres connection and gotten an error, that was this.

<video src="/videos/posts/tabularis-explain-postgres.mp4" poster="/videos/posts/tabularis-explain-postgres.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Pagination That Honors Your OFFSET

When the grid paginates a `SELECT`, it rewrites the query: it strips your trailing `LIMIT`/`OFFSET`, then re-appends `LIMIT <fetch> OFFSET <page offset>`. The rewriter only read back your `LIMIT` — the `OFFSET` was dropped on the floor. On page 1 the per-page offset is `0`, so `LIMIT 1 OFFSET 1` quietly became `LIMIT 1 OFFSET 0`, and your OFFSET was ignored.

PR [#275](https://github.com/TabularisDB/tabularis/pull/275) (fixes [#273](https://github.com/TabularisDB/tabularis/issues/273)) adds `extract_user_offset`, mirroring the existing token-aware `extract_user_limit` so an `OFFSET` inside an identifier or string literal isn't misread, and `build_paginated_query` now adds your OFFSET to the per-page offset. Pagination walks the rows you actually asked for. Because all three SQL drivers share `build_paginated_query`, the fix lands on Postgres, MySQL, and SQLite at once — with regression tests including the exact case from the issue and OFFSET-without-LIMIT on both page 1 and page 2.

There was a folk remedy floating around: appending a trailing `--` "fixed" it. The reason is grimly funny — the comment broke the stripper's pattern match, so the appended pagination clause landed on the same line as the `--` and got swallowed as a comment, and the database ran your original query verbatim. Correct result, entirely by accident. You don't need the `--` anymore.

---

## Connection Strings Stop Silently Failing

Pasting `postgresql://user@host/db` into the New Connection modal did nothing: no fields populated, no error, and the green success indicator still rendered. The connection-string protocol registry was built only from each driver's id and example, so for PostgreSQL only `postgres` was ever registered — `postgresql://` matched nothing and was silently skipped.

PR [#277](https://github.com/TabularisDB/tabularis/pull/277) (fixes [#260](https://github.com/TabularisDB/tabularis/issues/260)) registers well-known scheme aliases — `postgresql` ↔ `postgres`, `mariadb` ↔ `mysql`, `sqlite3` ↔ `sqlite` — in a second pass that never overrides a protocol a driver registered explicitly, so a dedicated `mariadb` plugin would still win over the alias. The modal's `looksLikeConnectionString` pre-filter is gone: input always runs through the parser now, an unrecognized scheme produces a real error (`Unsupported database driver: oracle. Supported: mariadb, mysql, postgres, postgresql, sqlite, sqlite3`), and the green check only appears when the string actually parsed and populated the form.

![The New Connection modal parsing a connection string into host, port, username, and password fields, with the green check confirming a successful parse](/img/tabularis-connection-string-aliases.png)

---

## MCP: A Parenthesized SELECT Is a Read Again

v0.13.0 [rebuilt the MCP safety gates](/blog/v0130-kubernetes-tunnels-quick-navigator-dml-tabs) to fail closed on multi-statement payloads. v0.13.1 fixes a false positive in the same classifier, reported and fixed by [@ymadd](https://github.com/ymadd) in PR [#272](https://github.com/TabularisDB/tabularis/pull/272).

`(SELECT ...) UNION ALL (SELECT ...)` — the shape you get when each UNION branch needs its own `ORDER BY`/`LIMIT` — starts with a `(`, so `first_keyword` returned empty and the query was classified as "unknown". That tripped both the [read-only mode](/wiki/mcp-readonly-mode) and the [write-approval gate](/wiki/mcp-approval-gates): a pure read raised a write prompt. The classifier now peels leading `(` and whitespace before reading the first keyword, so the inner `SELECT` is detected — while multi-statement detection still runs first (so `(SELECT 1); DROP ...` stays "unknown"), and the greedy peel never downgrades a parenthesized write or DDL to "select". Regression tests cover parenthesized UNION, nested and whitespace-padded parens, empty parens (which fail closed), parenthesized DDL/DML, and a writing CTE.

:::newsletter:::

---

## The Grid Stops Freezing on Large JSON

Open a table with a fat `JSON` column — say a MySQL `JSON` field holding a megabyte of nested data — and the grid would lock up. Each visible cell tokenized and rendered its **full** stringified value into thousands of DOM nodes, even though the cell is clipped to about 300px on screen and the full value is already one click away.

[@NewtTheWolf](https://github.com/NewtTheWolf) (Dominik Spitzli) fixes it in PR [#285](https://github.com/TabularisDB/tabularis/pull/285) (closes [#283](https://github.com/TabularisDB/tabularis/issues/283)): a new `truncateCellPreview` caps the inline preview at 300 characters *before* tokenization and render in both `JsonCell` and `TextCell`, and the native `<td>` tooltip is capped too. The cap is lossless — the inline expander and the JSON viewer both read the raw row value, not the truncated `displayText`, so the full content is always reachable. The MySQL and Postgres JSON demos gained a ~1 MB big-JSON row to reproduce the freeze and keep it fixed.

---

## Editor: Theme Isolation and Focus on Open

Two Monaco fixes from the maintainer.

PR [#282](https://github.com/TabularisDB/tabularis/pull/282) (closes [#281](https://github.com/TabularisDB/tabularis/issues/281)) stops the editor theme from leaking across instances. Monaco themes are global to the page, so every editor has to agree on the active theme — but each component resolved its own: most used the UI theme, the SQL editor and save-query modal honored the `editorTheme` override, and the AI explain modal passed a theme id it never registered. Whichever editor mounted last won, so opening the AI explanation modal re-colored every other editor in the app. A new `useEditorTheme` hook now resolves the effective theme once (the `editorTheme` override when set, otherwise the UI theme, with a fallback if the override points at a deleted theme), and all eleven Monaco usages route through it.

PR [#280](https://github.com/TabularisDB/tabularis/pull/280) (closes [#274](https://github.com/TabularisDB/tabularis/issues/274)) focuses the editor when you open a new console tab — via `Ctrl`/`Cmd+T`, the `+` button, or a Quick Navigator action — so you can start typing immediately. Each tab mounts its own editor instance once, keyed by tab id, so a single `editor.focus()` covers every creation path. The type check on `console` tabs avoids stealing focus when a table or query-builder tab opens.

<video src="/videos/posts/tabularis-ctrl-t.mp4" poster="/videos/posts/tabularis-ctrl-t.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Quieter Keychain, Correct TLS Pools

Two connection-layer fixes that you feel as fewer interruptions and fewer surprises.

Opening the **AI** settings tab on macOS used to fire the Keychain authorization prompt repeatedly — a single tab open issued eight or more keychain reads, one per provider across `SettingsProvider`, `AiTab`, and `get_ai_models`. [@ymadd](https://github.com/ymadd)'s PR [#269](https://github.com/TabularisDB/tabularis/pull/269) routes the AI key reads through the `CredentialCache` that already backs DB and SSH credentials, so the keychain is read at most once per provider per session. As a bonus, `get_ai_key` now distinguishes a definitive "no entry" from a denied or timed-out prompt, so a transient denial no longer caches a configured key as permanently missing until you restart.

[@arsis-dev](https://github.com/arsis-dev) (Julien Barbe) follows the v0.13.0 MySQL SSL work with the Postgres equivalent in PR [#278](https://github.com/TabularisDB/tabularis/pull/278): the connection pool key now includes PostgreSQL TLS settings, so editing a connection from one SSL mode to another can no longer silently reuse a pool created under the old mode.

---

## Smaller Things

- **MiniMax-M3 is the new default** ([@octo-patch](https://github.com/octo-patch), PR [#270](https://github.com/TabularisDB/tabularis/pull/270)) — `MiniMax-M3`, the new flagship model, is added to `ai_models.yaml` and placed first, so it's auto-selected when only the MiniMax key is configured. `MiniMax-M2.7` and `MiniMax-M2.7-highspeed` stay available for anyone who prefers the previous generation.

![Settings → AI with the MiniMax provider selected and the Default Model dropdown open, showing MiniMax-M3 at the top followed by MiniMax-M2.7 and MiniMax-M2.7-highspeed](/img/tabularis-minimax-m3-default.png)

- **Big-JSON demo rows** (part of PR [#285](https://github.com/TabularisDB/tabularis/pull/285)) — the MySQL and Postgres demo seeds gained ~1 MB JSON rows so the grid freeze stays reproducible and regression-tested.

---

## Thanks

Four external contributors land in v0.13.1 — three returning, one new.

**[@ymadd](https://github.com/ymadd)** keeps refining the seams from v0.13.0: the parenthesized-SELECT classifier fix ([#272](https://github.com/TabularisDB/tabularis/pull/272)) that removes a false write-prompt without weakening the fail-closed gate, and the AI keychain caching ([#269](https://github.com/TabularisDB/tabularis/pull/269)) that finishes wiring the credential cache through the last read path that wasn't using it.

**[@NewtTheWolf](https://github.com/NewtTheWolf) (Dominik Spitzli)** returns with two correctness fixes: the grid freeze on large JSON cells ([#285](https://github.com/TabularisDB/tabularis/pull/285)) and co-authoring the Postgres Explain Plan fix ([#279](https://github.com/TabularisDB/tabularis/pull/279)) — the feature that errored on every Postgres connection it ever ran against.

**[@arsis-dev](https://github.com/arsis-dev) (Julien Barbe)** follows his v0.13.0 MySQL SSL and Codex work with the PostgreSQL TLS pool-key fix ([#278](https://github.com/TabularisDB/tabularis/pull/278)) — closing the same class of "the pool ignored your TLS setting" bug on the other major engine.

**[@octo-patch](https://github.com/octo-patch)** is new to the contributor list and brings the MiniMax-M3 default upgrade ([#270](https://github.com/TabularisDB/tabularis/pull/270)). Welcome.

If you run Tabularis on macOS and were tired of the Gatekeeper dance, ever clicked "Explain Plan" on Postgres and got an error, lost rows to a paginated query that ignored your OFFSET, pasted a `postgresql://` string into a void, watched the grid freeze on a fat JSON column, or got Keychain-prompted on every AI-tab open — this is the upgrade.

:::contributors:::

---

_v0.13.1 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.13.1)._
