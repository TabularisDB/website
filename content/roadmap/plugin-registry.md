---
title: "Plugin registry platform"
slug: "plugin-registry"
category: "Ecosystem"
status: "in-progress"
order: 3
lede: "The plugin registry is currently a single static `plugins/registry.json` file checked into the website repo. Every new plugin or version means a maintainer PR. This initiative replaces it with a dedicated platform on a subdomain of tabularis.dev: developers sign in with GitHub or Codeberg OAuth, claim a plugin namespace, link their repo, and new releases get picked up automatically. Plus per-plugin download analytics. The registry stays a catalog + trust layer — binaries keep living in the author's Releases. Picked up by Dominik Spitzli (@NewtTheWolf) on [#196](https://github.com/TabularisDB/tabularis/issues/196)."
contributors:
  - username: debba
    role: Maintainer
  - username: NewtTheWolf
    role: Registry platform lead
links:
  - label: "Issue #196"
    href: "https://github.com/TabularisDB/tabularis/issues/196"
    external: true
  - label: "Current registry.json"
    href: "https://github.com/TabularisDB/tabularis-website/blob/main/plugins/registry.json"
    external: true
---

## How the registry works today

The registry is one file: [`plugins/registry.json`](https://github.com/TabularisDB/tabularis-website/blob/main/plugins/registry.json) in the website repo. Each plugin is an entry, each version a block under `releases:`, each asset URL a direct link to a GitHub Releases download on the plugin author's repo. The app reads this JSON at install time.

What this means in practice:

- Adding a new plugin means a PR on the website repo. Maintainer reviews and merges.
- Shipping a new version means another PR. Same flow.
- The plugin author has no way to publish on their own schedule. There's no "I own this plugin id" — it's whatever the JSON says.
- No download numbers, anywhere.
- No validation beyond "the JSON parsed and I trusted the PR."

It worked while the registry had three plugins and one author. It doesn't scale to an ecosystem.

## What we want

A dedicated registry platform, hosted on a subdomain of `tabularis.dev`. Concretely:

- **OAuth-based ownership.** Plugin authors sign in with **GitHub or Codeberg** and claim a namespace. Ownership is tied to the OAuth identity, not to a JSON entry that the maintainer merged.
- **Linked-repo publishing.** An author links their plugin repo. New releases on the linked repo are picked up automatically (webhook or polling) and become installable from the app — no website PR, no maintainer in the loop.
- **Hybrid storage.** The registry is a **catalog + trust layer**, not a CDN. Plugin binaries keep living in the author's GitHub / Codeberg Releases. The registry indexes them, validates the manifest, and serves the metadata.
- **Download analytics.** Per-plugin, per-version, per-platform counts that authors can see on their own dashboard, plus enough aggregate data on the public listing for users to gauge what's actually used.
- **Manifest validation at publish time** — schema, required platforms, version monotonicity.
- **Client install unchanged.** The existing pipeline (`manifest.json` + `install.sh` + `~/.local/share/tabularis/plugins/<id>/`) stays exactly as it is. The registry only changes how plugins are *discovered and resolved* — install itself doesn't move.

v1 ships plugins only. Themes, snippets and SQL templates slot into the same pipeline later with a different `kind:` in the manifest.

## Direction

Adapt an existing open-source plugin/extension marketplace rather than build one from scratch. Building a marketplace eats months and the work isn't where Tabularis adds value.

Top candidate: **[Eclipse Open VSX](https://github.com/eclipse/openvsx)**. It already has namespaces, publisher claim via OAuth, search, a REST API and a published web UI. What needs to change: rebrand, add Codeberg next to GitHub as an OAuth provider, swap the manifest schema for ours.

Other options still on the table: fork of [Gitea's package registry](https://docs.gitea.com/usage/packages/overview), or Backstage's plugin marketplace (likely overkill). Final platform choice is being scoped by Dominik on [#196](https://github.com/TabularisDB/tabularis/issues/196).

## Out of scope

- The client-side install path. Untouched.
- Hosting the binaries ourselves. The whole point of the hybrid model is *not* to become a CDN.
- A payment / paid-plugins layer. Not on the table for v1.

## Status

Dominik Spitzli ([@NewtTheWolf](https://github.com/NewtTheWolf)) is driving this initiative — assigned on [#196](https://github.com/TabularisDB/tabularis/issues/196). Platform selection and scoped sub-issues land there as the work progresses. Follow the issue for updates.
