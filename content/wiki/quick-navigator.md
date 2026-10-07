---
title: "Command Palette"
order: 4.2
excerpt: "Search actions and database objects together with Cmd+K / Ctrl+K, jump to any table, view, routine, or trigger with Cmd+P / Ctrl+P, or run editor, result and connection actions from the action palette on Cmd+Shift+A / Ctrl+Shift+A."
category: "Core Features"
---

Starting with v0.13.0, Tabularis includes a "go to anything" search overlay in the spirit of the palette every code editor has. In v0.20.0 it grew into a full **command palette** with two modes: **object search** (the original Quick Navigator) and an **action palette** for running app commands. A label in the palette header always shows which mode you're in. Since v0.26.0 the two are also searchable together, and the action palette covers the editor, the result grid and saved connections.

<video src="/videos/wiki/19-quick-navigator.mp4" poster="/videos/wiki/19-quick-navigator.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Opening It

Press `⌘+K` (macOS) or `Ctrl+K` (Windows/Linux) to search actions and objects in one list (since v0.26.0). `⌘+P` / `Ctrl+P` opens it scoped to object search while a connection is open, and `⌘+Shift+A` / `Ctrl+Shift+A` scoped to actions. All three shortcuts are customizable from **Settings → Keyboard Shortcuts** under the **Navigation** category — see [Keyboard Shortcuts](/wiki/keyboard-shortcuts).

## The Action Palette

The action palette runs app commands, filtered as you type, with the same keyboard handling as object search. Since v0.26.0 what it offers follows what you are doing:

| Category | Actions |
| :--- | :--- |
| **Navigation** | Open settings, open the connection manager |
| **Connection** | Every saved connection: connect to it, or switch to it if it is already open |
| **Editor** | Open a new console, run query, run all statements, save the SQL file (file-backed tabs), close the active tab |
| **Results** | Copy the selected cells, rows or columns, copy a column's values as a SQL `IN (...)` list, copy all rows |
| **Table** | Open the current table in a SQL console, inspect it, generate SQL, count rows |

Result actions work in both tabbed and stacked [multi-result](/wiki/editor) views and include pending inserted rows; each copy label states the number of rows the command will copy. The navigation commands stay available while the editor is loading or showing an error, so the palette is always a way back to Settings or the connection manager.

<video src="/videos/posts/tabularis-command-palette-actions.mp4" poster="/videos/posts/tabularis-command-palette-actions.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

Commands are **scope-aware**: each editor pane registers the connection and table it owns, and the palette resolves commands against the pane you're actually working in. In [split view](/wiki/split-view) with two connections, the action palette invoked from each pane targets that pane's connection and table — not whichever connection happens to be globally active.

## What Object Search Finds

The object palette filters **tables, views, routines, and triggers** as you type, using **typo-tolerant fuzzy matching** — a misspelling like `ordrs` still finds `orders`, and the closest names rank first. Since v0.23.0 object types carry a relevance weight (tables above views, both above routines and triggers): with an empty query tables come first, and a table whose name contains the text ranks above the functions that also match it, while typing the exact name of a function still puts that function first. The fuzzy threshold was tightened at the same time (one typo every four characters), which matters on PostgreSQL schemas where extensions such as PostGIS add over a thousand functions to `public`. When the overlay opens, Tabularis resolves and indexes *all* databases and schemas configured for the active connection in the background:

- A [multi-database MySQL/MariaDB connection](/wiki/connections#multi-database-support-mysql--mariadb) is searched across every selected database.
- A [multi-schema PostgreSQL connection](/wiki/connections#multi-schema-support-postgresql) is searched across every visible schema.

Results are grouped under separator headers by database/schema, so `users` in `app_prod` and `users` in `app_staging` are unambiguous.

## Quick Actions

Hover any result to reveal inline actions:

| Action | Available on | Effect |
| :--- | :--- | :--- |
| **Inspect structure** | tables | Opens the structure modal with columns, types, and keys |
| **New console** | tables | Opens a console tab pre-filled with a `SELECT *` — without running it |
| **Generate SQL templates** | tables | Opens the [Generate SQL](/wiki/schema-management#generate-sql) modal |
| **Count rows** | tables, views | Runs a `COUNT(*)` against the object |
| **Run SELECT query** | tables, views | Opens a console tab with a `SELECT *` and runs it |
| **Copy name** | everything | Copies the object name to the clipboard |

Selecting a result (Enter or click) opens it — tables and views run a `SELECT *` in a console tab, routines and triggers open their definition — and reveals the object in the sidebar: collapsed databases or schemas auto-expand, lazily load their contents if needed, and the sidebar scrolls the item into view.

## Performance Notes

The navigator was built to stay responsive on connections with hundreds of tables: sidebar table items are memoized so only the previously- and newly-active items re-render, and the scroll-reveal retries until asynchronously loaded items actually exist in the DOM. The result list renders at most 100 rows; the footer still shows the total number of matches, so narrowing the query is the way to reach anything below the cut.
