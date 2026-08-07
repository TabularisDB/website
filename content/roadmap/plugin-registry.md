---
title: "Plugin registry platform"
slug: "plugin-registry"
category: "Ecosystem"
status: "done"
order: 3
lede: "Shipped as **Tabularium**, a purpose-built plugin registry live at registry.tabularis.dev since Tabularis v0.16.0. Developers sign in via OAuth (GitHub, GitLab, Gitea/Forgejo — Codeberg included), claim a plugin slug, link their repo, and new releases are picked up automatically via webhooks. The registry stays a catalog + trust layer — binaries keep living in the author's Releases, with signature + SHA-256 verification on install. Built by Dominik Spitzli (@NewtTheWolf) on [#196](https://github.com/TabularisDB/tabularis/issues/196)."
contributors:
  - username: debba
    role: Maintainer
  - username: NewtTheWolf
    role: Registry platform lead
links:
  - label: "Tabularium registry (live)"
    href: "https://registry.tabularis.dev"
    external: true
  - label: "Tabularium docs"
    href: "https://docs.tabularium.wiki"
    external: true
  - label: "Tabularium source"
    href: "https://github.com/TabularisDB/tabularium"
    external: true
  - label: "Issue #196"
    href: "https://github.com/TabularisDB/tabularis/issues/196"
    external: true
---

## What shipped

The registry used to be a single static [`plugins/registry.json`](https://github.com/TabularisDB/website/blob/main/plugins/registry.json) in the website repo — every new plugin or version meant a maintainer PR. Since Tabularis **v0.16.0**, plugin discovery runs through the hosted **[Tabularium](https://registry.tabularis.dev)** registry instead; the static file survives only as a legacy source merged into the catalogue automatically.

Instead of adapting an existing marketplace (Open VSX and a Gitea package-registry fork were the candidates), a purpose-built registry was written: **[TabularisDB/tabularium](https://github.com/TabularisDB/tabularium)** — self-hostable, with the official instance at `registry.tabularis.dev`.

Delivered, matching the original goals:

- **OAuth-based ownership.** Authors sign in with GitHub, GitLab, or any Gitea/Forgejo instance (Codeberg included) and claim a plugin slug. Ownership is verified against the linked repository.
- **Linked-repo publishing.** New releases on the linked repo are picked up automatically via webhooks — no website PR, no maintainer in the loop. The `.tabularium` manifest is resolved from the release assets.
- **Hybrid storage.** The registry is a catalog + trust layer, not a CDN — binaries keep living in the author's Releases. On install, Tabularis verifies the registry's JWS signature and the download's SHA-256.
- **Download analytics.** Per-plugin, per-version, per-platform counts.
- **Manifest validation at publish time.** Schema-validated; invalid manifests are rejected (HTTP 422). CI can pre-validate via `POST /api/manifest/validate`.
- **Client install unchanged.** The registry changed how plugins are discovered and resolved; the install path stayed put.

Themes and other kinds slot into the same pipeline via `kind:` in the manifest — the kind system is admin-configurable per instance.

## Docs

- Publish a plugin: [docs.tabularium.wiki/publishing](https://docs.tabularium.wiki/publishing/)
- Manifest reference: [docs.tabularium.wiki/manifest](https://docs.tabularium.wiki/manifest/)
- Self-host your own instance: [docs.tabularium.wiki/deploy](https://docs.tabularium.wiki/deploy/) (point Tabularis at it via `tabulariumRegistryUrl`)
