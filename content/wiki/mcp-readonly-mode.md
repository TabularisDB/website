---
title: "MCP Read-only Mode"
order: 9.2
excerpt: "The bluntest MCP safety knob: block any non-SELECT statement reaching specific connections — or all of them by default."
category: "AI & MCP"
---

# MCP Read-only Mode

By default the [Tabularis MCP server](/wiki/mcp-server) lets your AI agent run any statement you'd run yourself — including `UPDATE`, `DELETE`, `DROP`. That's the right default when you're scripting the agent against a local sandbox. It's the wrong default when "production" is one wrong tool call away.

Read-only mode is the bluntest of Tabularis' three safety knobs: it stops anything that isn't a clear `SELECT` from reaching the database.

For a less blunt option that prompts you per-query, see [Approval Gates](/wiki/mcp-approval-gates).

## How it works

Before the MCP `run_query` tool dispatches to a driver, the SQL is run through a **conservative** classifier:

| Result      | First keyword                                                           |
|-------------|-------------------------------------------------------------------------|
| `select`    | `SELECT` · `SHOW` · `EXPLAIN` · `DESCRIBE` · `PRAGMA` · `VALUES`        |
| `write`     | `INSERT` · `UPDATE` · `DELETE` · `MERGE` · `REPLACE`                    |
| `ddl`       | `CREATE` · `DROP` · `ALTER` · `TRUNCATE` · `RENAME` · `GRANT` · `REVOKE` · `COMMENT` |
| `unknown`   | Anything else (including ambiguous CTEs).                               |

Read-only mode lets `select` through and **rejects everything else** — including `unknown`. That's deliberate (fail-closed): the classifier strips strings, comments and quoted identifiers before scanning, and CTEs that end in a write are caught, but if it can't classify with confidence the call is blocked rather than guessed at.

When a call is rejected, the agent gets:

```
Query blocked by Tabularis read-only mode. Enable writes for this connection
in Settings → MCP → Read-only mode.
```

The block is also recorded in the [audit log](/wiki/ai-audit-log) with `status = blocked_readonly` so you can see what the agent tried.

## Two modes of configuration

In **MCP → Safety → Read-only mode** you choose how the policy is applied across connections:

### Default off, allow-list of read-only connections

Toggle **Make all MCP queries read-only** = OFF.
Tick the connections you want to mark read-only.

Use this when most of your connections are throwaway (local Postgres, dev SQLite) and only a few — `prod-readonly`, `staging-billing` — are sensitive.

### Default on, allow-list of writable connections

Toggle **Make all MCP queries read-only** = ON.
Tick the connections that are *allowed to write*.

Use this when you want a deny-by-default policy: every connection is read-only unless you've explicitly cleared a single safe one (`local-sqlite`, `playground`, …).

The toggle on the modal flips the meaning of the checkbox list automatically.

:::newsletter:::

## What the agent sees

When the agent calls `run_query` against a read-only connection with a non-`SELECT`, the MCP response is a JSON-RPC error with code `-32000` and the message above. Most agents handle this gracefully — they'll either rewrite the query as a `SELECT` (great), or surface the error to you (also fine).

`SELECT … FOR UPDATE` and similar locking reads are classified as `select` because the first keyword is `SELECT`. If you want to block those too, use [Approval Gates](/wiki/mcp-approval-gates) with mode "All queries" instead.

## Configuration

```json
{
  "mcpReadonlyDefault": false,
  "mcpReadonlyConnections": ["prod-readonly", "staging-billing"]
}
```

The two fields together describe the full policy — see the two modes above for what `mcpReadonlyConnections` means depending on the value of `mcpReadonlyDefault`.
