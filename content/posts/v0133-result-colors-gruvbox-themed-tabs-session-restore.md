---
title: "v0.13.3: Color Your Results, Theme Your Tabs, and Pick Up Where You Left Off"
date: "2026-06-24T10:00:00"
release: "v0.13.3"
tags: ["release", "feature", "ui", "ux", "data-grid", "editor", "theme", "kubernetes", "mcp", "plugin", "community"]
excerpt: "v0.13.3 is a personalization release: color query results by data type, dress the editor in a new Gruvbox theme, tint the tab bar with each connection's color, reopen the connections you had last session, and toggle CSV headers when you copy — plus a community Informix driver, driver-aware Kubernetes ports, and louder MCP approval alerts."
og:
  title: "v0.13.3:"
  accent: "Make it yours."
  claim: "Result cells colored by data type, a new Gruvbox theme, connection-tinted editor tabs, session restore on launch, CSV-header copy, a community Informix driver, and driver-aware Kubernetes ports."
  image: "/img/og/v0133-personalization.png"
  cover: "/img/og/v0133-personalization.png"
---

# v0.13.3: Color Your Results, Theme Your Tabs, and Pick Up Where You Left Off

**v0.13.3** follows [v0.13.2](/blog/v0132-managed-notebooks-live-query-progress-faster-grid), which made the notebook, results panel, and grid feel responsive and managed. This one is about making the app feel like *yours*: results that read at a glance because they're colored by type, an editor that shows you which connection you're in by its color, a new theme, and a workspace that reopens where you left it. It's a release driven almost entirely by the community — ten external contributors land in this tag.

---

## Results, Colored by Type

A grid where every value renders in the same color makes you read each cell to know what it is. v0.13.3 fixes that with customizable result colors, contributed by [@GabrielMalava](https://github.com/GabrielMalava) (Gabriel Malavazi Rodrigues) in PR [#354](https://github.com/TabularisDB/tabularis/pull/354).

Turn on **Result Colors** under **Settings → Appearance → General** and query result cells are tinted by their data type — **numbers, text, dates/times, and booleans** each get their own color. The defaults follow your active theme's semantic palette, so it looks coherent out of the box, and a per-type color picker with a live preview and a **Reset to theme** button lets you tune each one. It's off by default; values render exactly as before until you opt in. Colors apply only to plain data cells — edited, inserted, deleted, and NULL cells keep their existing styling — and the per-column colors are precomputed once rather than recalculated on every render, so there's no scroll cost.

The same PR sharpened in-place editing: pending grid edits now commit with a rebindable **`save_grid_changes`** shortcut (Cmd/Ctrl+S, [TablePlus-style](/compare/tableplus-alternative)), and editing single-table `SELECT` results is validated against the table's real columns first — so an aliased or computed column gives you a clear message instead of a cryptic `1054 Unknown column`, and a result missing its primary key is blocked with guidance to include it rather than building an unsafe `UPDATE`.

<video src="/videos/posts/tabularis-result-colors.mp4" poster="/videos/posts/tabularis-result-colors.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Tabs That Wear the Connection's Color

If you keep several connections open, the editor tabs all looked the same — easy to run a statement against the wrong one. PR [#333](https://github.com/TabularisDB/tabularis/pull/333) by [@Davydhh](https://github.com/Davydhh) (with Davide Cazzetta) ties the whole tab strip to the active connection's color.

The active-tab indicator line now uses the connection color with a soft glow, the active tab carries an accent-tinted body gradient, and inactive tabs pick up an accent wash on hover instead of a flat grey. The loading bar and the rename input border follow the same color, and the tab bar itself uses a vertical accent gradient with an accent-tinted bottom border so the strip reads as part of the connection. The treatment extends into [split view](/wiki/split-view): split-pane panel headers and the connection switcher use each pane's accent instead of a fixed blue. When no connection is active it all falls back to the default blue, and the scroll arrows and new-tab buttons stay theme-safe.

<video src="/videos/posts/tabularis-connection-tabs.mp4" poster="/videos/posts/tabularis-connection-tabs.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## A New Theme: Gruvbox

[@Wilovy09](https://github.com/Wilovy09) added **Gruvbox Material**, in both Dark and Light, in PR [#357](https://github.com/TabularisDB/tabularis/pull/357) — bringing the built-in count to twelve. Each ships with a matching dedicated Monaco editor theme, so the SQL editor's syntax colors line up with the rest of the UI, and both are wired into the theme registry with sidebar and registry test coverage. Switch to it in **Settings → Appearance**; like every theme, it applies instantly with no restart.

<video src="/videos/posts/tabularis-gruvbox.mp4" poster="/videos/posts/tabularis-gruvbox.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

:::newsletter:::

---

## A Workspace That Remembers

Launching Tabularis dropped you on an empty workspace even if you'd had three connections open when you quit. PR [#332](https://github.com/TabularisDB/tabularis/pull/332), also from [@GabrielMalava](https://github.com/GabrielMalava), adds opt-in session restore: enable it and Tabularis reopens the connections from your previous session on startup, with autoconnect set only after the connection validates so a stale credential can't wedge the launch. The same PR adds a **start-maximized** option for anyone who always drags the window full-size anyway. Both live in **Settings → General**.

---

## Copy CSV With (or Without) Headers

When you copied rows as CSV, you got the values but never the column names — fine for pasting back into a query, annoying for pasting into a spreadsheet. [@Wilovy09](https://github.com/Wilovy09) added a **CSV headers** toggle in the copy controls in PR [#356](https://github.com/TabularisDB/tabularis/pull/356). A new `csvIncludeHeaders` setting (persisted in `config.json`, on by default) and a toolbar toggle let you decide per copy whether the header row comes along, threaded all the way down to the grid with i18n across all eight locales.

---

## Louder MCP Approvals

[Approval gates](/wiki/mcp-approval-gates) only help if you notice them. [@Stiwar0098](https://github.com/Stiwar0098) closed that gap in PR [#311](https://github.com/TabularisDB/tabularis/pull/311) (closes [#307](https://github.com/TabularisDB/tabularis/issues/307)) with an attention flow that fires when a pending approval appears: the window comes to the front via a user-attention request, an OS notification with localized title and body is sent, and an optional alert sound plays. Two new toggles under **MCP → Safety** — **keep the approval window on top** while a request is pending, and **play an alert sound** — let you tune how insistent it is, both localized across eight languages. On Linux the alert now plays through the OS notification sound so it actually reaches you when Tabularis is in the background.

---

## Driver-Aware Kubernetes Connections

The [Kubernetes connection](/wiki/kubernetes-tunneling) dialogs had two rough edges, fixed by [@metalgrid](https://github.com/metalgrid) in PR [#319](https://github.com/TabularisDB/tabularis/pull/319). The context, namespace, saved-connection, and resource-name selectors are now **searchable** instead of forcing a scroll through long lists, and the container port no longer hard-codes MySQL's `3306` — it reads `default_port` from the active driver's manifest, so Postgres lands on `5432`, ClickHouse on `8123`, and plugin drivers on whatever they declare. The maintainer follow-up added a **service port discovery** command so the dialog can derive the port from the service's actually-exposed port, plus corrected inline port defaults and localized K8s validation messages across all eight locales.

---

## A Community Informix Driver

[@danielnuld](https://github.com/danielnuld) built and shipped an **IBM Informix** driver plugin, registered in PR [#343](https://github.com/TabularisDB/tabularis/pull/343). It's now in the plugin registry serving releases for Linux, macOS, and Windows — v0.1.2 adds the missing `linux-x64` asset, and earlier point releases hid the stray console window on Windows. Install it from **Settings → Plugins**. Informix joins the growing set of community-built drivers extending Tabularis beyond the built-in MySQL, Postgres, and SQLite.

:::star:::

---

## Smaller Things

- **Fresh AI model lists** ([@debba](https://github.com/debba), PR [#359](https://github.com/TabularisDB/tabularis/pull/359)) — the Anthropic and MiniMax model menus are now fetched live from their APIs instead of a hardcoded list, so newly released models show up without a Tabularis update.
- **Multi-database operations stay scoped** ([@debba](https://github.com/debba), PR [#346](https://github.com/TabularisDB/tabularis/pull/346)) — the ER diagram, dump, and export now act on the database you've selected on a multi-database connection instead of leaking across all loaded databases.
- **Social links everywhere they're expected** ([@debba](https://github.com/debba), PR [#353](https://github.com/TabularisDB/tabularis/pull/353)) — GitHub, Discord, X, Bluesky, and Mastodon links now appear in the Settings Info tab, the update and What's New modals, and the welcome screen, pulled from a single source of truth.
- **External plugin triggers forwarded** ([@haos666](https://github.com/haos666), PR [#321](https://github.com/TabularisDB/tabularis/pull/321)) — plugin trigger RPCs are now forwarded through to plugin drivers, so plugins can expose trigger-style actions.
- **Robust view-definition parsing** ([@maacl](https://github.com/maacl), PR [#320](https://github.com/TabularisDB/tabularis/pull/320)) — the view editor extracts the `SELECT` body from a view definition more reliably across the shapes different engines return.
- **Flatpak via Flatpark** ([@jing2uo](https://github.com/jing2uo), PR [#341](https://github.com/TabularisDB/tabularis/pull/341)) landed in the README, alongside an updated sponsors list.

---

## Thanks

Nine external contributors land in v0.13.3 — this release is overwhelmingly community work.

**[@GabrielMalava](https://github.com/GabrielMalava) (Gabriel Malavazi Rodrigues)** lands both customizable result colors with the editing improvements ([#354](https://github.com/TabularisDB/tabularis/pull/354)) and session restore with the start-maximized option ([#332](https://github.com/TabularisDB/tabularis/pull/332)) — two of the headline features of the release.

**[@Davydhh](https://github.com/Davydhh)** (with Davide Cazzetta) tied the editor tab bar and split panels to the active connection's color ([#333](https://github.com/TabularisDB/tabularis/pull/333)).

**[@Wilovy09](https://github.com/Wilovy09)** added the Gruvbox theme ([#357](https://github.com/TabularisDB/tabularis/pull/357)) and the CSV-header copy toggle ([#356](https://github.com/TabularisDB/tabularis/pull/356)).

**[@Stiwar0098](https://github.com/Stiwar0098)** built the MCP approval attention flow ([#311](https://github.com/TabularisDB/tabularis/pull/311)) so a pending approval never goes unnoticed.

**[@metalgrid](https://github.com/metalgrid)** made the Kubernetes selection dialogs searchable and driver-aware ([#319](https://github.com/TabularisDB/tabularis/pull/319)).

**[@danielnuld](https://github.com/danielnuld)** built and shipped the community IBM Informix driver plugin ([#343](https://github.com/TabularisDB/tabularis/pull/343)).

**[@haos666](https://github.com/haos666)** forwarded external plugin trigger RPCs ([#321](https://github.com/TabularisDB/tabularis/pull/321)), and **[@maacl](https://github.com/maacl)** hardened view-definition parsing ([#320](https://github.com/TabularisDB/tabularis/pull/320)).

**[@jing2uo](https://github.com/jing2uo)** documented Flatpak install via Flatpark ([#341](https://github.com/TabularisDB/tabularis/pull/341)).

If you juggle multiple connections and want them color-coded, read grids faster when values are typed by color, theme your editor with Gruvbox, want Tabularis to reopen where you left it, or connect to Informix — this is the upgrade.

:::contributors:::

---

_v0.13.3 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.13.3)._
