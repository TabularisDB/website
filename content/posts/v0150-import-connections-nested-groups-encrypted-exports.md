---
title: "v0.15.0: Bring Your Connections With You — Imports, Nested Groups, and Encrypted Exports"
date: "2026-07-14T11:00:00"
release: "v0.15.0"
tags: ["release", "feature", "bugfix", "connections", "security", "postgres", "mysql", "ui", "ux", "community"]
excerpt: "v0.15.0 is the connections release: import saved connections from DBeaver, Beekeeper Studio, TablePlus, DataGrip and Sequel Ace, organize them in nested folders, act on many at once, and export them encrypted — plus ENUM dropdown editing on MySQL and PostgreSQL, an MCP safety fix for EXPLAIN ANALYZE, and Windows that finally stops flashing console windows."
og:
  template: "screenshot-split"
  title: "Import from anywhere."
  accent: "Nested folders. Encrypted exports."
  claim: "Import connections from DBeaver, Beekeeper, TablePlus, DataGrip and Sequel Ace; organize them in nested groups; select many at once; export them AES-encrypted — plus ENUM dropdowns and a Tagalog UI."
  image: "/img/tabularis-connection-manager.png"
  appLabel: "tabularis"
---

# v0.15.0: Bring Your Connections With You — Imports, Nested Groups, and Encrypted Exports

**v0.15.0** follows [v0.14.0](/blog/v0140-stored-routines-connection-windows-destructive-query-guard) and has one clear theme: the Connections page stops being a flat list you retype things into and becomes something you can actually *manage*. You can now import your saved connections from five other SQL clients, file them into folders inside folders, select twenty of them and act on all twenty, and hand a teammate an export that is actually encrypted instead of a JSON full of plaintext passwords. Around that core: ENUM columns become dropdowns on both MySQL and PostgreSQL, the MCP safety layer closes an `EXPLAIN ANALYZE` loophole, and Windows users stop seeing phantom console windows. Fourteen external contributors land in this tag.

---

## Import Connections From the Client You're Leaving

The biggest friction in trying a new database client is retyping every connection you've accumulated over the years. PR [#393](https://github.com/TabularisDB/tabularis/pull/393) removes it: a new **Import** dropup next to *Add Connection* reads saved connections from **DBeaver**, **Beekeeper Studio**, **TablePlus**, **DataGrip** and **Sequel Ace** — plus Tabularis's own JSON exports.

Each source is parsed into a neutral envelope, and credentials are decrypted or read from the source client's keychain when you ask for them. Nothing is merged blindly: a **preview** lists every connection found, flags duplicates against what you already have (keep, replace, or skip — the duplicate's existing name shown so you know what you're replacing), and lets each new connection pick a target group — or create one on the fly, with defaults seeded from the source app's own folder structure.

The feature ships marked **beta**, with a visible badge and a direct link to [file an issue](https://github.com/TabularisDB/tabularis/issues) — parsing five other apps' formats across three platforms is exactly the kind of surface where real-world files will find edge cases. One already got fixed before release: Beekeeper payloads containing non-ASCII characters used to abort the whole import on a byte-boundary panic; they now parse or skip gracefully.

<video src="/videos/posts/tabularis-import-connections.mp4" poster="/videos/posts/tabularis-import-connections.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Folders Inside Folders

Connection groups were single-level since the day they shipped. PR [#405](https://github.com/TabularisDB/tabularis/pull/405), from [@p4pupro](https://github.com/p4pupro), makes them a real tree: groups can contain groups, to arbitrary depth, in both grid and list view.

The workflow got the attention the data model change deserved:

- **Create paths, not just names.** Typing `clients/acme/staging` in the New Group input creates the whole chain, reusing existing segments case-insensitively — the same `/` syntax works in the inline subfolder input on each group header.
- **Drag to re-parent.** Dropping a group onto another group's header past one indent step moves it inside; dropping near the left edge keeps the plain reorder. A cycle guard refuses to move a folder into its own descendant, with a clear error rather than silent corruption.
- **Cascade delete.** Deleting a group now removes its entire subtree — nested groups and their connections included — instead of quietly orphaning children to the root.
- **Counts that add up.** A folder's badge sums direct *and* descendant connections, so a collapsed tree still tells you what's inside.

Existing `connections.json` files keep working unchanged — `parent_id` is optional and defaults to root — and the export/import path preserves the hierarchy, demoting any dangling parent reference to root instead of rendering ghost trees.

<video src="/videos/posts/tabularis-nested-groups.mp4" poster="/videos/posts/tabularis-nested-groups.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

---

## Select Many, Act Once

With imports and folders in place, you need a way to move things around in bulk. PR [#468](https://github.com/TabularisDB/tabularis/pull/468) adds **multi-select** to the connections list: a checkbox appears on hover, selected cards get a ring, and a pinned action bar shows the count with three actions — **Move to group** (a submenu built from the nested tree, plus *Ungrouped*), **Delete selected** behind a confirmation with the count, and clear.

[@pokertour](https://github.com/pokertour) immediately wired the selection into the export flow in PR [#469](https://github.com/TabularisDB/tabularis/pull/469): the action bar gains an **Export** button that writes only the selected connections. The filtering happens *before* secrets are resolved, so credentials for unselected connections never leave the keychain, and the exported group list is pruned to just the ancestor chains the retained connections actually need.

![Three connections selected in the grid, with the pinned action bar showing Export selected, the Move to group submenu open on the nested group tree, and Delete selected](/img/tabularis-connections-multiselect.png)

---

## Exports That Don't Leak Passwords

Until now, exporting connections wrote database, SSH and Kubernetes credentials in plaintext behind a single warning dialog. PR [#447](https://github.com/TabularisDB/tabularis/pull/447), also from [@pokertour](https://github.com/pokertour), replaces that with a proper export modal offering three modes:

- **Encrypted with a password** (the default) — the payload is encrypted with **AES-256-GCM** under an **Argon2id**-derived key.
- **Plain text without passwords** — secrets stripped entirely; fine for sharing a topology.
- **Plain text with all passwords** — the old behavior, with the warning now attached to the option that deserves it.

Import detects the encrypted envelope and prompts for the password before merging. The decryption path is hardened too: the Argon2 parameters read from the envelope are bounded, so a malicious import file can't request unbounded memory or CPU. Plain exports from older versions import unchanged.

![Export Connections modal offering the three export modes, with the encrypted option selected and password fields below](/img/tabularis-export-connections-modes.png)

:::newsletter:::

---

## ENUM Columns Become Dropdowns — on Both MySQL and PostgreSQL

Editing an ENUM cell used to mean remembering the allowed values and typing one exactly. Two PRs fix that end to end.

On MySQL, [@fhriz](https://github.com/fhriz) introspected the full `column_type` from `information_schema` in PR [#455](https://github.com/TabularisDB/tabularis/pull/455) (closes [#452](https://github.com/TabularisDB/tabularis/issues/452)), so a column shows as `enum('pending','approved','rejected')` instead of a stripped `enum` — and both the inline grid editor and the row sidebar render a **dropdown** of the allowed values, with a NULL option on nullable columns. SET types get the same treatment, ENUM joins the column-type picker for new tables, and the sidebar now matches column metadata by *name* rather than position, fixing type mismatches when a query's SELECT order differs from the table's.

PostgreSQL followed in PR [#471](https://github.com/TabularisDB/tabularis/pull/471) (fixes [#465](https://github.com/TabularisDB/tabularis/issues/465)), where the problem ran deeper: editing an enum cell failed outright with SQLSTATE 42804 — *column is of type X but expression is of type text* — because the bound value was never cast to the enum type. The binding layer now wraps enum parameters in a `CAST($N AS "schema"."type")` with the qualified type name resolved from `pg_catalog`, mirroring the existing temporal/UUID coercions. And since column introspection now aggregates labels from `pg_enum` into the same `enum('a','b',...)` shape MySQL uses, the dropdown editor kicks in for PostgreSQL automatically — grid and sidebar both.

![Editing a MySQL SET cell inline: the grid shows a dropdown of the allowed values with checkboxes and a NULL option](/img/tabularis-enum-dropdown.png)

---

## MCP Safety: EXPLAIN ANALYZE Is Not a Read

The MCP safety layer classifies queries so read-only mode and the write-approval prompt can gate them. Its classifier mapped anything starting with `EXPLAIN` to the read-only path — but `EXPLAIN ANALYZE DELETE ...` actually *executes* the DELETE. An AI agent could therefore slip a write past both gates by wrapping it. Thanks to [@daniel-mertz](https://github.com/daniel-mertz) for reporting it; PR [#456](https://github.com/TabularisDB/tabularis/pull/456) makes classification option-aware: a plain `EXPLAIN` stays a read (it only plans), while the presence of the `ANALYZE` option classifies the wrapped statement as if it had been submitted directly. Matching is word-boundary aware — a table named `analyze_runs` doesn't trip it — and unbalanced option lists fail closed.

Two more MCP improvements landed alongside it. [@erneztox](https://github.com/erneztox) fixed `list_connections` to serialize *all* of a connection's databases instead of collapsing them, and added a dedicated **`list_databases`** tool in PR [#426](https://github.com/TabularisDB/tabularis/pull/426), complete with AI Activity filtering and documentation across all translated READMEs. And the repo now has a [security policy](https://github.com/TabularisDB/tabularis/blob/main/SECURITY.md) documenting how to report vulnerabilities privately — with MCP safety-layer bypasses under an untrusted-input threat model explicitly called in scope.

---

## Windows Stops Flashing Terminals

Two independent contributors fixed the same class of Windows papercut in the same release. Launching a console executable from a GUI app on Windows allocates a visible console window — so an SSH tunnel popped an `ssh.exe` terminal, and starting a plugin popped another.

[@kennelken](https://github.com/kennelken) fixed the SSH side in PR [#418](https://github.com/TabularisDB/tabularis/pull/418) (fixes [#413](https://github.com/TabularisDB/tabularis/issues/413)), spawning `ssh.exe` with the `CREATE_NO_WINDOW` flag — and went further: SSH child processes used to outlive the app, so the fix also hooks Tauri's exit event to tear down every active tunnel when Tabularis closes. No more orphaned `ssh.exe` in Task Manager. [@erwin-lovecraft](https://github.com/erwin-lovecraft) applied the same `CREATE_NO_WINDOW` treatment to plugin processes in PR [#451](https://github.com/TabularisDB/tabularis/pull/451), keeping the stdin/stdout pipe communication intact.

---

## Grid and Editor Refinements

- **Column headers actually stay pinned.** [@thomaswasle](https://github.com/thomaswasle) fixed the result grid's sticky header in PR [#433](https://github.com/TabularisDB/tabularis/pull/433) — the old implementation fought the virtualizer with a counter-transform that desynced after ~40 rows of scrolling. The grid now uses spacer rows so `position: sticky` works unconditionally, and a *Sticky column headers* toggle in Settings → Appearance keeps the old behavior available.
- **Hover a header, see the type.** [@benedettoraviotta](https://github.com/benedettoraviotta) added a DataGrip-style tooltip in PR [#436](https://github.com/TabularisDB/tabularis/pull/436) (closes [#435](https://github.com/TabularisDB/tabularis/issues/435)) showing `name: type` — e.g. `id: uuid` — on column header hover, read from metadata already in hand, so it costs no backend round-trip.
- **Set Empty knows its limits.** The quick action used to write a single space to *any* non-BLOB column, which strongly-typed columns rejected (`column is of type uuid but expression is of type text`). PR [#442](https://github.com/TabularisDB/tabularis/pull/442) gates it to textual columns, writes a real empty string, and swaps its icon for an eraser.
- **Summon IntelliSense on demand.** [@GabrielMalava](https://github.com/GabrielMalava) added a configurable shortcut in PR [#371](https://github.com/TabularisDB/tabularis/pull/371) to force the SQL editor's suggestion widget open (⌘I on macOS, Ctrl+I on Windows, Ctrl+Space on Linux) — remappable in Settings → Keyboard Shortcuts, working in both the editor and notebook cells — plus a new rebindable **refresh table** keybinding.
- **Disconnected means disconnected.** Disconnecting your last open connection didn't persist the change, so the next launch auto-reconnected and restored its tabs anyway. PR [#467](https://github.com/TabularisDB/tabularis/pull/467) persists the session at disconnect time; the saved tab file stays on disk, so *manually* reconnecting later still restores your queries.

---

## Tabularis Speaks Tagalog

[@chriscupas](https://github.com/chriscupas) contributed a complete **Tagalog** locale in PR [#457](https://github.com/TabularisDB/tabularis/pull/457) — 1,574 translated strings, a translated README, and browser-locale detection that maps Filipino (`fil`) systems to it automatically. That makes nine UI languages. [@pokertour](https://github.com/pokertour) also brought **French** back to parity in PR [#445](https://github.com/TabularisDB/tabularis/pull/445), adding the 66 keys that had accumulated in English only — triggers, result colors, timezone settings and more.

:::star:::

---

## Smaller Things

- **Typo-tolerant connection search** ([@Davydhh](https://github.com/Davydhh), PR [#444](https://github.com/TabularisDB/tabularis/pull/444)) — the connection search joins the table filters and Quick Navigator on Fuse.js fuzzy matching, so `postgre prod` finds what you meant, ranked by closeness.
- **SSH connections get a Settings tab** (PR [#441](https://github.com/TabularisDB/tabularis/pull/441)) — saved SSH tunnels are now manageable from Settings, not just from inside the connection-creation modal, and deleting one warns how many database connections still reference it.
- **No more autocorrect in filters** ([@Necriso](https://github.com/Necriso), PRs [#432](https://github.com/TabularisDB/tabularis/pull/432) and [#437](https://github.com/TabularisDB/tabularis/pull/437)) — spellcheck, autocorrect and autocapitalize are off in the table toolbar and filter inputs, where they never belonged.
- **Visual fixes** ([@math-krish](https://github.com/math-krish), PR [#461](https://github.com/TabularisDB/tabularis/pull/461)) — auto-pagination colors (fixes [#448](https://github.com/TabularisDB/tabularis/issues/448)), dropdown menu font (fixes [#446](https://github.com/TabularisDB/tabularis/issues/446)), and the save menu that appears on edit.
- **Modal consistency pass** (PR [#440](https://github.com/TabularisDB/tabularis/pull/440)) — the last `window.confirm()` calls replaced with the app's ConfirmModal, Escape now closes the trigger/routine/explain modals like every other one, primary fields autofocus, and a batch of hardcoded strings moved to i18n across all locales.

---

## Thanks

Fourteen external contributors land in v0.15.0 — the widest tag yet.

**[@pokertour](https://github.com/pokertour)** owns the export story: password-encrypted connection exports ([#447](https://github.com/TabularisDB/tabularis/pull/447)), export-only-the-selection ([#469](https://github.com/TabularisDB/tabularis/pull/469)), and the French translation catch-up ([#445](https://github.com/TabularisDB/tabularis/pull/445)). **[@p4pupro](https://github.com/p4pupro)** built nested connection groups ([#405](https://github.com/TabularisDB/tabularis/pull/405)). **[@chriscupas](https://github.com/chriscupas)** translated the entire app into Tagalog ([#457](https://github.com/TabularisDB/tabularis/pull/457)).

**[@fhriz](https://github.com/fhriz)** brought ENUM dropdown editing to MySQL ([#455](https://github.com/TabularisDB/tabularis/pull/455)). **[@kennelken](https://github.com/kennelken)** silenced the Windows SSH console window and cleaned up tunnels on exit ([#418](https://github.com/TabularisDB/tabularis/pull/418)); **[@erwin-lovecraft](https://github.com/erwin-lovecraft)** did the same for plugin processes ([#451](https://github.com/TabularisDB/tabularis/pull/451)). **[@thomaswasle](https://github.com/thomaswasle)** fixed the sticky result headers ([#433](https://github.com/TabularisDB/tabularis/pull/433)), **[@benedettoraviotta](https://github.com/benedettoraviotta)** added the column-type tooltip ([#436](https://github.com/TabularisDB/tabularis/pull/436)), and **[@GabrielMalava](https://github.com/GabrielMalava)** added the IntelliSense trigger shortcut ([#371](https://github.com/TabularisDB/tabularis/pull/371)).

**[@erneztox](https://github.com/erneztox)** fixed multi-database serialization in MCP and added `list_databases` ([#426](https://github.com/TabularisDB/tabularis/pull/426)). **[@Davydhh](https://github.com/Davydhh)** made the connection search fuzzy ([#444](https://github.com/TabularisDB/tabularis/pull/444)), **[@Necriso](https://github.com/Necriso)** killed autocorrect in the filters ([#432](https://github.com/TabularisDB/tabularis/pull/432), [#437](https://github.com/TabularisDB/tabularis/pull/437)), and **[@math-krish](https://github.com/math-krish)** cleaned up pagination colors, the dropdown font and the save menu ([#461](https://github.com/TabularisDB/tabularis/pull/461)). And thanks to **[@daniel-mertz](https://github.com/daniel-mertz)** for responsibly reporting the `EXPLAIN ANALYZE` safety bypass.

If you've been meaning to [switch from DBeaver](/compare/dbeaver-alternative) but dreaded retyping thirty connections, if your team shares connection files, or if your database leans on ENUMs — this is the upgrade.

:::contributors:::

---

_v0.15.0 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.15.0)._
