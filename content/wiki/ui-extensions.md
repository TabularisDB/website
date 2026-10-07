---
title: "UI Extensions"
order: 8.55
excerpt: "Add React components to the Tabularis interface from a plugin: slots, manifest declaration, IIFE bundles, @tabularis/plugin-api hooks and translations."
category: "Integration"
---

Since v0.9.13, plugins can inject React components into the Tabularis interface through a **slot-based extension system**: buttons in the data grid toolbar, previews next to row fields, panels in the plugin settings, extra fields in the connection form. A plugin can ship UI extensions next to a driver, or UI only.

UI extensions are optional. Plugins without them work unchanged, and a slot with no contributions renders nothing.

To scaffold a plugin with a UI extension already wired, pass `--with-ui` to `@tabularis/create-plugin` — see [Building Your First Plugin](/wiki/building-plugins). The runtime side of plugins is covered in [Plugin System](/wiki/plugins).

## How It Works

The system has three layers:

1. **Slot anchors** — host components placed at predefined insertion points that determine *where* extensions render.
2. **Slot registry** — a React context that stores registered contributions and determines *what* gets rendered.
3. **Plugin modules** — pre-built JavaScript bundles that export one React component per contribution.

The host injects `React`, `ReactJSXRuntime` and the plugin API (`__TABULARIS_API__`) as runtime globals, so plugin bundles never ship their own copy of React.

## Available Slots

Each slot passes its component a `context` object (and a `pluginId` prop). The fields the host passes depend on the slot:

| Slot | Location | Context | Typical use |
|------|----------|---------|-------------|
| `row-edit-modal.field.after` | After each field in the New Row modal | `connectionId`, `tableName`, `schema`, `driver`, `columnName`, `rowData`, `onFieldChange(value)` | Validation hints, field previews |
| `row-edit-modal.footer.before` | Before Save/Cancel in the New Row modal | `connectionId`, `tableName`, `schema`, `driver`, `rowData` | Batch actions, templates |
| `row-editor-sidebar.field.after` | After each field in the Row Editor sidebar | `connectionId`, `tableName`, `schema`, `columnName`, `rowData`, `rowIndex`, `isInsertion`, `onFieldChange(value)` | Field-level previews, lookups |
| `row-editor-sidebar.header.actions` | Row Editor sidebar header | `connectionId`, `tableName`, `schema`, `rowData`, `rowIndex`, `isInsertion` | "Copy as JSON", audit links |
| `data-grid.toolbar.actions` | Table toolbar | *(empty)* | Export buttons, analysis tools |
| `data-grid.context-menu.items` | Right-click menu on grid rows | `connectionId`, `tableName`, `schema`, `columnName`, `rowIndex`, `rowData` | Row-level custom actions |
| `sidebar.footer.actions` | Sidebar footer | *(empty)* | Status indicators, quick actions |
| `settings.plugin.actions` | Per-plugin actions in Settings | `targetPluginId` | Diagnostics, re-auth buttons |
| `settings.plugin.before_settings` | Above the plugin settings form | `targetPluginId` | OAuth panels, status banners |
| `connection-modal.connection_content` | Replaces the connection form for `no_connection_required` drivers | `driver`, `database`, `onDatabaseChange`, `connectionName` | Custom connection forms |
| `connection-modal.extra_fields` | Below host/port in the connection form | `driver`, `extra`, `setExtraField`, `credentialFieldsHidden`, `setCredentialFieldsHidden` | Plugin-specific connection settings |

The `SlotContextMap` types in `@tabularis/plugin-api` describe some slots with more fields than the host currently passes; rely on the fields listed above. In slots with an empty context, read the active connection with `usePluginConnection()`.

### Custom connection fields

Since v0.19.0, `connection-modal.extra_fields` is backed by an opaque `extra` string map on the connection parameters: values set with `setExtraField` are persisted verbatim and forwarded to the driver, so a plugin can carry its own connection settings (an AWS region, say) without a core schema change.

Since v0.25.0 the same slot also exposes `credentialFieldsHidden` and `setCredentialFieldsHidden(hidden)`. A driver that authenticates without a database login (integrated authentication, IAM tokens, Kerberos) can hide the host username and password inputs. Hiding them clears both values, ignores the login part of an imported connection string and removes a previously stored password on save. The flag resets whenever the driver changes.

## Declaring Extensions in the Manifest

Contributions are declared in the `ui_extensions` array of the `.tabularium` manifest:

```json
"ui_extensions": [
  { "slot": "settings.plugin.before_settings", "module": "ui/dist/my-settings.js", "order": 10 },
  { "slot": "connection-modal.extra_fields",   "module": "ui/dist/my-fields.js",   "order": 10,
    "driver": "my-driver" }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `slot` | yes | Target slot name from the table above. |
| `module` | yes | Path to the pre-built IIFE bundle, relative to the plugin folder. |
| `order` | no | Sort order within the slot; lower renders first. Default `100`. |
| `driver` | no | Only render when the slot's `context.driver` equals this value — typically your own driver id. Slots whose context has no `driver` never render a contribution that sets this field. |

Several slots can point at the same `module`. Entries with an unknown slot name are skipped, and `module` must be a relative path inside the plugin folder (no leading `/` or `\`, no `..`). UI extensions load only for enabled plugins.

## Building the Bundles

Each module is an **IIFE bundle** that assigns its default-exported React component to the global `__tabularis_plugin__` (the host accepts either the component itself or an object with a `default` property). Install `@tabularis/plugin-api` as a dev dependency for types and autocomplete — at runtime the host injects the real implementation:

```bash
npm install --save-dev @tabularis/plugin-api
```

Then keep React and the plugin API external in the Vite config. The `--with-ui` scaffold puts it in the `ui/` subworkspace, so the bundle lands in `ui/dist/`:

```typescript
// ui/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    lib: {
      entry: "src/MyToolbar.tsx",
      formats: ["iife"],
      name: "__tabularis_plugin__",
      fileName: () => "my-toolbar.js",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "@tabularis/plugin-api"],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "ReactJSXRuntime",
          "@tabularis/plugin-api": "__TABULARIS_API__",
        },
      },
    },
  },
});
```

The `name` **must** be `__tabularis_plugin__` — the host looks for that global — and the component must be the default export of the entry file.

### One bundle per component

An IIFE bundle exports a single component, so a plugin that contributes different components to different slots needs one bundle each. The `--with-ui` scaffold generates a single-entry Vite config; to add a second, duplicate the config, change `entry` and `fileName`, and build both from `package.json`:

```json
"scripts": {
  "build":          "pnpm run build:a && pnpm run build:b",
  "build:a":        "vite build --config vite.a.config.ts",
  "build:b":        "vite build --config vite.b.config.ts"
}
```

Both configs share the same externals, output directory and IIFE name; they differ only in `entry` and `fileName`. This is the shape the [Google Sheets companion plugin](https://github.com/TabularisDB/tabularis-google-sheets-plugin/tree/main/ui) uses for its OAuth wizard and custom connection field.

## Writing a Slot Component

Use `defineSlot` from `@tabularis/plugin-api`. It binds the component to a slot and types `context` for that slot, so fields the host guarantees are not optional:

```tsx
import { defineSlot, usePluginToast } from "@tabularis/plugin-api";

const MyFooter = defineSlot("row-edit-modal.footer.before", ({ context }) => {
  // context.connectionId, context.tableName, context.schema, context.driver
  // are typed for this slot.
  const { showInfo } = usePluginToast();
  return (
    <button onClick={() => showInfo(`Table: ${context.tableName}`)}>Hi</button>
  );
});

export default MyFooter.component;
```

Reading a field that `SlotContextMap` does not declare is a compile error (but see the note above: some declared fields are not passed by the host yet). The default export must be `.component` so the host loader picks it up. Older bundles that take a loose `SlotComponentProps` argument still work, but new plugins should use `defineSlot`.

### Conditional rendering

A contribution can be limited in two ways:

1. **`driver` in the manifest** — the contribution only renders when the slot context's `driver` matches (only in slots that pass `driver`).
2. **In the component** — return `null` based on `context`, for example when `context.columnName` is not the column you handle.

## Plugin API Hooks

Every hook is a typed wrapper over the runtime `window.__TABULARIS_API__`:

| Hook | What it gives you |
|------|-------------------|
| `usePluginQuery()` | `executeQuery(sql)`, `loading`, `error` — runs a query on the active connection |
| `usePluginConnection()` | the active `connectionId`, `driver`, `schema` |
| `usePluginToast()` | `showInfo`, `showError`, `showWarning` — shown as native message dialogs |
| `usePluginSetting(pluginId)` | typed `getSetting<T>`, `setSetting`, `setSettings` |
| `usePluginModal()` | `openModal({ title, content, size })`, `closeModal` — `size` is `sm`, `md`, `lg` or `xl` |
| `usePluginTheme()` | `themeId`, `themeName`, `isDark` (true unless the theme id contains `-light`), the full `ThemeColors` token set |
| `usePluginTranslation(pluginId)` | translator backed by the plugin's `locales/<lang>.json` files |
| `openUrl(url)` | opens the URL in the **system** browser, not the app webview |

## Translations

Keep UI strings in `locales/<lang>.json` at the plugin root. The host loads them automatically and resolves each key from the active language, then English, then the key itself. Only the base language code is looked up (for example `pt.json` for Portuguese (Brazil), never `pt-BR.json`):

```text
my-plugin/
├── .tabularium
├── my-plugin-binary
├── locales/
│   ├── en.json
│   └── it.json
└── ui/dist/
    └── my-toolbar.js
```

```tsx
const t = usePluginTranslation(pluginId);
t("toolbar.label");
t("toolbar.greeting", { table });
```

Translations run on **[i18next](https://www.i18next.com/)**, with each plugin's strings in a namespace named after the plugin id. Use double-brace `{{var}}` placeholders.

## Security and Error Isolation

Plugin components must not import from `@tauri-apps/*`, access `window.__TAURI__` or invoke Tauri commands, or manipulate the DOM outside their own subtree. All host interaction goes through `@tabularis/plugin-api`.

Each contribution is wrapped in an error boundary: if a component throws, a small error badge replaces it and the host and other plugins keep working.

## Example

For a complete plugin with two UI extensions, see the [Google Sheets driver tutorial](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_TUTORIAL.md).
