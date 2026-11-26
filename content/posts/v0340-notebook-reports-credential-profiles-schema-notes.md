---
title: 'v0.34.0: Notebook Reports, Credential Profiles, and Schema Notes'
date: '2026-11-26T18:15:00+00:00'
release: 'v0.34.0'
tags: ['release', 'feature', 'bugfix', 'notebook', 'connections', 'ui', 'sqlite', 'postgres', 'mysql', 'web', 'community']
excerpt: 'Turn a notebook into a report with typed parameters, share one password across connections, write notes on tables and columns, and stop a SQLite query for real.'
og:
    title: 'v0.34.0:'
    accent: 'Notebooks as reports'
    claim: 'Switch a notebook to a report view and fill its parameters with typed, validated values.'
    image: '/img/tabularis-notebook-report-view.png'
---

# v0.34.0: Notebook Reports, Credential Profiles, and Schema Notes

**v0.34.0** covers everything since [v0.33.0](/blog/v0330-open-data-files-ai-completion-read-only-connections), including the fixes that already shipped in the [v0.33.1](https://github.com/TabularisDB/tabularis/releases/tag/v0.33.1) patch. It is a release about the things around a query: the notebook it lives in, the credentials it connects with and the notes that explain the tables. A notebook can switch to a report view, and its parameters can be typed so a date reaches the database as a date. One password can be shared by several connections, tables and columns can carry local Markdown notes, and SQLite gets a query timeout and a Stop that ends the statement. Tabularis Web also gains what a hosting panel needs to run it as a managed service.

---

## Notebooks Become Reports

**Report view.** The notebook toolbar has an **Edit / Report** switch. Report shows the included Markdown cells, KPI cards, charts and result tables in notebook order, with empty, running, failed and outdated states shown as such. Switching runs nothing and keeps the current outputs; the parameters panel and **Run All** stay available. Each cell header has a toggle to leave it out of the report, and existing cells are included by default. [@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys) built it in [#1559](https://github.com/TabularisDB/tabularis/pull/1559), closing [#1507](https://github.com/TabularisDB/tabularis/issues/1507).

<video src="/videos/posts/tabularis-notebook-report-view.mp4" poster="/videos/posts/tabularis-notebook-report-view.jpg" autoplay loop muted playsinline></video>

**Typed parameters.** A parameter's value used to be pasted into the SQL as typed, so `@start` set to `2026-01-01` reached SQLite, MySQL and MariaDB as the arithmetic `2024` and returned every row, while PostgreSQL failed with `date >= integer`. A parameter can now be given a type: text, number, boolean, date or a list of options, with NULL and Required. Typed values are validated, written as SQL literals for the connection's dialect, and edited as drafts that a single **Apply** commits together, as one undo step and without running anything. Untyped parameters keep working as before. Typed parameters are offered on PostgreSQL, MySQL and SQLite dialects, including plugins that declare one of them; other drivers keep raw parameters only. [@luc-pimentel](https://github.com/luc-pimentel) built it in [#1654](https://github.com/TabularisDB/tabularis/pull/1654), closing [#1505](https://github.com/TabularisDB/tabularis/issues/1505), with follow-ups in [#1661](https://github.com/TabularisDB/tabularis/pull/1661).

<video src="/videos/posts/tabularis-notebook-typed-parameters.mp4" poster="/videos/posts/tabularis-notebook-typed-parameters.jpg" autoplay loop muted playsinline></video>

**Disabled cells.** A SQL cell can be disabled without deleting it. It keeps its source, settings and last output, but no direct run, Run All or dependency resolution sends it to the database. A cell that reads a disabled one is marked as blocked instead of running against stale output ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1541](https://github.com/TabularisDB/tabularis/pull/1541), closing [#1510](https://github.com/TabularisDB/tabularis/issues/1510)).

**Run All across databases.** Cells that target different databases now start together, while cells on the same database still run in document order and a cell that reads another's result waits for it ([@kobewl](https://github.com/kobewl), [#1613](https://github.com/TabularisDB/tabularis/pull/1613)).

**Export Markdown.** The export menu writes the notebook's source as a `.md` file: Markdown cells as they are and SQL cells in fenced `sql` blocks. Results, parameter values and history are left out ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1530](https://github.com/TabularisDB/tabularis/pull/1530), closing [#1491](https://github.com/TabularisDB/tabularis/issues/1491)).

## Shared Credential Profiles

When several connections log in with the same database account, rotating its password meant editing every one of them. A **credential profile** holds a username and password once; connections link to it from the connection dialog's picker, or save their current credentials with **Save as profile…**. Settings has a manager for profiles next to the shared SSH connections. A changed password never closes an open pool, so running queries and transactions continue; linked connections pick it up on their next connect, and Settings lists the ones still open so you can reconnect them. A profile in use cannot be deleted until its connections are unlinked, and a missing profile fails the connection instead of falling back to an old password. With IAM authentication, the profile supplies the username and the token is still generated per connect.

Connection export includes the referenced profiles, and their passwords only with "include secrets"; importing as new remaps them and renames clashes. [@khaledCSE](https://github.com/khaledCSE) built it in [#1359](https://github.com/TabularisDB/tabularis/pull/1359), closing [#993](https://github.com/TabularisDB/tabularis/issues/993).

<video src="/videos/posts/tabularis-credential-profiles.mp4" poster="/videos/posts/tabularis-credential-profiles.jpg" autoplay loop muted playsinline></video>

**SSH user override.** A connection that reuses a saved SSH connection can now set its own SSH user, with the saved user as the fallback ([@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys), [#1660](https://github.com/TabularisDB/tabularis/pull/1660), closing [#1658](https://github.com/TabularisDB/tabularis/issues/1658)).

**Tunnels that recover.** After a sleep, a Wi-Fi switch or a NAT timeout, an SSH tunnel can stay alive while its traffic goes nowhere. Tabularis now replaces such a half-open shared tunnel before reconnecting, and when several connections share a tunnel that died, they open a single new SSH session instead of one each ([@Detoy](https://github.com/Detoy), [#1556](https://github.com/TabularisDB/tabularis/pull/1556), [#1609](https://github.com/TabularisDB/tabularis/pull/1609)).

## Schema Notes

**Schema Notes** in the explorer's table context menu opens local Markdown notes for the connection, the table and its columns, grouped by business domain. Database comments are shown next to the note fields but kept separate. The notes live in a sidecar file per connection in the Tabularis config directory and are never written to the database. They can be exported and imported on their own, without connection details or credentials.

A per-connection checkbox adds the notes to the AI schema context. It is off by default, and the notes go in under a header saying they were written by users and are not read from the database. Notes are rendered without raw HTML, remote images or live links. [@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca) built it in [#1480](https://github.com/TabularisDB/tabularis/pull/1480), closing [#1406](https://github.com/TabularisDB/tabularis/issues/1406).

![Schema Notes window for the orders table with a connection note, the Sales business domain, table and column notes in Markdown preview, and the AI context checkbox](/img/tabularis-schema-notes.png)

:::newsletter:::

## Editor Layout and Connection Colors

**Vertical tabs.** Settings → Appearance has a **Tab layout** option. **Vertical** lists the open tabs in a column between the explorer and the editor, with the new console, SQL file, visual query and notebook buttons at the top. Renaming, pinning, the context menu, drag-to-reorder and the connection tint work as in the horizontal bar, and in split view each pane gets its own column. Horizontal stays the default ([@GoodGaming2511](https://github.com/GoodGaming2511), [#1647](https://github.com/TabularisDB/tabularis/pull/1647), closing [#1646](https://github.com/TabularisDB/tabularis/issues/1646)).

**Connection color bar.** Connections were told apart only by a faint tint on the tab bar, which is hard to see on a low-contrast display or with poor eyesight. An opt-in setting adds a 10px bar along the bottom of the window in the active connection's accent color, mixed with the theme's text color so it stands out on dark and light themes ([@GoodGaming2511](https://github.com/GoodGaming2511), [#1645](https://github.com/TabularisDB/tabularis/pull/1645)).

<video src="/videos/posts/tabularis-vertical-tabs.mp4" poster="/videos/posts/tabularis-vertical-tabs.jpg" autoplay loop muted playsinline></video>

## SQLite: Query Timeout and a Real Stop

The built-in SQLite driver now honors the per-connection **Query timeout** from the Advanced tab, as PostgreSQL and MySQL already did. Stop now ends the statement too: before, the worker thread kept stepping it after the query was cancelled, so a stopped `INSERT ... SELECT` held the write lock and the next write failed with `database is locked`. The statement is now interrupted, its write rolled back, and the connection is not returned to the pool while it is still busy ([@Detoy](https://github.com/Detoy), [#1560](https://github.com/TabularisDB/tabularis/pull/1560)).

<div class="post-gallery">
  <img src="/img/tabularis-sqlite-query-timeout-setting.png" alt="SQLite connection Advanced tab with Query timeout set to 2 seconds" loading="lazy">
  <img src="/img/tabularis-sqlite-query-timeout.png" alt="Recursive CTE on SQLite stopped with the message Query stopped after 2 s by the connection's query timeout" loading="lazy">
</div>

The bundled SQLite moves to 3.54.1, so `if()`, multi-argument `iif()` and the `end of` date modifier work ([@Vijay431](https://github.com/Vijay431), [#1571](https://github.com/TabularisDB/tabularis/pull/1571), closing [#1567](https://github.com/TabularisDB/tabularis/issues/1567); [@kobewl](https://github.com/kobewl), [#1614](https://github.com/TabularisDB/tabularis/pull/1614)).

## Tabularis Web as a Managed Service

Three additions let a hosting panel run `tabularis web` for its users:

- **Managed mode.** Under `--connection-mode managed-only`, browser users can open the connections the instance was given and query within the database account's privileges. They cannot create, change, delete, duplicate, import, export or test connections, redirect one elsewhere or read stored credentials. The policy is enforced in the backend, and every authenticated user of an instance shares its managed connections, so one instance per group of users is the intended setup ([@Asymtode712](https://github.com/Asymtode712), [#1528](https://github.com/TabularisDB/tabularis/pull/1528)).
- **Provisioning API.** An opt-in machine API, disabled unless a bearer token is configured, creates, reads and removes managed connections by external reference. PUT and DELETE are idempotent, and GET returns metadata only ([#1574](https://github.com/TabularisDB/tabularis/pull/1574), closing [#1274](https://github.com/TabularisDB/tabularis/issues/1274)).
- **Base path at runtime.** One build can be served under any prefix with `tabularis web --base-path /workspaces/a/`; the older build-time `TABULARIS_BASE_PATH` still works ([#1575](https://github.com/TabularisDB/tabularis/pull/1575), closing [#1572](https://github.com/TabularisDB/tabularis/issues/1572)).

Desktop and standalone Web are unchanged. The [Plesk extension](https://github.com/TabularisDB/tabularis-plesk-extension) is the first integration built on these pieces; it is an evaluation implementation, not a released extension yet.

## Safer SQL and Fewer Broken Pages

**EXPLAIN ANALYZE.** The "no WHERE clause" confirmation looked at the first keyword, so `EXPLAIN ANALYZE DELETE FROM orders` ran without asking, and PostgreSQL executes the statement behind `EXPLAIN ANALYZE`. Prefixes that run their statement, including `EXPLAIN (ANALYZE)` and MariaDB's `ANALYZE DELETE`, are now looked through ([@Xnadir](https://github.com/Xnadir), [#1663](https://github.com/TabularisDB/tabularis/pull/1663), closing [#1662](https://github.com/TabularisDB/tabularis/issues/1662)).

![Run without a WHERE clause confirmation for EXPLAIN ANALYZE DELETE FROM orders on PostgreSQL](/img/tabularis-explain-analyze-confirm.png)

**Pagination.** The grid adds its own `LIMIT ... OFFSET` to a `SELECT` and removes the user's trailing limit first. Several queries ended up with two limit clauses and a syntax error; they now page correctly:

- `LIMIT offset, count` on MySQL and SQLite ([#1555](https://github.com/TabularisDB/tabularis/pull/1555)) and PostgreSQL's other row-limit forms ([#1615](https://github.com/TabularisDB/tabularis/pull/1615));
- a comment containing an apostrophe before the `LIMIT` ([#1616](https://github.com/TabularisDB/tabularis/pull/1616)), with comment rules per dialect ([@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys), [#1623](https://github.com/TabularisDB/tabularis/pull/1623), closing [#1596](https://github.com/TabularisDB/tabularis/issues/1596));
- a backslash at the end of a SQLite or PostgreSQL string ([@chiliec](https://github.com/chiliec), [#1653](https://github.com/TabularisDB/tabularis/pull/1653), closing [#1652](https://github.com/TabularisDB/tabularis/issues/1652));
- `FOR UPDATE`, `FOR SHARE` and `LOCK IN SHARE MODE`, which now come after the page clause ([#1666](https://github.com/TabularisDB/tabularis/pull/1666), [#1683](https://github.com/TabularisDB/tabularis/pull/1683)).

Unless noted, these are by [@Xnadir](https://github.com/Xnadir).

**PostgreSQL triggers.** Saving an edited trigger kept dropping parts of it. It now keeps `FOR EACH STATEMENT` and `WHEN` ([#1620](https://github.com/TabularisDB/tabularis/pull/1620)) and the `UPDATE OF` column list ([#1621](https://github.com/TabularisDB/tabularis/pull/1621)), reads a function name quoted separately from its schema ([#1618](https://github.com/TabularisDB/tabularis/pull/1618)), and ignores `BEGIN`/`END` inside comments and strings of the function body ([#1619](https://github.com/TabularisDB/tabularis/pull/1619)), all by [@Xnadir](https://github.com/Xnadir).

## Around the Ecosystem

### Plugins

The [PostgreSQL plugin](https://github.com/TabularisDB/tabularis-postgresql-plugin) has merged native whole-database operations, a transactional `import_database_sql`, reading statements in one network round trip, TLS for servers that require `hostssl` under the prefer/allow modes, and real Unix socket connections ([@aesslinger](https://github.com/aesslinger), [#192](https://github.com/TabularisDB/tabularis-postgresql-plugin/pull/192), [#197](https://github.com/TabularisDB/tabularis-postgresql-plugin/pull/197), [#201](https://github.com/TabularisDB/tabularis-postgresql-plugin/pull/201)). [@wuzi](https://github.com/wuzi) made it report the schema of cross-schema foreign keys ([#190](https://github.com/TabularisDB/tabularis-postgresql-plugin/pull/190)). These wait for the plugin's next release. In the app, the deprecated built-in PostgreSQL driver now carries a "Deprecated" chip in the Settings sidebar, so it can be told apart from the plugin of the same name ([@emreocell](https://github.com/emreocell), [#1602](https://github.com/TabularisDB/tabularis/pull/1602), closing [#1568](https://github.com/TabularisDB/tabularis/issues/1568)).

[Neon 0.4.0](https://github.com/TabularisDB/neon-plugin/releases/tag/v0.4.0) adds file transfers, Auth administration and live queries, and ships native builds for Windows, macOS and Linux; the [Neon post](/blog/neon-plugin-workspaces) walks through it.

### Themes

[Vice City 1.0.0](https://github.com/TabularisDB/tabularis-vice-city-theme/releases/tag/v1.0.0) by [@NewtTheWolf](https://github.com/NewtTheWolf) brings dark and light Vice City themes to the registry, with [a launch post](/blog/vice-city-launch-day) you can play.

### Tabularium

[Tabularium 0.26.0](https://github.com/TabularisDB/tabularium/releases/tag/v0.26.0) lets you submit a plugin without granting repository write access: sign-in uses read-only OAuth scopes for GitHub, GitLab and Gitea/Forgejo, and when webhook setup is skipped the submission still succeeds with manual setup instructions ([#36](https://github.com/TabularisDB/tabularium/pull/36)).

### Website

The [home page](https://tabularis.dev) now has a contributors wall with every commit author across the organization's public repositories, AI agents excluded, and the site's modals follow the design system ([@wajrock](https://github.com/wajrock), [#50](https://github.com/TabularisDB/website/pull/50), [#51](https://github.com/TabularisDB/website/pull/51), [#52](https://github.com/TabularisDB/website/pull/52)).

## Smaller Things

- **Explorer:** column usage tags failed history runs and resolves each side of a `UNION`, `INTERSECT` or `EXCEPT` on its own ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1542](https://github.com/TabularisDB/tabularis/pull/1542), [#1638](https://github.com/TabularisDB/tabularis/pull/1638)); the related-record header shows the referenced schema when it differs ([@wuzi](https://github.com/wuzi), [#1521](https://github.com/TabularisDB/tabularis/pull/1521)).
- **MySQL:** the Timezone setting no longer defaults to `SYSTEM`, so Apache Doris and other servers that reject it connect ([#1642](https://github.com/TabularisDB/tabularis/pull/1642), closing [#1640](https://github.com/TabularisDB/tabularis/issues/1640)); `ANALYZE`, `OPTIMIZE`, `REPAIR`, `CHECK` and `CHECKSUM TABLE` show their rows ([#1667](https://github.com/TabularisDB/tabularis/pull/1667)), both by [@Xnadir](https://github.com/Xnadir); queries run again on MySQL 5.5 and on MySQL-compatible servers that return the connection ID as text ([@antoinelgd](https://github.com/antoinelgd), [#1603](https://github.com/TabularisDB/tabularis/pull/1603); [@sosadfly-gh](https://github.com/sosadfly-gh), [#1657](https://github.com/TabularisDB/tabularis/pull/1657)).
- **Notebooks:** cell CTEs merge into a query's own `WITH`, DECIMAL columns chart, JSON values export as JSON, and `@@variables` in strings are not read as parameters ([@Xnadir](https://github.com/Xnadir), [#1550](https://github.com/TabularisDB/tabularis/pull/1550)–[#1553](https://github.com/TabularisDB/tabularis/pull/1553)); outline follow-ups ([@virTripathi](https://github.com/virTripathi), [#1543](https://github.com/TabularisDB/tabularis/pull/1543)).
- **Clipboard import:** an escaped pipe stays in its Markdown cell, a quote inside a CSV field is text, and JSON columns come from every object ([@Xnadir](https://github.com/Xnadir), [#1540](https://github.com/TabularisDB/tabularis/pull/1540), [#1668](https://github.com/TabularisDB/tabularis/pull/1668), [#1669](https://github.com/TabularisDB/tabularis/pull/1669)).
- **Updates:** the startup update prompt only appears in the main window, not over a JSON cell window, and a sidebar button reopens the release details ([#1637](https://github.com/TabularisDB/tabularis/pull/1637), closing [#1636](https://github.com/TabularisDB/tabularis/issues/1636)).
- **Plugins and themes:** a removed plugin leaves the Installed list right away, Install stays busy until the plugin lists have reloaded, and inline plugin frames grow with their content ([#1630](https://github.com/TabularisDB/tabularis/pull/1630), [#1629](https://github.com/TabularisDB/tabularis/pull/1629), [#1628](https://github.com/TabularisDB/tabularis/pull/1628)); native Windows ARM64 picks `win-arm64` plugin builds ([@sarthakdev143-lite](https://github.com/sarthakdev143-lite), [#1597](https://github.com/TabularisDB/tabularis/pull/1597)); theme commands run off the UI thread ([@kobewl](https://github.com/kobewl), [#1545](https://github.com/TabularisDB/tabularis/pull/1545)); installed themes show under the desktop Content Security Policy ([@NewtTheWolf](https://github.com/NewtTheWolf), [#1627](https://github.com/TabularisDB/tabularis/pull/1627)).
- **Editor and settings:** dollar-quote tags with any letter or digit split correctly, and whitespace inside a filter's string literal is kept ([@Xnadir](https://github.com/Xnadir), [#1539](https://github.com/TabularisDB/tabularis/pull/1539), [#1554](https://github.com/TabularisDB/tabularis/pull/1554)); `SELECT ... INTO` after an escaped quote counts as a write ([@chiliec](https://github.com/chiliec), [#1562](https://github.com/TabularisDB/tabularis/pull/1562)); the font size slider holds steady while dragging ([@GoodGaming2511](https://github.com/GoodGaming2511), [#1644](https://github.com/TabularisDB/tabularis/pull/1644)); the EXPLAIN graph cleans up its timer ([@itsmunzir](https://github.com/itsmunzir), [#1650](https://github.com/TabularisDB/tabularis/pull/1650)); the AI activity log no longer shows a duration as "1m 60s" ([@Xnadir](https://github.com/Xnadir), [#1538](https://github.com/TabularisDB/tabularis/pull/1538)); the sidebar stops highlighting Connections while a connection is open ([#1632](https://github.com/TabularisDB/tabularis/pull/1632)).
- **Web:** the community welcome stays dismissed across reloads, and the gateway checks proxy credentials on every session request ([#1579](https://github.com/TabularisDB/tabularis/pull/1579), [#1576](https://github.com/TabularisDB/tabularis/pull/1576)); the Docker image includes the theme validator and the built-in AI assistant manifests again ([#1634](https://github.com/TabularisDB/tabularis/pull/1634)).
- **Translations:** pt-BR gains 79 missing keys ([@jeffersongoncalves](https://github.com/jeffersongoncalves), [#1600](https://github.com/TabularisDB/tabularis/pull/1600)).

## Thanks

Thanks to [@luc-pimentel](https://github.com/luc-pimentel) for typed notebook parameters; [@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys) for the report view, the SSH user override and dialect-aware comment scanning; [@khaledCSE](https://github.com/khaledCSE) for credential profiles; [@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca) for schema notes, disabled cells, Markdown export and column usage; [@GoodGaming2511](https://github.com/GoodGaming2511) for vertical tabs and the connection color bar; [@Detoy](https://github.com/Detoy) for the SQLite timeout and SSH tunnel recovery; [@Xnadir](https://github.com/Xnadir) for the EXPLAIN ANALYZE check and a long run of pagination, trigger, MySQL, notebook and import fixes; [@Asymtode712](https://github.com/Asymtode712) for managed mode in Tabularis Web; and [@kobewl](https://github.com/kobewl) for parallel Run All and SQLite 3.54. Thanks also to [@chiliec](https://github.com/chiliec), [@wuzi](https://github.com/wuzi), [@Vijay431](https://github.com/Vijay431), [@antoinelgd](https://github.com/antoinelgd), [@sosadfly-gh](https://github.com/sosadfly-gh), [@emreocell](https://github.com/emreocell), [@sarthakdev143-lite](https://github.com/sarthakdev143-lite), [@itsmunzir](https://github.com/itsmunzir), [@virTripathi](https://github.com/virTripathi), [@jeffersongoncalves](https://github.com/jeffersongoncalves) and [@NewtTheWolf](https://github.com/NewtTheWolf) for the changes above. In the ecosystem, thanks to [@aesslinger](https://github.com/aesslinger) and [@wuzi](https://github.com/wuzi) for the PostgreSQL plugin work, [@NewtTheWolf](https://github.com/NewtTheWolf) for Neon, Vice City and Tabularium, and [@wajrock](https://github.com/wajrock) for the website.

If you share notebooks with people who only want the numbers, or you rotate one database password across a dozen connections, this is the upgrade.

:::contributors:::

---

_Download the latest published version from the [download page](/download). Release notes and packages are available on [GitHub Releases](https://github.com/TabularisDB/tabularis/releases)._
