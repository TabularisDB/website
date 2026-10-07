---
order: 8.6
category: "Integration"
title: "Publishing Plugins"
excerpt: "Package a Tabularis plugin, publish it to the Tabularium registry and point the app at a custom registry — manifest, release assets, submission, validation."
---

**Tabularium** is the plugin registry Tabularis installs plugins from: [registry.tabularis.dev](https://registry.tabularis.dev) by default, or any self-hosted instance. This page covers the registry side of a plugin — what the manifest must contain, how a release is packaged and how it gets submitted.

The plugin developer docs are split across these pages:

- [Plugin System](/wiki/plugins) — how a plugin is structured and loaded: architecture, directory layout, manifest, settings.
- [Plugin Protocol](/wiki/plugin-protocol) — every JSON-RPC method a driver implements.
- [Building Your First Plugin](/wiki/building-plugins) — scaffold a driver with `@tabularis/create-plugin` and implement it step by step.
- [UI Extensions](/wiki/ui-extensions) — add React components to the Tabularis interface.
- **Publishing Plugins** (this page) — release and submit it to the registry.
- [Plugin Kinds](/wiki/plugin-kinds) — the extra manifest fields each kind of plugin (drivers, themes) requires.

## One manifest, two readers

**`.tabularium`** is the single canonical manifest — one file that serves both the host (loading the driver: `executable`, `capabilities`, `data_types`, `settings`) and the registry (listing it: `id`, `name`, `description`, `category`, `kind`, plus the [kind-specific fields](/wiki/plugin-kinds)). The host still reads a legacy `manifest.json` as a fallback; the registry does not treat `manifest.json` as a first-class source.

It lives at the plugin's repo root **and must be uploaded as a standalone release asset** — the registry resolves the manifest from release assets (GitHub silently renames the dotfile to `default.tabularium`; the registry accepts both names).

Point `$schema` at the registry schema for your kind to get autocomplete and inline validation in your editor:

```json
{ "$schema": "https://registry.tabularis.dev/manifest.schema.json?kind=driver" }
```

## Core manifest fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | — | Stable plugin identifier and URL slug. Pinned at first submit. For legacy manifests without id, name supplies the identifier. |
| `name` | `string` | ✅ | Human-readable display name (e.g. "SQLite JDBC"). Without id, this must remain a lowercase slug (1–64 characters) for backwards compatibility. |
| `version` | `string` | ✅ | Semantic version of this plugin release (no leading "v"). REQUIRED — must match the release tag stripped of any "v" prefix. The registry rejects ingests whose tag and manifest version disagree, so a manifest version bump is the single source of truth for "this is a new release". |
| `description` | `string` | — | One-line summary shown on the plugin card and search results. Keep it under 280 characters and write it like a tagline, not a paragraph. |
| `category` | `string` | — | Free-form category label. Used for grouping plugins on the registry home page. |
| `kind` | `string` | — | Plugin kind slug (must match one of the registry's configured kinds — see [Plugin Kinds](/wiki/plugin-kinds)). Drives which extension fields apply and whether your plugin appears on the catalogue page for that kind. |
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

The registry treats `description` as optional, but the Tabularis host does not: a driver manifest without `name`, `version` and `description` fails to load or install. Always include all three.

## Plugin kinds

The extension fields and example manifests for every plugin kind are on the [Plugin Kinds](/wiki/plugin-kinds) page.

## Publishing to the registry

Once your plugin runs locally:

1. Build release binaries for every platform you support. The `.github/workflows/release.yml` scaffolded by `@tabularis/create-plugin` does this on tag push; for an existing plugin, `create-plugin migrate --ci` regenerates a registry-ready workflow.
2. Package each binary with the `.tabularium` manifest into a `.zip` per platform.
3. Publish a GitHub Release with the ZIPs attached — **plus `.tabularium` as a standalone asset** (it shows up as `default.tabularium`; that's fine). The release tag stripped of `v` must equal the manifest `version`.
4. Submit at [registry.tabularis.dev/submit](https://registry.tabularis.dev/submit). Ownership is verified via OAuth against your linked repository. If the registry requires manual approval, the plugin stays **pending** — visible only to you — until an admin approves it.

After the first submission the registry watches your release webhooks, so bumping `version` and publishing a new release is all an update needs.

## Pre-submit checklist

- [ ] `.tabularium` is at the repo root with `id`, `name`, `version`, `kind` and every field marked required for your kind on [Plugin Kinds](/wiki/plugin-kinds).
- [ ] `version` is semver without a leading `v` and equals the release tag minus `v`.
- [ ] Each platform has its own `.zip` containing the executable and `.tabularium`.
- [ ] `.tabularium` is also attached to the release as a standalone asset.
- [ ] `min_runtime_version` is set if the plugin relies on a recent Tabularis feature — older hosts then refuse it with a clear message instead of failing at runtime.
- [ ] `readme` points at your README: it is shown in the plugin details modal in the app.
- [ ] The manifest passes validation (see below).

## Validation and common submit failures

The registry validates every manifest against the schema for its kind. CI can run the same check before tagging:

```bash
curl -s https://registry.tabularis.dev/api/manifest/validate \
  -H 'content-type: application/json' \
  -d "$(jq -n --rawfile text .tabularium '{text: $text, kind: "driver"}')"
```

The response is `{ "ok": true, "normalized": { ... } }` or `{ "ok": false, "errors": [ ... ] }`. A submission whose manifest fails validation is rejected with **HTTP 422** — there is no silent fallback.

The most common failures:

- **Tag and version disagree.** `version` must equal the release tag stripped of any `v` prefix — `v1.4.0` → `1.4.0`.
- **Missing standalone manifest.** The `.tabularium` is only inside the ZIPs, not attached to the release on its own.
- **Invalid identifier.** `id` must match `^[a-z][a-z0-9-]*$` (1–64 characters) and is pinned at first submit. Manifests without `id` use `name` as the identifier, so `name` must then follow the same rule. When adding `id` to an existing plugin, set it to the current registry slug first, then change `name` to a display name.
- **Schema violations**, such as a `description` over 280 characters, an unknown field, or a missing required field for the kind.

## Using a custom registry

Tabularis talks to [registry.tabularis.dev](https://registry.tabularis.dev) unless `tabulariumRegistryUrl` in `config.json` points it at another Tabularium instance, such as a self-hosted or company-internal one:

```json
{ "tabulariumRegistryUrl": "https://registry.example.com" }
```

Use the instance's base URL. Both the in-app plugin browser and the install command use it.

## Where to get help

- **Tabularium source** — [`TabularisDB/tabularium`](https://github.com/TabularisDB/tabularium). Schema, validators, and submission flow. The registry also serves its own developer reference as one flat document at [`/api/docs/plugin-development?format=md`](https://registry.tabularis.dev/api/docs/plugin-development?format=md) — paste it into an LLM when an assistant needs to author or review a manifest.
- **Runtime reference** — [`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md) covers every RPC method with full parameter shapes.
- **Example plugins to copy patterns from** — the [Tabularium catalogue](https://registry.tabularis.dev) and the [Google Sheets driver](https://github.com/TabularisDB/tabularis-google-sheets-plugin) (OAuth, sheets-as-tables, UI extensions).
- **Found something wrong?** — Open an issue against [Tabularium](https://github.com/TabularisDB/tabularium/issues).

Happy hacking — and when you ship something, [submit it](https://registry.tabularis.dev/submit) so the rest of Tabularis can use it.
