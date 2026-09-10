---
title: "SQL Server driver"
slug: "sql-server"
category: "Driver"
status: "done"
order: 1
progressDone: 3
progressTotal: 3
progressLabel: "First release (1.0.0-beta.1) published to the plugin registry"
lede: "Microsoft SQL Server support ships as a **driver plugin** from its own repository, [tabularis-sqlserver-plugin](https://github.com/TabularisDB/tabularis-sqlserver-plugin), instead of a built-in driver inside the app binary. The first release, **1.0.0-beta.1**, is in the plugin registry with builds for macOS, Linux and Windows and requires Tabularis **0.23.0 or later**. It covers connection pooling, schema introspection, query execution, CRUD, DDL, triggers, stored routines and Visual EXPLAIN through its own SHOWPLAN XML parser."
contributors:
  - username: debba
    role: Maintainer
  - username: FabioMalpezzi
    role: Contributor
links:
  - label: "tabularis-sqlserver-plugin"
    href: "https://github.com/TabularisDB/tabularis-sqlserver-plugin"
    external: true
  - label: "Release 1.0.0-beta.1"
    href: "https://github.com/TabularisDB/tabularis-sqlserver-plugin/releases/tag/v1.0.0-beta.1"
    external: true
  - label: "v0.23.0 release post"
    href: "/blog/v0230-postgres-plugin-migration-sql-files-storage-location"
  - label: "Original built-in epic #150"
    href: "https://github.com/TabularisDB/tabularis/issues/150"
    external: true
  - label: "Phase 1 post"
    href: "/blog/sql-server-looking-for-contributors"
---

## From built-in to plugin

The first two phases of SQL Server support were built as a **built-in driver** on the `feat/sql-server` branch of the app repository ([epic #150](https://github.com/TabularisDB/tabularis/issues/150)): read-only connect, schema browsing and paginated SELECT queries, followed by TLS/auth connection fields and a TDS backend evaluation. That work proved the driver out — and also showed that the plugin path had caught up with what SQL Server needs.

The direction changed: SQL Server now ships as a **driver plugin**, developed in [`tabularis-sqlserver-plugin`](https://github.com/TabularisDB/tabularis-sqlserver-plugin). What tipped the decision:

- **Independent release cadence.** A driver plugin ships fixes and features on its own schedule instead of waiting for the next app release — the same channel Oracle, LibSQL and the other community drivers use.
- **Leaner core binary.** The TDS stack (tiberius + deadpool + TLS plumbing) stays out of the app binary that every user downloads, SQL Server user or not.
- **The plugin protocol grew up.** Capability flags, batch schema snapshots for the ER diagram, and execution-plan rendering are all expressible over the JSON-RPC plugin interface today — the gaps that originally justified a built-in are closed.

The built-in work was not thrown away: the introspection queries, pagination dialect, type-extraction rules and test discipline from `feat/sql-server` carried over into the plugin.

## What the plugin covers

The plugin is written in Rust on top of [`tiberius`](https://crates.io/crates/tiberius) with [`deadpool`](https://crates.io/crates/deadpool) connection pooling, speaking JSON-RPC 2.0 over stdio like every other Tabularis driver plugin. The feature surface in 1.0.0-beta.1:

- **Connections** — pooled connections with session reset (`sp_reset_connection`), per-connection startup scripts, and TLS via the standard Tabularis `ssl_mode` values mapped onto the TDS encryption policy (`disable`, `prefer`, `require`, `verify-full` against the system trust store)
- **Introspection** — schemas, tables, columns, primary/foreign keys, indexes, views, routines and triggers
- **Queries** — execution with pagination, CTE/DML classification, multiple result sets, session-preserving batches, and accurate affected-row counts including DML `OUTPUT`
- **Writes** — INSERT / UPDATE / DELETE with composite primary keys and safe `IDENTITY_INSERT` recovery
- **DDL** — table, view, index and foreign-key DDL plus safe `ALTER COLUMN` generation; trigger create/edit/remove; procedure and function management with typed `OUT`/`INOUT` variables
- **Explain** — static and runtime execution plans via `SHOWPLAN_XML` / `STATISTICS XML`, rendered in the app's Visual EXPLAIN
- **Types** — the full common SQL Server type set, including `DATETIMEOFFSET`, `UNIQUEIDENTIFIER`, `XML`, `SQL_VARIANT`, `ROWVERSION`, `HIERARCHYID` and spatial types; `BIGINT` values outside JavaScript's safe range are delivered as strings

Targets: Linux x64/arm64, macOS x64/arm64, Windows x64.

## Install it

Open **Settings → Plugins** in Tabularis 0.23.0 or later and install **SQL Server** from the catalogue, or download the archive from the [releases page](https://github.com/TabularisDB/tabularis-sqlserver-plugin/releases) and install it manually. The plugin declares `min_runtime_version` `0.23.0`: an older Tabularis filters it out of the catalogue and refuses a manual install with a message naming both versions.

## What's still open

The plugin is in **beta**. Known limitations being worked through:

- SQL authentication only; Azure AD and Windows Integrated Authentication are follow-up work
- Primary-key membership changes are disabled: the single-column alteration API cannot safely preserve composite PKs and referencing foreign keys
- Custom CA files and client certificates are rejected; strict TLS verification uses the system trust store

Gaps and bugs go to the [plugin repository's issues](https://github.com/TabularisDB/tabularis-sqlserver-plugin/issues).

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
