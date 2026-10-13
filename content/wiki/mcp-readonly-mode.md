---
title: "MCP Read-only Mode"
order: 9.2
excerpt: "The bluntest MCP safety knob: block any non-SELECT statement reaching specific connections — or all of them by default."
category: "AI & MCP"
---

By default the [Tabularis MCP server](/wiki/mcp-server) lets your AI agent run any statement you'd run yourself — including `UPDATE`, `DELETE`, `DROP`. That's the right default when you're scripting the agent against a local sandbox. It's the wrong default when "production" is one wrong tool call away.

Read-only mode is the bluntest of Tabularis' three safety knobs: it stops anything that isn't a clear `SELECT` from reaching the database.

For a less blunt option that prompts you per-query, see [Approval Gates](/wiki/mcp-approval-gates).

## How it works

Before the MCP `run_query` tool dispatches to a driver, the SQL is run through a **conservative** classifier:

| Result      | First keyword                                                           |
|-------------|-------------------------------------------------------------------------|
| `select`    | `SELECT` · `VALUES` · `PRAGMA` (unless they write, see below) · `SHOW` · `EXPLAIN` (see note below) · `DESCRIBE` · `DESC` |
| `write`     | `INSERT` · `UPDATE` · `DELETE` · `MERGE` · `REPLACE`                    |
| `ddl`       | `CREATE` · `DROP` · `ALTER` · `TRUNCATE` · `RENAME` · `GRANT` · `REVOKE` · `COMMENT` |
| `unknown`   | Anything else, including empty input and multi-statement payloads.      |

`WITH` queries (CTEs) are classified by what they contain: `ddl` if it contains `CREATE`, `DROP`, `ALTER`, `TRUNCATE` or `RENAME`, `write` if any DML keyword appears, and otherwise the same side-effect checks as a `SELECT`. Leading parentheses are skipped, so `(SELECT …) UNION (SELECT …)` counts as `select`.

Read-only mode lets `select` through and **rejects everything else** — including `unknown`. That's deliberate (fail-closed): the classifier strips strings, comments and quoted identifiers before scanning, and CTEs that end in a write are caught, but if it can't classify with confidence the call is blocked rather than guessed at.

Since v0.15.0, `EXPLAIN` classification is **option-aware**: a plain `EXPLAIN` stays `select` because it only plans, but `EXPLAIN ANALYZE …` (and `EXPLAIN (ANALYZE, …) …`) actually *executes* the wrapped statement, so it is classified as if that statement had been submitted directly — `EXPLAIN ANALYZE DELETE …` is a `write` and gets blocked or gated like a bare `DELETE`. Matching is word-boundary aware (`FROM analyze_runs` doesn't trip it) and unbalanced option lists fail closed as `unknown`.

Since v0.28.0 a leading `SELECT` is no longer proof of a read. These are classified as `write`, including inside CTEs and `EXPLAIN ANALYZE`:

- `SELECT … INTO` (creates a table on PostgreSQL) and `INTO OUTFILE` / `INTO DUMPFILE` (writes a file on the MySQL server).
- Locking clauses: `FOR UPDATE`, `FOR SHARE`, `FOR NO KEY UPDATE`, `FOR KEY SHARE`, `LOCK IN SHARE MODE`.
- Calls to PostgreSQL functions that act on the server or outside the transaction: `setval`, `nextval`, `pg_terminate_backend`, `pg_cancel_backend`, `pg_reload_conf`, the large-object functions (`lo_import`, `lo_export`, …), `dblink` and `dblink_*`, and similar.
- SQLite `PRAGMA` assignments (`PRAGMA user_version = 42`), pragmas given a value (`PRAGMA journal_mode(DELETE)`), and action pragmas (`optimize`, `wal_checkpoint`, `incremental_vacuum`, `shrink_memory`). Reading a pragma, and introspection pragmas such as `table_info(t)`, stay `select`.

A read that calls a function through a quoted name (`"lo_export"(…)`, `pg_catalog."lo_export"(…)`, `U&"…"`) is classified `unknown`, since the function check matches bare names only. Dollar-quoted (`$$…$$`, `$tag$…$tag$`) and `E'…'` literals are skipped as whole strings, so a quote inside them cannot throw off the scanner. Quoted columns and aliases still classify as reads.

Since v0.13.0 the classifier also **fails closed on multi-statement payloads**: a stacked query like `SELECT 1; DROP TABLE users` is classified `unknown` — not `select` from its leading keyword — and blocked. String literals are stripped under both the SQL-standard (`''`) and MySQL backslash-escape (`\'`) readings, so a payload can't hide the `;` separator inside a string under either dialect. A single trailing `;` keeps its classification.

### Enforced by the database

Since v0.28.0 the classifier is no longer the only check. Every query on a read-only connection, and every query that skips [approval](/wiki/mcp-approval-gates) because it was classified as a read, runs on a read-only database session on the built-in drivers:

| Driver | How |
|--------|-----|
| PostgreSQL | `BEGIN READ ONLY` |
| MySQL / MariaDB | `START TRANSACTION READ ONLY` |
| SQLite | `PRAGMA query_only` turned on inside a transaction |

The transaction is always rolled back, so a write the classifier missed is refused by the database itself. If the reset fails or the call is dropped, the connection is closed instead of being returned to the pool, so the read-only setting cannot leak into your own editor session. Plugin drivers have no read-only session and keep the previous behavior, where the classifier is the only safeguard.

Some PostgreSQL functions act outside the transaction (`lo_export` writes a server file even inside `BEGIN READ ONLY`; backend-signal and `dblink_*` functions affect other sessions), so for those the classifier remains the check that blocks them.

### When a call is rejected

When a call is rejected, the agent gets:

```
Query blocked by Tabularis read-only mode. Enable writes for this connection
in Settings → MCP → Read-only mode.
```

The block is also recorded in the [audit log](/wiki/ai-audit-log) with `status = blocked_readonly` so you can see what the agent tried.

## Two modes of configuration

In **MCP Server → Safety → Read-only mode** you choose how the policy is applied across connections:

### Default off, allow-list of read-only connections

Toggle **Make all MCP queries read-only** = OFF.
Tick the connections you want to mark read-only.

Use this when most of your connections are throwaway (local Postgres, dev SQLite) and only a few — `prod-readonly`, `staging-billing` — are sensitive.

### Default on, allow-list of writable connections

Toggle **Make all MCP queries read-only** = ON.
Tick the connections that are *allowed to write*.

Use this when you want a deny-by-default policy: every connection is read-only unless you've explicitly cleared a single safe one (`local-sqlite`, `playground`, …).

The **Make all MCP queries read-only** toggle flips the meaning of the checkbox list automatically: it is labelled **Read-only connections** when the toggle is off and **Allow writes from MCP** when it is on.

:::newsletter:::

## What the agent sees

When the agent calls `run_query` against a read-only connection with a non-`SELECT`, the MCP response is a JSON-RPC error with code `-32000` and the message above. Most agents handle this gracefully — they'll either rewrite the query as a `SELECT` (great), or surface the error to you (also fine).

Since v0.28.0, `SELECT … FOR UPDATE` and similar locking reads are classified as `write`, so read-only mode blocks them and approval gates ask about them. To review every query, plain reads included, use [Approval Gates](/wiki/mcp-approval-gates) with mode "All queries".

## Configuration

```json
{
  "mcpReadonlyDefault": false,
  "mcpReadonlyConnections": [
    "3f2a9c1e-8b4d-4e7a-9f10-2c6d5e8a7b01",
    "a7c41d02-5e9f-4b38-8d21-6f0e3b9c4a55"
  ]
}
```

`mcpReadonlyConnections` holds connection **IDs**, not connection names. Ticking connections in the Safety tab fills it in for you.

The two fields together describe the full policy — see the two modes above for what `mcpReadonlyConnections` means depending on the value of `mcpReadonlyDefault`.
