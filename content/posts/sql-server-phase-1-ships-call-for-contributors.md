---
title: "SQL Server Driver: Phase 1 Done on feat/sql-server, Phase 2 Open"
date: "2026-04-23T12:00:00"
tags: ["sql-server", "roadmap", "contribute", "rust"]
excerpt: "Native Microsoft SQL Server — read-only preview, built-in, on the feat/sql-server branch. Tiberius + deadpool, 471 Rust tests green, zero regressions. Not on main, not released. Phase 2 (editing, TLS, composite keys) is six open issues."
og:
  title: "SQL Server Driver:"
  accent: "Phase 1 on feat/sql-server. Phase 2 Open."
  claim: "Native SQL Server, built-in, on feat/sql-server — tiberius + deadpool, six open issues for Phase 2."
  image: "/img/overview.png"
---

# SQL Server Driver: Phase 1 Done on `feat/sql-server`, Phase 2 Open

SQL Server will be a built-in driver. Not a plugin — peer to MySQL, PostgreSQL, SQLite, registered in the same `lib.rs`, served out of the same `pool_manager`, showing up in the connection modal with nothing to install first. Code lives on [`feat/sql-server`](https://github.com/TabularisDB/tabularis/tree/feat/sql-server) today. Not on `main`. Not in any released build. Phase 1 on the branch is read-only browsing + query execution. Phase 2 — editing, TLS, composite primary keys — is six GitHub issues away. Help close it and the whole branch squashes back into `main`.

## Why built-in instead of a plugin

Tabularis has a plugin system. DuckDB, Google Sheets, Redis, and others reach the app through it, talking JSON-RPC over stdin/stdout. The system is stable and deliberately simple. It was still the wrong choice for SQL Server, for four reasons that matter in practice:

**Streaming latency.** Plugin drivers serialise every row through a JSON-RPC frame. On a 100k-row result the overhead is visible — for the built-in it's a `Vec<Row>` hand-off inside the host process.

**Capability flags.** The ER diagram's batch snapshot, the pager, the explain tree all branch on `DriverCapabilities`. Built-ins set those natively from the `DatabaseDriver` trait; plugins translate them through a JSON manifest, which drifts and needs to be kept in sync.

**Credential and pool reuse.** SSH tunnels, the keychain-backed credential cache, and the health pinger hold `Arc<T>` state inside the host binary. A plugin driver re-implements what it needs from that stack; a built-in shares one pool manager.

**Install step.** The plugin manager exists and works. Expecting a user to visit it for SQL Server specifically — day zero, from a fresh install — is the wrong default.

Costs: `~2.5 MB` on the release binary (tiberius + deadpool + tokio-util compat layer), and the driver ships on the main release cadence instead of its own. We took those over the alternative.

## What Phase 1 actually does

The driver lives under `src-tauri/src/drivers/sqlserver/`. It is `readonly: true` in its manifest — the UI honours that flag automatically and hides INSERT/UPDATE/DELETE controls — so users can browse and query without ever putting data at risk.

Concretely:

- Connect over SQL authentication; `sys.schemas` filtered against role schemas for the tree
- Table, view, routine discovery; column / PK / FK / index introspection
- `execute_query` streaming over `tiberius::Client::query`
- Pagination via a new `PaginationDialect` enum in `drivers/common/query.rs` — the legacy `build_paginated_query(q, ps, p)` signature still produces the same MySQL/PG/SQLite `LIMIT/OFFSET` output it always has. The SQL Server branch synthesises `ORDER BY (SELECT NULL)` when the caller query has no top-level `ORDER BY`, using a paren-depth-aware matcher (documented false positives on string literals, accepted trade-off)
- Type extraction dispatched off `tiberius::ColumnType`: int family, float family, `Decimal` with `Numeric` fallback for NUMERIC(38), `Uuid`, chrono temporals incl. `datetimeoffset`, `varbinary` → base64, `xml`, `sql_variant`
- Runtime version detection from `SERVERPROPERTY('ProductMajorVersion')`, cached per pool. Default major = 14 (2017) when parsing fails. `supports_offset_fetch` gates on ≥ 11, `supports_string_agg` on ≥ 14
- Batch endpoints for the ER diagram: `get_all_columns_batch`, `get_all_foreign_keys_batch`, `get_schema_snapshot`

The CI number: 471 Rust tests, 0 regressions on the existing MySQL/PostgreSQL/SQLite drivers. Every pure helper — identifier quoting, decimal normalization, query builders, the SQL-string constants themselves — ships with co-located `#[cfg(test)] mod tests`.

## Phase 2 — six issues

Phase 1 was the part with the unknowns: whether `tiberius` 0.12 composes with the current tokio version, whether a non-sqlx pool can sit next to the sqlx ones in `pool_manager`, whether the `DatabaseDriver` trait generalises to a driver that doesn't speak `LIMIT/OFFSET`. Answers came out yes, yes, yes. Those risks are gone.

What's left is scoped and mostly independent. The epic is [#150](https://github.com/TabularisDB/tabularis/issues/150); the six sub-issues:

- [#144](https://github.com/TabularisDB/tabularis/issues/144) — `ConnectionParams` extension (`trust_server_certificate`, `encrypt`, `instance_name`, `domain`, `auth_mode`). All `Option<T>` with `#[serde(default)]` so old saved connections deserialize untouched. Labelled `good first issue`
- [#145](https://github.com/TabularisDB/tabularis/issues/145) — `delete_record_composite` / `update_record_composite` as default methods on the trait, forwarding to the legacy single-key path when `pk_cols.len() == 1`. No change to the other three drivers
- [#146](https://github.com/TabularisDB/tabularis/issues/146) — FK aggregation: `STRING_AGG(…) WITHIN GROUP (ORDER BY constraint_column_id)` on 2017+ servers, `FOR XML PATH('')` fallback for 2012–2016
- [#147](https://github.com/TabularisDB/tabularis/issues/147) — `IDENTITY_INSERT ON/…/OFF` wrapper inside an explicit transaction, triggered when the insert data contains a value for the IDENTITY column
- [#148](https://github.com/TabularisDB/tabularis/issues/148) — frontend: `pkColumns?: string[]` on `DataGrid`, composite detection in `Editor.tsx`, aggregate-by-constraint-name in `SchemaDiagram.tsx`. Depends on #145 and #146
- [#149](https://github.com/TabularisDB/tabularis/issues/149) — flip `readonly: false`, `manage_tables: true`. Closes Phase 2

Everything — architecture, module layout, type coverage, dependencies between issues, local setup — is on the [roadmap page](/roadmap/).

## Ground rules

Three invariants get checked at review, they're not negotiable:

No GPL-licensed code copied from other open source SQL clients. The driver is written against Microsoft TDS / T-SQL docs and observable server behaviour; Tabularis stays Apache-2.0.

New struct fields are `Option<T>` / `Vec<T>` with `#[serde(default)]` + `skip_serializing_if`. Saved connections from previous releases deserialize untouched, and the MySQL / Postgres / SQLite drivers stay byte-identical — `cargo test --lib` catches regressions before the PR lands.

Every pure helper ships with `#[cfg(test)] mod tests` in the same PR. Happy path plus at least one edge case. SQL-string constants count as pure helpers — assert the query contains the expected `sys.*` / `INFORMATION_SCHEMA.*` tables and the right `@P1` / `@P2` placeholders.

## If you want in

- Rust, backend: [#144](https://github.com/TabularisDB/tabularis/issues/144) (good first issue), [#145](https://github.com/TabularisDB/tabularis/issues/145), [#146](https://github.com/TabularisDB/tabularis/issues/146), [#147](https://github.com/TabularisDB/tabularis/issues/147)
- TypeScript / React: [#148](https://github.com/TabularisDB/tabularis/issues/148) — DataGrid + Editor + ER diagram composite-PK support
- Just testing: spin up `mcr.microsoft.com/mssql/server:2022-latest` against your own schema, file issues for whatever doesn't match
- Architecture input: the epic [#150](https://github.com/TabularisDB/tabularis/issues/150) is the right thread

Full architecture reference, module layout, type-extraction details, local setup: [roadmap page](/roadmap/).

Phase 2 will land either way. It lands sooner, and better, with a couple more people on it.
