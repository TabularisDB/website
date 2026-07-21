---
title: "SQL Editor"
order: 4
excerpt: "How to use the modern SQL editor in Tabularis with syntax highlighting, autocomplete, and multi-tab support."
category: "Core Features"
---

# SQL Editor

The **SQL Editor** in Tabularis is built around a highly customized integration of **Monaco** (the exact editor engine that powers VS Code). It provides a world-class typing experience optimized specifically for complex database querying.

<video src="/videos/wiki/02-sql-editor.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Intelligent Context-Aware Autocomplete

Unlike basic editors that simply suggest a static list of SQL keywords and table names, Tabularis implements a dynamic, context-aware autocomplete engine.

### How It Works
1. **AST Parsing**: As you type, a lightweight local parser analyzes your SQL statement to build an Abstract Syntax Tree (AST).
2. **Scope Resolution**: The engine identifies which tables are present in the `FROM` and `JOIN` clauses.
3. **Alias Mapping**: It maps aliases to their source tables (e.g., `FROM customer_orders AS co`).
4. **Targeted Suggestions**: When you type `co.`, the editor immediately suggests only the columns belonging to the `customer_orders` table, along with their data types.

### Accepting suggestions

When the autocomplete dropdown is open, **Enter accepts the highlighted suggestion by default** (matching the behavior of every other Monaco-based editor). If you prefer Enter to insert a newline instead, toggle **Settings → Editor → Accept suggestion on Enter** off. The setting is honored across every editor surface — main SQL tabs, notebook cells, and the Raw SQL tab of the trigger editor.

`Tab` always accepts the highlighted suggestion, regardless of the setting.

### Caching Strategy
To ensure the editor remains responsive even on databases with thousands of tables, Tabularis caches schema metadata:
- **TTL**: Table metadata is cached in memory for 5 minutes.
- **Size limit**: The cache holds metadata for at most 50 tables. When the limit is exceeded, expired entries are evicted first; if still over the limit, the oldest entries are removed.
- **Manual Invalidation**: You can force a cache clear by clicking the "Refresh Schema" button in the sidebar or via the Command Palette.

## Editor Features & Shortcuts

The Monaco integration brings powerful developer features:

| Feature | Shortcut (Mac) | Shortcut (Win/Linux) | Description |
| :--- | :--- | :--- | :--- |
| **Execute** | `Cmd + Enter` or `Cmd + F5` | `Ctrl + Enter` or `Ctrl + F5` | Runs the selected text; with nothing selected, runs the statement under the cursor. |
| **Run All** | `Cmd + Shift + Enter` | `Ctrl + Shift + Enter` | Executes every statement in the editor (also `Ctrl/Cmd + Shift + F5`, or the entry at the top of the Run dropdown). |
| **Execute Selection** | *(context menu only)* | *(context menu only)* | Right-click → "Execute Selection" to run highlighted text. |
| **Format SQL** | `Shift + Option + F` | `Shift + Alt + F` | Prettifies the SQL syntax (built-in Monaco). |
| **Toggle Comment** | `Cmd + /` | `Ctrl + /` | Comments/uncomments the current line or selection (built-in Monaco). |
| **Multi-Cursor (click)** | `Cmd + Click` | `Ctrl + Click` | Place multiple cursors for simultaneous editing. |
| **Add Next Occurrence** | `Cmd + D` | `Ctrl + D` | Select the next occurrence of the current selection and add a cursor. |
| **Select All Occurrences** | `Cmd + Shift + L` | `Ctrl + Shift + L` | Select all occurrences of the current selection and add cursors. |
| **Cursors at Line Ends** | `Option + Shift + I` | `Alt + Shift + I` | Add a cursor at the end of each line in the current selection. |
| **Copy Line Up** | `Option + Shift + ↑` | `Ctrl + Shift + ↑` | Duplicate the current line above. |
| **Copy Line Down** | `Option + Shift + ↓` | `Ctrl + Shift + ↓` | Duplicate the current line below. |
| **Command Palette**| `F1` | `F1` | Open the Monaco command palette. |

## Multi-Statement Execution

When the editor contains multiple semicolon-separated statements, execution is **cursor-driven** (since v0.16.0):

### Run the Statement at the Cursor

Press **Execute** (`Ctrl/Cmd + Enter` or `Ctrl/Cmd + F5`) with nothing selected and Tabularis runs the single statement the cursor is inside — no whole-file execution, no picker dialog. A subtle highlight shows which statement is *armed* to run; it disappears as soon as you make a selection. **Explain** follows the same rule, explaining the statement under the cursor.

<video src="/videos/posts/tabularis-run-at-cursor.mp4" poster="/videos/posts/tabularis-run-at-cursor.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

Prefer picking from a list? Turn off **Run statement under cursor** in **Settings → General → Query Execution** to restore the [Query Selection Modal](#the-query-selection-modal-optional) instead.

### Run All

Press `Ctrl/Cmd + Shift + Enter` in the editor (`Ctrl/Cmd + Shift + F5` globally), or pick **Run All** at the top of the Run dropdown, to execute every statement in the editor. Results from each query appear in separate tabs in the results panel.

**Session continuity** — multi-statement scripts run via Run All share a single physical database connection across all statements (built-in drivers only). User variables (`SET @var := …`), `LAST_INSERT_ID()` / `LASTVAL()`, explicit `BEGIN` / `COMMIT` blocks, temporary tables, and `PREPARE` / `EXECUTE` pairs all behave the way they do in `mysql` CLI / `psql` / DBeaver. Plugin drivers fall back to sequential execution on separate pooled connections (ordering preserved, session state not guaranteed).

### The Query Selection Modal (Optional)

With **Run statement under cursor** turned off in Settings → General, pressing Execute on a multi-statement buffer opens the **Query Selection Modal** instead:

- **Run a single query** — click any query in the list, or press its number `1`–`9`.
- **Run All** — press `Ctrl/Cmd + Enter` inside the modal.
- **Run Selected** — check specific queries and press `Shift + Enter` (or click **Run Selected (N)**); `Space` toggles the focused query, `↑`/`↓` move focus.

### Execute Selection

If you highlight a text selection in the editor and run it, Tabularis splits the selection by `;` and executes all contained queries concurrently. Results appear as separate tabs in the multi-result panel.

## Multi-Result Panel

When multiple queries are executed (via Run All or Execute Selection), results are displayed in a **results panel** at the bottom of the editor. Each query gets its own result with independent pagination, error handling, and loading state.

The panel supports two view modes — **Tab view** (default) and **Stacked view** — switchable via the toggle button in the top-right corner of the results bar.

### Tab View

The default view. Each query result lives in its own tab. Click a tab to switch between results.

| Action | How |
|--------|-----|
| Switch tab | Click the tab header |
| Close tab | Click the **X** button or middle-click |
| Rename tab | Double-click the tab header or right-click → Rename |
| AI rename | Click the sparkles icon (requires AI enabled in Settings) |
| Context menu | Right-click a tab for Close / Close Others / Close Right / Close Left / Close All |
| Re-run | Click the play icon on a tab to re-execute that query |

A summary bar shows the total number of queries and how many succeeded or failed. Each tab displays a collapsible query preview, row count, and execution time.

### Stacked View

Inspired by SQL Server Management Studio, the stacked view displays **all query results vertically** in a single scrollable panel — no tab switching required.

| Action | How |
|--------|-----|
| Collapse / Expand | Click a result header to toggle its content |
| Collapse All / Expand All | Click the collapse button in the top bar |
| Close result | Click the **X** button or middle-click on the header |
| Rename | Double-click the result label |
| AI rename | Click the sparkles icon on the header |
| Re-run | Click the play icon on the header |
| Resize | Drag the resize handle between results to adjust height |

Each result section shows the query label, a collapsible SQL preview, row count, execution time, and pagination controls — all inline in the header. When collapsed, the header still shows key metadata (row count, execution time, error summary).

### Window Controls & Detachable Results

The right side of the results bar carries a set of window controls:

| Control | What it does |
|---------|--------------|
| **Minimize** | Collapses the panel without losing data — the **Show Results** button restores it. |
| **Maximize** | Hides the editor so results take the full height; click again to restore the split. |
| **Detach** | Pops the active tab's results into a separate OS window. |
| **Close** | Collapses the panel (same as Minimize; data is kept). |

Manual drag-to-resize of the panel is unchanged.

**Detach** is the one to reach for on a multi-monitor setup: it moves the active tab's results into their own window so you can keep the grid on one screen while you keep editing SQL on the other. The detached window stays in sync with the tab it came from, and closing it folds the results back into the main layout.

<video src="/videos/posts/tabularis-detach-results.mp4" poster="/videos/posts/tabularis-detach-results.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

### Success Feedback for Non-SELECT Statements

A statement that returns no result set — `INSERT`/`UPDATE`/`DELETE` or DDL such as `CREATE`/`ALTER`/`DROP` — no longer shows a misleading "0 rows retrieved" empty grid. Instead the result area renders a success panel: a check icon, "Query executed successfully", the affected-row count when there is one, and the execution time. This applies to both single statements and multi-statement batches.

### Query Parameters

When running multiple queries that contain `:param` placeholders, Tabularis collects parameters across all queries and prompts you **once** via the parameters modal before execution begins.

### Destructive Query Confirmation

Both the SQL editor and notebook cells guard against the queries that are easiest to regret. Before it runs a `DELETE` or `UPDATE` with **no `WHERE` clause**, or a `DROP` or `TRUNCATE`, Tabularis pops a confirmation dialog with kind-specific copy and a read-only preview of the exact statement it flagged. The confirm button stays disabled for a **five-second countdown** so the warning is actually read.

The detection is not a naïve substring match — it ignores comments and string literals (including backslash-escaped quotes), understands data-modifying CTEs, and handles multi-statement batches.

### Total Row Count

The pager shows the exact size of the current result — `{total} rows` next to the page indicator — counted against the *reconstructed filtered query*, so a filtered grid reports the filtered total rather than the base table's. The count resets when the query or filter changes and is preserved across pagination.

![A filtered grid showing the total row count next to the page indicator](/img/posts/tabularis-total-row-count.png)

## Query Splitting

Tabularis splits multi-statement SQL with its own **dialect-aware splitter** — a tokenizer that understands the quoting and block rules of each engine (`postgres`, `mysql`, `mssql`, `sqlite`, `oracle`, and a `generic` fallback) rather than naively breaking on every `;`. It correctly handles stored procedures and functions that contain internal semicolons:

```sql
CREATE FUNCTION example()
RETURNS INT
LANGUAGE PLPGSQL
AS $$
BEGIN
    RETURN 10::INT;
END;
$$;
```

The splitter treats this as a single statement rather than breaking on the internal `;` inside the `$$` dollar-quoted block. Beyond dollar-quoting, it also tracks:

- **Comments** — leading/trailing comment-only segments are folded into the adjacent statement instead of becoming empty statements.
- **Oracle PL/SQL blocks** — `BEGIN ... END;` source units are merged up to the terminating `/`.
- **MySQL `DELIMITER` changes** — the active statement delimiter is tracked as it is redefined.

Each split statement is also classified (e.g. result-set-returning vs. not) to drive the Query Selection Modal and per-statement result handling.

## Autocomplete: Multi-Database and Multi-Schema

Autocomplete suggestions are scoped to the active context:

- **Schema-aware connections** (PostgreSQL): when a non-default schema is active, suggestions come from the tables in that schema only.
- **Multi-database connections** (MySQL / MariaDB): suggestions come from the tables of all selected databases.

This ensures that you see relevant completions regardless of how many schemas or databases your connection exposes.

## Query Execution & Data Grid

When you execute a query, Tabularis handles the results asynchronously, streaming them into the integrated Data Grid.

## Query History Sidebar

Every execution is also written to the Explorer's **History** tab for the active connection.

![Query History tab in the Explorer sidebar](/img/tabularis-query-history-sidebar.png)

### What gets stored

Each history entry includes:

- The SQL text
- Execution timestamp
- Execution duration
- Success or error status
- Rows affected when available

History is stored per connection, newest first. If you run the exact same SQL twice in a row, Tabularis updates the latest entry instead of appending a duplicate immediately after it.

### Working from history

The History tab supports:

- **Search** by SQL text
- **Date grouping** such as Today / Yesterday / older buckets
- **Double-click to reopen** a query in the editor without auto-running it
- **Context menu actions** to copy SQL, run it, run it in a new tab, save it to Favorites, or delete the entry
- **Clear All** for the current connection only

This makes the sidebar history a fast iteration loop: run a query, tweak it, and jump back to any earlier version without digging through editor tabs.

### History retention

The maximum number of stored entries is controlled in **Settings → General → Query History**. The backing config key is `queryHistoryMaxEntries`, with a default of `500`.

### Durability & corruption recovery

Since v0.13.0, history writes are **atomic** (written to a temp file, then renamed onto the target) and serialized per connection, so multi-statement scripts recording many entries concurrently can never corrupt the file. If a history file from an earlier version is found corrupt, Tabularis backs it up as `<id>.json.corrupt-<timestamp>`, starts fresh, and shows a dismissible banner in the History panel with the backup path — instead of silently showing an empty panel and recording nothing.

### Transaction Management
By default, queries are executed in auto-commit mode. However, you can manually wrap your statements in `BEGIN; ... COMMIT;` blocks. If an error occurs midway through a block, Tabularis halts execution and outputs the precise line and database engine error.

### Powerful Data Grid
The results grid is heavily optimized to handle thousands of rows without dropping frames:
- **Inline Editing**: Double-click any cell to modify its content. Changes are marked in yellow and can be committed back to the database with a single click (generating `UPDATE` statements securely via primary keys).
- **Rich Data Types**: JSON / JSONB columns and long text columns open in a Monaco editor with diff and side-by-side toggles; JSON cells additionally open in a standalone Tauri window (see [Data Grid → JSON & long text cells](/wiki/data-grid#json--long-text-cells)). Spatial data displays coordinates.
- **Foreign Key Navigation**: FK cells get a click-to-navigate affordance and a context-menu entry that opens the referenced table filtered to the matching row. See [Data Grid → Foreign Key Navigation](/wiki/data-grid#foreign-key-navigation).
- **Exporting**: Export the current view to CSV or JSON instantly.
- **Copy with Headers**: Highlight cells, right-click, and select "Copy with Headers" to easily paste data into Excel or Google Sheets.
