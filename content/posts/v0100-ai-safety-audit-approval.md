---
title: "AI Safety, Audit Log and Approval Gates: v0.10.0"
date: "2026-04-25T10:00:00"
release: "v0.10.0"
tags: ["release", "mcp", "ai", "safety", "audit"]
excerpt: "v0.10.0 ships an AI audit log, MCP read-only mode, and approval gates with pre-flight EXPLAIN preview. Built around a 200-line file-queue between two processes."
og:
  title: "AI Safety, Audit Log,"
  accent: "v0.10.0."
  claim: "Local audit log of every MCP tool call, read-only mode, and approval gates with pre-flight EXPLAIN. Give your AI agent safe access to your databases."
  image: "/img/tabularis-mcp-server.png"
---

# AI Safety, Audit Log and Approval Gates: v0.10.0

In 2026 a lot of SQL isn't written by you anymore. It's written by your AI agent.

Tabularis has been [MCP-native](/wiki/mcp-server) since day one — Claude Desktop, Claude Code, Cursor, Windsurf, Antigravity all talk to your saved Tabularis connections directly via the `tabularis --mcp` server. Schema reading, table description, query execution. Until now, the agent's access was a little too generous: once you set MCP up, the agent could do anything you could do.

**v0.10.0 is the safety release.** Three features, all visible at first launch after the upgrade:

- An **[audit log](/wiki/ai-audit-log)** of every MCP tool call, locally, queryable from a new Settings panel.
- **[Read-only mode](/wiki/mcp-readonly-mode)** to block writes per-connection or globally.
- **[Approval gates](/wiki/mcp-approval-gates)** that pause writes and require user confirmation, with a pre-flight EXPLAIN plan rendered inside the modal.

Plus two bonuses that fall out naturally: **export an entire AI session as a SQL notebook**, and **jump from any audit row into Visual Explain**.

---

## 1. The audit log

Every MCP tool call is now recorded as one line of JSON in `~/.config/tabularis/ai_activity.jsonl`:

```json
{"id":"4f9b…","sessionId":"a8c1…","timestamp":"2026-04-24T14:02:11Z",
 "tool":"run_query","connectionId":"prod-pg","connectionName":"prod",
 "query":"SELECT count(*) FROM orders","queryKind":"select",
 "durationMs":42,"status":"success","rows":1,
 "clientHint":"claude-desktop","approvalId":null}
```

There's a new **MCP → Activity** tab for it (the plug icon in the sidebar opens the MCP page). Two sub-tabs:

- **Events** — flat, filterable, exportable to CSV or JSON.
- **Sessions** — events auto-grouped by 10-minute inactivity gaps, with a per-session **Export as Notebook** button.

The Sessions tab is the underrated piece. One click and you get a valid `.tabularis-notebook` you can replay or attach to a PR:

- A markdown header with session metadata (client, connections, time range, event count).
- One SQL cell per `run_query`, in chronological order.
- Cell names from the first `--` comment in the query when present.
- Markdown context cells for the `list_tables` / `describe_table` calls so you keep the agent's investigation trail.

Results aren't embedded — opening the notebook re-executes the cells. Same behaviour as every other Tabularis notebook.

Off switch: `aiAuditEnabled: false` in `config.json` returns the original code path with zero overhead.

---

## 2. Read-only mode

The bluntest knob, configured in **MCP → Safety → Read-only mode**:

- *Allow-list of read-only connections* (default off, mark `prod` as read-only).
- *Allow-list of writable connections* (default on, mark `local-sqlite` as writable).

The classifier strips strings, comments, and quoted identifiers before scanning the SQL keyword, and catches CTEs that end in `UPDATE` / `INSERT` / `DELETE`. Everything ambiguous is treated as a write — fail-closed by design. If your "write detector" can be fooled, it's not a write detector.

Blocked calls land in the audit log with `status = blocked_readonly` and the agent gets:

> Query blocked by Tabularis read-only mode. Enable writes for this connection in Settings → MCP → Read-only mode.

Most agents handle this gracefully — they rewrite as a `SELECT` or surface the error to you.

---

## 3. Approval gates with pre-flight EXPLAIN

This is the one that took the most thinking. And it's the one that makes "give your agent access to production" feel reasonable.

When the agent fires a write, Tabularis pauses it and pops up an **AI Approval Modal**:

- The full SQL in a Monaco editor (read-only by default — toggle "Edit before approving" to modify).
- The **execution plan**, rendered with the same Visual Explain component you use for ad-hoc EXPLAINs.
- An optional reason field. Approve, Deny, or close the modal.

You see, *before any row is touched*, that the `UPDATE` is going to do a sequential scan on 1.2 million rows. You can edit the WHERE clause, add the right index hint, then approve. The audit log captures both the original and the edited query, linked by an `approvalId`.

Three modes — `off`, `writes_only` (the default), `all queries`. Configurable timeout (default 120 s). Pre-flight EXPLAIN is best-effort: if it fails (DDL, syntax, missing permission) the modal still opens with an "EXPLAIN unavailable" notice and you can decide anyway.

:::newsletter:::

---

## How approval gates actually work

The MCP server is a separate subprocess. Your AI client spawns `tabularis --mcp` as a child process; the two talk over JSON-RPC 2.0 on stdin/stdout. That subprocess has no Tauri runtime, no `AppHandle`, no socket back to the main app.

So how do you ask the user to approve a write?

I considered three approaches:

1. **A real RPC channel** between the MCP subprocess and the main Tabularis app. Means teaching the MCP binary to discover the running app, open a Unix socket / named pipe, handle disconnect/reconnect, ports on Windows… Days of work for something brittle.
2. **Desktop notifications** from the OS. Quick to implement. But you can't render a Visual Explain plan in a desktop notification, which defeats the entire point of the feature.
3. **A file queue.** Both processes touch the same directory. The MCP server writes a request file, polls for a response file. The Tabularis app uses `notify` (the inotify/FSEvents/ReadDirectoryChangesW crate) to watch the directory and pops up the modal as soon as a file appears.

Option 3 won. The directory:

```
~/.config/tabularis/pending_approvals/
  ├── {uuid}.pending.json    ← MCP server writes
  └── {uuid}.decision.json   ← Tabularis app writes
```

`pending.json` carries the full payload — query, classifier kind, connection, EXPLAIN plan as JSON, the agent's `clientInfo.name`. `decision.json` carries the verdict (`approve` / `deny`), an optional `reason`, and an optional `editedQuery` if the user touched the SQL.

The MCP server polls every 500 ms. The Tabularis app's file watcher fires the modal almost instantly. A periodic janitor (every 60 s) wipes anything older than an hour so the directory never grows.

Total implementation: about 200 lines of Rust. No IPC framework. Works even if you launch the agent before opening Tabularis — the request queues in the directory and the modal handles it the moment the app shows up. If Tabularis stays closed, the call times out (default 120 s) with a clear error to the agent telling it to start the app.

The whole flow is testable end-to-end without an MCP client: write a `pending.json` with a fake payload, watch the modal pop up, click Approve, see a `decision.json` appear. No mocking needed.

---

## Bonuses

**Open in Visual Explain.** Every `run_query` row in the AI Activity panel has a one-click jump into the same Visual Explain modal you get from the query editor — opens with the query and connection pre-loaded, runs `EXPLAIN`, shows you the plan. Useful when you spot a slow query in the log and want to know why.

**Export Session as Notebook.** Already mentioned above, but worth repeating: this is how you turn an opaque AI conversation into something a human can review, diff, and re-run. Attach to a PR, share with a colleague, archive alongside the ticket.

---

## Defaults

After this upgrade:

| Setting                            | Default          |
|------------------------------------|------------------|
| `aiAuditEnabled`                   | `true`           |
| `aiAuditMaxEntries`                | `5000`           |
| `aiSessionGapMinutes`              | `10`             |
| `mcpReadonlyDefault`               | `false`          |
| `mcpReadonlyConnections`           | `[]`             |
| `mcpApprovalMode`                  | `writes_only`    |
| `mcpApprovalTimeoutSeconds`        | `120`            |
| `mcpPreflightExplain`              | `true`           |

Audit on, approval on `writes_only`, pre-flight EXPLAIN on. The first time your agent tries to write after upgrading, you'll see the modal. SELECTs fly through with no friction.

If you want to keep the previous behaviour wholesale: set `aiAuditEnabled = false` and `mcpApprovalMode = "off"` in `config.json` (or via the **MCP** page).

---

## Where to read more

- Wiki: [AI Audit Log](/wiki/ai-audit-log) · [Read-only Mode](/wiki/mcp-readonly-mode) · [Approval Gates](/wiki/mcp-approval-gates) · [MCP Server](/wiki/mcp-server)

The agent doesn't need to know any of this changed. The Tabularis app gets a refreshed **MCP** page (plug icon in the sidebar) with three tabs — **Setup**, **Activity**, **Safety** — and a modal that pops up when the agent goes for the database with anything sharper than a `SELECT`.

---

## Summary

| Area | What's new |
|------|-----------|
| AI Activity | New **MCP → Activity** tab with Events + Sessions sub-tabs |
| AI Activity | Local JSONL audit log of every MCP tool call (5,000-entry rotation × 5 archives) |
| AI Activity | One-click "Export as Notebook" per session |
| AI Activity | "Open in Visual Explain" on every `run_query` row |
| MCP | Read-only mode — global default + per-connection override list |
| MCP | Approval gates — three modes (`off` / `writes_only` / `all`) |
| MCP | Pre-flight EXPLAIN inside the approval modal |
| MCP | Edit-before-approving — modify the SQL before it executes |
| Architecture | File-queue IPC between the MCP subprocess and the Tabularis app — no socket needed |
