---
title: "SQL Server driver"
slug: "sql-server"
category: "Driver"
status: "in-progress"
order: 1
progressDone: 1
progressTotal: 3
progressLabel: "1 of 3 phases shipped"
lede: "Native Microsoft SQL Server as a built-in driver, next to MySQL, PostgreSQL and SQLite — no extra plugin to install. Phase 1 is live as a read-only preview: connect, browse schemas and tables, run SELECT queries. Phase 2 brings editing, TLS options and composite primary keys, and it's the part where we'd love some help."
links:
  - label: "Epic #150"
    href: "https://github.com/TabularisDB/tabularis/issues/150"
    external: true
  - label: "Phase 1 post"
    href: "/blog/sql-server-phase-1-ships-call-for-contributors"
---

## Why built-in, not a plugin

The plugin system (JSON-RPC over stdin/stdout, one subprocess per driver) is how DuckDB, Google Sheets, and Redis reach the app today. For SQL Server that model loses on four concrete axes:

- **Streaming latency.** Plugin drivers serialise every row through a JSON-RPC frame to the host process. On queries returning 100k+ rows that's a measurable hit; for the in-process built-in, the row hand-off is a `Vec<Row>` move.
- **Capability flags.** The ER diagram's batch snapshot, the data-grid paging loop and the explain tree all branch on `DriverCapabilities`. Built-ins set those natively from the trait; plugins translate them through a JSON manifest, which drifts.
- **Credential + pool reuse.** SSH tunnels, the keychain-backed credential cache, and the connection-health pinger hold `Arc<T>` state inside the host binary. Plugin drivers re-implement the moving parts they need; built-ins share one pool manager.
- **Install step.** The plugin manager UI exists and works, but expecting users to visit it for SQL Server specifically is the wrong default. Most of the target audience would hit it on day zero.

Trade-offs: `~2.5 MB` added to the release binary (tiberius + deadpool + tokio-util compat layer), and the driver now ships on the same release cadence as the rest of the app — no independent fix channel.

## Phase 1 — Shipped

Read-only preview. The driver is registered in `lib.rs` peer to the other three built-ins, and the UI honours the `readonly: true` manifest flag by hiding INSERT / UPDATE / DELETE automatically.

- SQL auth connect, schema listing (`sys.schemas` filtered against role schemas), table / view / routine discovery
- `execute_query` with streaming over `tiberius::Client::query`; pagination via dialect-aware `build_paginated_query_dialect` in `drivers/common/query.rs`
- `OFFSET … FETCH NEXT` synthesised with `ORDER BY (SELECT NULL)` when the caller query has no top-level `ORDER BY` (paren-depth-aware matcher, documented false positives for string literals)
- Type extraction keyed on `tiberius::ColumnType`: int family, float family, `Decimal` + `Numeric` fallback for NUMERIC(38), `Uuid`, chrono temporal types, `varbinary` → base64, `xml`, `sql_variant`
- Runtime version detection from `SERVERPROPERTY('ProductMajorVersion')`; default major = 14 (2017) when parsing fails; feature gates for 2012 (`supports_offset_fetch`) and 2017 (`supports_string_agg`)
- ER-diagram batch endpoints: `get_all_columns_batch` + `get_all_foreign_keys_batch` + `get_schema_snapshot`
- 471 Rust tests, 0 regressions; every pure util (query builders, SQL constants, decimal normalizer, datetime formatters) has co-located `#[cfg(test)] mod tests`

## Phase 2 — Open

Six issues. Independent where the dependency column is empty. First is `good first issue`.

| # | Task | Area | Depends on |
|---|------|------|------------|
| [#144](https://github.com/TabularisDB/tabularis/issues/144) | ConnectionParams: `trust_server_certificate`, `encrypt`, `instance_name`, `domain`, `auth_mode` | good first issue | — |
| [#145](https://github.com/TabularisDB/tabularis/issues/145) | `delete_record_composite` / `update_record_composite` trait defaults + `commands.rs` wiring | rust | — |
| [#146](https://github.com/TabularisDB/tabularis/issues/146) | FK aggregation via `STRING_AGG` (2017+) with `FOR XML PATH` fallback for 2012–2016 | rust | — |
| [#147](https://github.com/TabularisDB/tabularis/issues/147) | `IDENTITY_INSERT ON/OFF` wrapper + transactional guard | rust | — |
| [#148](https://github.com/TabularisDB/tabularis/issues/148) | DataGrid `pkColumns?: string[]` + Editor composite invoke + SchemaDiagram group-by-constraint | ts / react | #145, #146 |
| [#149](https://github.com/TabularisDB/tabularis/issues/149) | Flip manifest `readonly:false`, `manage_tables:true` (closes Phase 2) | close-out | #144, #145, #146, #147, #148 |

## Phase 3 — Planned

- DDL generation: `sp_rename` for renames, `IDENTITY(1,1)` instead of SERIAL, the `DROP CONSTRAINT … ADD CONSTRAINT …` dance for `ALTER COLUMN DEFAULT`
- `SET SHOWPLAN_XML ON` (estimated) and `SET STATISTICS XML ON` (actual) parsed with `quick-xml` into the existing `ExplainPlan` tree; `PhysicalOp`, `EstimatedTotalSubtreeCost`, `ActualElapsedms` mapped one-to-one
- `sys.triggers`, `sys.computed_columns`, `sys.extended_properties` for trigger lists, computed-column definitions and `MS_Description`
- Azure AD via `AuthMethod::AADToken` + `azure_identity::DefaultAzureCredential`, feature-gated behind `azure-auth`
- Windows Integrated via `AuthMethod::Integrated` under `#[cfg(windows)]`

Not yet issue-tracked. Comment on [#150](https://github.com/TabularisDB/tabularis/issues/150) if you want to scope one.

## Architecture

### Module layout

Everything lives under `src-tauri/src/drivers/sqlserver/`:

| File | Contents |
|------|----------|
| `mod.rs` | `SqlServerDriver` struct + `impl DatabaseDriver` (manifest, CRUD routes, batch snapshot) |
| `pool.rs` | Custom `deadpool::managed::Manager` wrapping `tiberius::Client` over `tokio::net::TcpStream` via `tokio-util::compat`; `build_config` from `ConnectionParams` |
| `helpers.rs` | `bracket_quote` / `quote_identifier` / `qualify` / `escape_single_quoted` — pure, unit-tested |
| `version.rs` | `SERVERPROPERTY` parsing + feature gates (`supports_offset_fetch`, `supports_string_agg`, `supports_drop_if_exists`) |
| `introspection.rs` | `sys.*` + `INFORMATION_SCHEMA.*` metadata queries; pure builders `build_table_column` / `build_foreign_key` |
| `extract/mod.rs` | `ColumnType`-keyed dispatcher turning tiberius rows into `serde_json::Value` |
| `extract/temporal.rs` | Pure chrono formatters for `date` / `time` / `datetime` / `datetimeoffset` |

Pagination lives outside the driver. The `PaginationDialect` enum and `build_paginated_query_dialect` are in `drivers/common/query.rs` and are shared with the other three built-in drivers. The legacy `build_paginated_query(q, ps, p)` signature still produces the same output it always has.

### Version-gated features

`SERVERPROPERTY('ProductMajorVersion')` is parsed on first use and cached per pool. Default = 14 (2017) when parsing fails.

| Feature | Min major | Fallback below threshold |
|---------|-----------|--------------------------|
| `OFFSET … ROWS FETCH NEXT` | 11 (2012) | `ROW_NUMBER() OVER (…)` CTE |
| `STRING_AGG` | 14 (2017) | `FOR XML PATH('')` + `STUFF` |
| `DROP TABLE IF EXISTS` | 13 (2016) | `IF OBJECT_ID(…) IS NOT NULL` guard |

The fallback branches are not all implemented yet — they land alongside the Phase 2 / Phase 3 features that need them.

### Type coverage

- **Numeric:** `BIT`, `INT1`/`INT2`/`INT4`/`INT8`/`INTN`, `FLOAT4`/`FLOAT8`/`FLOATN`, `MONEY`/`MONEY4`, `DECIMALN`/`NUMERICN` (via `rust_decimal::Decimal` with `tiberius::numeric::Numeric` fallback for NUMERIC(38) beyond Decimal's range)
- **Temporal:** `DATETIME`, `DATETIME2`, `DATETIME4`, `DATEN`, `TIMEN`, `DATETIMEOFFSETN` — formatted to match the MySQL driver's output, trailing zeros in fractional seconds trimmed
- **Strings:** `TEXT`, `NTEXT`, `BIGCHAR`, `BIGVARCHAR`, `NCHAR`, `NVARCHAR`, `XML`
- **Binary:** `IMAGE`, `BIGBINARY`, `BIGVARBIN` → base64-encoded
- **Other:** `GUID` → UUID string; `UDT` and `SSVARIANT` fall back to best-effort string

Non-finite floats (`NaN`, `±Inf`) are returned as strings instead of JSON numbers (which aren't valid JSON). Decimal-to-string conversion trims insignificant trailing zeros — `3.1400` becomes `3.14`.

## Invariants enforced at review

- No GPL-licensed code copied from other open source SQL clients. The driver is written against Microsoft TDS / T-SQL docs and observable server behaviour; Tabularis stays Apache-2.0.
- New struct fields are `Option<T>` / `Vec<T>` with `#[serde(default)]` + `skip_serializing_if`. Saved connections from previous releases must deserialize untouched. MySQL / Postgres / SQLite drivers stay byte-identical — caught by the full `cargo test --lib` suite.
- Every pure helper ships with `#[cfg(test)] mod tests` in the same PR. Happy path and at least one edge case. SQL-string constants count as pure helpers — assert the query contains the expected `sys.*` / `INFORMATION_SCHEMA.*` tables and `@P1` / `@P2` placeholders.

## Local setup

Start a throwaway SQL Server 2022 (~1.5 GB image, pulls once):

```bash
docker run -e 'ACCEPT_EULA=Y' \
  -e 'MSSQL_SA_PASSWORD=Strong!Pass123' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

Clone and confirm the baseline is green before you touch anything:

```bash
git clone https://github.com/TabularisDB/tabularis.git
cd tabularis
cargo test --lib     # expect 471 passing, 0 failed
npm install
npm run typecheck
```

Launch the app (`cargo tauri dev`) and add a connection — driver **SQL Server**, host `localhost`, port `1433`, user `sa`, password `Strong!Pass123`, database `master`. You should see `dbo`, `sys`, `INFORMATION_SCHEMA` in the schema tree and be able to run `SELECT TOP 10 * FROM sys.objects`.

Pick a sub-issue from the Phase 2 table above. Comment on it before you start — avoids two people on the same task and lets reviewers flag edge cases early.

## Claiming an issue

- Comment on the issue ("I'd like to take this"). No formal assignment needed — first-come, first-served. The courtesy comment just avoids duplicate work.
- Stuck for more than a couple of days? Drop an update so others know the slot is either moving or freeing up.
- Small PRs land faster. Splitting an issue into a backend PR and a frontend PR is encouraged when the issue spans both.
- `Closes #NNN` trailer in the PR description so the issue closes on merge.
- Design questions, alternative approaches, blockers → epic [#150](https://github.com/TabularisDB/tabularis/issues/150). We read every comment.
