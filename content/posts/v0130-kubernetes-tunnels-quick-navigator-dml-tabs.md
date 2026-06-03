---
title: "v0.13.0: Kubernetes Tunnels, a Quick Navigator, and MCP That Reaches Your Plugins"
date: "2026-06-03T10:00:00"
release: "v0.13.0"
tags: ["release", "feature", "security", "mcp", "plugin", "kubernetes", "ui", "ux", "sql", "mysql", "postgres", "community"]
excerpt: "v0.13.0 adds first-class Kubernetes port-forward tunnels alongside SSH, a Cmd+P Quick Navigator for jumping to any table in any database, MCP access to plugin-driven connections, a closed multi-statement bypass in the MCP safety gates, Codex as an MCP install target, DML tabs in Generate SQL, a configurable display timezone, self-healing query history, and MySQL SSL modes that are actually honored."
og:
  title: "v0.13.0:"
  accent: "Kubernetes, Cmd+P, MCP."
  claim: "First-class Kubernetes port-forward tunnels, a Quick Navigator search overlay, MCP that reaches plugin drivers with hardened fail-closed gates, Codex integration, DML tabs in Generate SQL, display timezone, and self-healing query history."
  image: "/img/tabularis-kubernetes-tunnel.png"
---

# v0.13.0: Kubernetes Tunnels, a Quick Navigator, and MCP That Reaches Your Plugins

**v0.13.0** follows [v0.12.0](/blog/v0120-per-connection-appearance-related-records-sql-splitter) with a cycle about *reach*: reaching a database that lives inside a Kubernetes cluster without `kubectl port-forward` in a forgotten terminal tab, reaching any table in any schema with two keystrokes, and letting MCP agents reach the connections that run through plugin drivers — while closing the one hole that let a stacked query reach further than it should have.

Six external contributors land in this tag — three of them new — plus a first-time co-author.

---

## Kubernetes Port-Forward Tunnels

If your database lives inside a Kubernetes cluster, the ritual is familiar: `kubectl port-forward svc/postgres 5433:5432` in a terminal you must remember to keep open, then a connection in your database client pointed at `127.0.0.1:5433` that silently breaks the moment that terminal dies.

[@metalgrid](https://github.com/metalgrid) (Iskren Hadzhinedev) — new to the contributor list — ships PR [#246](https://github.com/TabularisDB/tabularis/pull/246), which makes Kubernetes a **first-class transport option alongside SSH tunnels**. The connection modal grows a **Kubernetes** tab: pick a kubectl context, a namespace, a resource (service or pod), and a container port — each dropdown discovered live from your kubeconfig and cascading into the next.

![The Kubernetes tab in the connection modal with cascading dropdowns for context, namespace, resource, and port](/img/tabularis-kubernetes-tunnel.png)

How it works:

- Tabularis runs `kubectl port-forward` as a **managed child process**, binds a local ephemeral port, and points the database driver at it — same pattern as the SSH tunnel, no port to pick manually.
- Tunnels are **reused** across connections to the same resource (keyed by context/namespace/resource/port), with health checks and lifecycle management.
- Saved K8s configurations persist as reusable profiles in `k8s_connections.json` — the same pattern as SSH profiles — and round-trip through connection Export / Import.
- Connections with a tunnel get a blue **K8s badge** on the Connections page and in the sidebar.
- K8s and SSH are mutually exclusive on a connection — enabling one disables the other.

The only requirements are `kubectl` in your `$PATH` and a valid kubeconfig. The PR lands with 18 new Rust tests and 24 new TypeScript tests, and the tunnel expansion is wired through every database command path — including MCP, so an agent can query a cluster-resident database through the same tunnel you use.

Full reference in the wiki: [Kubernetes Tunneling](/wiki/kubernetes-tunneling).

If you've been keeping a `kubectl port-forward` alive in tmux just to browse a staging database, this is the upgrade.

---

## Quick Navigator: `Cmd+P` for Your Schema

Every editor since Sublime has had a "jump to anything" key. Your database client now does too. PR [#252](https://github.com/TabularisDB/tabularis/pull/252) — co-authored with **lecndu**, taking inspiration from Beekeeper Studio's Quick Search — adds a **Quick Navigator** overlay on `Cmd+P` / `Ctrl+P`:

<video src="/videos/wiki/19-quick-navigator.mp4" poster="/videos/wiki/19-quick-navigator.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

- Type to filter **tables, views, routines, and triggers** of the active connection.
- All databases and schemas configured on the connection are indexed **in the background** when the overlay opens — a multi-database MySQL connection or a multi-schema Postgres one is searched whole, with results grouped under per-database/schema headers.
- Hover any result for **quick actions**: Inspect Structure, New Console, Generate SQL, Count Rows, Run Query, and Copy Name — scoped to what makes sense for each object type.
- Pick a result and the sidebar **expands and scrolls to the table** — including databases that were collapsed and hadn't loaded their table list yet.
- The shortcut is customizable in **Settings → Keyboard Shortcuts** under Navigation.

The follow-up commits are where it got interesting: on a connection with *hundreds* of tables, selecting a result used to freeze the UI, because every sidebar table item re-rendered on every render. `SidebarTableItem` is now memoized with a comparator that only re-renders the two items whose active-state actually changed, collapsed databases auto-expand and lazy-load when they become active, and the scroll-into-view retries across animation frames until the asynchronously-loaded item actually exists in the DOM. Large-schema sidebars get faster even if you never press `Cmd+P`.

---

## MCP: Plugin Drivers, a Closed Bypass, and Codex

Three PRs this cycle touch the MCP server — two from [@ymadd](https://github.com/ymadd), who keeps pulling on threads until the whole seam is rebuilt.

### Plugin-driven connections now work over MCP

The MCP server hardcoded dispatch for mysql/postgres/sqlite, so every connection running through a plugin driver — Hacker News, Redis, anything from the registry — failed with `Unsupported driver`. PR [#256](https://github.com/TabularisDB/tabularis/pull/256) (closes [#255](https://github.com/TabularisDB/tabularis/issues/255)) routes the schema resource, `list_tables`, `describe_table`, `run_query`, and the pre-flight `EXPLAIN` through the **shared driver registry** — the same path the GUI uses — and registers built-in plus installed plugin drivers when the `--mcp` subprocess starts.

Reaching plugins from a headless subprocess surfaced a pile of hardening, all shipped in the same PR: plugin RPC calls are bounded by timeouts so a wedged plugin can't block the request loop forever, plugin children are killed instead of orphaned when the subprocess exits, plugins claiming a built-in driver id are refused, `resources/read` resolves through the keychain/SSH-aware path, and the `--mcp` mode finally gets a logger (stderr only) so plugin-load errors are visible.

### The approval/read-only bypass, closed

PR [#261](https://github.com/TabularisDB/tabularis/pull/261) fixes the kind of bug a safety feature exists to not have. The [read-only](/wiki/mcp-readonly-mode) and [approval](/wiki/mcp-approval-gates) gates classified a query by its **leading keyword** — so a stacked payload like `SELECT 1; DROP TABLE users` was tagged as a clean read and sailed past both gates. Separately, an approver could edit an approved `SELECT` into a `DELETE` in the approval modal, and the edit was executed without being re-classified.

The classifier now **fails closed on multi-statement payloads**: string literals are stripped under both the SQL-standard (`''`) and MySQL backslash-escape (`\'`) readings, and a `;` followed by more SQL under *either* reading trips the gate — so a payload can't hide a separator by exploiting whichever dialect the classifier doesn't assume. And the approver-edited query is **re-classified and re-checked against read-only** before execution, with the audit record updated to the effective query.

The execution layer's prepared-statement protocol already rejected most stacked queries, but the classifier is the documented fail-closed contract — this restores it. If you point agents at anything you care about, update.

### Codex joins the client list

[@arsis-dev](https://github.com/arsis-dev) (Julien Barbe) — new to the contributor list — adds **Codex** as an MCP install target in PR [#264](https://github.com/TabularisDB/tabularis/pull/264). The MCP integration page already auto-detects Claude Desktop, Claude Code, Cursor, Windsurf, and Antigravity; Codex now appears alongside them, wired through `codex mcp add tabularis -- <tabularis> --mcp`, with the Codex-specific manual command shown in the setup UI.

:::newsletter:::

---

## Generate SQL Grows DML Tabs

The **Generate SQL** tool in the table context menu used to do one thing: show the `CREATE TABLE` statement. [@capvalen](https://github.com/capvalen) (Infocat) — new to the contributor list — extends it in PR [#259](https://github.com/TabularisDB/tabularis/pull/259) with a tab per statement kind:

![The Generate SQL modal with tabs for CREATE TABLE, SELECT *, SELECT fields, UPDATE, and DELETE](/img/tabularis-generate-sql-dml-tabs.png)

- **SELECT \*** and **SELECT [fields]** — ready-made queries against the table.
- **UPDATE** and **DELETE** — templates with every column laid out.
- A **Run in Console** button that opens the generated statement in a new editor tab.

The generated `UPDATE` uses `:named` bind parameters derived from the column names instead of bare `?` placeholders, so the statement binds correctly the moment it lands in the query editor. Translations ship for all eight locales in the same PR.

---

## Display Timezone: Timestamps Where You Are

[@ymadd](https://github.com/ymadd)'s third PR of the cycle, [#251](https://github.com/TabularisDB/tabularis/pull/251) (closes [#249](https://github.com/TabularisDB/tabularis/issues/249) and [#250](https://github.com/TabularisDB/tabularis/issues/250)), starts as a bug fix and ends as a setting.

The bug: the AI activity log rendered raw UTC timestamps — events table, sessions list, detail modal, and the CSV / JSON / notebook exports all showed a time that wasn't yours.

The setting: **Settings → Localization → Timezone**, a searchable picker of IANA zones with current UTC-offset labels, defaulting to **Auto** (your OS zone). The selected zone drives every UI timestamp — activity log, query history, favorites — and the backend exports via `chrono-tz`. Query-history date grouping classifies the today/yesterday/older boundaries in the same zone, so the group headers and the per-row times can never disagree. Even the default export filename derives its date from the configured zone.

---

## Query History That Heals Itself

PR [#253](https://github.com/TabularisDB/tabularis/pull/253) chases a "history doesn't work anymore" report on macOS down to a file ending in valid JSON followed by 46 bytes of leftover tail — concurrent `addEntry` calls (one per statement in multi-statement scripts) raced on the file write, and a shorter write over a longer one left trailing garbage. Once corrupt, the parse failure silently short-circuited both reads *and* writes: the History panel went permanently empty and nothing new was ever recorded.

Three fixes ship together:

- **Self-healing reads** — a corrupt file is renamed aside as `<id>.json.corrupt-<timestamp>` and history starts fresh, instead of staying mute forever.
- **Atomic writes** — write to a temp file, then rename onto the target, so a concurrent or crashed write can never leave a half-written file.
- **Per-connection serialization** — an async mutex orders read-modify-write sequences so concurrent entries can't lose updates.

If a corrupt file was recovered, the History sidebar shows a dismissible banner with the backup path — so you know what happened and where your data went.

---

## Failed Schema Loads Now Say So

When `get_schemas` failed — bad search path, permissions, a flaky tunnel — the sidebar rendered `TABLES (0)` / `VIEWS (0)` and nothing else. The connection looked open (the connection test runs on a separate code path), so it *appeared* connected while showing nothing, with no hint anything went wrong.

[@verbaux](https://github.com/verbaux) (Nikolay Zhuravlev) fixes the silence in PR [#242](https://github.com/TabularisDB/tabularis/pull/242): the sidebar now shows a **"Failed to load schemas"** message with a **Retry** button, a two-line brief of the actual error, and a collapsible **Details** section holding the full raw error with a copy button. For Postgres the brief is the human-readable part of the driver error, with the debug dump tucked into the expanded box. The new strings ship in all eight locales.

---

## MySQL SSL Mode, Actually Honored

[@arsis-dev](https://github.com/arsis-dev)'s second PR of the cycle, [#263](https://github.com/TabularisDB/tabularis/pull/263), follows up the original MySQL SSL support from [#133](https://github.com/TabularisDB/tabularis/pull/133). Two related gaps: the test-connection path built its URL without passing the selected `ssl_mode` to the driver — so a connection configured with `ssl_mode=disabled` still attempted TLS in the test path — and the connection pool key ignored TLS settings entirely, so editing a connection from one SSL mode to another could silently reuse a cached pool created under the old mode. Both are fixed, with regression tests on the URL builder and the pool key.

---

## Smaller Things

- **PostgreSQL FK metadata via `pg_catalog`** ([@m-tonon](https://github.com/m-tonon), PR [#245](https://github.com/TabularisDB/tabularis/pull/245)) — the `information_schema` query that loaded foreign-key metadata sometimes missed constraints, and when it did the FK buttons just disappeared from the grid. The query now reads `pg_constraint` / `pg_attribute` / `pg_class` / `pg_namespace` directly, correctly handling composite keys, cross-schema references, and update/delete rules — with an integration test covering all of it.
- **Mouse scroll no longer re-renders the selection** (commit `12f45865`) — scrolling the results with the wheel was churning `selectedIndex` re-renders for no reason.
- **Plugin data folder paths corrected** (commit `358514ed`) — plugin data directories now resolve to the right place.

---

## Thanks

Six external contributors land in v0.13.0 — three new, three returning — plus a first-time co-author.

**[@ymadd](https://github.com/ymadd)** ships three PRs this cycle, and they form an arc: the registry dispatch that lets MCP reach plugin drivers ([#256](https://github.com/TabularisDB/tabularis/pull/256)), the fail-closed classifier that makes sure that expanded reach stays gated ([#261](https://github.com/TabularisDB/tabularis/pull/261)), and the display-timezone work ([#251](https://github.com/TabularisDB/tabularis/pull/251)) that turns a timestamp bug into a proper Localization setting. After the SQL splitter in v0.12.0, ymadd has now rebuilt both of the places where Tabularis decides what a piece of SQL *is* — in the editor and in the safety gates.

**[@metalgrid](https://github.com/metalgrid) (Iskren Hadzhinedev)** is new to the contributor list and lands the Kubernetes tunnel feature ([#246](https://github.com/TabularisDB/tabularis/pull/246)) — a genuinely vertical piece of work spanning a new Rust tunnel module, Tauri commands, the connection modal with cascading kubectl discovery, badges, export/import, and 42 new tests. First PR, first-class transport. Welcome.

**[@arsis-dev](https://github.com/arsis-dev) (Julien Barbe)** is also new and ships two precise PRs: the Codex MCP integration ([#264](https://github.com/TabularisDB/tabularis/pull/264)) and the MySQL SSL mode fix ([#263](https://github.com/TabularisDB/tabularis/pull/263)) — the latter with exactly the kind of issue-archaeology (checking #122, #133, #166, #167, #190 for overlap) that makes a fix easy to merge. Welcome.

**[@capvalen](https://github.com/capvalen) (Infocat)** is new as well, and extends the Generate SQL tool with DML tabs and Run in Console ([#259](https://github.com/TabularisDB/tabularis/pull/259)) — including translations for all eight locales. Welcome.

**[@verbaux](https://github.com/verbaux) (Nikolay Zhuravlev)** follows the Russian locale from v0.12.0 with the schema-load error surfacing ([#242](https://github.com/TabularisDB/tabularis/pull/242)) — taking a "shows nothing, says nothing" failure and giving it a message, a Retry button, and copyable details, in every locale.

**[@m-tonon](https://github.com/m-tonon) (Matheus Tonon)** returns with the `pg_catalog` FK metadata fix ([#245](https://github.com/TabularisDB/tabularis/pull/245)) — following the Related Records panel from v0.12.0 with the fix that keeps the FK buttons it depends on from vanishing.

And **lecndu** co-authors the Quick Navigator ([#252](https://github.com/TabularisDB/tabularis/pull/252)) — a first contribution from inside a pair, which counts.

If you want to reach a database inside a Kubernetes cluster without babysitting a port-forward, jump to any table in any schema with `Cmd+P`, point an MCP agent at a plugin-driven connection and trust the gates it passes through, generate an UPDATE with named bind params in two clicks, read timestamps in your own timezone, or never again watch your query history go silently mute — this is the upgrade.

:::contributors:::

---

_v0.13.0 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.13.0)._
