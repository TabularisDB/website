---
title: "Building Your First Plugin"
order: 8.5
excerpt: "Scaffold a working database driver in minutes using @tabularis/create-plugin and @tabularis/plugin-api."
category: "Integration"
---

# Building Your First Plugin

The [Plugin System](./plugins) tells you *what* a Tabularis plugin is. This page tells you *how* to write one without reading the 1100-line protocol reference first.

Two npm packages handle the boilerplate:

- **[`@tabularis/create-plugin`](https://www.npmjs.com/package/@tabularis/create-plugin)** — a scaffolder CLI. Generates a runnable Rust project with all 33 JSON-RPC handlers pre-wired, a cross-platform GitHub Actions release workflow, and (optionally) a TypeScript/React UI extension bundle ready to build with Vite.
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

Add `--with-ui` to also scaffold a React/Vite subworkspace targeting `data-grid.toolbar.actions` as a hello-world UI extension.

## Implementation order that minimises surprises

Handlers you fill in first → features that light up:

1. `initialize` — receive the plugin's saved settings (OAuth tokens, paths, API keys).
2. `test_connection` — turn the "Test" button in the connection form into a real check.
3. `get_databases` + `get_tables` + `get_columns` — sidebar populates with real data.
4. `execute_query` — users can run SQL in the editor.
5. `insert_record` / `update_record` / `delete_record` — inline row editing in the data grid.
6. `get_create_table_sql` and friends — SQL preview for DDL operations.

Every step is independently shippable. A plugin with only the first three is already useful as a read-only viewer.

## UI extensions

The Tabularis host mounts **slot contributions** at ten predefined points (plugin row in Settings, new connection form, row editor fields, data grid toolbar, context menu, etc.). Plugins declare contributions in `manifest.json`:

```json
"ui_extensions": [
  { "slot": "settings.plugin.before_settings", "module": "ui/dist/my-settings.js", "order": 10 },
  { "slot": "data-grid.toolbar.actions",       "module": "ui/dist/my-toolbar.js",  "order": 10,
    "driver": "my-driver" }
]
```

Each module is an **IIFE bundle** that assigns a React component to `__tabularis_plugin__`. The host injects `React`, `ReactJSXRuntime`, and `__TABULARIS_API__` as runtime globals — plugins list them as Vite externals, no React is bundled.

### Typed contributions with `@tabularis/plugin-api`

```tsx
import { defineSlot, usePluginSetting, usePluginToast } from "@tabularis/plugin-api";

const MyToolbar = defineSlot("data-grid.toolbar.actions", ({ context }) => {
  // context.connectionId, context.tableName, context.schema, context.driver
  // are fully typed per slot — not optional, not unknown.
  const { showInfo } = usePluginToast();
  return (
    <button onClick={() => showInfo(`Table: ${context.tableName}`)}>Hi</button>
  );
});

export default MyToolbar.component;
```

`defineSlot(slotName, component)` binds the component to a slot and types `context` accordingly. Pick the wrong slot for the fields you read and the compiler tells you — no more `context.columnName!` sprinkled around. The `default export` must be `.component` so the host loader picks it up.

### Hook catalogue

Every hook is a thin, typed wrapper over the runtime `window.__TABULARIS_API__`:

| Hook | What it gives you |
|------|-------------------|
| `usePluginQuery()` | `executeQuery(sql)`, `loading`, `error` |
| `usePluginConnection()` | the active `connectionId`, `driver`, `schema` |
| `usePluginToast()` | `showInfo`, `showError`, `showWarning` |
| `usePluginSetting(pluginId)` | typed `getSetting<T>`, `setSetting`, `setSettings` |
| `usePluginModal()` | `openModal({ title, content, size })`, `closeModal` |
| `usePluginTheme()` | `themeId`, `isDark`, full `ThemeColors` token set |
| `usePluginTranslation(pluginId)` | i18next-compatible translator |
| `openUrl(url)` | launches the **system** browser (not the Tauri webview) |

### Multiple slots in one plugin

Plugins that touch more than one slot need more than one IIFE bundle (one per slot). The scaffold's `--with-ui` generates a single-entry Vite config; when you need two, duplicate the config file, change `entry` and `fileName`, and wire them through `package.json`:

```json
"scripts": {
  "build":          "pnpm run build:a && pnpm run build:b",
  "build:a":        "vite build --config vite.a.config.ts",
  "build:b":        "vite build --config vite.b.config.ts"
}
```

Both configs share the same externals (`react`, `react/jsx-runtime`, `@tabularis/plugin-api`), output directory (`ui/dist/`), and IIFE name (`__tabularis_plugin__`). They differ only in `entry` and `fileName`. This is the shape the [Google Sheets companion plugin](https://github.com/TabularisDB/tabularis-google-sheets-plugin/tree/main/ui) uses for its OAuth wizard + custom connection field.

## Full walkthrough

The repo's [`plugins/PLUGIN_TUTORIAL.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_TUTORIAL.md) is a 20-minute step-by-step that takes you from `npm create` to a working **Google Sheets** driver installed in your local Tabularis — OAuth, sheets-as-tables, a mini SQL parser, two UI extensions. The finished plugin is published at [`tabularis-google-sheets-plugin`](https://github.com/TabularisDB/tabularis-google-sheets-plugin).

## Reference material

- [Plugin System (architecture)](./plugins) — what a plugin is, how it runs, where it lives on disk.
- [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md) — every RPC method, every manifest field, every capability flag.
- [`@tabularis/plugin-api` on npm](https://www.npmjs.com/package/@tabularis/plugin-api) — slot context types, hook signatures.
- [`@tabularis/create-plugin` on npm](https://www.npmjs.com/package/@tabularis/create-plugin) — CLI flags, generated project layout.
- [Registry of community plugins](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json) — eight drivers to copy patterns from.
