---
title: "Plugin System & Custom Drivers"
order: 8
excerpt: "How Tabularis plugins are structured and loaded: architecture, directory layout, the .tabularium manifest and plugin settings."
category: "Integration"
---

While Tabularis supports major relational databases natively via Rust, the ecosystem of data stores is vast. The Plugin System allows anyone to add support for external databases (like DuckDB, ClickHouse, or Redis) using **any programming language**.

This page explains how a plugin is structured and loaded. The rest of the plugin documentation:

- [Installing Plugins](/wiki/installing-plugins) — for users: the Plugin Center, updates and plugin settings.
- [Plugin Protocol](/wiki/plugin-protocol) — the JSON-RPC methods a driver implements.
- [Building Your First Plugin](/wiki/building-plugins) — scaffold a driver and implement it step by step.
- [UI Extensions](/wiki/ui-extensions) — add React components to the Tabularis interface.
- [Publishing Plugins](/wiki/plugin-development) and [Plugin Kinds](/wiki/plugin-kinds) — release a plugin to the registry.

## Architecture: JSON-RPC over STDIO

Tabularis avoids dynamic linking (`.so` or `.dll` files) for plugins, which can cause version conflicts and security issues. Instead, plugins are **standalone executables** — a binary or a script — that run as child processes.

For each enabled plugin driver, Tabularis:

1. Spawns the plugin executable as a child process when the app starts (or when you enable the plugin in Settings).
2. Sends **JSON-RPC 2.0** request objects to the plugin's `stdin`, one per line.
3. Reads **JSON-RPC 2.0** response objects from the plugin's `stdout`, one per line.
4. Reuses that single process for every connection that uses the driver.

Output written to `stderr` is passed through to Tabularis's own standard error (visible when you launch the app from a terminal). It is not part of the protocol, so it is safe to use for debugging.

## Directory Structure

A plugin is distributed as a `.zip` file per platform. Tabularis installs it into a folder named after the plugin `id`, grouped by kind:

```text
plugins/
├── drivers/
│   └── duckdb/
│       ├── .tabularium      (or legacy manifest.json)
│       ├── duckdb-plugin    (or duckdb-plugin.exe on Windows)
│       ├── locales/         (optional, UI translations)
│       └── ui/dist/         (optional, UI extension bundles)
└── themes/
    └── my-theme/
```

Plugin folders placed directly under `plugins/` (without the `drivers/` level) are still loaded, so older manual installs keep working.

**Plugin folder locations:**

| Platform | Path |
|----------|------|
| Linux | `~/.local/share/tabularis/plugins/` |
| macOS | `~/Library/Application Support/tabularis/plugins/` |
| Windows | `%APPDATA%\tabularis\plugins\` |

## The Manifest (`.tabularium`)

Every plugin ships one manifest that tells Tabularis its capabilities and the data types it supports. Its canonical name is **`.tabularium`** — one file at the plugin root that serves both the host (loading the driver) and the [Tabularium registry](/wiki/plugin-development) (listing it). The host still reads a legacy `manifest.json` as a fallback. With Tabularium 0.14.0 and Tabularis v0.25.0, a `.tabularium` may carry `id` as the stable lowercase identifier and `name` as the human-readable display name, which the connection catalogue shows for standalone plugins instead of title-casing the slug; manifests without `id` remain valid, and their `name` keeps acting as the identifier. When adopting the split, set `id` equal to the existing registry slug first, then change `name`. The registry-side fields are listed in [Publishing Plugins](/wiki/plugin-development#core-manifest-fields) and, per kind, in [Plugin Kinds](/wiki/plugin-kinds).

```json
{
  "$schema": "https://registry.tabularis.dev/manifest.schema.json?kind=driver",
  "name": "duckdb",
  "version": "1.0.0",
  "description": "DuckDB file-based analytical database",
  "default_port": null,
  "executable": "duckdb-plugin",
  "capabilities": {
    "schemas": false,
    "views": true,
    "routines": false,
    "file_based": true,
    "identifier_quote": "\"",
    "alter_primary_key": false
  },
  "data_types": [
    { "name": "INTEGER",  "category": "numeric", "requires_length": false, "requires_precision": false },
    { "name": "VARCHAR",  "category": "string",  "requires_length": true,  "requires_precision": false },
    { "name": "BOOLEAN",  "category": "other",   "requires_length": false, "requires_precision": false },
    { "name": "TIMESTAMP","category": "date",    "requires_length": false, "requires_precision": false }
  ]
}
```

### Capabilities

| Flag | Type | Description |
|------|------|-------------|
| `schemas` | bool | `true` if the database supports named schemas (e.g. PostgreSQL). Shows the schema selector in the UI. |
| `views` | bool | `true` to enable the Views section in the explorer. |
| `materialized_views` | bool | `true` if the database supports materialized views. Enables the materialized views section in the explorer (see [Materialized Views](/wiki/plugin-protocol#materialized-views-optional)). Defaults to `false`. |
| `routines` | bool | `true` to enable stored procedures/functions in the explorer. |
| `routine_management` | bool | `true` to enable routine management actions (run with parameters, create from template, edit, drop). The backing RPCs are optional — the host falls back to dialect-neutral SQL. Defaults to `false`. |
| `triggers` | bool | `true` if the database supports triggers. Enables trigger listing and management for drivers that implement the trigger RPCs. Defaults to `false`. |
| `file_based` | bool | `true` for local file databases (e.g. SQLite, DuckDB). Replaces host/port with a file path field. |
| `in_memory` | bool | Since v0.29.0. Requires `file_based`. `true` if the driver also opens the path `:memory:` as a temporary database (e.g. DuckDB). Adds an **In-memory** button next to the file path input and skips the file existence check for that path. The database lives in the plugin process: connections that use `:memory:` share it until the plugin process stops. `inMemory` is also accepted. Defaults to `false`. |
| `identifier_quote` | string | Character used to quote SQL identifiers: `"\""` (ANSI) or `` "`" `` (MySQL). |
| `alter_primary_key` | bool | `true` if the database supports altering primary keys after table creation. Defaults to `true`. |
| `alter_column` | bool | `true` to enable ALTER TABLE MODIFY COLUMN operations in the schema editor. |
| `create_foreign_keys` | bool | `true` to enable FK constraint creation in the schema editor. |
| `folder_based` | bool | `true` for databases that target a folder rather than a file or host (e.g., CSV plugin). Replaces host/port with a folder picker. |
| `no_connection_required` | bool | `true` for API-based plugins that need no host, port, or credentials (e.g. a public REST API). Hides the entire connection form — the user only fills in the connection name. |
| `connection_string` | bool | Set `false` to hide the connection string import UI for this driver. Defaults to `true` for network drivers; automatically skipped for `file_based` and `folder_based` drivers. |
| `connection_string_example` | string | Optional placeholder example shown in the connection string import field (e.g. `"clickhouse://user:pass@localhost:9000/db"`). `connectionStringExample` is also accepted. |
| `connection_string_examples` | array | Since v0.27.0. Optional labelled presets shown in a selector beside the connection string import field, for drivers with several URL forms. Each item has a required `label` and `value` and an optional `description`, shown under the selector. Selecting one fills the field; `connection_string_example` stays the placeholder. `connectionStringExamples` is also accepted. |
| `manage_tables` | bool | `true` to enable table and column management UI (Create Table, Add/Modify/Drop Column, Drop Table). Does not control index or FK operations. Defaults to `true`. |
| `readonly` | bool | When `true`, the driver is read-only: all data modification operations (INSERT, UPDATE, DELETE) are disabled in the UI. Table and column management is also hidden regardless of `manage_tables`. Defaults to `false`. |
| `explain` | bool | `true` if the driver implements the `explain_query` method (EXPLAIN / query plan support). Enables the Visual EXPLAIN button in the SQL editor and notebook cells; when `false` or omitted, the Visual EXPLAIN UI is hidden for connections using this driver. Defaults to `false`. |
| `sql_dialect` | string | Optional SQL dialect preset: `postgres`, `mysql`, `mssql`, `sqlite`, `oracle`, or `generic`. Drives statement splitting, the AI/MCP read-only check, generated SQL and literals. Oracle-like plugins, including DM/Dameng, should use `"oracle"`. A dialect the host does not know loads as `generic`. |
| `sql_syntax` | object | Since v0.29.0. Optional declarative syntax that extends a preset, for engines no preset describes. See [SQL Syntax](#sql-syntax-sql_syntax) below. |
| `column_comments` | bool | Since v0.29.0. The DDL generation RPCs honour `ColumnDefinition.comment`, so the column editor (Modify Column) shows a description field. Defaults to `false`. |
| `column_stats` | bool | Since v0.29.0. Opts the data grid's **Column statistics** popover into the optional `get_column_stats` RPC (see [Column Statistics](/wiki/plugin-protocol#column-statistics-optional-since-v0290)). Defaults to `false`: plugins whose `sql_dialect` is `postgres`, `mysql` or `sqlite` get the host's generic SQL, the others do not show the menu entry. |
| `drop_table_sql` | bool | Since v0.29.0. Opts the explorer's **Drop table** action into the optional `get_drop_table_sql` RPC, so the plugin can return its own statement (for example `DROP SNAPSHOT TABLE`). Defaults to `false`: the host runs a generic `DROP TABLE` with your `identifier_quote`. |
| `supports_ssl` | bool | `true` to show the SSL/TLS configuration tab (mode + CA/client cert/key) in the connection modal. The values are forwarded to the plugin as `ssl_mode`, `ssl_ca`, `ssl_cert`, and `ssl_key` in `ConnectionParams`. Network drivers only. Defaults to `false`. |
| `table_query_templates` | bool | Since v0.26.0. Opts the **Generate SQL** dialog into the optional `get_table_query_template` RPC for SELECT, UPDATE and DELETE previews (see [Table Query Templates](/wiki/plugin-protocol#table-query-templates-optional)). Defaults to `false`; built-in drivers and plugins without it keep the host's templates. |
| `single_database` | bool | `true` for drivers exposing a single implicit database (e.g. a flat search/document store like Meilisearch). Skips the database tab and the database-name field in the connection modal. |
| `user_management` | bool | `true` to enable the **Users & Privileges** view (see [User Management](/wiki/user-management)). Defaults to `false`. |
| `connection_uri` | bool | `true` if the driver consumes the raw connection URI verbatim instead of the decomposed host/port/database fields (e.g. `mongodb+srv://`). Defaults to `false`. |
| `connection_uri_schemes` | string[] | Additional URI schemes the driver handles, beyond its own id and the scheme of `connection_string_example` (e.g. `["mongodb+srv"]`). |
| `auto_increment_keyword` | string | Keyword appended after the column type for auto-increment columns in generated DDL (e.g. `AUTO_INCREMENT`). Empty by default. |
| `serial_type` | string | Replacement type for auto-increment columns in generated DDL (e.g. `SERIAL`). Empty by default. |
| `inline_pk` | bool | `true` if the primary key is declared inline in the column definition (e.g. SQLite `AUTOINCREMENT`). Defaults to `false`. |

When the manifest includes a `capabilities` object, `schemas`, `views`, `routines` and `file_based` are required; the other flags fall back to the defaults listed above.

### Declaring the SQL dialect

Always set `sql_dialect` to the closest preset. A plugin that declares no dialect, or only `generic`, still loads, but the host cannot know how its SQL is tokenized and assumes the worst: the AI/MCP read-only check lexes every query under every preset and rejects reads they disagree on (a `#` outside a string, a backslash in a string literal, `$$` bodies, and similar), and generated SQL (filters, dumps, notebook cell CTEs, Copy as INSERT) falls back to standard quoting. Since v0.29.0 the **Copy SQL Without Comments** editor action is also hidden for such drivers.

### SQL Syntax (`sql_syntax`)

Since v0.29.0, a driver whose engine lexes SQL differently from every preset (GoogleSQL's triple-quoted strings, `#` comments and procedural scripts, for example) can describe the difference in `capabilities.sql_syntax`. It is data only; the host never runs code from it. `extends` names the preset to start from (it defaults to `sql_dialect`), and every other field overrides one rule of that preset:

| Field | Meaning |
|-------|---------|
| `extends` | Preset to extend: `postgres`, `mysql`, `mssql`, `sqlite`, `oracle` or `generic`. |
| `quotes` | Replaces the quote rules: 1–8 objects `{ "open", "close"?, "kind", "escape"? }`, with `kind` `string` or `identifier` and `escape` `double`, `backslash`, `both` or `none`. |
| `triple_quoted_strings` | `'''…'''` and `"""…"""` strings that may span lines. |
| `string_prefixes` | Letter prefixes accepted before a string (e.g. `r`, `b`, `rb`). |
| `hash_comments`, `nested_block_comments`, `line_comment_requires_space` | Comment rules. |
| `script_blocks` | Procedural blocks (`BEGIN … END`, `IF … END IF`, loops, `CREATE PROCEDURE` bodies) stay one statement. |
| `dollar_quoting` | `$tag$ … $tag$` strings. |
| `string_escape` | How the host writes string literals: `standard` (`'it''s'`) or `backslash` (`'it\'s'`). |
| `like_escape` | Whether `LIKE … ESCAPE '!'` is supported. |
| `boolean_literals` | `keywords` (`TRUE`/`FALSE`) or `numeric` (`1`/`0`) in generated SQL. |
| `formatter` | `sql-formatter` language used by **Format SQL** (for example `bigquery`, `duckdb`, `trino`). |
| `keywords`, `functions` | Extra autocomplete words, up to 1000 each. |

The statement splitter, **Format SQL**, autocomplete, the filter bar, Copy as INSERT, imports, dumps, notebook literals and the MCP read-only check all read it. For the read-only check a declared syntax adds a tokenization pass, so it can make the check stricter, never looser. An invalid field is logged and ignored, unknown fields are ignored, and hosts that predate `sql_syntax` keep using `sql_dialect`, so keep `sql_dialect` set to the closest preset (e.g. `mysql` for GoogleSQL). Connection metadata cannot override it. The full field reference, with the GoogleSQL descriptor of the BigQuery driver as an example, is in the [plugin guide](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md#sql-syntax-sql_syntax).

### Connection Fields

Since v0.29.0 the optional manifest object `connection_fields` adapts the host's connection inputs to a driver that does not use them as-is. Each of `host`, `port`, `username`, `password` and `database` accepts `hidden` (boolean), `label` (up to 80 characters) and `placeholder` (up to 200 characters):

```json
{
  "connection_fields": {
    "host": { "hidden": true },
    "port": { "hidden": true },
    "username": { "hidden": true },
    "password": { "hidden": true },
    "database": { "label": "Project ID", "placeholder": "billing-project" }
  }
}
```

Overrides are presentation only: a hidden input is not rendered, but a value already saved for it is kept and still sent to the driver. A hidden `database` is not required on Test Connection or Save, and hiding `host` also hides **Load Databases**. Collect what the driver needs instead through the `connection-modal.extra_fields` [UI extension](/wiki/ui-extensions#custom-connection-fields), with `setSecretField` for credentials, which are kept in the OS keychain.

### Data Type Categories

| Category | Examples |
|----------|----------|
| `numeric` | INTEGER, BIGINT, DECIMAL, FLOAT |
| `string` | VARCHAR, TEXT, CHAR |
| `date` | DATE, TIME, TIMESTAMP |
| `binary` | BLOB, BYTEA |
| `json` | JSON, JSONB |
| `spatial` | GEOMETRY, POINT |
| `other` | BOOLEAN, UUID |

### Type Mappings

The optional `type_mappings` manifest field declares how generic inferred type names map to driver-native types. It is used during paste/import, where Tabularis infers column types from the data (e.g. detects a date column as `DATETIME`) and needs the driver-native equivalent. The mapping is static in the manifest and resolved by the host — no RPC round-trip.

```json
{
  "type_mappings": {
    "DATETIME": "TIMESTAMP",
    "JSON": "JSONB"
  }
}
```

Keys are uppercase generic type names; the lookup is case-insensitive. Types without a mapping (or an omitted `type_mappings`) pass through unchanged.

`@tabularis/create-plugin` scaffolds the `.tabularium` manifest directly and ships a `migrate` command that converts an existing legacy `manifest.json` plugin (and, with `--ci`, regenerates a registry-ready release workflow).

## Plugin Settings

Plugins can declare configuration fields that Tabularis renders in **Settings → gear icon** next to the plugin; the values are persisted in `config.json` and delivered to the plugin through the `initialize` call. For the user side, including the per-plugin call timeout, see [Plugin Settings](/wiki/installing-plugins#plugin-settings).

### Declaring settings in the manifest

Add an optional `settings` array to your manifest:

```json
{
  "name": "my-plugin",
  "settings": [
    {
      "key": "api_key",
      "label": "API Key",
      "type": "string",
      "required": true,
      "description": "Your API key for authentication."
    },
    {
      "key": "region",
      "label": "Region",
      "type": "select",
      "options": ["us-east-1", "eu-west-1"],
      "default": "us-east-1"
    },
    {
      "key": "max_connections",
      "label": "Max Connections",
      "type": "number",
      "default": 10
    },
    {
      "key": "ssl",
      "label": "Enable SSL",
      "type": "boolean",
      "default": true
    }
  ]
}
```

Supported setting types: `"string"`, `"boolean"`, `"number"`, `"select"`.

### The `initialize` call

Tabularis sends an `initialize` JSON-RPC call with the user's saved settings just before the first real request to the plugin, not at spawn time. Other requests wait for it to finish (up to 15 seconds):

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": { "settings": { "api_key": "abc", "region": "eu-west-1" } },
  "id": 1
}
```

Returning an error from `initialize` is safe — Tabularis logs a warning and carries on. Plugins that do not implement `initialize` are completely unaffected.

Plugin settings are stored under the top-level `plugins` key in `config.json`, keyed by plugin ID.

For the full developer reference (field schema, code examples in Rust and Python), see the [Plugin Guide](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md).

## Testing Your Plugin

You can test your plugin directly from the shell before installing it in Tabularis:

```bash
echo '{"jsonrpc":"2.0","method":"test_connection","params":{"params":{"driver":"duckdb","database":"/tmp/test.duckdb","host":null,"port":null,"username":null,"password":null,"ssl_mode":null}},"id":1}' \
  | ./duckdb-plugin
```

You should see a valid JSON-RPC response on `stdout`.

## Installing Locally

1. Create the plugin directory inside the Tabularis plugins folder, for example on Linux:
   ```
   ~/.local/share/tabularis/plugins/drivers/myplugin/
   ```
2. Place your `.tabularium` (or legacy `manifest.json`) and the compiled executable there, plus `ui/dist/` and `locales/` if the plugin has UI extensions.
3. On Linux/macOS, make it executable: `chmod +x myplugin`
4. Restart Tabularis, or enable the plugin in **Settings → Plugins**. Once you have saved a list of enabled plugins, a folder copied in by hand stays disabled until you turn it on there.

A project scaffolded with `@tabularis/create-plugin` handles steps 1–3 with `just dev-install`, which copies the executable, `.tabularium` and `ui/dist/index.js`. Copy `locales/` yourself if the plugin has translations.
