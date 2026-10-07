---
title: "Plugin Protocol"
order: 8.2
excerpt: "JSON-RPC reference for Tabularis plugins: request and response format, required and optional methods, cancellation and connection-specific metadata."
category: "Integration"
---

Reference for the JSON-RPC 2.0 protocol a Tabularis plugin speaks over `stdin`/`stdout`. For how plugins are loaded and packaged see [Plugin System](/wiki/plugins); to scaffold a driver with every handler pre-wired, see [Building Your First Plugin](/wiki/building-plugins). The full reference with every parameter shape lives in [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md).

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

Return a result shaped as `{ "tables": [{ "name", "columns", "foreign_keys" }], "total_table_count": 42 }`. Respect `max_tables` while reporting the pre-limit count in `total_table_count`. If the method is not implemented, return a `-32601` "Method not found" error; Tabularis automatically falls back to the standard metadata calls, keeping existing plugins compatible.

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

#### Signalling an unimplemented method

For an optional method your plugin does not implement, reply with code `-32601` and the message **`Method not found`**. Most host fallbacks (materialized views, BLOB operations, `execute_query_batch`, routine helpers, `get_ai_schema_context`, …) only see the error *message*, and they treat it as "not implemented" when it contains `method not found` (case-insensitive) or the text `-32601`. A custom message such as `"Method 'x' not implemented"` is shown to the user as an error instead of triggering the fallback. `get_connection_metadata` and `get_table_query_template` check the numeric code `-32601`.

## Required Methods

Your plugin must implement at minimum the following methods. For unimplemented optional methods, return an empty array `[]` or a `-32601` "Method not found" error (see [above](#signalling-an-unimplemented-method)).

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
    "is_pk": true,
    "is_nullable": false,
    "is_auto_increment": true,
    "is_generated": false,
    "default_value": null,
    "character_maximum_length": null,
    "comment": null
  }
]
```

`name`, `data_type`, `is_pk`, `is_nullable` and `is_auto_increment` are required. `is_generated` defaults to `false`; `default_value`, `character_maximum_length` and `comment` may be omitted or `null`.

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
  "affected_rows": 0,
  "truncated": false,
  "pagination": null
}
```

`columns`, `rows` and `affected_rows` are required. `truncated` defaults to `false`. `pagination` may be `null` or `{ "page", "page_size", "total_rows", "has_more" }` (`total_rows` may be `null`). A statement that produces several result sets can return the extra ones in `additional_results`, an array of the same shape.

#### Editor sessions and open transactions *(optional, since v0.26.0)*

`execute_query` and `execute_query_batch` may carry a `session_id`, the id of the editor tab that sent the run. A plugin that supports sessions keeps that session's connection when a run leaves an explicit transaction open, so `BEGIN`, the changes, a verifying `SELECT` and `COMMIT` can be separate runs. With a `session_id` it replies `{ "result": QueryResult, "in_transaction": bool }` (or `{ "results": [...], "in_transaction": bool }` for a batch); the host recognizes the `execute_query` wrapper by the presence of `in_transaction` (and the batch wrapper by the `results` key), so a column named `result` is not mistaken for it, and reads `null` as `false`. The host calls `release_session` when the tab closes, disconnects or the app exits, and tolerates method-not-found. Plugins that ignore `session_id` and reply with the bare shapes keep the per-run behaviour. The [PostgreSQL plugin](https://github.com/TabularisDB/tabularis-postgresql-plugin) implements this from 1.0.0-rc.5.

### Cancel Notification *(optional)*

Since v0.26.0, when a call exceeds the [call timeout](/wiki/installing-plugins#call-timeout-and-cancellation) while it is still pending, the host writes a JSON-RPC notification to the plugin's stdin:

```json
{"jsonrpc":"2.0","method":"cancel","params":{"id":42}}
```

`params.id` is the id of the request that timed out. There is no top-level `id`, so this is a notification: the plugin must not reply. Ignore ids you do not know (the request may have finished in the meantime), and keep reading stdin while a request runs so the notification can arrive. No cancel is sent for a response that raced the timeout, or when the timeout is disabled. Plugins that do not implement `cancel` keep working; a reply to it matches no pending request and is dropped. The [PostgreSQL plugin](https://github.com/TabularisDB/tabularis-postgresql-plugin) implements it from 1.0.0-rc.6 with `pg_cancel_backend`.

### Table Query Templates *(optional)*

Since v0.26.0, a driver that declares `table_query_templates: true` is asked for the SELECT, UPDATE and DELETE previews in **Generate SQL** through `get_table_query_template`. The method returns a SQL string and must not execute it.

```json
{
  "params": ConnectionParams,
  "request": {
    "table": "orders",
    "schema": "sales",
    "kind": "select",
    "columns": ["id", "status"],
    "limit": 100
  }
}
```

`kind` is `select`, `update` or `delete`. Table, schema and column names are unquoted identifiers that the driver must quote and escape. `columns` defaults to `[]` (SELECT uses `*`); `schema` and `limit` may be null. SELECT All passes no limit, SELECT Fields passes 100, and UPDATE/DELETE reject a limit. UPDATE and DELETE templates must include `WHERE 1 = 0`, and UPDATE values use the editor's `:value_1`, `:value_2` placeholders. Only a `-32601` error falls back to the host template; other errors are shown to the user. Older hosts ignore the capability, so it does not require a higher `min_runtime_version`. The [SQL Server plugin](https://github.com/TabularisDB/tabularis-sqlserver-plugin) uses it from 1.0.0-beta.3.

### Materialized Views *(optional)*

Declare `materialized_views: true` in capabilities to enable the UI. If the plugin returns a "Method not found" error, the host falls back to empty results for `get_materialized_views` and `get_materialized_view_columns`; `get_materialized_view_definition` and `refresh_materialized_view` surface a "not supported by this driver" error instead.

| Method | Params | Result |
|--------|--------|--------|
| `get_materialized_views` | `{ "params", "schema" }` | `[{ "name": string, "definition": string \| null }]` |
| `get_materialized_view_columns` | `{ "params", "view_name", "schema" }` | `[TableColumn]` (same shape as `get_columns`) |
| `get_materialized_view_definition` | `{ "params", "view_name", "schema" }` | `string` (the SQL definition) |
| `refresh_materialized_view` | `{ "params", "view_name", "schema" }` | `null` on success |

### BLOB Operations *(optional)*

If the plugin returns a "Method not found" error, the host shows "BLOB export/preview not supported".

- **`save_blob_to_file`** — params `{ "params", "table", "col_name", "pk_map", "schema", "file_path" }`. The plugin queries the binary value via the PK map and writes the raw bytes to `file_path` itself (it runs on the same machine as the host). Returns `null` on success.
- **`fetch_blob_as_data_url`** — params `{ "params", "table", "col_name", "pk_map", "schema" }`. Returns the value in the BLOB wire format `"BLOB:<size_bytes>:<mime_type>:<base64_data>"` for preview in the row editor.

### Other methods

The host also calls the following methods, depending on the capabilities you declare. Parameter shapes are in the [complete plugin guide](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md).

| Area | Methods |
|------|---------|
| Schema metadata | `get_schemas`, `get_foreign_keys`, `get_indexes` |
| Batch / ER diagram | `get_schema_snapshot`, `get_all_columns_batch`, `get_all_foreign_keys_batch`, `execute_query_batch` (falls back to one `execute_query` per statement) |
| Row editing | `insert_record`, `update_record`, `delete_record` |
| DDL generation | `get_create_table_sql`, `get_add_column_sql`, `get_alter_column_sql`, `get_create_index_sql`, `get_create_foreign_key_sql`, `drop_index`, `drop_foreign_key` |
| Views | `get_views`, `get_view_definition`, `get_view_columns`, `create_view`, `alter_view`, `drop_view` |
| Routines | `get_routines`, `get_routine_parameters`, `get_routine_definition` |
| Routine management (`routine_management`) | `build_routine_call_sql`, `routine_create_template`, `get_routine_edit_script`, `drop_routine` — each optional, with a host fallback |
| Triggers (`triggers`) | `get_triggers`, `get_trigger_definition`, `create_trigger`, `drop_trigger` |
| User management (`user_management`) | `get_db_privilege_catalog`, `get_db_users`, `get_db_user_grants`, `create_db_user`, `drop_db_user`, `set_db_user_password`, `get_db_user_privileges`, `apply_db_user_privileges` |
| Sessions | `release_session` |

### `explain_query` *(optional)*

Runs EXPLAIN, or EXPLAIN ANALYZE when `analyze` is `true`, for the query. Implement it together with the `explain` capability to enable [Visual EXPLAIN](/wiki/visual-explain) for your driver.

```json
{
  "params": "ConnectionParams",
  "query": "SELECT * FROM users WHERE id = 42",
  "analyze": false,
  "schema": "public"
}
```

The result is either the **parsed plan** shape, where the plugin maps the plan onto the host's node tree:

```json
{
  "root": {
    "id": "node-0",
    "node_type": "Index Scan",
    "relation": "users",
    "startup_cost": 0.15,
    "total_cost": 8.17,
    "plan_rows": 1,
    "actual_rows": null,
    "actual_time_ms": null,
    "actual_loops": null,
    "buffers_hit": null,
    "buffers_read": null,
    "filter": null,
    "index_condition": "id = 42",
    "join_type": null,
    "hash_condition": null,
    "extra": {},
    "children": []
  },
  "planning_time_ms": 0.12,
  "execution_time_ms": null,
  "original_query": "SELECT * FROM users WHERE id = 42",
  "driver": "example-db",
  "has_analyze_data": false,
  "raw_output": null
}
```

or, since v0.23.0, the **raw** shape, which hands the database's own plan output to a parser the plugin ships (see [EXPLAIN Parser Bundles](#explain-parser-bundles-optional-since-v0230)):

```json
{
  "engine": "example-db",
  "format": "example-db-plan-text",
  "payload": "raw plan payload",
  "original_query": "SELECT * FROM users WHERE id = 42"
}
```

The host treats a result as raw only when `engine`, `format` and `payload` are all strings. `original_query` may be omitted or `null`; the host fills it from the request. Plugins returning the parsed shape stay supported.

## EXPLAIN Parser Bundles *(optional, since v0.23.0)*

A plugin that returns raw `explain_query` output ships the parser for it as an IIFE bundle and declares it in the `explain_parsers` array of its `.tabularium` manifest:

```json
{
  "explain_parsers": [
    {
      "engine": "example-db",
      "format": "example-db-plan-text",
      "label": "Example DB plan",
      "module": "explain/dist/index.iife.js"
    }
  ]
}
```

`engine`, `format` and `module` are required; `label` is optional. `module` is relative to the installed plugin folder and must not be absolute or contain `..`.

Build the module as an IIFE named `__tabularis_explain_parser__`, keep `@tabularis/explain` external as the global `__TABULARIS_EXPLAIN__`, and default-export one `RegisteredExplainParser` or an array of them:

```ts
import type { RegisteredExplainParser } from "@tabularis/explain";
import { parseExamplePlan } from "./parser";

const parser: RegisteredExplainParser = {
  engine: "example-db",
  format: "example-db-plan-text",
  label: "Example DB plan",
  parse: parseExamplePlan,
  sniff: (payload) => payload.startsWith("EXAMPLE PLAN"),
};

export default parser;
```

The host reads each declared module once, matches the exports to the manifest entries by exact `engine` and `format`, applies the manifest `label` and registers the parser alongside the built-in PostgreSQL, MySQL and SQLite ones, so every Visual EXPLAIN view works with your plans.

- **Do not self-register** in the IIFE entry: the host does the registration. A separate entry published to npm may register itself on import.
- **Errors are isolated.** A bundle that fails to load or exports an invalid descriptor only affects its own plugin; exceptions thrown while parsing a plan surface in Visual EXPLAIN's normal error handling.
- **Enable and disable are deterministic.** When the set of enabled plugins changes, the host removes the formats it loaded and reloads enabled plugins in plugin-id order.
- **Set `min_runtime_version` to `0.23.0` or later.** Older hosts then refuse the plugin at install and load time instead of failing inside Visual EXPLAIN.

The [SQL Server plugin](https://github.com/TabularisDB/tabularis-sqlserver-plugin) uses this with a `sqlserver-showplan-xml` parser; the design is described in [How plugins can now inject their own parsers into Visual EXPLAIN](/blog/how-plugins-can-now-inject-their-own-parsers-into-visual-explain).

## Connection-specific Metadata *(optional, since v0.24.0)*

A driver serving multiple engines can opt in with `"connection_metadata": true` at the manifest root and implement `get_connection_metadata`. After a successful connection test, the host requests effective `capabilities`, `data_types` and `type_mappings` for that connection before loading objects. Backend operations, including MCP, use the same metadata; the registered manifest is not mutated.

Omitted fields keep static defaults, while explicit `false` or empty collections replace them. A connection cannot lift a manifest-level read-only restriction. Only a remote JSON-RPC `-32601` falls back to the manifest; authentication, transport and validation failures surface as errors. Static plugins receive no discovery calls. Discovery is cached per process and connection, with invalidation on tests and disconnects.

A bridge must still implement and route its database operations, and the registry's driver schema must accept this opt-in before publication (it is listed under [Drivers](/wiki/plugin-kinds#drivers-driver) on Plugin Kinds). Declare a suitable `min_runtime_version` if your plugin cannot work without discovery. See the complete [connection metadata protocol](https://github.com/TabularisDB/tabularis/blob/main/plugins/CONNECTION_METADATA.md) for allowed overrides, request shapes and cache behaviour.

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
                "affected_rows": 0, "truncated": false, "pagination": null
            },
            "id": id
        }),
        _ => json!({
            "jsonrpc": "2.0",
            // "Method not found" lets the host fall back for optional methods.
            "error": { "code": -32601, "message": "Method not found" },
            "id": id
        }),
    }
}
```
