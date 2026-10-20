---
title: "Data Import (Clipboard and Files)"
order: 6.6
excerpt: "Import CSV, TSV, JSON, or Markdown table data from the clipboard or from a file into any database table, with automatic type inference and a schema editor."
category: "Database Objects"
---

**Import data** lets you take structured data — a copied spreadsheet range, a CSV paste, a JSON array, a Markdown table, or since v0.29.0 a CSV, TSV, JSON or Markdown file — and insert it into a database table without writing a single SQL statement.

Right-click a table in the sidebar and choose **Import data...**, or press `Cmd/Ctrl + Shift + V`. The import modal opens and immediately reads your clipboard; switch the source to a file with **Choose file...**.

<video src="/videos/posts/tabularis-import-from-file.mp4" poster="/videos/posts/tabularis-import-from-file.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Sources

The modal has two sources:

- **Clipboard** — read when the modal opens. The format is detected from the content.
- **Choose file...** (since v0.29.0) — opens a native file picker for one CSV, TSV, JSON or Markdown file. The file extension decides the format. Files over 20 MiB are refused before they are read. Cancelling the picker keeps the previous preview, and a read that finishes after you switched source or closed the modal is discarded.

Both sources go through the same pipeline: type inference, schema editor, preview, then create a new table or append to an existing one. The CSV parser keeps quoted newlines, CRLF line endings and escaped quotes.

## Supported Formats

For clipboard content, Tabularis detects the format automatically:

| Format | Example source |
| :--- | :--- |
| **TSV** (tab-separated) | Copied rows from Excel, Google Sheets, LibreOffice Calc |
| **CSV** (comma or semicolon-separated) | Exported CSV files, pasted or opened |
| **JSON Array** | `[{"col": "val"}, ...]` or a JSON object array |
| **Markdown table** | Table blocks copied from docs, GitHub, Notion |

If the first row looks like headers, Tabularis marks it as a header row. You can toggle this with the **First row as header** checkbox in the parse summary bar.

## Schema Inference

After parsing, Tabularis infers a column type for each field:

| Inferred type | When used |
| :--- | :--- |
| `INTEGER` | Whole numbers |
| `REAL` | Decimal numbers |
| `BOOLEAN` | `true`/`false`, `yes`/`no` values (`1`/`0` are inferred as `INTEGER`) |
| `DATE` | `YYYY-MM-DD`, `DD/MM/YYYY` or `DD-MM-YYYY` date strings |
| `DATETIME` | ISO datetime strings |
| `TEXT` | Everything else |
| `JSON` | Nested JSON objects or arrays within a cell |

Inferred types are then mapped to the actual SQL types of your active driver (e.g., `INTEGER` becomes `INT` for MySQL, `INTEGER` for SQLite). Columns mixing whole and decimal numbers become `REAL`; any other mix of types falls back to `TEXT` and is flagged with a low-confidence indicator. Empty cells are inserted as `NULL`.

You can edit any column name or type directly in the **Column Schema** panel before importing.

## Import Modes

### Create New Table

A new table is created with the inferred schema and the rows are inserted. You must provide a table name. If a table with that name already exists, the **If exists** strategy applies:

| Strategy | Behaviour |
| :--- | :--- |
| **Fail with error** | The import is cancelled if the table already exists |
| **Append rows** | Rows are inserted into the existing table without touching its schema |
| **Replace table** | The existing table is dropped and recreated with the new schema |

Use **AI Suggest** to let the configured AI provider propose a descriptive table name and column names based on your data.

### Append to Existing

Select a target table from the dropdown. The **Column Schema** panel switches to a mapping view: each source column can be mapped to an existing column in the target table, set to create a new column via `ALTER TABLE ADD COLUMN`, or skipped entirely.

Tabularis auto-maps source columns to target columns by name. Unmatched columns default to **Skip**.

## The Schema Editor

The schema editor is the main review step. Each row is a source column with:

- **Name** — editable text field
- **Type** — dropdown with all types supported by the active driver
- **Nullable** — checkbox
- **Low-confidence indicator** — shown when Tabularis had to fall back to TEXT due to mixed values in a column
- **Sample values** — a comma-separated preview of the first values in that column

You can select multiple columns and delete them in bulk using the **Delete selected** action.

Use the **maximize** button to expand either the schema editor or the data preview to full height for easier review on large datasets.

## Data Preview

The **Data Preview** panel shows the first rows as a table. It updates as you adjust the header-row toggle. It is read-only — it reflects the parsed input, not the final SQL output.

## How to Access

- **Right-click a table** in the sidebar → **Import data...**
- Press `Cmd/Ctrl + Shift + V` (listed as **Import data** and customizable in **Settings → Keyboard Shortcuts**)

The clipboard is read automatically when the modal opens. If the source is empty or the content cannot be parsed, an error message is shown with a **Try again** button. It retries the last source: it re-reads the clipboard after a clipboard failure and reopens the file picker after a failed file. A readable file with no rows shows *No data found in the selected source*; an unreadable, unsupported or oversized file shows the reason.
