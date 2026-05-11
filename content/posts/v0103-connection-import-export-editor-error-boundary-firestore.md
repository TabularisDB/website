---
title: "v0.10.3: Portable Connections, an Editor Error Boundary, and Firestore"
date: "2026-05-11T10:00:00"
release: "v0.10.3"
tags: ["release", "feature", "ui", "ux", "plugin", "community"]
excerpt: "v0.10.3 lands JSON-based connection export and import (passwords included, keychain-safe), an editor error boundary that keeps the workspace alive when a driver crashes the result grid, a portal-rendered notebook database selector, a fix for drivers that return unnamed columns, and a new community-built Firestore plugin."
og:
  title: "v0.10.3:"
  accent: "Portable, Resilient, Firestore."
  claim: "Connection export/import with keychain-safe passwords, an editor error boundary, a portal-rendered notebook database selector, and a new community Firestore driver."
  image: "/img/tabularis-connection-manager.png"
---

# v0.10.3: Portable Connections, an Editor Error Boundary, and Firestore

**v0.10.3** is a community-heavy follow-up to [v0.10.2](/blog/v0102-postgres-rds-tls-cell-selection-sql-insert). Three external contributors land in this tag — two of them new — and a fourth ships a Firestore driver to the plugin registry on the same day. The headline change is being able to move your connections between machines without rebuilding them by hand; the rest is the kind of resilience work that's invisible until the day it isn't.

If v0.10.2 was about getting connections to work where they should, v0.10.3 is about getting them — and the editor that consumes them — to travel.

---

## Connection Export and Import

Up to v0.10.2, the only way to move your connection profiles between two installations was to copy `connections.json`, copy `ssh_connections.json`, then re-enter every password by hand on the new machine because the secrets live in the OS keychain and the JSON files don't include them. Doable, but painful past a handful of connections.

PRs [#175](https://github.com/TabularisDB/tabularis/pull/175) and [#176](https://github.com/TabularisDB/tabularis/pull/176) — both originating in [@zhaopengme](https://github.com/zhaopengme)'s combined PR [#172](https://github.com/TabularisDB/tabularis/pull/172), split into two focused PRs for review — replace that with a single round-trip through a JSON file.

The Connections page gets **Export** and **Import** buttons in the toolbar. Export walks every connection group, saved database connection, and SSH profile, pulls the relevant password out of the OS keychain (database password, SSH password, SSH key passphrase), and writes the lot into a JSON file. Import takes that file back, merges it with the existing config, writes the embedded passwords back into the keychain, and persists the connection files — so the imported entries behave exactly like manually-created ones. A fresh install also picks up an **Import** button on the empty-state view, so you have a way in before you've created the first profile.

The trade-off is unavoidable: the exported JSON contains plaintext passwords. Keep the file the way you'd keep a `.env`. If you only need to move connection shape and not credentials, you can strip the password fields before importing — Import writes back whatever passwords are present and leaves the keychain alone for empty ones.

The same PR also lands password visibility toggles on every password input across the New Connection, SSH, and AI provider modals. Small ergonomic win when you're pasting a password and want to see whether the paste landed correctly.

Full reference in the wiki: [Connections → Export / Import](/wiki/connections#export--import).

---

## An Editor Error Boundary

[@saurabh500](https://github.com/saurabh500) reported and fixed a sharp edge in [#173](https://github.com/TabularisDB/tabularis/pull/173): some drivers return columns with no name. The two examples in the wild are SQL Server's `SELECT @@VERSION` and PostgreSQL's `SELECT 1 AS ""`. The data grid couldn't render the empty column header — the whole editor pane blanked out instead, with no result, no error message, and no recovery short of reopening the tab.

The fix is small: empty column names are handled internally without breaking the grid. Drivers that return real names are unaffected.

That bug surfaced something else — there was no top-level error boundary around the editor. So one driver edge case could take down the whole workspace. PR [#173](https://github.com/TabularisDB/tabularis/pull/173) closes the immediate crash, and a follow-up commit wraps the editor surface in an **Editor Error Boundary** with a fallback UI ("Editor crashed — try again / report"), translated across English, Italian, Spanish, French, German, and Chinese.

Together they're the difference between "your query crashed the app" and "your query crashed; here's the trace and a reload button."

Saurabh also lands a small refactor in [#174](https://github.com/TabularisDB/tabularis/pull/174) — not user-visible, but the kind of housekeeping you only do when you've started reading the code seriously.

---

## Notebook Database Selector, Now Through a Portal

The scrollable database selector that landed in v0.10.1 ([#160](https://github.com/TabularisDB/tabularis/pull/160)) had a clipping bug nobody hit until a Notebook cell with a tall dropdown showed up. Short cells — no result yet, the last cell in a notebook, anything with collapsed neighbors — cut off the lower half of the dropdown, and the inner scrollbar became unreachable.

New contributor [@ymadd](https://github.com/ymadd) shipped the fix in PR [#178](https://github.com/TabularisDB/tabularis/pull/178). The dropdown now renders on top of the page rather than inside the cell, so it can't be clipped regardless of how tall or short its container is. Behavior across scroll and resize is consistent with the rest of the app, and the existing styling, height cap, click-outside-to-close, and "show only when more than one database" condition are all preserved.

If you have a MySQL host with many schemas and you've been bouncing off the Notebook DB selector since v0.10.1, this is the upgrade.

:::newsletter:::

---

## A New Plugin: Firestore (Community)

The plugin ecosystem picks up a sixth third-party driver, and the first one to target a managed NoSQL platform: **firestore-tabularis** by [@NewtTheWolf](https://github.com/NewtTheWolf), connecting Tabularis to [Google Cloud Firestore](https://cloud.google.com/firestore). It's now published to the [plugin registry](/plugins), so it's a one-click install from the in-app Plugin Manager.

:::plugin firestore:::

The mapping is the interesting part. Firestore is collection/document, not table/row, and it has no schema. The plugin fits Firestore into Tabularis' relational worldview by listing root collections as tables and sampling N documents per collection (default 50) to infer column types. Inferred schemas are cached per process; an optional set of JSON override files lets you pin required-ness, correct types, hide fields, or declare extras per project/database.

What works today (tagged `v0.1.0`):

- **Connection lifecycle** — install from the in-app Plugin Manager, then connect like any other driver.
- **Schema discovery** — root collections appear as tables, columns are inferred from document samples, and the ER diagram is populated with inferred foreign keys.
- **A SQL subset for queries** — `SELECT` with `WHERE`, `AND` / `OR` / `NOT`, `IN`, array contains, ordering, `LIMIT` / `OFFSET`, and cursor pagination.
- **`EXPLAIN`** mapped to Firestore's plan endpoint, with documents returned, documents scanned, index used, and execution time.
- **CRUD** via the data grid context menu (insert, update, delete rows, rename document IDs).
- **The full Google auth chain** — service account JSON, Application Default Credentials, `GOOGLE_APPLICATION_CREDENTIALS`, or the Firestore emulator host.

What's not in v0.1.0 yet: writing through raw SQL statements (`INSERT INTO`, `UPDATE`, `DELETE`) — those return a friendly redirect pointing you at the grid actions instead, with SQL-side DML on the plugin's roadmap. DDL is intentionally absent because Firestore is schemaless. Subcollections, multi-database, and live mode are listed as future phases.

The plugin is hosted on Codeberg ([NewtTheWolf/firestore-tabularis](https://codeberg.org/NewtTheWolf/firestore-tabularis)) with binaries mirrored for installation from the registry. If you've been waiting to point Tabularis at a Firestore project, this is the upgrade — and the plugin is open for issues on Codeberg.

---

## A Discord Community Channel

Tabularis now has a **dedicated Discord channel** for the community — a place to ask questions, share what you're building, and follow what's coming next.

To make it findable from inside the app, a small tile appears in the sidebar the first time you launch this version, inviting you to join the server. Dismiss it once and it's gone for good. Every Discord link across the app, the README, and the contributing guide now points to the same invite, so wherever you click, you land in the same room.

Come say hi.

---

## Smaller Things

A handful of polish items round out the release:

- **Connections page — import on empty state**. The empty Connections view ("No saved connections yet") used to offer only a "New Connection" button. It now also offers an **Import** button, so a fresh install with an exported payload in hand is one click from being usable.

---

## Thanks

Three external contributors land in v0.10.3, and one community plugin ships alongside it.

**[@zhaopengme](https://github.com/zhaopengme)** is new to the contributor list and lands the headline feature. The original PR [#172](https://github.com/TabularisDB/tabularis/pull/172) bundled both password visibility toggles and connection export/import; splitting it into [#175](https://github.com/TabularisDB/tabularis/pull/175) and [#176](https://github.com/TabularisDB/tabularis/pull/176) for separate review was friction we asked for and you accommodated without pushback — thank you.

**[@saurabh500](https://github.com/saurabh500)** continues a streak that started outside this window: two PRs in this tag ([#173](https://github.com/TabularisDB/tabularis/pull/173) and [#174](https://github.com/TabularisDB/tabularis/pull/174)), one bug fix sharp enough to expose a missing error boundary, one small refactor that's the kind of thing you only do when you've started reading the code seriously.

**[@ymadd](https://github.com/ymadd)** is also new — PR [#178](https://github.com/TabularisDB/tabularis/pull/178) is a textbook portal-rendering fix, with the test plan, the reproduction conditions, and the cross-reference to the existing pattern already written. The kind of PR that's just done when it lands.

**[@NewtTheWolf](https://github.com/NewtTheWolf)** ships [firestore-tabularis](https://codeberg.org/NewtTheWolf/firestore-tabularis) the same day as the release — a full Firestore driver written from scratch against the plugin protocol, with schema inference, a SELECT parser, EXPLAIN plan extraction, schema overrides, and the entire Google auth chain wired up. The plugin protocol exists so this kind of thing can happen without us touching the core, and it's still satisfying when it does.

If you've been moving between machines and rebuilding your connection list by hand, hitting unnamed columns in SQL Server or Postgres, bouncing off the Notebook DB selector, or waiting to point Tabularis at Firestore — this is the upgrade.

:::contributors:::

---

_v0.10.3 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.10.3)._
