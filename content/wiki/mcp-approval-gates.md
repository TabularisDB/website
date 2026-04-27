---
title: "MCP Approval Gates"
order: 9.3
excerpt: "Pause MCP writes (or every query) and require explicit user approval — with a pre-flight EXPLAIN plan rendered inside the modal."
category: "AI & MCP"
---

# MCP Approval Gates

Approval gates are the middle ground between letting the agent do whatever it wants and locking the connection down with [Read-only Mode](/wiki/mcp-readonly-mode). They pause sensitive queries, show you the SQL, show you the **execution plan** before anything runs, and let you approve, edit, or deny.

This is the feature that makes "give your AI agent access to your production database" not entirely insane.

## How it works end-to-end

1. Agent calls `run_query` with `UPDATE orders SET status = 'shipped' WHERE id = 42`.
2. MCP server classifies it (`write`), and because **Approval mode** = `writes_only`, it doesn't dispatch yet.
3. MCP server runs `EXPLAIN` against the connection (best-effort) and writes a `pending_approval` file with the query + the plan as JSON.
4. The Tabularis main app, watching the directory via `notify`, picks up the file and pops up the **AI Approval Modal**:
   - Query in a Monaco editor (read-only by default; toggle "Edit before approving" to modify).
   - Pre-flight execution plan rendered with the same Visual Explain component used for ad-hoc EXPLAINs.
   - Optional reason field.
   - **Deny** / **Approve** buttons.
5. You decide. Tabularis writes a `decision` file.
6. The MCP server, polling every 500 ms, sees the decision:
   - **Approve** → executes (using the edited query if you changed it). Status: `success`.
   - **Approve + edited** → executes the new SQL. Status: `success`, the audit log captures both original and approval id.
   - **Deny** → returns `Query denied by user[: <reason>]` to the agent. Status: `denied`.
   - **Timeout** (default 120 s) → returns `Approval timed out after 120s — open Tabularis to approve writes`. Status: `timeout`.

Every outcome lands in the [audit log](/wiki/ai-audit-log) with the `approvalId` linking back to the request.

## Three modes

Set in **MCP → Safety → Approval gate → Approval required**:

| Mode          | What gets gated                                          | When to use                                               |
|---------------|----------------------------------------------------------|-----------------------------------------------------------|
| `off`         | Nothing. Queries dispatch immediately.                   | Local sandbox only.                                       |
| `writes_only` | Anything classified as `write`, `ddl`, or `unknown`.     | **Default.** Read-only stays fast, writes are safe.       |
| `all`         | Every `run_query`, including `SELECT`.                   | Paranoid mode: review-before-execute every call.          |

The classifier is the same conservative one used for [read-only mode](/wiki/mcp-readonly-mode) — anything ambiguous is treated as a write. Better one false positive (you click Approve) than one false negative (an `UPDATE` slips through unwatched).

## Pre-flight EXPLAIN

The plan preview is the most useful thing in the modal — it's why approval gates are different from the "yes/no" prompts other tools offer.

You see, before a single row is touched:

- How the planner will execute the query.
- Estimated rows, costs, joins.
- Sequential scans on millions of rows when there should have been an index lookup.
- Materialised CTEs, lock acquisition strategy, the works.

Pre-flight EXPLAIN is **best-effort**:

- Postgres → `EXPLAIN (FORMAT JSON)`.
- MySQL/MariaDB → `EXPLAIN FORMAT=JSON` (with appropriate version detection — same code path as the regular [Visual Explain](/wiki/visual-explain)).
- SQLite → `EXPLAIN QUERY PLAN`.

If `EXPLAIN` fails (DDL, syntax error, missing permission), the modal still shows up — with a "EXPLAIN unavailable" / "EXPLAIN failed: <error>" notice instead of the plan. You can still approve or deny: the failure to explain doesn't mean the query itself is broken.

To turn pre-flight off entirely, untick **Pre-flight EXPLAIN**.

:::newsletter:::

## What the agent experiences

The agent's `tools/call` request blocks until you decide (or the timeout fires). Most clients (Claude Desktop, Cursor) handle this fine — the agent sees a normal long-running tool call.

Best practice for agents: their system prompt should mention that writes may be gated, so when the user is mid-conversation the agent doesn't conclude "tool unavailable" after a 30 s pause. Many clients already handle this.

If Tabularis isn't running when the agent tries to write, the call still goes through the file-queue, but it'll time out with a clear error telling the agent (and the user reading the agent's reply) to start Tabularis.

## File-queue protocol

The implementation is intentionally simple — a directory both processes can poll/watch:

```
~/.config/tabularis/pending_approvals/
  ├── {uuid}.pending.json    ← written by MCP server
  └── {uuid}.decision.json   ← written by Tabularis app
```

`pending.json` carries the full payload (query, kind, connection, EXPLAIN plan, client hint).
`decision.json` carries `decision` (approve/deny), an optional `reason`, and an optional `editedQuery`.

The Tabularis app cleans up consumed files automatically and runs a periodic janitor every 60 s that deletes entries older than 1 hour, so the directory never grows.

This file-queue design has one crucial property: **no IPC or shared runtime needed**. The MCP server has no `AppHandle`, no Tauri runtime, no socket. Just `~/.config/tabularis/`. It works even if you launch the agent before Tabularis ever starts; the requests pile up and the modal handles them as soon as you open the app.

## Configuration

```json
{
  "mcpApprovalMode": "writes_only",
  "mcpApprovalTimeoutSeconds": 120,
  "mcpPreflightExplain": true
}
```

Increase `mcpApprovalTimeoutSeconds` if you walk away from the keyboard often; max is whatever your AI client tolerates as a tool call duration. Most allow 5+ minutes.
