---
title: "Saved Queries"
order: 4.5
excerpt: "Save, organize, and reuse your most frequent SQL queries per connection."
category: "Core Features"
---

Tabularis lets you save SQL queries and associate them with a specific connection. Saved queries appear in the Explorer sidebar and can be executed, edited, or deleted with a single click.

<video src="/videos/wiki/11-favorites-history.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Saving a Query

There are two ways to save a query:

1. **From the Editor** — write or highlight a SQL statement in the editor, then click the **Save Query** button (or use the command palette). A modal opens where you give the query a name.
2. **From Query History** — open the Explorer's **History** tab, browse past executions for the active connection, and save any entry to promote it to a saved query.

The query is stored on disk alongside your connection profiles. Each saved query gets a unique UUID, and the SQL content is written to its own `.sql` file inside `{app_config_dir}/saved_queries/`. Metadata (name, filename, connection ID, database, creation and update time) is tracked in a central `meta.json` file.

## Browsing Saved Queries

Open the Explorer's **Favorites** tab. The saved-query list is separated from the schema tree and shows only the entries for the active connection.

![Favorites tab in the Explorer sidebar](/img/tabularis-favorites-sidebar.png)

Each entry displays the query name, a highlighted preview of its SQL, the database it was saved against (when set) and when it was last updated. Use the **Search favorites...** box at the top to filter the list by name or SQL text. Since v0.29.0, when the SQL matches, the entry shows the line containing the first match, shortened to about 80 characters, with the matched text highlighted; the term is matched literally and case-insensitively. Search covers every folder and shows where each result is filed. Click once to select an entry; **double-click** it, or press `Enter` on the selected entry, to execute it immediately in a new editor tab.

## Folders

Since v0.29.0 saved queries can be grouped in folders. Folders belong to a connection and are not nested.

- **New folder** creates one. Names are trimmed, 1–64 characters, and unique per connection (case-insensitive).
- **Rename folder** and **Delete folder** are in the folder's context menu. Only an empty folder can be deleted; a folder that still contains queries is refused with an explanation, and queries are never moved or deleted implicitly.
- **Move to folder...** in a query's context menu moves it to a folder or back to **Unfiled (no folder)**. Moving does not change the SQL, the database or the update time.

Folders are collapsible. Queries saved before v0.29.0, or not filed, appear under **Unfiled**.

![Saved queries grouped into the Data cleanup and Reports folders, with an Unfiled section](/img/tabularis-saved-query-folders.png)

## Executing a Saved Query

- **Double-click** the query in the sidebar (or select it and press `Enter`), or
- **Right-click → Execute** from the context menu.

The SQL is loaded into a new editor tab and executed against the current connection — on the database saved with the query, when it has one. The tab title is set to the query name for easy identification. On a multi-database connection, the tab title and the toolbar database selector show the query's database.

## Using a Query Without Running It

Since v0.29.0 the context menu also offers:

- **Open in Editor** — opens the SQL in a new editor tab, on the saved database, without executing it.
- **Copy Query** — copies the SQL to the clipboard.
- **Export as SQL…** — saves the SQL to a `.sql` file through a save dialog. The proposed file name is derived from the query name. Nothing is executed and the saved query is not changed.
- **Duplicate** — saves a copy named `<name> (copy)` (or `(copy 2)`, `(copy 3)` and so on), with the same SQL and database.

## Editing a Saved Query

Right-click a saved query in the sidebar and choose **Edit**. The Query Modal opens pre-populated with the current name and SQL. Modify either field, then click **Save** to update both the metadata and the `.sql` file on disk.

## Deleting a Saved Query

Right-click → **Delete**. A confirmation dialog is shown before the query file and its metadata entry are removed.

## Per-Connection Isolation

Saved queries are scoped to a connection. When you switch the active connection in the sidebar, the Favorites tab updates automatically to show only the queries associated with that connection. This prevents accidental execution of a PostgreSQL query against a MySQL connection.

## Storage Format

| File | Location | Content |
| :--- | :--- | :--- |
| `meta.json` | `{app_config_dir}/saved_queries/` | Array of `{ id, name, filename, connection_id, database, folder_id, created_at, updated_at }`. `folder_id` is omitted for unfiled queries |
| `folders.json` | `{app_config_dir}/saved_queries/` | Saved-query folders, per connection. Created with the first folder |
| `{uuid}.sql` | `{app_config_dir}/saved_queries/` | Raw SQL text |

The `app_config_dir` is `~/.config/tabularis` on Linux, `~/Library/Application Support/tabularis` on macOS, and `%APPDATA%\tabularis` on Windows — or the folder chosen as a [custom storage location](/wiki/configuration#custom-storage-location) (including `TABULARIS_DATA_DIR`).
