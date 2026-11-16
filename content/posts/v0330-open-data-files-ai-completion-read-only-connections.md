---
title: 'v0.33.0: Open Data Files, AI Completion, and Read-Only Connections'
date: '2026-11-16T09:30:00+00:00'
release: 'v0.33.0'
tags: ['release', 'feature', 'bugfix', 'editor', 'ai', 'connections', 'postgres', 'mysql', 'notebook', 'plugin', 'community']
excerpt: 'Open a CSV, JSON or Parquet file as a table, get AI completions in the editor, lock a connection to read-only and preview the rows an UPDATE would touch.'
og:
    title: 'v0.33.0:'
    accent: 'Open the file'
    claim: 'Open a CSV, JSON or Parquet file as a table, with no connection to set up first.'
    image: '/img/tabularis-open-data-file.png'
---

# v0.33.0: Open Data Files, AI Completion, and Read-Only Connections

**v0.33.0** follows [v0.32.0](/blog/v0320-table-transfer-sql-snippets-plan-comparison) with a release about getting to the data and not breaking it. A CSV, TSV, JSON, NDJSON or Parquet file now opens as a table without creating a connection first. The editor gains AI ghost-text completion, a Fix with AI button on failed queries and an opt-in Vim mode. A connection can be locked to read-only, and on PostgreSQL an `UPDATE` or `DELETE` can be previewed before it runs. Connections can also go through a Unix socket, locally or over SSH.

---

## Open a Data File as a Table

**Open data file…** opens a CSV, TSV, JSON, NDJSON or Parquet file in a table tab with the regular data grid, in the desktop app and in `tabularis web`. It is on the Connections page, in the Add Connection menu and in the command palette; in the browser you can also drop a file on the window. On the desktop, a launch whose arguments are only data files opens them, which covers a file manager's **Open with** and `tabularis orders.csv` from a terminal. The installers register the five formats as an alternate handler, so Tabularis is offered but never becomes the default application.

The file becomes a view in a workspace database that Tabularis keeps per driver, saved once as a normal connection named "Data files". Filters, sorting, the SQL editor, exports and MCP therefore work on it with no special cases, and opened files stay listed until you drop them from the explorer.

Reading the file is the job of a plugin that declares the `data_files` capability. When none is installed, the dialog offers to install the DuckDB plugin and then opens the file that was waiting for it. [DuckDB 0.3.0](https://github.com/TabularisDB/tabularis-duckdb-plugin/releases/tag/v0.3.0) is the first version that supports it. Built in [#1464](https://github.com/TabularisDB/tabularis/pull/1464), closing [#1003](https://github.com/TabularisDB/tabularis/issues/1003).

<video src="/videos/posts/tabularis-open-data-file.mp4" poster="/videos/posts/tabularis-open-data-file.jpg" autoplay loop muted playsinline></video>

## AI in the Editor

**Inline completion.** SQL consoles can show AI continuations as ghost text. The setting is off by default and uses the provider and model already selected in AI settings, including Ollama and local OpenAI-compatible endpoints. Tab accepts and Escape dismisses, as usual in Monaco; accepting a suggestion never runs the query. When you enable it, the setting states what is sent: at most 4,000 characters before the cursor, 1,000 after it and up to 8,000 characters of cached table and column names. Result rows and credentials are never included. [@lejyfps](https://github.com/lejyfps) built it in [#1455](https://github.com/TabularisDB/tabularis/pull/1455).

**Fix with AI.** A failed query shows a **Fix with AI** button next to the error. It opens the AI dialog with the SQL and the error message already in the prompt; the corrected query goes into the editor and is not run automatically. [@Asymtode712](https://github.com/Asymtode712) added it in [#1327](https://github.com/TabularisDB/tabularis/pull/1327).

**External assistants.** AI providers can now ship as declarative packages installed from the registry, with Tabularis holding the credentials, proxy routing and timeouts. OpenAI, Anthropic, Ollama, OpenRouter, Requesty, MiniMax, OpenAI Compatible and API Route stay built in, and existing settings, saved models and custom endpoints are carried over. [Google Gemini](https://github.com/TabularisDB/tabularis-gemini-plugin) is the first external package ([#1337](https://github.com/TabularisDB/tabularis/pull/1337)). [@lejyfps](https://github.com/lejyfps) also added API Route as a provider ([#1459](https://github.com/TabularisDB/tabularis/pull/1459)) and let OpenAI-compatible providers run without an API key ([#1457](https://github.com/TabularisDB/tabularis/pull/1457)).

<video src="/videos/posts/tabularis-ai-inline-completion.mp4" poster="/videos/posts/tabularis-ai-inline-completion.jpg" autoplay loop muted playsinline></video>

## Read-Only Connections and Safer Writes

**Read-only mode** is a new connection setting that blocks writes on that connection, including SQL generated through text-to-SQL. The connection shows a badge and the editor a banner; editing and schema actions are disabled. The policy is enforced in the shared backend, so it applies to the desktop app, `tabularis web` and MCP, and covers queries, batches, row edits, schema changes and imports. On the built-in PostgreSQL, MySQL/MariaDB and SQLite drivers it is also enforced at the database level through a separate protected pool. Exports keep working. [@pokertour](https://github.com/pokertour) built it in [#1463](https://github.com/TabularisDB/tabularis/pull/1463), closing [#301](https://github.com/TabularisDB/tabularis/issues/301). Plugins can classify their own queries for this check through a new `query_classification` capability, so a non-SQL plugin such as MongoDB is no longer treated as writing everything ([@kobewl](https://github.com/kobewl), [#1324](https://github.com/TabularisDB/tabularis/pull/1324)).

**Preview changes (PostgreSQL).** The editor's context menu and toolbar offer **Preview changes** for a single-table `UPDATE` or `DELETE`. The dialog shows the current and proposed values for an `UPDATE`, the matching rows for a `DELETE`, the preview SQL, and warnings for a missing `WHERE`, truncation, triggers and rules. Nothing is written; **Run statement** goes through the normal execution path and its usual confirmations. Statements outside the supported subset (joins, `RETURNING`, CTEs, subqueries, side-effecting functions) are rejected with a reason. [@Detoy](https://github.com/Detoy) contributed [#1515](https://github.com/TabularisDB/tabularis/pull/1515), closing [#1404](https://github.com/TabularisDB/tabularis/issues/1404).

The write check also got stricter: a `DELETE` or `UPDATE` inside a CTE now asks for confirmation ([#1451](https://github.com/TabularisDB/tabularis/pull/1451)), and PRAGMA setters and `SELECT INTO` count as writes ([#1472](https://github.com/TabularisDB/tabularis/pull/1472)), both by [@parthchilwerwar](https://github.com/parthchilwerwar).

<video src="/videos/posts/tabularis-preview-dml-changes.mp4" poster="/videos/posts/tabularis-preview-dml-changes.jpg" autoplay loop muted playsinline></video>

## SQL Files and Git

A new **SQL Files** tab in the explorer links a local folder and lists its `.sql`, `.psql` and `.pgsql` scripts. Scripts open in regular editor tabs; if the file changed on disk, saving asks whether to reload, overwrite or save a copy ([@Asymtode712](https://github.com/Asymtode712), [#1423](https://github.com/TabularisDB/tabularis/pull/1423)).

When the folder is in a Git repository, the desktop app can show the diff of the saved scripts and commit the ones you select. Unsaved editor drafts and unrelated staged files are left alone, commit hooks and signing are honored, and a stale review or an in-progress merge stops the commit. There are no reset, clean or remote operations. [@lejyfps](https://github.com/lejyfps) built it in [#1454](https://github.com/TabularisDB/tabularis/pull/1454), closing [#1418](https://github.com/TabularisDB/tabularis/issues/1418).

<video src="/videos/posts/tabularis-sql-files-git.mp4" poster="/videos/posts/tabularis-sql-files-git.jpg" autoplay loop muted playsinline></video>

## Connections: Unix Sockets, Project Files and Reconnects

**Unix sockets.** MySQL/MariaDB and PostgreSQL connections can use a Unix socket in place of host and port. PostgreSQL accepts a socket file or directory. Over SSH, Tabularis forwards to the socket on the remote server, including through a bastion; on Windows only that remote form is available. Plugins opt in with the `unix_socket` capability. [@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys) built it in [#1250](https://github.com/TabularisDB/tabularis/pull/1250), closing [#1002](https://github.com/TabularisDB/tabularis/issues/1002).

**Import from a project.** Connection import can scan a project folder for `.env` files and Docker Compose files and offer the databases it finds as candidates, through the existing preview and duplicate checks. The scan is bounded, skips `node_modules`, `.git` and similar folders, never follows symlinks and never executes anything ([@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys), [#1444](https://github.com/TabularisDB/tabularis/pull/1444)).

<div class="post-gallery">
  <img src="/img/tabularis-unix-socket-connection.png" alt="New PostgreSQL connection using a Unix socket path, with a successful connection test" loading="lazy">
  <img src="/img/tabularis-import-project-config.png" alt="Connection import listing candidates found in a project .env file and compose.yaml" loading="lazy">
</div>

**Reconnects.** A failed health check now tries one reconnect before giving up, and **Reconnect automatically** is an opt-in setting. Health checks also no longer fire in a burst after the machine wakes from sleep ([@Detoy](https://github.com/Detoy), [#1446](https://github.com/TabularisDB/tabularis/pull/1446)).

**SOCKS5 over SSH.** Drivers that connect to several hosts, such as a MongoDB replica set or a `mongodb+srv://` URI, can declare `socks5_proxy`; for them an SSH connection opens a SOCKS5 proxy instead of a single port forward ([@vinimcorrea](https://github.com/vinimcorrea), [#1467](https://github.com/TabularisDB/tabularis/pull/1467)). The MongoDB plugin side is merged and waits for its next release. The same PR makes SSH tunnels send keepalives and reopen a tunnel whose session has ended, where before a dropped tunnel stayed cached until a restart.

**MySQL timeout.** MySQL connections get a per-connection query timeout, and Stop now ends the query on the server instead of leaving it running ([@Detoy](https://github.com/Detoy), [#1466](https://github.com/TabularisDB/tabularis/pull/1466)).

:::newsletter:::

## Query Performance Insights

The query history has an **Insights** view. It groups executions by query shape and shows call counts, average and total time, failure rate, and a comparison with the previous 24 hours, 7 days or 30 days, with regressions sortable to the top. Repeated runs are counted even when the history list collapses identical consecutive queries. Timings come from Tabularis's own execution records, so it works for every driver and runs no monitoring SQL. [@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys) built it in [#1441](https://github.com/TabularisDB/tabularis/pull/1441), closing [#1413](https://github.com/TabularisDB/tabularis/issues/1413). History search can now also match error messages ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1492](https://github.com/TabularisDB/tabularis/pull/1492)).

![Query history Insights grouping executions by query shape with call counts, average and total time](/img/tabularis-query-insights.png)

## Vim Mode and Editor Settings

Settings → Appearance has a **Vim Mode** toggle for SQL editors, including notebook cells. The status and command line follow the theme, and Tabularis's run shortcuts keep working. [@M4Y4NK-V3RM4](https://github.com/M4Y4NK-V3RM4) contributed it in [#957](https://github.com/TabularisDB/tabularis/pull/957), closing [#686](https://github.com/TabularisDB/tabularis/issues/686). The same tab now has **Show Minimap** ([#1450](https://github.com/TabularisDB/tabularis/pull/1450)) and **Show spaces and tabs** with None, Selection or All ([#1500](https://github.com/TabularisDB/tabularis/pull/1500)), both by [@lejyfps](https://github.com/lejyfps).

<video src="/videos/posts/tabularis-vim-mode.mp4" poster="/videos/posts/tabularis-vim-mode.jpg" autoplay loop muted playsinline></video>

## Transfers and Exports

**Copy rows between connections.** A guided transfer copies rows from a PostgreSQL table into an existing PostgreSQL or SQLite table. Columns are mapped by name or by hand, the plan is checked before anything is written, and values that would lose information are rejected rather than converted. Writes are append-only, in batches that each commit separately, and can be cancelled between batches. Plugin drivers do not get this yet. [@Asymtode712](https://github.com/Asymtode712) built it in [#1421](https://github.com/TabularisDB/tabularis/pull/1421).

**Export every row.** Every export format (CSV, JSON, NDJSON, Markdown, HTML) now streams through the backend, with a choice between **All rows** and the **Current results** in the grid. When the grid already holds the full result, the query is not run again ([@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys), [#1240](https://github.com/TabularisDB/tabularis/pull/1240)).

<div class="post-gallery">
  <img src="/img/tabularis-table-row-transfer.png" alt="Transfer plan from a PostgreSQL orders table to a SQLite orders_archive table with column mapping and conversions" loading="lazy">
  <img src="/img/tabularis-export-all-rows.png" alt="Export menu with the All rows and Current results choice on a paginated result" loading="lazy">
</div>

**Whole-database dumps through plugins.** A plugin can now offer its own native backup format next to SQL, and generic-dialect triggers can be edited as a complete statement without dropping the existing trigger first ([@lejyfps](https://github.com/lejyfps), [#1470](https://github.com/TabularisDB/tabularis/pull/1470)). Data dumps also use a plugin's own SQL renderers ([#1469](https://github.com/TabularisDB/tabularis/pull/1469)). The Firebird 1.0 plugin is the first to use both; see below.

## Notebooks

A SQL cell can show a one-row result as a **KPI** card, with a chosen column, label, decimals, prefix and suffix. The card is collapsible like the chart, and states such as "no rows" or "not a number" are shown instead of a guessed value ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1533](https://github.com/TabularisDB/tabularis/pull/1533)). The outline can be filtered by text and shows which SQL cell is running ([@virTripathi](https://github.com/virTripathi), [#1519](https://github.com/TabularisDB/tabularis/pull/1519), [#1520](https://github.com/TabularisDB/tabularis/pull/1520)). Cells can be duplicated to the end of the notebook ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1523](https://github.com/TabularisDB/tabularis/pull/1523)) and their source copied from the header ([@anubhavaanand](https://github.com/anubhavaanand), [#1522](https://github.com/TabularisDB/tabularis/pull/1522)).

![Notebook with an outline and two SQL cells showing their one-row results as KPI cards](/img/tabularis-notebook-kpi.png)

## Explorer and Schema

**Show Usage** on a column in the explorer collects its declared foreign keys, references in view definitions and matches in this connection's query history. Each item shows its source, an excerpt and a confidence level; it does not claim to be complete lineage ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1479](https://github.com/TabularisDB/tabularis/pull/1479), closing [#1407](https://github.com/TabularisDB/tabularis/issues/1407)). The ER diagram has a legend for keys and relationship types ([#1428](https://github.com/TabularisDB/tabularis/pull/1428)) and Visual EXPLAIN can copy the selected node's details ([#1424](https://github.com/TabularisDB/tabularis/pull/1424)), both by [@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys). Drivers that support it let you edit column comments ([@lejyfps](https://github.com/lejyfps), [#1453](https://github.com/TabularisDB/tabularis/pull/1453)).

![Show Usage panel for orders.customer_id with a declared foreign key, a view reference and query-history matches](/img/tabularis-column-usage.png)

## Snippets

The snippet library can be searched and filtered by scope ([#1497](https://github.com/TabularisDB/tabularis/pull/1497)), a snippet can be duplicated ([#1495](https://github.com/TabularisDB/tabularis/pull/1495)), and the library exported as JSON ([#1498](https://github.com/TabularisDB/tabularis/pull/1498)), all by [@lejyfps](https://github.com/lejyfps).

![SQL snippet library searched for orders and filtered to the PostgreSQL scope](/img/tabularis-snippets-search.png)

## For Plugin Authors

- **Routine debugging host.** A driver that declares `routine_debug` gets a debugger from the routine context menu: inputs, breakpoints, stepping, stack, watches and OUT/return values ([@lejyfps](https://github.com/lejyfps), [#1460](https://github.com/TabularisDB/tabularis/pull/1460)). The saved read-only policy applies to debugging sessions too ([#1468](https://github.com/TabularisDB/tabularis/pull/1468)). No released plugin uses it yet; the Oracle implementation is [in review](https://github.com/TabularisDB/tabularis-oracle-plugin/pull/26).
- **Provider workspaces.** Cloud plugins can add account onboarding and connection-scoped service tabs, with their UI in sandboxed frames and credentials in host storage. [@NewtTheWolf](https://github.com/NewtTheWolf) built the host in [#1445](https://github.com/TabularisDB/tabularis/pull/1445); the [Neon plugin](https://github.com/TabularisDB/neon-plugin) is its first, preview-only user.
- **New capabilities:** `data_files`, `unix_socket`, `socks5_proxy`, `query_classification` and `read_only_queries`, documented in the plugin guide.

## Around the Ecosystem

### Plugins

**[Firebird 1.0.0](https://github.com/TabularisDB/tabularis-firebird-plugin/releases/tag/v1.0.0)** by [@lejyfps](https://github.com/lejyfps) is the first stable release for Firebird 3, 4 and 5: interactive transactions, cancellation and timeouts, grid writes, schema builders, routines, triggers and query plans. Native `.fbk` backup and create-only restore go through Firebird's Services API, with no local Firebird installation or `gbak` needed.

**[SQL Server 1.0.1](https://github.com/TabularisDB/tabularis-sqlserver-plugin/releases/tag/v1.0.1)** adds NTLM authentication with `DOMAIN\user` on every platform, including Linux and macOS, contributed by [@egertaia](https://github.com/egertaia) ([#58](https://github.com/TabularisDB/tabularis-sqlserver-plugin/pull/58)).

**[Db2 0.1](https://github.com/TabularisDB/tabularis-db2-plugin/releases/tag/v0.1.1)** fixes schema metadata, typed values, DDL and row edits on tables without a primary key, and adds Visual EXPLAIN from `db2exfmt` reports. The [Oracle](https://github.com/TabularisDB/tabularis-oracle-plugin/releases/tag/v0.1.3) plugin parses `DBMS_XPLAN` reports in the same way.

**[CockroachDB 0.1.0-alpha.3](https://github.com/TabularisDB/tabularis-cockroachdb-plugin/releases/tag/v0.1.0-alpha.3)** lists, describes and refreshes materialized views, and **[Trino 0.1.15](https://github.com/TabularisDB/tabularis-trino-plugin/releases/tag/v0.1.15)** bounds result buffering for paginated queries, both by [@1-DARK](https://github.com/1-DARK). **[Google Gemini](https://github.com/TabularisDB/tabularis-gemini-plugin)** is the first external AI assistant package.

### Explain Plan

The [online EXPLAIN visualizer](https://explain.tabularis.dev) reads native Db2 and Oracle plan reports, and moves to `@tabularis/explain` 0.3.0 with asynchronous parsing ([#17](https://github.com/TabularisDB/explain-plan/pull/17)).

### Tabularium

[Tabularium 0.25.3](https://github.com/TabularisDB/tabularium/releases/tag/v0.25.3) adds the preset for the new declarative AI assistant package kind ([#35](https://github.com/TabularisDB/tabularium/pull/35)).

## Smaller Things

- **Grid and viewers:** edit Boolean values with checkboxes and narrow the column picker to matching columns ([@lejyfps](https://github.com/lejyfps), [#1501](https://github.com/TabularisDB/tabularis/pull/1501), [#1496](https://github.com/TabularisDB/tabularis/pull/1496)); wrap lines in the text cell viewer ([@Abhishek8841](https://github.com/Abhishek8841), [#1517](https://github.com/TabularisDB/tabularis/pull/1517)); expand read-only JSON trees to a chosen depth ([@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca), [#1529](https://github.com/TabularisDB/tabularis/pull/1529)); edit text stored in a BLOB as text in the row editor ([@parthchilwerwar](https://github.com/parthchilwerwar), [#1452](https://github.com/TabularisDB/tabularis/pull/1452)).
- **Settings:** search keyboard shortcuts by action or key combination ([@Xnadir](https://github.com/Xnadir), [#1493](https://github.com/TabularisDB/tabularis/pull/1493)); a persistent **Interface scale** for the desktop app ([@NewtTheWolf](https://github.com/NewtTheWolf)).
- **Web:** `tabularis web` can be served under a sub-path with `TABULARIS_BASE_PATH` ([#1426](https://github.com/TabularisDB/tabularis/pull/1426)).
- **Fixes:** PostgreSQL resolves foreign keys that point to another schema ([@wuzi](https://github.com/wuzi), [#1474](https://github.com/TabularisDB/tabularis/pull/1474)); Visual EXPLAIN parses never-executed nodes and Buffers in PostgreSQL text plans ([#1548](https://github.com/TabularisDB/tabularis/pull/1548)); generated `CREATE TABLE` escapes identifiers and TSV clipboard import keeps an empty first cell ([@Xnadir](https://github.com/Xnadir), [#1532](https://github.com/TabularisDB/tabularis/pull/1532), [#1494](https://github.com/TabularisDB/tabularis/pull/1494)); theme installs wait briefly for a lock that looks held ([@kobewl](https://github.com/kobewl), [#1527](https://github.com/TabularisDB/tabularis/pull/1527)); the environment selector closes cleanly when you click another control ([@shah-avetta](https://github.com/shah-avetta), [#1111](https://github.com/TabularisDB/tabularis/pull/1111)); Firebird PSQL and cancellation state are preserved ([#1462](https://github.com/TabularisDB/tabularis/pull/1462)); keychain failures are reported as such, not as an unreachable SSH server ([#934](https://github.com/TabularisDB/tabularis/pull/934)).

## Thanks

Thanks to [@lejyfps](https://github.com/lejyfps) for AI inline completion, Git commits from SQL Files, whole-database plugin dumps, the routine debugging host, editor and snippet work, and Firebird 1.0; [@markankamaransheogarat-sys](https://github.com/markankamaransheogarat-sys) for Unix sockets, project import, query Insights and streamed exports; [@Asymtode712](https://github.com/Asymtode712) for SQL Files, row transfers and Fix with AI; [@pokertour](https://github.com/pokertour) for read-only connections; [@Detoy](https://github.com/Detoy) for change previews, reconnects and the MySQL timeout; [@shu-chen-dot-ca](https://github.com/shu-chen-dot-ca) for KPI cards, Show Usage and notebook and history work; [@M4Y4NK-V3RM4](https://github.com/M4Y4NK-V3RM4) for Vim mode; and [@NewtTheWolf](https://github.com/NewtTheWolf) for provider workspaces. Thanks also to [@parthchilwerwar](https://github.com/parthchilwerwar), [@kobewl](https://github.com/kobewl), [@vinimcorrea](https://github.com/vinimcorrea), [@virTripathi](https://github.com/virTripathi), [@anubhavaanand](https://github.com/anubhavaanand), [@Xnadir](https://github.com/Xnadir), [@Abhishek8841](https://github.com/Abhishek8841), [@wuzi](https://github.com/wuzi) and [@shah-avetta](https://github.com/shah-avetta) for the changes above. In the ecosystem, thanks to [@egertaia](https://github.com/egertaia) for NTLM in SQL Server and [@1-DARK](https://github.com/1-DARK) for the CockroachDB and Trino releases.

If you open CSV or Parquet files more often than you open a database, or you want a connection that cannot write, this is the upgrade.

:::contributors:::

---

_Download the latest published version from the [download page](/download). Release notes and packages are available on [GitHub Releases](https://github.com/TabularisDB/tabularis/releases)._
