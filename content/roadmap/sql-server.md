---
title: "SQL Server driver"
slug: "sql-server"
category: "Driver"
status: "in-progress"
order: 1
progressDone: 2
progressTotal: 3
progressLabel: "Driver core built in the dedicated plugin repo — first release still ahead"
lede: "Microsoft SQL Server support is now being built as a **driver plugin** in its own repository, [tabularis-sqlserver-plugin](https://github.com/TabularisDB/tabularis-sqlserver-plugin), instead of a built-in driver inside the app binary. The plugin covers connection pooling, schema introspection, query execution, CRUD, DDL, triggers, stored routines and visual execution plans. It is in active development and has not shipped a release yet."
contributors:
  - username: debba
    role: Maintainer
  - username: FabioMalpezzi
    role: Contributor
links:
  - label: "tabularis-sqlserver-plugin"
    href: "https://github.com/TabularisDB/tabularis-sqlserver-plugin"
    external: true
  - label: "Original built-in epic #150"
    href: "https://github.com/TabularisDB/tabularis/issues/150"
    external: true
  - label: "Phase 1 post"
    href: "/blog/sql-server-looking-for-contributors"
---

## From built-in to plugin

The first two phases of SQL Server support were built as a **built-in driver** on the `feat/sql-server` branch of the app repository ([epic #150](https://github.com/TabularisDB/tabularis/issues/150)): read-only connect, schema browsing and paginated SELECT queries, followed by TLS/auth connection fields and a TDS backend evaluation. That work proved the driver out — and also showed that the plugin path had caught up with what SQL Server needs.

The direction has changed: SQL Server now ships as a **driver plugin**, developed in [`tabularis-sqlserver-plugin`](https://github.com/TabularisDB/tabularis-sqlserver-plugin). What tipped the decision:

- **Independent release cadence.** A driver plugin ships fixes and features on its own schedule instead of waiting for the next app release — the same channel Oracle, LibSQL and the other community drivers use.
- **Leaner core binary.** The TDS stack (tiberius + deadpool + TLS plumbing) stays out of the app binary that every user downloads, SQL Server user or not.
- **The plugin protocol grew up.** Capability flags, batch schema snapshots for the ER diagram, and execution-plan rendering are all expressible over the JSON-RPC plugin interface today — the gaps that originally justified a built-in are closed.

The built-in work was not thrown away: the introspection queries, pagination dialect, type-extraction rules and test discipline from `feat/sql-server` carried over into the plugin.

## What the plugin covers

The plugin is written in Rust on top of [`tiberius`](https://crates.io/crates/tiberius) with [`deadpool`](https://crates.io/crates/deadpool) connection pooling, speaking JSON-RPC 2.0 over stdio like every other Tabularis driver plugin. The feature surface being built:

- **Connections** — pooled connections with session reset (`sp_reset_connection`), per-connection startup scripts, and TLS via the standard Tabularis `ssl_mode` values mapped onto the TDS encryption policy (`disable`, `prefer`, `require`, `verify-full` against the system trust store)
- **Introspection** — schemas, tables, columns, primary/foreign keys, indexes, views, routines and triggers
- **Queries** — execution with pagination, CTE/DML classification, multiple result sets, session-preserving batches, and accurate affected-row counts including DML `OUTPUT`
- **Writes** — INSERT / UPDATE / DELETE with composite primary keys and safe `IDENTITY_INSERT` recovery
- **DDL** — table, view, index and foreign-key DDL plus safe `ALTER COLUMN` generation; trigger create/edit/remove; procedure and function management with typed `OUT`/`INOUT` variables
- **Explain** — static and runtime execution plans via `SHOWPLAN_XML` / `STATISTICS XML`, rendered in the app's Visual EXPLAIN
- **Types** — the full common SQL Server type set, including `DATETIMEOFFSET`, `UNIQUEIDENTIFIER`, `XML`, `SQL_VARIANT`, `ROWVERSION`, `HIERARCHYID` and spatial types; `BIGINT` values outside JavaScript's safe range are delivered as strings

Targets: Linux x64/arm64, macOS x64/arm64, Windows x64.

## What's still open

The plugin is **in development — there is no release yet** and it is not in the plugin registry. Known limitations being worked through:

- SQL authentication only; Azure AD and Windows Integrated Authentication are follow-up work
- Primary-key membership changes are disabled: the single-column alteration API cannot safely preserve composite PKs and referencing foreign keys
- Custom CA files and client certificates are rejected; strict TLS verification uses the system trust store

Once the first release lands, installation will be **Settings → Plugins** in Tabularis, or a manual download from the repository's releases page.

## Try it and contribute

Start a throwaway SQL Server 2022 (~1.5 GB image, pulls once):

```bash
docker run -e 'ACCEPT_EULA=Y' \
  -e 'MSSQL_SA_PASSWORD=Strong!Pass123' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

Then build the plugin from source and install it locally:

```bash
git clone https://github.com/TabularisDB/tabularis-sqlserver-plugin.git
cd tabularis-sqlserver-plugin
just dev-install   # build + copy binary and manifest into the Tabularis plugins dir
```

Restart Tabularis and add a connection — driver **SQL Server**, host `localhost`, port `1433`, user `sa`, password `Strong!Pass123`, database `master`.

Issues, testing reports and PRs all go to [`tabularis-sqlserver-plugin`](https://github.com/TabularisDB/tabularis-sqlserver-plugin) — not the app repository. Comment on an issue before starting so two people don't land on the same task.
