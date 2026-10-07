---
title: "Building Your First Plugin"
order: 8.5
excerpt: "Scaffold a working database driver in minutes using @tabularis/create-plugin and @tabularis/plugin-api."
category: "Integration"
---

The [Plugin System](/wiki/plugins) tells you *what* a Tabularis plugin is. This page tells you *how* to write one without reading the 1100-line protocol reference first. When it runs, [Publishing Plugins](/wiki/plugin-development) takes it to the registry.

Two npm packages handle the boilerplate:

- **[`@tabularis/create-plugin`](https://www.npmjs.com/package/@tabularis/create-plugin)** — a scaffolder CLI. Generates a runnable Rust project with every JSON-RPC handler the host can call pre-wired, a cross-platform GitHub Actions release workflow, and (optionally) a TypeScript/React UI extension bundle ready to build with Vite.
- **[`@tabularis/plugin-api`](https://www.npmjs.com/package/@tabularis/plugin-api)** — TypeScript types and runtime hooks for UI extensions. Gives you `defineSlot(...)` with fully typed context per slot, plus typed wrappers for `usePluginSetting`, `usePluginQuery`, `usePluginToast`, `usePluginModal`, and a few others.

## From zero to driver

```bash
npm create @tabularis/plugin@latest -- --db-type=network my-driver
cd my-driver
just dev-install
```

That's the whole flow. The generated project:

- Compiles and runs on first `cargo check` — no blank files.
- Contains stubs for every RPC method the host can call. Metadata methods return empty arrays (plugin loads cleanly), query/CRUD/DDL methods return `-32601 method not implemented`.
- Has a working `test_connection` stub that returns success, so your driver appears in Tabularis' connection picker immediately after `just dev-install`.
- Ships unit-tested utility functions (`quote_identifier`, `paginate`) to set the bar for the rest.
- Includes a `.github/workflows/release.yml` with a 5-platform matrix — tag `v0.1.0`, push, get binaries.

Pick the template that matches your data source:

| `--db-type` | Shape | Example databases |
|-------------|-------|-------------------|
| `network`   | host + port + user + pass | PostgreSQL, MySQL clones |
| `file`      | single file path          | SQLite, DuckDB, Parquet |
| `folder`    | directory of files        | CSV folder, Parquet lake |
| `api`       | no connection form needed | REST APIs, Google Sheets, HackerNews |

Add `--with-ui` to also scaffold a React/Vite subworkspace targeting `data-grid.toolbar.actions` as a hello-world [UI extension](/wiki/ui-extensions).

## Implementation order that minimises surprises

Handlers you fill in first → features that light up:

1. `initialize` — receive the plugin's saved settings (OAuth tokens, paths, API keys).
2. `test_connection` — turn the "Test" button in the connection form into a real check.
3. `get_databases` + `get_tables` + `get_columns` — sidebar populates with real data.
4. `execute_query` — users can run SQL in the editor.
5. `insert_record` / `update_record` / `delete_record` — inline row editing in the data grid.
6. `get_create_table_sql` and friends — SQL preview for DDL operations.

Once `get_tables` and `get_columns` work, the driver also supplies schema context to **AI Query Assist** automatically. For databases that can fetch the first tables, columns, and foreign keys more efficiently in one operation, optionally add `get_ai_schema_context`; returning `-32601` keeps the host's standard metadata fallback. The plugin returns structured metadata, while Tabularis formats and sends the AI prompt.

Every step is independently shippable. A plugin with only the first three is already useful as a read-only viewer.

A driver that serves several engines can also report capabilities and data types per connection — see [Connection-specific Metadata](/wiki/plugin-protocol#connection-specific-metadata-optional-since-v0240).

## UI extensions

Add `--with-ui` to the scaffold and the plugin also gets a React/Vite subworkspace in `ui/` with a hello-world contribution to `data-grid.toolbar.actions`. `just dev-install` builds the bundle along with the driver and copies `ui/dist/index.js` into the plugin folder, so the button shows up in the table toolbar. If you add more bundles, extend the `dev-install` recipe to copy them too.

Slots, the manifest declaration, bundle setup, `defineSlot`, the hook catalogue and translations are covered in [UI Extensions](/wiki/ui-extensions).

## Full walkthrough

The repo's [`plugins/PLUGIN_TUTORIAL.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_TUTORIAL.md) is a 20-minute step-by-step that takes you from `npm create` to a working **Google Sheets** driver installed in your local Tabularis — OAuth, sheets-as-tables, a mini SQL parser, two UI extensions. The finished plugin is published at [`tabularis-google-sheets-plugin`](https://github.com/TabularisDB/tabularis-google-sheets-plugin).

## Reference material

- [Plugin System (architecture)](/wiki/plugins) — what a plugin is, how it runs, where it lives on disk.
- [Plugin Protocol](/wiki/plugin-protocol) — every JSON-RPC method with its request and response shape.
- [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md) — every RPC method, every manifest field, every capability flag.
- [UI Extensions](/wiki/ui-extensions) — slots, bundles and hooks for plugin UI.
- [`@tabularis/plugin-api` on npm](https://www.npmjs.com/package/@tabularis/plugin-api) — slot context types, hook signatures.
- [`@tabularis/create-plugin` on npm](https://www.npmjs.com/package/@tabularis/create-plugin) — CLI flags, generated project layout.
- [Publishing Plugins](/wiki/plugin-development) — release packaging, the pre-submit checklist and the registry's validation rules.
- [The Tabularium registry](https://registry.tabularis.dev) — browse published drivers to copy patterns from.
