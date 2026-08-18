---
title: "Command Palette"
order: 4.2
excerpt: "Jump to any table, view, routine, or trigger with Cmd+P / Ctrl+P, or run app actions from the action palette on Cmd+Shift+A / Ctrl+Shift+A."
category: "Core Features"
---

# Command Palette

Starting with v0.13.0, Tabularis includes a "go to anything" search overlay in the spirit of the palette every code editor has. In v0.20.0 it grew into a full **command palette** with two modes: **object search** (the original Quick Navigator) and an **action palette** for running app commands. A label in the palette header always shows which mode you're in.

<video src="/videos/wiki/19-quick-navigator.mp4" poster="/videos/wiki/19-quick-navigator.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Opening It

Press `⌘+P` (macOS) or `Ctrl+P` (Windows/Linux) while a connection is open to search objects, or `⌘+Shift+A` / `Ctrl+Shift+A` for the action palette. Both shortcuts are customizable from **Settings → Keyboard Shortcuts** under the **Navigation** category — see [Keyboard Shortcuts](/wiki/keyboard-shortcuts).

## The Action Palette

The action palette runs app commands — for example opening settings or opening the current table in a SQL console — filtered as you type, with the same keyboard handling as object search.

Commands are **scope-aware**: each editor pane registers the connection and table it owns, and the palette resolves commands against the pane you're actually working in. In [split view](/wiki/split-view) with two connections, the action palette invoked from each pane targets that pane's connection and table — not whichever connection happens to be globally active.

## What Object Search Finds

The object palette filters **tables, views, routines, and triggers** as you type, using **typo-tolerant fuzzy matching** — a misspelling like `ordrs` still finds `orders`, and the closest names rank first. When the overlay opens, Tabularis resolves and indexes *all* databases and schemas configured for the active connection in the background:

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
