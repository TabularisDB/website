---
title: "Plugin System"
order: 8
excerpt: "Extend Tabularis with new database drivers using any programming language."
category: "Integration"
---

# Plugin System & Custom Drivers

While Tabularis supports major relational databases natively via Rust, the ecosystem of data stores is vast. The Plugin System allows anyone to add support for external databases (like DuckDB, ClickHouse, or Redis) using **any programming language**.

<video src="/videos/wiki/08-plugins.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

For the complete protocol reference, see [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md) in the repository.

## Architecture: JSON-RPC over STDIO

Tabularis avoids dynamic linking (`.so` or `.dll` files) for plugins, which can cause version conflicts and security issues. Instead, plugins are **standalone executables** — a binary or a script — that run as child processes.

When a user opens a connection using a plugin driver, Tabularis:

1. Spawns the plugin executable as a child process.
2. Sends **JSON-RPC 2.0** request objects to the plugin's `stdin`, one per line.
3. Reads **JSON-RPC 2.0** response objects from the plugin's `stdout`, one per line.
4. Reuses the same process instance for the entire session.

Any output written to `stderr` is captured by Tabularis and shown in the log viewer — safe to use for debugging without breaking the protocol.

## Directory Structure

A plugin is distributed as a `.zip` file. When extracted into the Tabularis plugins folder, it must follow this layout:

```text
plugins/
└── duckdb/
    ├── manifest.json
    └── duckdb-plugin        (or duckdb-plugin.exe on Windows)
```

**Plugin folder locations:**

| Platform | Path |
|----------|------|
| Linux | `~/.local/share/tabularis/plugins/` |
| macOS | `~/Library/Application Support/tabularis/plugins/` |
| Windows | `%APPDATA%\tabularis\plugins\` |

## The `manifest.json`

Every plugin must include a `manifest.json` that tells Tabularis its capabilities and the data types it supports.

```json
{
  "$schema": "https://tabularis.dev/schemas/plugin-manifest.json",
  "id": "duckdb",
  "name": "DuckDB",
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
| `materialized_views` | bool | `true` if the database supports materialized views. Enables the materialized views section in the explorer (see [Materialized Views](#materialized-views)). Defaults to `false`. |
| `routines` | bool | `true` to enable stored procedures/functions in the explorer. |
| `routine_management` | bool | `true` to enable routine management actions (run with parameters, create from template, edit, drop). The backing RPCs are optional — the host falls back to dialect-neutral SQL. Defaults to `false`. |
| `triggers` | bool | `true` if the database supports triggers. Enables trigger listing and management for drivers that implement the trigger RPCs. Defaults to `false`. |
| `file_based` | bool | `true` for local file databases (e.g. SQLite, DuckDB). Replaces host/port with a file path field. |
| `identifier_quote` | string | Character used to quote SQL identifiers: `"\""` (ANSI) or `` "`" `` (MySQL). |
| `alter_primary_key` | bool | `true` if the database supports altering primary keys after table creation. |
| `alter_column` | bool | `true` to enable ALTER TABLE MODIFY COLUMN operations in the schema editor. |
| `create_foreign_keys` | bool | `true` to enable FK constraint creation in the schema editor. |
| `folder_based` | bool | `true` for databases that target a folder rather than a file or host (e.g., CSV plugin). Replaces host/port with a folder picker. |
| `no_connection_required` | bool | `true` for API-based plugins that need no host, port, or credentials (e.g. a public REST API). Hides the entire connection form — the user only fills in the connection name. |
| `connection_string` | bool | Set `false` to hide the connection string import UI for this driver. Defaults to `true` for network drivers; automatically skipped for `file_based` and `folder_based` drivers. |
| `connection_string_example` | string | Optional placeholder example shown in the connection string import field (e.g. `"clickhouse://user:pass@localhost:9000/db"`). `connectionStringExample` is also accepted. |
| `manage_tables` | bool | `true` to enable table and column management UI (Create Table, Add/Modify/Drop Column, Drop Table). Does not control index or FK operations. Defaults to `true`. |
| `readonly` | bool | When `true`, the driver is read-only: all data modification operations (INSERT, UPDATE, DELETE) are disabled in the UI. Table and column management is also hidden regardless of `manage_tables`. Defaults to `false`. |
| `explain` | bool | `true` if the driver implements the `explain_query` method (EXPLAIN / query plan support). Enables the Visual EXPLAIN button in the SQL editor and notebook cells; when `false` or omitted, the Visual EXPLAIN UI is hidden for connections using this driver. Defaults to `false`. |
| `sql_dialect` | string | Optional statement-splitting dialect: `postgres`, `mysql`, `mssql`, `sqlite`, `oracle`, or `generic`. Oracle-like plugins, including DM/Dameng, should use `"oracle"`. |
| `supports_ssl` | bool | `true` to show the SSL/TLS configuration tab (mode + CA/client cert/key) in the connection modal. The values are forwarded to the plugin as `ssl_mode`, `ssl_ca`, `ssl_cert`, and `ssl_key` in `ConnectionParams`. Network drivers only. Defaults to `false`. |
| `single_database` | bool | `true` for drivers exposing a single implicit database (e.g. a flat search/document store like Meilisearch). Skips the database tab and the database-name field in the connection modal. |

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

## Plugin Settings

Plugins can declare custom configuration fields in their `manifest.json`. Tabularis renders these fields in **Settings → gear icon** next to the plugin. Users fill them in, the values are persisted in `config.json`, and Tabularis delivers them to the plugin at startup.

![Plugin settings modal with configurable fields](/img/posts/plugin-settings-modal.png)

### Declaring settings in `manifest.json`

Add an optional `settings` array to your manifest:

```json
{
  "id": "my-plugin",
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

After spawning the plugin process, Tabularis immediately sends an `initialize` JSON-RPC call with the user's saved settings:

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": { "settings": { "api_key": "abc", "region": "eu-west-1" } },
  "id": 1
}
```

Returning an error from `initialize` is safe — Tabularis ignores it silently. Plugins that do not implement `initialize` are completely unaffected.

Plugin settings are stored under the top-level `plugins` key in `config.json`, keyed by plugin ID.

For the full developer reference (field schema, code examples in Rust and Python), see the [Plugin Guide](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md).

## Protocol Specification

Your plugin runs a continuous read loop on `stdin`. For each line received, parse the JSON-RPC request, execute the operation, and write a JSON-RPC response to `stdout` followed by `\n`.

### Request format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_tables",
  "params": {
    "params": {
      "driver": "duckdb",
      "host": null,
      "port": null,
      "database": "/path/to/my.duckdb",
      "username": null,
      "password": null,
      "ssl_mode": null
    },
    "schema": null
  }
}
```

The `params.params` object (a `ConnectionParams`) contains the values the user entered in the connection form. Additional fields at the top level of `params` are method-specific (e.g. `schema`, `table`, `query`).

### Optional AI schema context

External drivers automatically participate in **AI Query Assist** when they implement the standard `get_tables`, `get_columns`, and `get_foreign_keys` metadata methods. The host limits the selected tables and builds the final system prompt, so plugins do not need to know which AI provider the user configured.

Drivers with an efficient batch metadata API can additionally implement `get_ai_schema_context`:

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "get_ai_schema_context",
  "params": {
    "params": { "driver": "my-driver", "database": "app" },
    "schema": "public",
    "max_tables": 20
  }
}
```

Return a result shaped as `{ "tables": [{ "name", "columns", "foreign_keys" }], "total_table_count": 42 }`. Respect `max_tables` while reporting the pre-limit count in `total_table_count`. If the method is not implemented, return `-32601`; Tabularis automatically falls back to the standard metadata calls, keeping existing plugins compatible.

### Successful response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    { "name": "users", "schema": "main", "comment": null }
  ]
}
```

### Error response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Database file not found."
  }
}
```

**Standard error codes:**

| Code | Meaning |
|------|---------|
| `-32700` | Parse error |
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |

## Required Methods

Your plugin must implement at minimum the following methods. For unimplemented optional methods, return an empty array `[]` or a `-32601` error.

### `test_connection`

Verify that a connection can be established.

**Params:** `{ "params": ConnectionParams }`

**Result:** `{ "success": true }` or an error response.

---

### `ping` *(optional)*

Lightweight health check called periodically on active connections. Tabularis pings every active connection at a configurable interval (default: 30 seconds). After 2 consecutive failures, the connection is automatically disconnected and the user is notified.

**Params:** `{ "params": ConnectionParams }`

**Result:** `null` on success, or an error response if the connection is dead.

> If not implemented, Tabularis falls back to `test_connection`. Implementing `ping` is recommended when your plugin can do a cheaper liveness check than a full connection test.

---

### `get_databases`

List available databases.

**Params:** `{ "params": ConnectionParams }`

**Result:** `["db1", "db2"]`

---

### `get_tables`

List tables in a schema/database.

**Params:** `{ "params": ConnectionParams, "schema": string | null }`

**Result:**
```json
[{ "name": "users", "schema": "main", "comment": null }]
```

---

### `get_columns`

Get column metadata for a table.

**Params:** `{ "params": ConnectionParams, "schema": string | null, "table": string }`

**Result:**
```json
[
  {
    "name": "id",
    "data_type": "INTEGER",
    "is_nullable": false,
    "column_default": null,
    "is_primary_key": true,
    "is_auto_increment": true,
    "comment": null
  }
]
```

---

### `execute_query`

Execute a SQL query and return results.

**Params:**
```json
{
  "params": ConnectionParams,
  "query": "SELECT * FROM users",
  "limit": 100,
  "page": 1,
  "schema": null
}
```

**Result:**
```json
{
  "columns": ["id", "name"],
  "rows": [[1, "Alice"]],
  "total_count": 1,
  "execution_time_ms": 5
}
```

### Materialized Views *(optional)*

Declare `materialized_views: true` in capabilities to enable the UI. If the plugin returns `-32601` (method not found), the host falls back to empty results for `get_materialized_views` and `get_materialized_view_columns`; `get_materialized_view_definition` and `refresh_materialized_view` surface a "not supported by this driver" error instead.

| Method | Params | Result |
|--------|--------|--------|
| `get_materialized_views` | `{ "params", "schema" }` | `[{ "name": string, "schema": string \| null }]` |
| `get_materialized_view_columns` | `{ "params", "view_name", "schema" }` | `[TableColumn]` (same shape as `get_columns`) |
| `get_materialized_view_definition` | `{ "params", "view_name", "schema" }` | `string` (the SQL definition) |
| `refresh_materialized_view` | `{ "params", "view_name", "schema" }` | `null` on success |

### BLOB Operations *(optional)*

If the plugin returns `-32601`, the host shows "BLOB export/preview not supported".

- **`save_blob_to_file`** — params `{ "params", "table", "col_name", "pk_map", "schema", "file_path" }`. The plugin queries the binary value via the PK map and writes the raw bytes to `file_path` itself (it runs on the same machine as the host). Returns `null` on success.
- **`fetch_blob_as_data_url`** — params `{ "params", "table", "col_name", "pk_map", "schema" }`. Returns the value in the BLOB wire format `"BLOB:<size_bytes>:<mime_type>:<base64_data>"` for preview in the row editor.

For the full list of methods (CRUD, DDL, views, routines, triggers, batch/ER diagram methods), see the [complete plugin guide](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md).

## Minimal Skeleton (Rust)

```rust
use std::io::{self, BufRead, Write};
use serde_json::{json, Value};

fn main() {
    let stdin = io::stdin();
    let mut stdout = io::stdout();

    for line in stdin.lock().lines() {
        let line = line.unwrap();
        if line.trim().is_empty() { continue; }

        let req: Value = match serde_json::from_str(&line) {
            Ok(v) => v,
            Err(_) => continue,
        };

        let id = req["id"].clone();
        let method = req["method"].as_str().unwrap_or("");
        let params = &req["params"];
        let response = dispatch(method, params, id);

        let mut res_str = serde_json::to_string(&response).unwrap();
        res_str.push('\n');
        stdout.write_all(res_str.as_bytes()).unwrap();
        stdout.flush().unwrap();
    }
}

fn dispatch(method: &str, _params: &Value, id: Value) -> Value {
    match method {
        "test_connection" => json!({
            "jsonrpc": "2.0", "result": { "success": true }, "id": id
        }),
        // Optional: lightweight health check (called periodically).
        // If omitted, Tabularis falls back to test_connection.
        "ping" => json!({
            "jsonrpc": "2.0", "result": null, "id": id
        }),
        "get_databases" => json!({
            "jsonrpc": "2.0", "result": ["my_database"], "id": id
        }),
        "get_tables" => json!({
            "jsonrpc": "2.0",
            "result": [{ "name": "example", "schema": null, "comment": null }],
            "id": id
        }),
        "execute_query" => json!({
            "jsonrpc": "2.0",
            "result": {
                "columns": ["id"], "rows": [[1]],
                "total_count": 1, "execution_time_ms": 1
            },
            "id": id
        }),
        _ => json!({
            "jsonrpc": "2.0",
            "error": { "code": -32601, "message": format!("Method '{}' not implemented", method) },
            "id": id
        }),
    }
}
```

## Testing Your Plugin

You can test your plugin directly from the shell before installing it in Tabularis:

```bash
echo '{"jsonrpc":"2.0","method":"test_connection","params":{"params":{"driver":"duckdb","database":"/tmp/test.duckdb","host":null,"port":null,"username":null,"password":null,"ssl_mode":null}},"id":1}' \
  | ./duckdb-plugin
```

You should see a valid JSON-RPC response on `stdout`.

## Installing Locally

1. Create the plugin directory inside the Tabularis plugins folder:
   ```
   ~/.local/share/tabularis/plugins/myplugin/   (Linux)
   ```
2. Place your `manifest.json` and the compiled executable there.
3. On Linux/macOS, make it executable: `chmod +x myplugin`
4. Open Tabularis and refresh the plugins list if needed. A locally installed plugin can be loaded directly from the plugins directory.

## The Hosted Registry and the Connection Catalogue

Since v0.16.0, plugin discovery runs through the hosted **Tabularium** registry at `registry.tabularis.dev` instead of a static JSON file:

![The connection catalogue merging built-in drivers and registry plugins, with paradigm facets, Installed badges, and per-plugin download counts](/img/tabularis-connection-catalogue.png)

- **The connection catalogue.** Creating a new connection starts from a searchable catalogue that merges built-in drivers with registry plugins into one grid, with paradigm facets for filtering. Drivers your platform can't run are badged and dimmed. Picking an uninstalled driver install-gates it — you can install the plugin inline and continue straight to the connection form.
- **Deep-link installs.** Links of the form `tabularis://install/<slug>` open the app with a version-aware confirmation: **Install** for a new plugin, **Update** when a newer version exists, or an already-installed notice. An optional `?version=` pins a specific release.
- **Version picking and updates.** Catalogue cards let you install a specific released version, and the **Installed** tab shows an Update button when a newer compatible release exists for your platform and app version.
- **Backwards compatibility.** The legacy static [`registry.json`](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json) is still merged into the catalogue (the hosted API wins on conflicting ids), so plugins that haven't migrated remain visible and installable, and older app versions keep working unchanged.

The manifest format also has a new canonical name: **`.tabularium`** — same JSON content as the legacy `manifest.json`, which is still read as a fallback. `@tabularis/create-plugin` 0.2.0 scaffolds `.tabularium` directly and ships a `migrate` command that converts an existing `manifest.json` plugin (and, with `--ci`, regenerates a registry-ready release workflow).

## Using a Custom Plugin Registry

By default, Tabularis fetches the plugin list from the official Tabularium registry. You can point the app to a different registry (e.g., a self-hosted or company-internal Tabularium instance) by setting `customRegistryUrl` in your `config.json`:

```json
{
  "customRegistryUrl": "https://registry.example.com/api/manifest"
}
```

When this key is set, both the in-app plugin browser and the install command use your registry instead of the default one. A plain static JSON file following the [legacy registry schema](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json) also still works.

## UI Extensions (Phase 2)

Starting with v0.9.13, plugins can inject custom React components into the Tabularis UI through a **slot-based extension system**. This allows plugins to add buttons, fields, previews, and menu items directly into the interface without modifying host code.

### How It Works

The system has three layers:

1. **SlotAnchor** — Host components placed at predefined insertion points that determine WHERE extensions render.
2. **PluginSlotRegistry** — A React context that stores registered contributions and determines WHAT gets rendered.
3. **Plugin Modules** — JavaScript/TypeScript code that registers components during plugin activation.

### Available Slots

Ten insertion points are available:

| Slot Name | Location | Renders Per |
|-----------|----------|-------------|
| `row-edit-modal.field.after` | After each field in New Row modal | Each column |
| `row-edit-modal.footer.before` | Before Save/Cancel buttons | Once per modal |
| `row-editor-sidebar.field.after` | After each field in Row Editor sidebar | Each column |
| `row-editor-sidebar.header.actions` | Sidebar header action area | Once per sidebar |
| `data-grid.toolbar.actions` | Table toolbar (after LIMIT) | Once per table view |
| `data-grid.context-menu.items` | Right-click context menu on grid rows | Each menu open |
| `sidebar.footer.actions` | Main sidebar footer area | Once (global) |
| `settings.plugin.actions` | Per-plugin actions in Settings | Each installed plugin |
| `settings.plugin.before_settings` | Above plugin settings form | Each installed plugin |
| `connection-modal.connection_content` | Inside the connection form | Each connection dialog |

### Declaring UI Extensions in the Manifest

Add an optional `ui_extensions` array to your `manifest.json`:

```json
{
  "id": "postgis-toolkit",
  "name": "PostGIS Toolkit",
  "version": "1.0.0",
  "ui_extensions": [
    {
      "slot": "row-editor-sidebar.field.after",
      "module": "./ui/GeometryPreview.tsx",
      "order": 50
    },
    {
      "slot": "data-grid.toolbar.actions",
      "module": "./ui/MapViewButton.tsx",
      "order": 80
    }
  ]
}
```

### Plugin API

Slot components can import hooks from `@tabularis/plugin-api`:

| Hook | Purpose |
|------|---------|
| `usePluginQuery()` | Execute read-only queries on the active connection |
| `usePluginConnection()` | Access active connection metadata (ID, driver, schema) |
| `usePluginToast()` | Show info/error/warning notification dialogs |
| `usePluginModal()` | Open host-managed modals with custom content |
| `usePluginSetting(pluginId)` | Read and write plugin-specific settings |
| `usePluginTheme()` | Access theme information (dark/light, colors) |
| `usePluginTranslation(pluginId)` | Access plugin-specific i18n translations |
| `openUrl(url)` | Open a URL in the system browser |

### Error Isolation

Each slot contribution is wrapped in a `SlotErrorBoundary`. A crashing plugin component displays a compact error message without affecting the host application or other plugins.

### Backward Compatibility

The `ui_extensions` field is optional. Plugins without it continue to work identically. The slot anchors render nothing when no contributions are registered — zero overhead.

### Built-in Example: JSON Viewer

Tabularis ships with a built-in **JSON Viewer** plugin that demonstrates the slot system. It renders a formatted, collapsible JSON tree with syntax highlighting for JSON/JSONB columns in the row editor.

**Slots used:** `row-editor-sidebar.field.after`, `row-edit-modal.field.after`

Features:
- Auto-detects JSON columns by name (contains "json") or by parsing the value
- Syntax-highlighted tokens: strings (green), numbers (blue), booleans (yellow), null (red), keys (purple)
- Collapsible objects and arrays with auto-expand for the first 2 depth levels
- Copy-to-clipboard button for the formatted JSON

Source code: [`src/plugins/examples/json-viewer/`](https://github.com/TabularisDB/tabularis/tree/main/src/plugins/examples/json-viewer)

For the full specification, see the [Plugin UI Extensions Spec](/docs/plugin-ui-extensions-spec.md).

## Publishing to the Registry

To make your plugin available in the official in-app plugin browser:

1. Build release binaries for all target platforms.
2. Package each binary with your manifest into a `.zip` file, and keep a `.tabularium` registry manifest in your repo (the registry resolves your plugin's metadata from it). The release workflow scaffolded by `@tabularis/create-plugin` (or regenerated via `create-plugin migrate --ci`) does this for you.
3. Publish a GitHub Release with the ZIP assets.
4. Submit your plugin at [registry.tabularis.dev/submit](https://registry.tabularis.dev/submit) — ownership is verified via OAuth against your linked repository, and CI can pre-validate your manifest via `POST /api/manifest/validate`. The registry's [plugin development page](https://registry.tabularis.dev/docs/plugin-development) documents every `.tabularium` field, derived live from the registry's schema.

The legacy path — a pull request against [`plugins/registry.json`](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json) — still works during the transition; legacy entries are merged into the hosted catalogue automatically. New plugins should submit to the registry directly.
