---
title: 'v0.27.0: Filter From a Cell, Columns That Hold Still, and T-SQL That Runs as a Batch'
date: '2026-10-08T13:25:00'
release: 'v0.27.0'
tags: ['release', 'feature', 'bugfix', 'data-grid', 'ui', 'ux', 'editor', 'sql-server', 'plugin', 'community']
excerpt: 'v0.27.0 adds filter-by-value to the cell menu, zebra stripes and column widths that stay put while you scroll, runs T-SQL scripts as one batch, and stops Visual Explain and the routine Run dialog from executing writes you did not ask for.'
og:
    template: 'screenshot-split'
    title: 'v0.27.0:'
    accent: 'Grid, Batches, Safety'
    claim: 'Filter a table from the cell you are looking at, scroll a wide result without the columns jumping, and run a T-SQL script the way SSMS does.'
    image: '/img/posts/v0270-og-shot.png'
    appLabel: 'tabularis'
---

# v0.27.0: Filter From a Cell, Columns That Hold Still, and T-SQL That Runs as a Batch

**v0.27.0** follows [v0.26.0](/blog/v0260-postgres-tab-transactions-command-palette-accessible-themes). That release was about the editor session; this one is a shorter cycle about the places you look at all day. The data grid gets a filter built from the cell under your mouse, optional zebra stripes, and column widths that no longer change as you scroll. The SQL editor names result tabs from a leading comment, turns a pasted column into an `IN (...)` list, and tells same-name tables from different schemas apart. SQL Server scripts run as one batch, split only on `GO`. Two fixes close holes where Tabularis executed a statement the user expected to review first: Visual Explain's **Analyze** default, and the **Run…** dialog for stored routines. Almost all of it comes from community pull requests, many of them picked up from issues we opened as starting points. Around the release, tabularis.dev itself was rebuilt and the wiki was checked page by page against the app.

---

## Filter by This Value

[@M4Y4NK-V3RM4](https://github.com/M4Y4NK-V3RM4) adds quick filters to the cell context menu in PR [#908](https://github.com/TabularisDB/tabularis/pull/908), closing [#853](https://github.com/TabularisDB/tabularis/issues/853). Right-click a cell in a table tab and the menu offers **Filter: `col` = this value** and **Filter: `col` <> this value**, or **IS NULL** / **IS NOT NULL** when the cell is `NULL`. The condition is added to the tab's current filter with `AND`, the existing filter is wrapped in parentheses so an `a OR b` keeps its meaning, and the grid reloads from page 1 with the new clause visible in the **WHERE** input, where you can edit it.

<video src="/videos/posts/tabularis-filter-by-value.mp4" poster="/videos/posts/tabularis-filter-by-value.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

The value is formatted per column type, not per appearance: `42` in an `integer` column is unquoted, `'42'` in a `varchar` column stays a string, booleans become `TRUE`/`FALSE`, and `O'Brien` is escaped. Identifiers are quoted for the active driver, so MySQL gets backticks and PostgreSQL and SQLite double quotes. The items are not offered on BLOB and JSON cells, unsaved insertion rows or ad-hoc query results, which have no table to filter. A follow-up commit keeps masked cells out of it: a cell hidden by [column masking](/wiki/data-grid#column-masking) only offers `IS NULL` / `IS NOT NULL`, so the real value never ends up in the filter text.

---

## Columns That Stay Where They Are

The result grid is virtualized: only the rows on screen are in the DOM. With an automatic table layout, every scroll step let the browser size the columns again from whichever rows happened to be rendered, so columns widened as long values came into view and narrowed again on the way back, and on a wide result the columns visible on screen kept changing. [@noone-silent](https://github.com/noone-silent) reported it in [#844](https://github.com/TabularisDB/tabularis/issues/844).

PR [#847](https://github.com/TabularisDB/tabularis/pull/847) keeps the first paint as it was, sized to the header and the first visible rows, then measures the header cells and locks those widths. From then on scrolling never reflows the columns; longer values are truncated with an ellipsis and remain available in the tooltip and the cell expander. Widths are measured again only when the column set changes, another query or another table, or when rows first arrive in a result that was empty. Paging and refreshing keep the current widths, and a grid hidden in an inactive tab waits until it is visible before measuring.

<video src="/videos/posts/tabularis-stable-column-widths.mp4" poster="/videos/posts/tabularis-stable-column-widths.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

Manual column resizing is not part of this release. Locked widths make it a natural next step, since there is now one place where widths are applied.

---

## Zebra Stripes, and Settings That Survive a Restart

Also from [@M4Y4NK-V3RM4](https://github.com/M4Y4NK-V3RM4), PR [#882](https://github.com/TabularisDB/tabularis/pull/882) closes [#854](https://github.com/TabularisDB/tabularis/issues/854) with **Settings → Appearance → Data Grid → Alternating row background**: every other row gets a light tint so a row is easier to follow across a wide table. It is off by default, uses theme tokens only, so it follows light, dark and installed themes, and applies to table tabs and query results alike. Selected, inserted and pending-delete rows keep their own colors, and edited cells keep their state styling on top of the stripe.

![Data grid with alternating row background enabled](/img/tabularis-grid-zebra-stripes.png)

While wiring it in, the same contributor found that the stripes setting and the existing **Sticky column headers** toggle were not part of the persisted app config, so both were reset by a restart. Both are now saved to `config.json` (`resultZebraStripes`, `stickyColumnHeaders`).

:::newsletter:::

---

## T-SQL Scripts Run as One Batch

SQL Server scopes `DECLARE @var`, temporary tables and `SET` options to the batch. Tabularis split every script on `;` and sent each statement as its own batch, so this failed on the second line with _"Must declare the scalar variable"_:

```sql
DECLARE @id UNIQUEIDENTIFIER = '...';
SELECT * FROM a WHERE id = @id;
SELECT * FROM b WHERE id = @id;
```

PR [#799](https://github.com/TabularisDB/tabularis/pull/799) by [@egertaia](https://github.com/egertaia) does what SSMS does. For dialects with a batch separator, which today means T-SQL and its `GO`, scripts are split only on `GO` and the semicolons stay inside the batch; every other dialect is split per statement exactly as before. All execution paths use the new splitter: the Run button, **Run All**, a selection, **Execute Selection**, the run dropdown and auto-run. On SQL Server, running at the cursor now runs the whole batch under it, up to the surrounding `GO`, and the Run button's label and the highlighted region count batches, so what the button says and what it sends cannot drift apart. The script above runs once and returns one result tab per `SELECT`, through the [SQL Server plugin](https://github.com/TabularisDB/tabularis-sqlserver-plugin)'s existing support for additional result sets; no plugin update is needed. Add `GO` where you want separate batches.

Grouping statements into one batch must not let a dangerous statement hide behind a harmless one, so the destructive query check still looks at each statement inside the batch: a `DELETE` without `WHERE` after a `SELECT` still asks for confirmation, and so does one inside a `CREATE PROCEDURE` body, as before.

---

## Nothing Runs Before You Have Seen It

Two fixes for actions that executed SQL the user had reason to think was only being prepared.

**Visual Explain no longer turns on Analyze for writes it did not recognize.** `EXPLAIN ANALYZE` really executes the statement, so Analyze defaults off, with a warning, for data-modifying statements. The check only looked at the first keyword for six statement types, so `REPLACE`, `MERGE`, data-modifying CTEs such as `WITH d AS (DELETE … RETURNING *) SELECT …`, and any write preceded by a comment opened with Analyze on and no warning, and fetching the plan changed data. [@TonyWu2333](https://github.com/TonyWu2333) fixes it in PR [#900](https://github.com/TabularisDB/tabularis/pull/900), closing [#884](https://github.com/TabularisDB/tabularis/issues/884). The first keyword is now read after leading comments and parentheses and checked against `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `REPLACE`, `UPSERT`, `TRUNCATE`, `CREATE`, `DROP`, `ALTER`, `GRANT`, `REVOKE`, `CALL`, `EXEC` and `EXECUTE`. A `WITH` statement is scanned for a write keyword outside strings and comments, with the masking applied under every SQL dialect Tabularis knows, so an apostrophe inside a PostgreSQL dollar-quoted string or a T-SQL bracket identifier cannot hide the `DELETE` that follows it. `SELECT … INTO` counts as a write too, since it creates a table. The scan errs towards caution: a read-only CTE with `FOR UPDATE` now also opens with Analyze off, and you can still tick it. Side-effecting functions called from a `SELECT` are not detected. This applies to the Visual Explain window and to notebook cells.

**Run… on a stored routine opens the call for review.** The dialog says _"Provide the parameter values, then review the generated SQL in the editor"_, but submitting it ran the generated `CALL` or `SELECT fn(...)` straight away, which for a procedure that modifies data skipped the review it promised. [@tosinxt](https://github.com/tosinxt) fixes it in PR [#899](https://github.com/TabularisDB/tabularis/pull/899), closing [#887](https://github.com/TabularisDB/tabularis/issues/887): the SQL now opens in a new console without running, like **Edit** and the SQL template actions, and the dialog's button reads **Open in Editor**.

---

## Editor Conveniences

- **Result tabs named from a comment** ([@w3lld1](https://github.com/w3lld1), PR [#874](https://github.com/TabularisDB/tabularis/pull/874), closes [#855](https://github.com/TabularisDB/tabularis/issues/855)): when you run several statements, a leading `-- Active customers` or `/* Active customers */` comment becomes that result's tab name. Whitespace is collapsed and the label is capped at 80 characters; statements without a comment keep the numbered name, and renaming a tab by hand still wins.

  <video src="/videos/posts/tabularis-result-tab-names.mp4" poster="/videos/posts/tabularis-result-tab-names.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

- **Convert Selection to SQL List** ([@Xnadir](https://github.com/Xnadir), PR [#880](https://github.com/TabularisDB/tabularis/pull/880), closes [#870](https://github.com/TabularisDB/tabularis/issues/870)): select values in the editor, for example a column pasted from a spreadsheet, and the context-menu action turns them into `'alice@example.com', 'bob@example.com'`, ready for `IN (...)`. It splits on newlines, tabs and commas, skips blanks and doubles embedded quotes. Purely numeric input stays unquoted, but values with a leading zero or `+` are treated as text, so IDs and phone numbers are not silently turned into numbers. Multi-cursor selections are converted in one undo step.

  <video src="/videos/posts/tabularis-convert-selection-sql-list.mp4" poster="/videos/posts/tabularis-convert-selection-sql-list.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

- **Schema names on same-name table tabs** ([@benedettoraviotta](https://github.com/benedettoraviotta), PR [#877](https://github.com/TabularisDB/tabularis/pull/877)): with `mira.clubs` and `mira_dev.clubs` open on one connection, both tabs used to read `clubs`. While the names collide, each tab reads `schema.table` in the tab bar and the tab switcher; close one and the other goes back to the plain name. Only the label changes, and custom tab titles are left alone.

---

## Around the Release

Not everything that happened this week shipped in the app.

**A new tabularis.dev.** The redesigned site you are reading this on went live this week. [@wajrock](https://github.com/wajrock) rebuilt it page by page, from the landing page and the wiki to downloads, plugins and the blog, and tells the story in [When the Project Outgrows the Site](/blog/tabularis-dev-rebuild-story). It also adds a [brand page](/brand) with the logos, icons, fonts and colors, for anyone writing about Tabularis. The [plugins page](/plugins) now lists every kind of package in the registry, with a badge on each card and its own page per kind: [drivers](/plugins/drivers) and [themes](/plugins/themes). The GitHub star and download counters, which often stayed blank because the browser hit GitHub's anonymous rate limit, are now part of the build.

**The wiki, checked against the app.** Every wiki page was audited against v0.26.0, and the claims that no longer matched, from config keys and UI labels to plugin protocol shapes, were corrected. Screenshots and videos were refreshed across the wiki. The plugin docs were split into [Installing Plugins](/wiki/installing-plugins), [Plugin System](/wiki/plugins), [Plugin Protocol](/wiki/plugin-protocol), [Building Your First Plugin](/wiki/building-plugins), [UI Extensions](/wiki/ui-extensions) and [Publishing Plugins](/wiki/plugin-development), which gains a pre-submit checklist and the common submit failures, plus a new [Plugin Kinds](/wiki/plugin-kinds) page generated from the registry's own schema.

**Claude for Startups.** Tabularis is now part of Anthropic's program for early-stage companies; [the announcement](/blog/tabularis-joins-claude-startups) explains what that includes and what it changes for a small open-source project.

**SQL Server plugin.** [@egertaia](https://github.com/egertaia) fixed schema introspection on databases running below compatibility level 110, where it failed with error 195 because of `TRY_CONVERT` (plugin PR [#34](https://github.com/TabularisDB/tabularis-sqlserver-plugin/pull/34)). The fix is merged and ships with the next [SQL Server plugin](https://github.com/TabularisDB/tabularis-sqlserver-plugin) release.

---

## Smaller Things

- **Reorder connections by drag** ([@benedettoraviotta](https://github.com/benedettoraviotta), PR [#878](https://github.com/TabularisDB/tabularis/pull/878)): on the Connections page, in grid and list view, dropping a connection onto another one in the same group moves it into that slot, with a dashed outline on the target. The order is saved and survives a restart. Dropping onto a different group still moves the connection there, now at the end of that group, and new, duplicated or imported connections sort after the ordered ones.
- **Several connection string examples per plugin** ([@DhruvShah-Dev](https://github.com/DhruvShah-Dev), PR [#851](https://github.com/TabularisDB/tabularis/pull/851), closes [#849](https://github.com/TabularisDB/tabularis/issues/849)): a driver plugin can declare `connection_string_examples`, a list of labelled presets with an optional description, and the New Connection form shows them in a selector beside the import field. It came from a user connecting to H2 through a JDBC plugin, where in-memory, file and TCP URLs all look different; opaque passthrough URIs such as `jdbc:h2:mem:test` are now accepted as they are. Existing manifests and the driver RPC are unchanged. See the [plugin manifest reference](/wiki/plugins).
- **Plugins scaffolded with `create-plugin` reach the host fallbacks** ([@tosinxt](https://github.com/tosinxt), PR [#898](https://github.com/TabularisDB/tabularis/pull/898), closes [#890](https://github.com/TabularisDB/tabularis/issues/890)): the `rust-driver` template answered unimplemented methods with `method '<name>' is not implemented by this plugin yet`, which the host's optional-method fallbacks, matching on `Method not found`, did not recognize. The template and the example in the plugin guide now return `Method not found: <method>` with code `-32601`. Plugins scaffolded earlier should change their catch-all message the same way.
- **Flatpak updates within minutes** ([@jing2uo](https://github.com/jing2uo), PR [#846](https://github.com/TabularisDB/tabularis/pull/846), closes [#326](https://github.com/TabularisDB/tabularis/issues/326)): publishing a stable release now notifies [FlatPark](https://flatpark.org/apps/dev.tabularis.Tabularis/), so the Flatpak update opens right away instead of on the next daily poll. Prereleases and nightlies are skipped.
- **A new README** ([@wajrock](https://github.com/wajrock), PR [#850](https://github.com/TabularisDB/tabularis/pull/850)): the README and its translations have a new layout with localized light and dark banners, plugin tables and a sponsors table, and the roadmap is synced with what has shipped: the command palette, SQL Server and the plugin registry are marked done.

---

## Thanks

Ten external contributors land in this release. **[@M4Y4NK-V3RM4](https://github.com/M4Y4NK-V3RM4)** added filter-by-value and zebra stripes, and fixed persistence for the sticky header setting along the way ([#908](https://github.com/TabularisDB/tabularis/pull/908), [#882](https://github.com/TabularisDB/tabularis/pull/882)). **[@egertaia](https://github.com/egertaia)** made T-SQL scripts run as one batch without weakening the destructive query check ([#799](https://github.com/TabularisDB/tabularis/pull/799)), and fixed SQL Server plugin introspection on older compatibility levels. **[@TonyWu2333](https://github.com/TonyWu2333)** stopped Visual Explain from analyzing writes it did not recognize ([#900](https://github.com/TabularisDB/tabularis/pull/900)), and **[@tosinxt](https://github.com/tosinxt)** fixed the routine **Run…** dialog and the `create-plugin` template ([#899](https://github.com/TabularisDB/tabularis/pull/899), [#898](https://github.com/TabularisDB/tabularis/pull/898)).

**[@benedettoraviotta](https://github.com/benedettoraviotta)** added connection reordering and schema labels on colliding tabs ([#878](https://github.com/TabularisDB/tabularis/pull/878), [#877](https://github.com/TabularisDB/tabularis/pull/877)), **[@w3lld1](https://github.com/w3lld1)** named result tabs from comments ([#874](https://github.com/TabularisDB/tabularis/pull/874)), **[@Xnadir](https://github.com/Xnadir)** wrote Convert Selection to SQL List ([#880](https://github.com/TabularisDB/tabularis/pull/880)), **[@DhruvShah-Dev](https://github.com/DhruvShah-Dev)** added connection string examples ([#851](https://github.com/TabularisDB/tabularis/pull/851)), **[@jing2uo](https://github.com/jing2uo)** wired up FlatPark ([#846](https://github.com/TabularisDB/tabularis/pull/846)), and **[@wajrock](https://github.com/wajrock)** redesigned the README ([#850](https://github.com/TabularisDB/tabularis/pull/850)) and rebuilt the website. Thanks also to **[@noone-silent](https://github.com/noone-silent)** for the report behind the column-width fix.

If you have ever lost a column off the right edge of the screen just by scrolling down, this is the upgrade.

:::contributors:::

---

_Download the latest published version from the [download page](/download). Release notes and packages are available on [GitHub Releases](https://github.com/TabularisDB/tabularis/releases)._
