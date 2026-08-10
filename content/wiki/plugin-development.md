---
order: 8.6
category: "Integration"
title: "Plugin Development"
excerpt: "Build database driver plugins for Tabularis and publish them to this Tabularium registry — protocol, manifest, scaffold, release workflow."
---

Tabularis is the desktop app that connects to your databases. **Tabularium** is the registry it pulls plugins from — this instance, or [registry.tabularis.dev](https://registry.tabularis.dev), or any other self-hosted Tabularium your users point their `tabulariumRegistryUrl` at. This page covers both halves of the developer story:

- **Runtime** — how a Tabularis plugin works on the wire (JSON-RPC over STDIO, manifest, methods).
- **Registry** — how that plugin is packaged and submitted here so other Tabularis users can find and install it.

The per-kind sections below — currently only **Drivers** — list every manifest field this registry expects, derived live from the configured kind schema. Use [`/api/docs/plugin-development?format=md`](https://registry.tabularis.dev/api/docs/plugin-development?format=md) for an LLM-pasteable copy of everything on this page (also linked in the page header).

For the full runtime protocol reference and every RPC method, see [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md).

## From zero to driver

Scaffold a working project with **[`@tabularis/create-plugin`](https://www.npmjs.com/package/@tabularis/create-plugin)**:

```bash
npm create @tabularis/plugin@latest -- --db-type=network my-driver
cd my-driver
just dev-install
```

The generated project compiles on first `cargo check`, contains stubs for every required method, has a working `test_connection`, and ships a 5-platform release workflow. Pick the template that fits your data source:

| `--db-type` | Shape | Examples |
|---|---|---|
| `network` | host + port + user + pass | PostgreSQL, MySQL clones |
| `file` | single file path | SQLite, DuckDB, Parquet |
| `folder` | directory of files | CSV folder, Parquet lake |
| `api` | no connection form | REST APIs, Google Sheets |

## Architecture: JSON-RPC over STDIO

Tabularis avoids dynamic linking. Plugins are **standalone executables** that run as child processes. When a user opens a connection:

1. Tabularis spawns the plugin as a child process.
2. Sends JSON-RPC 2.0 requests to the plugin's `stdin`, one per line.
3. Reads JSON-RPC 2.0 responses from the plugin's `stdout`, one per line.
4. Reuses the same process instance for the entire session.

`stderr` output is captured and shown in the log viewer — safe for debugging without breaking the protocol.

## One manifest, two readers

**`.tabularium`** is the single canonical manifest — one file that serves both the host (loading the driver: `executable`, `capabilities`, `data_types`, `settings`) and the registry (listing it: `name`, `description`, `category`, `kind`, plus the kind-specific fields below). The host still reads a legacy `manifest.json` as a fallback; the registry does not treat `manifest.json` as a first-class source.

It lives at the plugin's repo root **and must be uploaded as a standalone release asset** — the registry resolves the manifest from release assets (GitHub silently renames the dotfile to `default.tabularium`; the registry accepts both names). The **Drivers** section below shows exactly which fields and constraints this registry expects.

## Required methods

Your plugin must implement at least these. Optional methods can return `[]` or a `-32601` error.

| Method | Result shape |
|---|---|
| `test_connection` | `{ "success": true }` |
| `get_databases` | `["db1", "db2"]` |
| `get_tables` | `[{ "name": "users", "schema": "main", "comment": null }]` |
| `get_columns` | `[{ "name": "id", "data_type": "INTEGER", "is_nullable": false, ... }]` |
| `execute_query` | `{ "columns": [...], "rows": [...], "total_count": N, "execution_time_ms": M }` |

`ping` is optional but recommended — lightweight health check, falls back to `test_connection` when absent.

## UI extensions & i18n

Beyond the driver, a plugin can contribute React UI via `ui_extensions` (scaffold one with `--with-ui`). UI components consume the host API from [`@tabularis/plugin-api`](https://www.npmjs.com/package/@tabularis/plugin-api).

Keep UI strings in `locales/<lang>.json` at the plugin root and read them with `usePluginTranslation(pluginId)` — the host loads them automatically (active language → English → the key itself):

```tsx
const t = usePluginTranslation(pluginId);
t("toolbar.label");
t("toolbar.greeting", { table });
```

The host runtime is **[Lingui](https://lingui.dev/)** — author new keys ICU-style with single-brace `{var}` placeholders. Legacy i18next `{{var}}` placeholders still interpolate, so existing plugins keep working unchanged.

## Publishing to this registry

Once your driver runs locally and binaries are on GitHub Releases:

1. Build release binaries (`.github/workflows/release.yml` from the scaffold does this on tag push).
2. Package each binary with the `.tabularium` manifest into a `.zip` per platform.
3. Publish a GitHub Release with the ZIPs attached — **plus `.tabularium` as a standalone asset** (it will show up as `default.tabularium`; that's fine). The release tag stripped of `v` must equal the manifest `version`.
4. Submit at [`/submit`](https://registry.tabularis.dev/submit). The exact shape is in the [schema reference](https://registry.tabularis.dev/docs/plugin-development/schema). CI can validate against this registry via `POST /api/manifest/validate`. A manifest that fails validation is rejected with **HTTP 422** — there is no silent fallback.

The admin may require manual approval — check `/requests` after submitting.

## Using this registry from Tabularis

End users point their Tabularis at any Tabularium by setting `tabulariumRegistryUrl` in their `config.json`:

```json
{ "tabulariumRegistryUrl": "https://registry.tabularis.dev" }
```

Both the in-app plugin browser and the install command will use that URL.

## Core manifest fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | URL slug, canonical package name, and default display title. Must start with a letter; lowercase alphanumerics + hyphens only. REQUIRED — pinned at first submit; changing it later does not rename the existing slug. Use the README for prose / branding; no separate display-name field. |
| `version` | `string` | ✅ | Semantic version of this plugin release (no leading "v"). REQUIRED — must match the release tag stripped of any "v" prefix. The registry rejects ingests whose tag and manifest version disagree, so a manifest version bump is the single source of truth for "this is a new release". |
| `description` | `string` | — | One-line summary shown on the plugin card and search results. Keep it under 280 characters and write it like a tagline, not a paragraph. |
| `category` | `string` | — | Free-form category label. Used for grouping plugins on the registry home page. |
| `kind` | `string` | — | Plugin kind slug (must match one of the registry's configured kinds — see the per-kind sections below). Drives which extension fields apply and whether your plugin appears on the catalogue page for that kind. |
| `tags` | `array<string>` | — | Searchable tags. Used by the registry's search index; max 16 tags, 30 chars each. |
| `license` | `string` | — | SPDX identifier (e.g. "MIT", "Apache-2.0", "GPL-3.0-only"). Plain text accepted; SPDX is strongly recommended. |
| `icon` | `string` | — | URL to the plugin icon. Renders next to the plugin name on cards and detail pages. PNG/SVG recommended, 256×256 or vector. |
| `screenshots` | `array<object>` | — | Up to 12 screenshots shown in the plugin detail gallery. |
| `readme` | `string` | — | Repo-relative path or URL to the README markdown file. Rendered on the plugin detail page. |
| `readmes` | `object` | — | Per-locale README overrides. Map keys are BCP-47 locale codes (e.g. "en", "de", "zh-CN"); values are the same shape as `readme`. |
| `documentation_url` | `string` | — | Link to standalone documentation site (Vitepress, MkDocs, GitHub Pages, etc.). Surfaces as an "Open docs" CTA. |
| `homepage` | `string` | — | Marketing homepage if separate from the documentation site or the repository. |
| `support` | `object` | — | Where end users go when they have a problem with the plugin. |
| `min_runtime_version` | `string` | — | Minimum host runtime version (semver range or single version). The host refuses to load the plugin on older runtimes. |

## Plugin kinds

### Drivers (`driver`)

Database driver plugins that extend Tabularis to talk to new data stores via JSON-RPC over STDIO — any language, any database.

**Extensions**

| Field | Type | Required | Description |
|---|---|---|---|
| `engine` | `string` | ✅ | Concrete database this driver connects to (e.g. "firestore", "postgres", "qdrant"). Tabularis groups the connection catalogue by engine: every driver targeting the same database shares one engine value, so two "firestore" drivers collapse into a single Firestore entry and the user picks which driver. |
| `paradigms` | `array<string>` | ✅ | Data-model families the engine supports, most representative first. Single-model drivers declare one (e.g. ["sql"]); multi-model declare several (SurrealDB: ["document","graph","relational","key-value","vector"]). The first entry is the primary model used to place the engine in the catalogue; every entry feeds the filter chips, so a multi-model engine appears when ANY of its models is selected. Allowed values come from the registry's admin-managed paradigm list (facets), not a fixed enum, so new models never need a schema release. |
| `color` | `string` | — | Hex accent colour shown on the catalogue card and sidebar (e.g. "#f97316"). |
| `default_port` | `integer` | — | Default TCP port pre-filled in the connection modal. Omit for file-, folder-, and API-based drivers. |
| `default_username` | `string` | — | Default username pre-filled in the connection modal (e.g. "postgres", "root"). |
| `is_builtin` | `boolean` | — | True for drivers shipped with Tabularis. External plugins should omit this or leave it false. |
| `executable` | `string` | ✅ | Relative path to the plugin executable inside the plugin folder. No extension on Linux/macOS; Tabularis appends .exe on Windows automatically. |
| `interpreter` | `string` | — | Optional interpreter for script-based plugins (e.g. "python3", "node"). Omit for native binaries. |
| `capabilities` | `object` | ✅ | Feature flags that control which UI elements Tabularis renders for this driver. |
| `settings` | `array<object>` | — | Optional list of configuration fields the plugin exposes to the user via the Tabularis settings modal. |
| `data_types` | `array<object>` | — | List of data types this driver supports for column creation in the UI. |
| `supports_ssl` | `boolean` | — | true to show the SSL/TLS configuration tab (mode + CA/client cert/key) in the connection modal for this network driver. Defaults to false. |
| `ui_extensions` | `array<object>` | — | UI extension contributions rendered into named slots of the Tabularis interface. Only needed by plugins that ship a frontend module; driver-only plugins omit it. |
| `type_mappings` | `object` | — | Optional map of generic inferred type names to driver-native types, resolved by the host during paste/import (map_inferred_type). Keys are uppercase generic names (e.g. DATETIME, JSON); values are the driver-native equivalents (e.g. TIMESTAMP, JSONB). Lookup is case-insensitive; unmapped types pass through unchanged. |

**Example (YAML)**

```yaml
name: tabularis-clickhouse-driver
description: Connect Tabularis to ClickHouse over JSON-RPC with full DDL, query, and ER-diagram support.
category: integration
kind: driver
tags:
  - clickhouse
  - analytics
  - olap
license: MIT
icon: https://raw.githubusercontent.com/example/tabularis-clickhouse/main/assets/icon.svg
homepage: https://github.com/example/tabularis-clickhouse
documentation_url: https://github.com/example/tabularis-clickhouse#readme
support:
  email: maintainers@example.com
  issues_url: https://github.com/example/tabularis-clickhouse/issues
screenshots:
  - url: https://raw.githubusercontent.com/example/tabularis-clickhouse/main/assets/screen-connect.png
    caption: Connection form with native ClickHouse fields
    alt: Tabularis connection dialog showing host, port, user, and database fields
  - url: https://raw.githubusercontent.com/example/tabularis-clickhouse/main/assets/screen-query.png
    caption: Running a SELECT against the ontime table
    alt: Tabularis data grid showing ClickHouse query results
min_runtime_version: 0.9.13
readme: |
  # ClickHouse driver for Tabularis

  Adds a native ClickHouse connection to Tabularis. Supports SELECT/INSERT/UPDATE/DELETE through execute_query, schema introspection for the explorer, DDL generation (CREATE TABLE, ALTER TABLE, DROP), and ER-diagram rendering via get_relationships.
```

**Example (JSON)**

```json
{
  "name": "tabularis-clickhouse-driver",
  "description": "Connect Tabularis to ClickHouse over JSON-RPC with full DDL, query, and ER-diagram support.",
  "category": "integration",
  "kind": "driver",
  "tags": [
    "clickhouse",
    "analytics",
    "olap"
  ],
  "license": "MIT",
  "icon": "https://raw.githubusercontent.com/example/tabularis-clickhouse/main/assets/icon.svg",
  "homepage": "https://github.com/example/tabularis-clickhouse",
  "documentation_url": "https://github.com/example/tabularis-clickhouse#readme",
  "support": {
    "email": "maintainers@example.com",
    "issues_url": "https://github.com/example/tabularis-clickhouse/issues"
  },
  "screenshots": [
    {
      "url": "https://raw.githubusercontent.com/example/tabularis-clickhouse/main/assets/screen-connect.png",
      "caption": "Connection form with native ClickHouse fields",
      "alt": "Tabularis connection dialog showing host, port, user, and database fields"
    },
    {
      "url": "https://raw.githubusercontent.com/example/tabularis-clickhouse/main/assets/screen-query.png",
      "caption": "Running a SELECT against the ontime table",
      "alt": "Tabularis data grid showing ClickHouse query results"
    }
  ],
  "min_runtime_version": "0.9.13",
  "readme": "# ClickHouse driver for Tabularis\n\nAdds a native ClickHouse connection to Tabularis. Supports SELECT/INSERT/UPDATE/DELETE through execute_query, schema introspection for the explorer, DDL generation (CREATE TABLE, ALTER TABLE, DROP), and ER-diagram rendering via get_relationships.\n"
}
```

## Where to get help

- **Tabularis source + runtime docs** — [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis). The [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md) covers every RPC method with full parameter shapes.
- **Tabularium source (this registry)** — [`TabularisDB/tabularium`](https://github.com/TabularisDB/tabularium). Schema, validators, and submission flow.
- **Example plugins to copy patterns from** — the [community registry](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json) and the [Google Sheets driver](https://github.com/TabularisDB/tabularis-google-sheets-plugin) (OAuth, sheets-as-tables, UI extensions).
- **LLM-friendly export** — the **Raw markdown ↗** and **Copy as markdown** buttons at the top of this page surface everything as one flat document at [`/api/docs/plugin-development?format=md`](https://registry.tabularis.dev/api/docs/plugin-development?format=md). Paste straight into any LLM (or `curl` it) when an assistant needs to author or review plugin manifests against this registry.
- **Found something wrong here?** — Open an issue against [Tabularium](https://github.com/TabularisDB/tabularium/issues), or ping this instance's admin.

Happy hacking — and when you ship something, [submit it](https://registry.tabularis.dev/submit) so the rest of Tabularis can use it.

---
_Generated by Tabularium for https://registry.tabularis.dev._
