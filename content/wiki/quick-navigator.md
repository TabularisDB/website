---
title: "Quick Navigator"
order: 4.2
excerpt: "Jump to any table, view, routine, or trigger in any database or schema with Cmd+P / Ctrl+P."
category: "Core Features"
---

# Quick Navigator

Starting with v0.13.0, Tabularis includes a **Quick Navigator** — a search overlay for jumping to any schema object of the active connection, in the spirit of the "go to anything" palette every code editor has.

<video src="/videos/wiki/19-quick-navigator.mp4" poster="/videos/wiki/19-quick-navigator.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Opening It

Press `⌘+P` (macOS) or `Ctrl+P` (Windows/Linux) while a connection is open. The shortcut is customizable from **Settings → Keyboard Shortcuts** under the **Navigation** category — see [Keyboard Shortcuts](/wiki/keyboard-shortcuts).

## What It Searches

The navigator filters **tables, views, routines, and triggers** as you type, using **typo-tolerant fuzzy matching** — a misspelling like `ordrs` still finds `orders`, and the closest names rank first. When the overlay opens, Tabularis resolves and indexes *all* databases and schemas configured for the active connection in the background:

- A [multi-database MySQL/MariaDB connection](/wiki/connections#multi-database-support-mysql--mariadb) is searched across every selected database.
- A [multi-schema PostgreSQL connection](/wiki/connections#multi-schema-support-postgresql) is searched across every visible schema.

Results are grouped under separator headers by database/schema, so `users` in `app_prod` and `users` in `app_staging` are unambiguous.

## Quick Actions

Hover any result to reveal inline actions:

| Action | Available on | Effect |
| :--- | :--- | :--- |
| **Inspect Structure** | tables | Opens the structure modal with columns, types, and keys |
| **New Console** | tables | Opens a console tab pre-filled with a `SELECT *` — without running it |
| **Generate SQL** | tables | Opens the [Generate SQL](/wiki/schema-management#generate-sql) modal |
| **Count Rows** | tables, views | Runs a `COUNT(*)` against the object |
| **Run Query** | tables, views | Opens a console tab with a `SELECT *` and runs it |
| **Copy Name** | everything | Copies the object name to the clipboard |

Selecting a result (Enter or click) opens it — tables and views run a `SELECT *` in a console tab, routines and triggers open their definition — and reveals the object in the sidebar: collapsed databases or schemas auto-expand, lazily load their contents if needed, and the sidebar scrolls the item into view.

## Performance Notes

The navigator was built to stay responsive on connections with hundreds of tables: sidebar table items are memoized so only the previously- and newly-active items re-render, and the scroll-reveal retries until asynchronously loaded items actually exist in the DOM.
