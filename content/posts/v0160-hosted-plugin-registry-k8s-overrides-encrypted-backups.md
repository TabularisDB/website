---
title: "v0.16.0: A Hosted Plugin Registry, Kubernetes Your Way, and Backups That Encrypt Themselves"
date: "2026-07-21T11:00:00"
release: "v0.16.0"
tags: ["release", "feature", "bugfix", "plugin", "community", "connections", "mysql", "security", "ui", "ux"]
excerpt: "v0.16.0 gives the plugin ecosystem real infrastructure: a hosted registry at registry.tabularis.dev, a searchable driver catalogue inside New Connection, and one-click deep-link installs — plus kubectl/kubeconfig overrides for Kubernetes tunnels, automatic encrypted connection backups to a folder or WebDAV, run-statement-at-cursor in the editor, AWS RDS IAM authentication for MySQL, and Elasticsearch and Cloudflare D1 drivers."
og:
  template: "screenshot-split"
  title: "Plugins, hosted."
  accent: "Catalogue. Deep links. Registry."
  claim: "A hosted plugin registry with a searchable driver catalogue and one-click installs, kubectl and kubeconfig overrides for Kubernetes, automatic encrypted backups, run-at-cursor, and AWS RDS IAM auth for MySQL."
  image: "/img/tabularis-plugin-manager.png"
  appLabel: "tabularis"
---

# v0.16.0: A Hosted Plugin Registry, Kubernetes Your Way, and Backups That Encrypt Themselves

**v0.16.0** follows [v0.15.0](/blog/v0150-import-connections-nested-groups-encrypted-exports) and is the release where the plugin ecosystem stops being a JSON file in a git repo and becomes infrastructure: a hosted registry, a searchable driver catalogue built into the New Connection flow, one-click installs from a browser link, and two new community drivers — Elasticsearch and Cloudflare D1 — to install through it. Around that core: Kubernetes tunnels learn to use *your* kubectl and *your* kubeconfig, connections back themselves up encrypted to a folder or a WebDAV server, the SQL editor runs the statement under your cursor, and MySQL connections can authenticate against AWS RDS with IAM.

---

## A Hosted Plugin Registry and a New Connection Catalogue

Until now, discovering a Tabularis plugin meant knowing it existed: the registry was a static `registry.json`, and installing meant finding a GitHub release yourself. PR [#299](https://github.com/TabularisDB/tabularis/pull/299), a long-running effort from [@NewtTheWolf](https://github.com/NewtTheWolf), replaces that with the hosted **Tabularium** registry at `registry.tabularis.dev` — and rebuilds the New Connection flow around it.

- **A driver catalogue is now step one.** Creating a connection starts from a searchable grid of every engine Tabularis can talk to — built-in drivers and registry plugins merged into one view, with paradigm facets to filter by. Built-ins lead, and drivers your platform can't run are badged and dimmed instead of being a click-through dead end. An uninstalled driver is install-gated: pick it, install it inline, connect.
- **Deep-link installs.** `tabularis://install/<slug>` links open the app with a version-aware confirmation — Install, Update when a newer version exists, or an already-up-to-date notice. Plugin pages on the web can now be one click from a working driver.
- **Fully backwards compatible.** The legacy `registry.json` is still merged in (the API wins on conflicts), so older plugins stay visible and already-shipped app versions keep working. All of the compatibility code is marked `COMPAT(registry-ga)` so it can be removed mechanically once migration completes.
- **Tooling for authors.** `@tabularis/create-plugin` 0.2.0 scaffolds the new `.tabularium` manifest format, adds a `migrate` command that converts legacy `manifest.json` plugins, and emits a registry-ready release workflow that publishes the manifest as a release asset the registry resolves directly.

The weeks after the merge hardened the transition paths: installed plugins that drop out of the hosted listing stay updatable instead of silently losing their update button, legacy `manifest.json` bundles install and list again, legacy-only plugins no longer link to a 404 on the API, and the Installed tab finally has an **Update** button next to the plugin it's telling you to update.

<video src="/videos/posts/tabularis-connection-catalogue.mp4" poster="/videos/posts/tabularis-connection-catalogue.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Two New Community Drivers: Elasticsearch and Cloudflare D1

Two community-built drivers joined the registry this cycle.

**Elasticsearch**, by [@erwin-lovecraft](https://github.com/erwin-lovecraft) ([repo](https://github.com/TabularisDB/tabularis-elasticsearch-plugin), added in PR [#476](https://github.com/TabularisDB/tabularis/pull/476)), brings cluster inspection to Tabularis: index browsing with stats, a mapping viewer for fields and nested structures, and document sampling. Queries run in three modes selected by a shebang on the first line — Elasticsearch SQL by default, `#!esql` for ES|QL, and `#!rest` for raw REST requests with the method and endpoint on the first line and the body below. It requires Tabularis 0.15.0 or newer.

**Cloudflare D1**, by [@josejorge](https://github.com/josejorge) ([repo](https://github.com/josejorge/tabularis_cloudflare_d1_plugin), registered in PR [#430](https://github.com/TabularisDB/tabularis/pull/430)), talks to Cloudflare's serverless SQLite over the D1 REST API: browse every D1 database in your account, inspect tables, indexes, foreign keys and views, run paginated queries, edit rows, and manage tables, indexes and views — ER diagram included.

Plugin drivers also got more capable underneath: batch query RPCs are now forwarded to external plugin drivers ([@haos666](https://github.com/haos666), PR [#443](https://github.com/TabularisDB/tabularis/pull/443)), and a new `explain` driver capability (PR [#491](https://github.com/TabularisDB/tabularis/pull/491)) means the Visual EXPLAIN button only appears for drivers that actually implement it, instead of failing at click time.

---

## Kubernetes Tunnels, With Your kubectl and Your kubeconfig

Tabularis's Kubernetes port-forwarding always used whatever `kubectl` was first on the PATH and the default kubeconfig. If you juggle multiple clusters, wrap kubectl in a corporate shim, or keep per-project kubeconfig files, that assumption was the feature's ceiling. PR [#365](https://github.com/TabularisDB/tabularis/pull/365), from [@metalgrid](https://github.com/metalgrid), adds **advanced settings** to Kubernetes connections — both inline and saved — that override the `kubectl` binary and the kubeconfig file per connection.

![The Advanced kubectl settings section of a saved Kubernetes tunnel, with kubectl and kubeconfig path overrides validated inline](/img/tabularis-k8s-advanced-settings.png)

The override paths are validated *before* they're used: an on-blur preflight checks that the pair actually works, incomplete pairs are refused before apply, and cancelling the modal cancels the validation instead of letting it land on a closed form. Tunnel cache keys now include the overrides, so two connections pointing at the same host through different kubeconfigs no longer collide on the same cached tunnel. The new settings are translated across all supported locales.

---

## Backups That Take Themselves

v0.15.0 gave connection exports proper encryption. v0.16.0 makes them automatic. PR [#470](https://github.com/TabularisDB/tabularis/pull/470), from [@pokertour](https://github.com/pokertour), adds a dedicated **Backup** tab in Settings that periodically writes an encrypted export of your connections — same **AES-256-GCM** / **Argon2id** envelope as the manual export, and deliberately *only* that: plaintext automatic backups are not an option.

- **Triggers**: manual, on an interval (6h/12h/daily/weekly presets or a custom value, with the next run time shown), on app launch, or on app close — the exit backup is bounded by a timeout so the app can always quit.
- **Destinations**: a local folder, or a **WebDAV** collection (Nextcloud and friends). Rotation honors your retention count and only ever touches `tabularis-backup-*.json` files, so it can't eat anything else living in the same directory.
- **Secrets stay in the keychain.** The encryption password and the WebDAV credentials live in the OS keychain, never in `config.json`, and the scheduler re-reads its config every minute so settings changes apply without a restart.

<video src="/videos/posts/tabularis-backup-settings.mp4" poster="/videos/posts/tabularis-backup-settings.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

:::newsletter:::

---

## Run the Statement Under Your Cursor

The single most-used editor action got the TablePlus treatment. PR [#464](https://github.com/TabularisDB/tabularis/pull/464), from [@maximumbreak](https://github.com/maximumbreak), makes **Cmd/Ctrl+Enter** run the SQL statement the cursor is *inside* when nothing is selected — no more whole-file execution or a "pick a statement" popup. A subtle highlight shows which statement is armed, Explain follows the same rule, and **Run All** moves to Cmd/Ctrl+Shift+Enter with a dedicated entry at the top of the Run dropdown. Selecting text still runs exactly the selection.

Making back-to-back statement runs easy exposed two long-standing result bugs, fixed in the same PR: an in-flight column-metadata fetch could resolve late and stamp the wrong table's primary key onto the current result, and pagination or post-edit refresh re-sent the whole editor buffer — which PostgreSQL rejects as "multiple commands in a prepared statement" once the buffer holds more than one. Both paths now track the exact last-run statement per tab, and stale async responses detect themselves and drop out.

And if you *liked* the old picker: [@GabrielMalava](https://github.com/GabrielMalava) added a **Query Execution** toggle in Settings → General in PR [#487](https://github.com/TabularisDB/tabularis/pull/487) — running the statement under the cursor stays the default, but switching it off brings back the query-selection dialog for multi-statement scripts.

<video src="/videos/posts/tabularis-run-at-cursor.mp4" poster="/videos/posts/tabularis-run-at-cursor.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## AWS RDS IAM Authentication for MySQL

If your MySQL lives on RDS behind IAM database authentication, Tabularis can now speak it. PR [#404](https://github.com/TabularisDB/tabularis/pull/404), from [@p4pupro](https://github.com/p4pupro), adds a **Use AWS IAM Authentication (RDS)** option to MySQL connections: the password field carries a generated RDS auth token (they expire after 15 minutes, so the token must be supplied per connect — the keychain is deliberately bypassed), and TLS is mandatory and enforced on every path, so a token can never travel in the clear. Connections with IAM enabled and a CA bundle configured are auto-escalated to certificate verification, empty-token mistakes fail fast with an actionable message instead of an opaque `1045 Access denied`, and a macOS-specific TLS handshake failure with the RDS regional CA bundle was fixed by moving the MySQL TLS backend to rustls with the OS trust store kept active — so corporate CAs in the system keychain keep working on every platform.

![The SSL tab of a MySQL connection with SSL mode Required and the Use AWS IAM Authentication (RDS) checkbox enabled](/img/tabularis-rds-iam-auth.png)

---

## Stored Procedures Show All Their Result Sets

A MySQL `CALL` to a stored procedure with several `SELECT`s streams back several result sets — and Tabularis only ever showed the first one. PR [#415](https://github.com/TabularisDB/tabularis/pull/415) (fixes [#414](https://github.com/TabularisDB/tabularis/issues/414)) rebuilds the MySQL execution path around result-set boundaries: every set now arrives, rendered through the multi-result tab UI with one tab per result set, and the per-page row cap applies to each set independently. The extra sets travel in a new optional field that other drivers and plugins simply never see, so nothing else changes shape. One known limit: a result set with zero rows is indistinguishable from the statement's OK packet at the driver level, so empty sets are still dropped.

---

## Tabularis Speaks Korean

[@moduvoice](https://github.com/moduvoice) contributed a complete **Korean** locale in PR [#463](https://github.com/TabularisDB/tabularis/pull/463) — all 1,574 strings, every interpolation placeholder intact, plus a translated README linked from the language switchers. That makes ten UI languages.

:::star:::

---

## Smaller Things

- **Copy rows as a Markdown table** ([@pokertour](https://github.com/pokertour), PR [#481](https://github.com/TabularisDB/tabularis/pull/481), closes [#474](https://github.com/TabularisDB/tabularis/issues/474)) — the grid's copy and export menus gain a Markdown table format, ready to paste into a PR description or a wiki page.
- **MCP transport no longer corrupts itself** (PR [#488](https://github.com/TabularisDB/tabularis/pull/488), fixes [#486](https://github.com/TabularisDB/tabularis/issues/486)) — keychain lookups and SSH/K8s tunnel setup logged to stdout, which in MCP mode interleaves with the JSON-RPC frames; clients like Warp dropped the connection with "Transport closed" on queries that had actually succeeded. All runtime logging now goes to stderr.
- **JSON in the row editor, not `[object Object]`** ([@NewtTheWolf](https://github.com/NewtTheWolf), PR [#475](https://github.com/TabularisDB/tabularis/pull/475), closes [#428](https://github.com/TabularisDB/tabularis/issues/428)) — JSON/JSONB values from JOINs, UNIONs and aggregates arrive without column metadata; the row editor now recognizes structured values on their own and opens the JSON editor for them.
- **Smart quotes normalized in filters** ([@Davydhh](https://github.com/Davydhh), PR [#439](https://github.com/TabularisDB/tabularis/pull/439)) — a `WHERE name = “foo”` pasted from a chat app no longer fails; curly quotes in filter and sort clauses are normalized to the straight quotes SQL expects.
- **MiniMax key status** ([@octo-patch](https://github.com/octo-patch), PR [#454](https://github.com/TabularisDB/tabularis/pull/454)) — the AI settings now show whether a MiniMax API key is configured, like every other provider.
- **Nightly builds, properly gated** ([@NewtTheWolf](https://github.com/NewtTheWolf), PR [#419](https://github.com/TabularisDB/tabularis/pull/419)) — signed nightly builds now ship as one tag per build (`nightly-<date>-<sha>`), cut only from the newest commit that passed CI, laying the groundwork for a selectable nightly update channel.
- **Linux builds run on older distros again** (PR [#490](https://github.com/TabularisDB/tabularis/pull/490)) — release and nightly Linux builds moved into an Ubuntu 22.04 container, lowering the glibc baseline so the `.deb` and AppImage keep working on older LTS systems.
- **Plugin uninstall no longer trips on empty config** (PR [#501](https://github.com/TabularisDB/tabularis/pull/501)) — uninstalling a plugin that never wrote a config crashed on macOS; the null case is now handled.

---

## Thanks

Eleven external contributors land in v0.16.0.

**[@NewtTheWolf](https://github.com/NewtTheWolf)** built the release's centerpiece: the hosted Tabularium registry and the connection catalogue ([#299](https://github.com/TabularisDB/tabularis/pull/299)), plus the gated nightly pipeline ([#419](https://github.com/TabularisDB/tabularis/pull/419)) and the row-editor JSON fix ([#475](https://github.com/TabularisDB/tabularis/pull/475)). **[@metalgrid](https://github.com/metalgrid)** made Kubernetes tunnels configurable with kubectl and kubeconfig overrides ([#365](https://github.com/TabularisDB/tabularis/pull/365)). **[@pokertour](https://github.com/pokertour)** added automatic encrypted backups ([#470](https://github.com/TabularisDB/tabularis/pull/470)) and Markdown table export ([#481](https://github.com/TabularisDB/tabularis/pull/481)).

**[@maximumbreak](https://github.com/maximumbreak)** brought run-at-cursor to the editor ([#464](https://github.com/TabularisDB/tabularis/pull/464)). **[@p4pupro](https://github.com/p4pupro)** added AWS RDS IAM authentication for MySQL ([#404](https://github.com/TabularisDB/tabularis/pull/404)). **[@erwin-lovecraft](https://github.com/erwin-lovecraft)** built the Elasticsearch driver plugin ([#476](https://github.com/TabularisDB/tabularis/pull/476)) and **[@josejorge](https://github.com/josejorge)** the Cloudflare D1 one, registered by **[@GabrielMalava](https://github.com/GabrielMalava)** in [#430](https://github.com/TabularisDB/tabularis/pull/430) — who also made the cursor-run behavior configurable ([#487](https://github.com/TabularisDB/tabularis/pull/487)).

**[@moduvoice](https://github.com/moduvoice)** translated the entire app into Korean ([#463](https://github.com/TabularisDB/tabularis/pull/463)). **[@haos666](https://github.com/haos666)** forwarded batch query RPCs to plugin drivers ([#443](https://github.com/TabularisDB/tabularis/pull/443)), **[@Davydhh](https://github.com/Davydhh)** normalized smart quotes in filters ([#439](https://github.com/TabularisDB/tabularis/pull/439)), and **[@octo-patch](https://github.com/octo-patch)** surfaced the MiniMax key status ([#454](https://github.com/TabularisDB/tabularis/pull/454)).

If you've been waiting for plugins you can discover and install without leaving the app, if your databases live behind a corporate kubectl, or if you've ever wished your connections backed themselves up — this is the upgrade.

:::contributors:::

---

_v0.16.0 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.16.0)._
