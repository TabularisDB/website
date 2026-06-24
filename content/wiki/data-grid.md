---
title: "Data Grid"
order: 13
excerpt: "Browse, edit, filter, and export table data with a high-performance virtualized grid."
category: "Core Features"
---

# Data Grid

The **Data Grid** is the primary view for browsing and editing table contents. It opens automatically when you double-click a table in the sidebar. Every table, view, or query result is displayed using a high-performance virtualized renderer — only the visible rows are rendered, so even large result sets feel instant.

<video src="/videos/wiki/06-data-grid.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Opening a Table

Double-click any table or view in the sidebar. The data grid opens in a new tab, color-coded by connection. The tab title shows the table name and the connection name in the tab bar.

## Browsing Data

### Pagination

Data is fetched in pages. The default page size is **500 rows**, configurable via `resultPageSize` in [Configuration](/wiki/configuration). Navigation controls at the bottom of the grid let you move forward and backward through pages.

The total row count is shown alongside the pagination controls, fetched via a `COUNT(*)` query when you open the table.

### Column Resizing

Drag a column header border left or right to resize columns. Double-click the border to auto-fit the column to its content width.

### Sorting

Click a column header to sort by that column (ascending). Click again to sort descending. A third click removes the sort. Sorting is applied server-side — a new query is issued with an `ORDER BY` clause so the sort is consistent across all pages.

> **LIMIT / OFFSET preservation** — if your query includes a `LIMIT` or `OFFSET` clause, clicking a column header to sort will preserve it. Only the `ORDER BY` portion is replaced.

### Filtering

A filter bar is available at the top of the grid. Type a condition to filter the results. The filter is applied as a `WHERE` clause, so it works across all pages and correctly reflects the total count.

## Inline Editing

Tabularis supports **inline cell editing** for tables. Changes are tracked as pending edits and not immediately committed.

### Editing a Cell

Double-click a cell to enter edit mode. Type the new value and press `Enter` to confirm or `Escape` to cancel. Edited cells are highlighted to distinguish them from unchanged values.

### Adding a Row

Click the **+ Add Row** button at the bottom of the grid. A new empty row appears at the end. Fill in the values for each cell and commit when ready.

### Deleting Rows

Select one or more rows by clicking the row header checkbox, then click **Delete Selected** — or press `Delete` / `Backspace` with the rows selected (works whenever no cell is being edited and the grid isn't read-only). A confirmation is shown before the `DELETE` statement is executed.

### Committing Changes

Pending edits (cell modifications, new rows, deleted rows) are shown with a visual indicator. Click **Apply Changes** to generate and execute the corresponding `INSERT`, `UPDATE`, or `DELETE` statements. Click **Discard** to roll back all pending changes without touching the database.

A DDL preview showing the exact SQL that will be executed is available before you confirm.

## Copying Data

Tabularis supports both **row-level** and **cell-level** copy from the data grid. The two modes don't fight each other: clicking a row checkbox clears the cell focus, clicking a cell clears the row selection. So `Ctrl/Cmd + C` with an active cell focus copies the cell, and `Ctrl/Cmd + C` with selected rows copies the rows.

### Cell-level selection

Click any cell to give it a focused outline; the row checkbox stays untouched. Press `Ctrl/Cmd + C` to copy just that cell value to the clipboard, formatted using the same null/length/type rules used for row copy. The cell context menu also exposes a **Copy cell** action.

### Row-level selection and copy formats

Select one or more rows by clicking the row header checkbox (or shift-click / ctrl-click for ranges and multi-select), then use `Ctrl/Cmd + C` to copy. The default format is **CSV**; you can change it in **Settings → General → Default Copy Format** to one of:

| Format | Output |
| :--- | :--- |
| **CSV** | Tab- or comma-separated values (delimiter follows `csvDelimiter`), spreadsheet-friendly. A toolbar toggle controls whether the column-header row is included (`csvIncludeHeaders`, on by default). |
| **JSON** | A JSON array of objects with column names as keys. |
| **SQL INSERT** | A sequence of `INSERT INTO \`table\` (col1, col2, …) VALUES (…);` statements, one per row. NULLs render as `NULL`, booleans as `TRUE`/`FALSE`, numbers unquoted, strings single-quoted with single quotes doubled-up. |

The setting maps to the `copyFormat` key in `config.json` (see [Configuration](/wiki/configuration)).

## Result Colors

By default every cell value renders in the same text color. Enable **Result Colors** under **Settings → Appearance → General** to tint cell values by their data type — **numbers, text, dates/times, and booleans** each get their own color, so you can read a row's shape at a glance.

![Query result grid with cells colored by data type](/img/tabularis-result-colors.png)

- The defaults follow the active theme's semantic palette (`--semantic-number`, `--semantic-string`, `--semantic-date`, `--semantic-boolean`).
- A per-type color picker with a live preview and a **Reset to theme** button lets you override any of them; overrides are saved in `config.json` and applied on top of the theme.
- Colorization is **off by default** — values render as before until you opt in.
- Colors apply only to plain data cells. Edited, inserted, and deleted rows, and `NULL` values, keep their existing styling. Per-column colors are precomputed once, so there is no scroll-time cost.

## Exporting Results

Any query result — whether from a table browse or an SQL editor query — can be exported.

### Export to CSV

Click the **Export** button in the toolbar and choose **CSV**. Tabularis streams the full result set (not just the current page) to a file. A progress indicator tracks the export; you can cancel it at any time.

### Export to JSON

Choose **JSON** from the export menu. The full result set is written as a JSON array of objects, with column names as keys. Same streaming and cancellation support as CSV.

> Exports are always performed on the **complete result set** — all rows that match the current filter, not just the visible page.

## JSON & Long Text Cells

`json` / `jsonb` columns and long text columns (`TEXT`, `LONGTEXT`, `VARCHAR(MAX)` and any string value longer than 80 characters or containing a newline) get a richer in-grid editor than the default single-line input.

<video src="/videos/wiki/13-json-viewer.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

### Chevron expand

A chevron icon appears next to the cell value. Click it to open an **inline editor pane** below the row:

- For JSON / JSONB cells: Monaco runs in JSON mode with syntax highlighting and bracket matching.
- For long text cells: Monaco runs in `plaintext` mode.

The expansion editor supports a **Diff toggle** (off by default) that compares the original cell value against the current pending edit. A second **Side-by-side toggle** flips the diff from unified to a two-pane view. Both toggles are persisted only within the open expansion — closing it discards the toggle state.

### Standalone viewer window (JSON / JSONB only)

JSON cells additionally show a **braces icon**. Clicking it opens the cell in a **standalone Tauri window** dedicated to the value, with the same JSON editor and Diff / Side-by-side toggles plus a Save button. Multiple cells can have their viewers open at the same time — each window keeps its own session and remembers its bounds. Saving flows back to the grid as a pending change; close the window without saving to discard the edit.

Double-clicking a JSON cell opens the viewer directly in edit mode (skipping the chevron).

There is no separate viewer window for plain text cells — text values aren't compared across windows as often as JSON, and the inline chevron is the entry point that mattered.

### "Detect JSON in text columns" (per-connection)

Some applications store JSON inside plain `TEXT` columns. To route those values through the JSON cell renderer, open the connection edit modal and enable **Detect JSON in text columns**. The flag is per-connection — toggle it on for your audit-log database and off for the one where TEXT means "free-form prose".

The same toggle also enables native array detection for `text[]` / `int[]` (PostgreSQL) and Firestore arrays.

<video src="/videos/wiki/14-long-text-cells.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

### Round-trip through pending changes

Edits made in the inline expansion editor or the viewer window are queued as **pending row changes** rather than committed immediately. You can review the unified diff, decide you don't like it, close the editor, and hit **Submit** on the row when you do. PostgreSQL binds `json` / `jsonb` values natively (no string round-trip), so structured objects and arrays go through as typed parameters.

The same diff toggles are available in the **row-editor sidebar** for long fields, and that pane is drag-resizable so a long markdown article can occupy the height it deserves.

## BLOB / Binary Columns

Large binary columns (BLOB, `bytea`, etc.) are truncated in the grid to avoid loading multi-megabyte values into memory. The maximum bytes loaded per cell is controlled by `maxBlobSize` in `config.json` (default: 1 MB). Values exceeding this limit are shown as a truncated hex preview with the full size in bytes.

## Foreign Key Navigation

When the active result is a table with foreign keys, FK cells get a click-to-navigate affordance:

<img src="/img/tabularis-foreignkey.gif" alt="Hovering a foreign key cell in the Tabularis data grid and clicking the arrow to open the referenced row in the parent table" loading="lazy" decoding="async" style="width:100%;border-radius:8px;margin:1rem 0" />

- **Hover** an FK cell → a small ↗ icon appears on the right of the cell. Clicking it opens (or reuses) a tab against the referenced table with `WHERE "ref_col" = value` pre-applied and runs the query.
- **Right-click** an FK cell → the context menu's first entry is **Open referenced row in `<table>`**.

The icon and menu entry only appear when the cell value is non-null, the row is not a pending insertion, and the row is not pending deletion. Identifier quoting follows the driver (backticks for MySQL/MariaDB, double-quotes elsewhere); numeric, bigint, boolean, and string values are formatted with the same rules used by the SQL INSERT copy format.

If the referenced table is already open as a tab, that tab is reused — the WHERE filter is overwritten and the query re-runs.

**V1 limitations**: only single-column foreign keys are surfaced; composite constraints and cross-schema navigation are not yet supported.

### Related Records Panel

When you want to *check* what a foreign key points at without losing the row you're already on, click the FK value (or pick **Show related record** from the cell context menu) and a **Related Records Panel** slides up from the bottom of the data grid. The parent table stays visible and interactive above it.

- The panel renders a mini result grid of `SELECT * FROM <ref_table> WHERE <ref_col> = <value> LIMIT 100`, using the same identifier-quoting rules as FK navigation.
- Clicking a different FK in the parent grid **swaps the panel content in place** — no close-then-reopen.
- The panel is **drag-resizable** from the grip in its header, so a wide referenced row can claim the height it needs.
- An **Open in tab** button hands off to the navigation path above when you decide you do want to leave for the referenced table after all.

## Column Header Context Menu

Right-click any column header to open the header context menu. Available actions:

| Action | Description |
|--------|-------------|
| **Copy column name** | Copies the column name as plain text to the clipboard. Useful when building queries or referencing column names in other tools. |

More actions may appear depending on context (e.g., sort direction, column visibility toggles).

## Null vs. Empty String

The grid displays `NULL` values with a distinct grey `NULL` badge to differentiate them from empty strings. When editing, leave a cell blank to write an empty string; use the dedicated **Set NULL** option in the cell context menu to write a true `NULL`.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Edit selected cell | `Enter` / `F2` |
| Confirm edit | `Enter` |
| Cancel edit | `Escape` |
| Copy selection (row or cell, depending on focus) | `Ctrl/Cmd + C` |
| Move between cells | Arrow keys |
| Next page | `Ctrl/Cmd + Right` |
| Previous page | `Ctrl/Cmd + Left` |
| Mark selected rows for deletion | `Delete` / `Backspace` |
