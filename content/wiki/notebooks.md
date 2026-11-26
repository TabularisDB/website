---
title: "SQL Notebooks"
order: 4.5
excerpt: "Create interactive multi-cell workspaces that combine SQL queries, Markdown documentation, charts, and cross-cell variables in a single document."
category: "Core Features"
---

**SQL Notebooks** bring a notebook-style workflow to Tabularis. Instead of juggling multiple console tabs, you can organize SQL queries and documentation into a single, structured document — run cells individually or sequentially, visualize results with charts, and share the whole thing as an HTML export.

<video src="/videos/wiki/04-sql-notebook.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Creating a Notebook

Click the **New Notebook** button (book icon) in the tab bar. A new tab opens with an empty notebook. From here you can add two types of cells:

- **SQL** — a full Monaco editor with execution, inline results, charts, and per-cell schema selection.
- **Markdown** — a text block with editing and preview toggle, useful for documenting queries, adding notes, or logically separating sections.

Use the **+ Add Cell** buttons between cells (or at the bottom of the notebook) to insert new SQL or Markdown blocks wherever you need them.

## SQL Cells

Each SQL cell is a self-contained query environment:

- **Monaco editor** with full syntax highlighting and context-aware autocomplete (same engine as the SQL Editor).
- **Execute** with the play button or `Cmd/Ctrl + Enter` to run the cell.
- **Inline results** appear directly below the cell — no need to switch views.
- **Per-cell schema selector** — useful with multi-database connections, each cell can target a different database or schema.
- **Resizable results panel** — drag the handle to adjust how much space results occupy.

![Per-cell database selector dropdown](/img/posts/tabularis-notebook-multi-database-selector-dropdown.png)

### Inline Query Plans

Since v0.24.0, SQL cells on connections with EXPLAIN support have a **Show query plan** button in the cell header. It opens a resizable **Query Plan** section with the same views as [Visual EXPLAIN](/wiki/visual-explain), a Re-run button and a popout to the full viewer. The popout reuses the fetched plan without another database request. Plan visibility is saved per cell and included in notebook exports.

- Opening the section requests plain **EXPLAIN** once. **Analyze** is off initially; selecting it does not execute a query until you click **Re-run**. ANALYZE really executes SQL, including writes for data-modifying statements.
- The plan uses resolved `@param` values and `{{cell_N}}` references. Missing cell results are listed as unresolved references, and no request is sent until they are available.
- Changing the query, connection or schema invalidates the displayed plan and resets the source-specific Analyze choice. Click Re-run for a fresh plan; running the cell does not automatically refresh EXPLAIN.
- The section can be resized independently. Moving a cell preserves its editor and plan state.

<video src="/videos/posts/tabularis-notebook-query-plan.mp4" poster="/videos/posts/tabularis-notebook-query-plan.jpg" controls autoplay loop muted playsinline></video>

### Charts

After running a SQL cell, click the **Chart** toggle in the result toolbar to visualize the data.

![Bar chart with column selector](/img/posts/tabularis-notebook-bar-chart-column-selector.png)

Three chart types are supported:

| Type | Best for |
|------|----------|
| **Bar** | Comparing discrete categories |
| **Line** | Trends over time or ordered sequences |
| **Pie** | Proportional breakdowns |

Configure the chart by selecting a **label column** (X axis / categories) and one or more **value columns** (Y axis / slices). Charts are rendered with Recharts and update live as you change the configuration.

![Line and pie chart examples](/img/posts/tabularis-notebook-line-chart-pie-chart-variety.png)

### KPI Card

Since v0.33.0, a SQL cell whose query returns a single row can show one value as a large **KPI** card under the results. Open the **KPI** section in the result area and set the **Column**, **Label**, **Decimals** (**Auto** keeps the value's own digits), **Prefix** and **Suffix**. The first time it opens, the first numeric column is picked. The result table stays where it is, and the section is collapsible like the chart.

![Notebook with an outline and two SQL cells showing their one-row results as KPI cards](/img/tabularis-notebook-kpi.png)

Instead of guessing a value, the card states why there is nothing to show: the cell has not run, the query failed, it returned no rows or more than one row, the configured column is missing, the value is NULL, or the value is not a number. Large numbers and decimals are formatted exactly, with the locale's grouping and decimal separator. Changing a KPI setting does not run the query; the configuration is saved with the notebook and is undoable. The card only reads the result the cell already returned, so it works the same for every driver.

### Execution History

Each SQL cell keeps a local history of its last 10 executions. Click the **History** icon in the cell header to browse previous queries and results. This is useful for comparing how results change as you iterate on a query.

![Execution history panel](/img/posts/tabularis-notebook-execution-history-panel.png)

## Markdown Cells

Markdown cells support standard Markdown syntax. Toggle between **Edit** and **Preview** mode with the eye icon. In preview mode, the rendered Markdown is displayed inline. These cells are ideal for:

- Documenting the purpose of a query or section.
- Adding headings to organize the notebook visually.
- Writing notes about findings or next steps.

## Cross-Cell Variables

SQL cells can reference another cell's result using `{{cell_N}}` syntax, where `N` is the cell's position in the notebook (1-based, counting Markdown cells too). At execution time, `{{cell_N}}` is expanded into a Common Table Expression (CTE) named `cell_N` holding the **full result** of that cell, so you use it like a table. When you run a cell that contains an unresolved reference, the notebook automatically detects the dependency and executes the referenced cell first.

**Example:**

1. The third cell runs `SELECT id, username FROM users LIMIT 10`.
2. A later cell uses `SELECT * FROM orders WHERE user_id IN (SELECT id FROM {{cell_3}})`.
3. When you run that cell, Tabularis detects the dependency, runs cell 3 first (if needed), wraps its result in a `WITH cell_3 AS (...)` CTE, and runs your query against it.

This enables building multi-step analytical workflows where each cell builds on the results of previous ones.

![Cross-cell variable references and query chaining](/img/posts/tabularis-notebook-cell-references-cte-query-chaining.png)

## Notebook Parameters

Notebooks support a global parameter system using `@paramName` (or `${paramName}`) syntax. Open the **Parameters** panel from the toolbar to define parameters. Each reference is substituted across all SQL cells at execution time. A reference to an undefined parameter is left as is (it may be a native SQL variable).

This is useful for:
- Running the same notebook against different date ranges or IDs without editing every cell.
- Sharing notebooks with colleagues who can plug in their own values.

![Parameters panel](/img/posts/tabularis-notebook-parameters-panel-variables.png)

### Raw Parameters

A parameter is **Raw** until you give it a type. A raw value is pasted into the SQL as typed and takes effect immediately, so add quotes yourself when it is a string literal (for example `'2024-01-01'`); `'${name}'` inside quotes is still replaced. Without quotes, `@start` = `2026-01-01` is sent as `2026-01-01`, which SQLite and MySQL evaluate as the number 2024 and PostgreSQL rejects when compared with a date.

### Typed Parameters

Since v0.34.0 the **Type** selector on each row makes a parameter typed: **Text**, **Number**, **Boolean**, **Date**, or **List** (options, one per line). A typed value is validated and written as a SQL literal for the connection's dialect:

| Type | Sent as |
|------|---------|
| **Text** | A quoted string, escaped for the dialect (`O'Brien` → `'O''Brien'`) |
| **Number** | The digits as typed; a negative number in parentheses, so `10-@n` cannot become `10--5` |
| **Boolean** | The dialect's boolean literals |
| **Date** | A quoted `YYYY-MM-DD` |
| **List** | The chosen option, as a quoted string |

Each typed row also has **NULL**, which sends `NULL`, and **Required**. An invalid value shows its reason under the row, for example *Not a valid date* or *Must be true or false*, and stops every cell that references it. When a raw value is switched to Boolean, `true`, `false`, `1` and `0` in any case are read; anything else is kept and flagged.

Edits to typed rows are drafts. **Apply** commits all of them in one undoable change and runs nothing; it is enabled when something is pending and every row is valid. **Discard** drops the drafts. Runs always use the applied values, and drafts are never saved with the notebook.

- A typed reference is replaced only in code. `${name}` inside a string or a quoted identifier stops the cell and its query plan with an error naming the parameter; inside a comment it is left as written. `@name` in a string or comment stays text.
- Typed parameters are available on PostgreSQL, MySQL/MariaDB and SQLite, and on plugin drivers whose declared dialect resolves to one of them. On other connections the selector is disabled with the reason, and a cell that references a typed parameter stops with an error instead of sending it.
- A type this version does not know, for example from a newer release, is shown as **Unknown (type)** with a read-only value. Cells that use it stop with *This version of Tabularis does not know this type*, the entry is saved back unchanged, and Apply stays disabled until you switch it to Raw or a known type, or remove it.
- Versions before v0.34.0 read a typed parameter as raw text.

<video src="/videos/posts/tabularis-notebook-typed-parameters.mp4" poster="/videos/posts/tabularis-notebook-typed-parameters.jpg" controls autoplay loop muted playsinline></video>

## Cell Management

### Naming Cells

Click the cell name in the header to rename it. Cell names appear in the outline panel; cross-cell variable references always use the cell position (`{{cell_N}}`), not the name. Unnamed cells show as "Untitled" with a preview of their content.

### Reordering

Drag and drop cells to reorder them. Grab the drag handle on the left side of the cell header and move the cell to a new position, or use the **Move Up** / **Move Down** arrows in the cell header.

### Duplicating Cells

**Duplicate to End** in the cell header appends a copy of a SQL or Markdown cell as the last cell of the notebook. Existing cells keep their position, so `{{cell_N}}` references keep pointing where they did. The copy keeps the content, name, schema and chart settings, but not the result, error or execution history, and its query plan starts closed. Nothing is executed, and the button is disabled while a cell or Run All is running. The duplication is a single undoable edit.

### Copying the Source

**Copy source** in the cell header copies the cell's content exactly as written, including comments and unresolved `@param` or `{{cell_N}}` placeholders. It works on collapsed cells and is disabled when the cell is empty. Results are not copied.

### Disabling Cells

Since v0.34.0 the power toggle in a SQL cell header (**Disable cell** / **Enable cell**) switches a cell off without deleting it. A disabled cell keeps its source, settings and last output and shows a **Disabled** badge, but nothing sends it to the database: its run button is disabled, Run All counts it as skipped, it is never run as a dependency, and its query plan cannot be opened, since opening one sends EXPLAIN. If an earlier output is still shown, a notice says it is not current.

A cell that references a disabled cell, directly or through referenced cells that would have to run first, shows *Blocked: prerequisite {{cell_N}} is disabled* and sends nothing. A disabled cell's cached output is never substituted into another cell. The Run All summary counts blocked cells separately, with links to each one and to the disabled cell it waits on, and a blocked cell does not trigger **Stop on Error**. Disabling and enabling are undoable edits saved with the notebook, and enabling a cell runs nothing. **Export SQL source** still includes the SQL of disabled cells.

![A disabled SQL cell keeping its earlier output, a dependent cell blocked on it, and the Run All summary with one skipped and one blocked cell](/img/tabularis-notebook-disabled-cell.png)

### Collapsing

Click the collapse arrow in the cell header to minimize a cell — useful for hiding setup queries you don't need to see while working on later cells. The toolbar provides **Collapse All** and **Expand All** buttons for bulk operations.

![Collapsed and expanded cells](/img/posts/tabularis-notebook-collapsed-expanded-cells-organization.png)

Inside an SQL cell you can also collapse its areas **independently** — the **Query** editor, the **Results** grid, the **Chart**, and the optional **Query Plan** — each via a thin labelled header with its own chevron, on top of the master cell collapse. The chart header appears only when the result is chartable. The collapsed state of every section is saved with the notebook, so it persists across reloads, and chart visibility is persisted too (it defaults to whether a chart config already exists, so notebooks created before this change keep showing their charts).

<video src="/videos/posts/tabularis-notebooks-collapse.mp4" poster="/videos/posts/tabularis-notebooks-collapse.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Run All

Click **Run All** in the notebook toolbar (or press `Cmd/Ctrl + Shift + Enter`) to execute all SQL cells. Cells that use the same database run one by one in document order; a cell without its own database uses the notebook's. Since v0.34.0 each database has its own queue and the queues run at the same time, so a cell aimed at another database no longer waits for unrelated statements. A cell that reads an earlier cell's result through `{{cell_N}}` waits for that cell, even when it is on another database. Options:

- **Stop on Error** — halts execution when a cell fails. Since v0.34.0 it skips only the remaining cells on the same database. A cell elsewhere that reads a skipped cell is skipped too, instead of reusing an output from a previous run.
- **Summary** — after completion, a summary panel shows success/failure/skipped counts, and since v0.34.0 [blocked](#disabling-cells) cells, with links to any errors.

### Parallel cells

Toggle **Parallel Execution (Run All)** in a SQL cell header to mark it as parallel. During Run All, all parallel cells start together first, then the per-database queues run.

![Parallel execution of concurrent cells](/img/posts/tabularis-notebook-parallel-execution-concurrent-cells.png)

## Report View

Since v0.34.0 the **Edit** / **Report** switcher in the notebook toolbar turns the notebook into a read-only report of its outputs. Switching runs nothing, keeps the current outputs and does not change which cells are collapsed.

The report shows the included cells in notebook order: Markdown cells rendered, and for each SQL cell its name, [KPI card](#kpi-card), chart and result table, without the SQL. A cell that has not run, is running or failed says so, and an output is marked **Outdated** when the query changed after it ran or when parameters were applied after it. The **Parameters** panel, **Run All** and the export menu stay available; the other editing tools are hidden until you switch back to **Edit**.

Every cell header has an **Include in Report** / **Exclude from Report** toggle. Cells are included by default, including those of notebooks saved before v0.34.0. The flag is saved with the notebook, kept in exports and undoable. When no cell is included, the report says so and offers a button back to Edit.

<video src="/videos/posts/tabularis-notebook-report-view.mp4" poster="/videos/posts/tabularis-notebook-report-view.jpg" controls autoplay loop muted playsinline></video>

## Outline

The **Outline** side panel shows the notebook structure at a glance — every cell listed with its name (or a content preview for unnamed cells). Click any entry to scroll directly to that cell. The outline updates in real time as you add, rename, or reorder cells.

Since v0.33.0, the **Filter outline...** field at the top narrows the entries to those whose displayed text (cell name, Markdown heading or fallback label) contains the typed text, case-insensitively; `Escape` clears it. The filter is not saved with the notebook. SQL entries also show an execution status icon: **Running**, **Failed** or **Output available**. The status reflects the current session, so clearing outputs removes it.

![Outline panel with cell navigation](/img/posts/tabularis-notebook-outline-panel-cell-navigation.png)

## AI Integration

If you have an AI provider configured in Settings, notebooks offer additional capabilities:

- **Generate SQL** — use the AI overlay to generate SQL from natural language, same as in the regular editor.
- **Explain Query** — ask the AI to explain the SQL in a cell.
- **Cell Naming** — click the AI icon on any cell to automatically generate a descriptive name based on its content. Click the sparkles icon in the **Outline** panel (*Generate names for unnamed cells with AI*) to batch-generate names for all unnamed cells. The naming prompt is customizable in **Settings > AI > Notebook Cell Name Prompt**.

![AI explain buttons and history](/img/posts/tabularis-notebook-ai-explain-buttons-history.png)

## Managing Notebooks

Notebooks are managed from the **Notebooks** section in the sidebar, which lists the saved notebooks for the active connection. From here you can:

- **Search** the list by name.
- **Open** a notebook with a single click.
- Use the context menu to **rename**, **export**, **import**, **delete** (with confirmation), or **Export as HTML**.

The list refreshes live — creating a notebook adds it immediately, and renames or deletions reflect without a manual reload. You can also rename a notebook directly from its editor tab by double-clicking the title.

### Edit History

Notebook editing is undoable. Every structural change — adding, removing, reordering, or editing cells — is captured into a timeline. Open the **history panel** to scrub back through previous states and jump to any point; each entry is labeled by what changed. When focus is not inside a cell editor or input, `Cmd/Ctrl + Z` undoes and `Cmd/Ctrl + Shift + Z` (or `Ctrl + Y`) redoes.

![Notebook edit history panel](/img/posts/tabularis-notebook-edit-history.png)

## Persistence

Notebooks are saved automatically to disk in the app config directory (JSON format), organized **per connection** under `notebooks/<connectionId>/<notebookId>`. Legacy flat notebooks from older versions are migrated automatically the first time you open them. Saving is debounced — changes are written after you stop editing, not on every keystroke.

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/tabularis/notebooks/` |
| Linux | `~/.config/tabularis/notebooks/` |
| Windows | `%APPDATA%\tabularis\notebooks\` |

If you set a custom storage location, notebooks are stored there instead.

## Import & Export

### Notebook format

Export a notebook as a `.tabularis-notebook` file to share with colleagues. Import from the notebook toolbar or from the **Notebooks** sidebar context menu. Importing from the toolbar creates a new notebook from the file and switches the current tab to it; all cells, names, and parameters are preserved.

### HTML Export

Click **Export as HTML** to generate a standalone HTML document containing all cells, their results, and rendered Markdown. This is useful for sharing findings with non-technical stakeholders or archiving completed analyses.

### Markdown Export

Since v0.34.0 **Export Markdown** in the export menu, after **Export SQL source**, saves the notebook's source as a `<title>.md` file: Markdown cells as written and SQL cells in fenced `sql` code blocks, in notebook order. Collapsed cells are included, and `@name`, `${name}` and `{{cell_N}}` placeholders are copied verbatim. Results, charts, errors, timings, history, per-cell databases, cell names and parameter values are left out, and empty cells are skipped; a notebook with nothing to export shows a message instead of a save dialog.

The code fence is one backtick longer than the longest backtick run in the SQL, so backticks in a query cannot close the block early, and a Markdown cell that leaves a code block open gets a closing fence. Exporting runs nothing and does not save the notebook. Every notebook export includes an edit typed just before it.

### CSV / JSON

Individual cell results can be exported to CSV or JSON using the result toolbar, same as in the regular data grid. Since v0.24.0, exports report success or a write error; cancelling the file picker produces neither.

## Keyboard Shortcuts

| Action | macOS | Windows / Linux |
|--------|-------|-----------------|
| Run current cell | `Cmd + Enter` | `Ctrl + Enter` |
| Run All cells | `Cmd + Shift + Enter` | `Ctrl + Shift + Enter` |
| Undo / Redo notebook edits | `Cmd + Z` / `Cmd + Shift + Z` | `Ctrl + Z` / `Ctrl + Shift + Z` or `Ctrl + Y` |

The Run All shortcut can be changed in **Settings → Keyboard Shortcuts**.

## Clear Outputs and Export SQL

Since v0.32.0, the notebook toolbar can clear outputs, and SQL cell source can be exported to a `.sql` file.

![A notebook SQL cell showing six SQLite rows](/img/tabularis-notebook-output.png)

![The Clear Outputs confirmation in a notebook with query results](/img/tabularis-notebook-clear.png)

![The notebook export menu with the SQL export option](/img/tabularis-notebook-export.png)
