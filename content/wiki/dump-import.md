---
title: "Dump & Import"
order: 6.5
excerpt: "Export a full database snapshot to SQL and restore it — with progress tracking and cancellation support."
category: "Database Objects"
---

![SQL Dump & Import](/img/tabularis-sql-dump-import.png)

Tabularis lets you dump a database to a `.sql` file and import an existing `.sql` file back into a PostgreSQL, MySQL/MariaDB or SQLite connection — right from the sidebar, without leaving the app.

## Dump a Database

Right-click a database in the sidebar and choose **Dump Database**. A modal opens with the following options:

| Option | Description |
| :--- | :--- |
| **Structure (DDL)** | Exports `CREATE TABLE`, `CREATE INDEX`, and other DDL statements, each table preceded by `DROP TABLE IF EXISTS`. |
| **Data (INSERT)** | Exports `INSERT INTO` statements for all rows. |
| **Select Tables** | Choose which tables to include. Use **Select All** / **Deselect All** for convenience. |

At least one of _Structure_ or _Data_ must be selected, and at least one table must be chosen before starting.

Since v0.23.0 string literals are escaped per dialect (MySQL doubles backslashes and writes NUL as `\0`; PostgreSQL and SQLite only escape quotes) and `JSON` / `JSONB` columns are written as JSON literals with UTF-8 emitted as-is, so dumps round-trip on re-import. Before that, PostgreSQL and SQLite text columns came back with doubled backslashes and MySQL JSON columns could fail to import or lose non-ASCII text.

Click **Export** to open the OS file save dialog. The default filename is `<database>_dump_<date>.sql`. Tabularis streams the dump to disk as it runs — you can see the elapsed time in real time. Click **Cancel** at any time to abort the operation.

## Import a Database

Right-click a database in the sidebar and choose **Run SQL File...**, then select a `.sql` file — or a `.zip` archive, in which case the first `.sql` file inside it is used. After you confirm the warning that the import may overwrite existing data, the import starts and shows:

- An indeterminate progress bar with the number of statements executed so far.
- The elapsed time.

The import can be cancelled at any time. Tabularis will close the modal automatically after a successful import.

> **Note**: Import executes the SQL statements in your file sequentially, inside a single transaction that is committed at the end. If a statement fails, execution stops and the error is displayed. To speed up loading, MySQL/MariaDB imports turn off `FOREIGN_KEY_CHECKS` and `UNIQUE_CHECKS` for the session, and PostgreSQL imports defer constraints (`SET CONSTRAINTS ALL DEFERRED`). Statements that commit implicitly on the server (such as DDL on MySQL) are not rolled back by a later failure.

## Schemas (PostgreSQL)

On PostgreSQL connections, dump and import work on the **active schema**: the dump reads the selected tables from it, and the import runs with `search_path` set to it. There are no separate schema-level menu entries.

## How to Access

- Right-click a database node in the left sidebar → **Dump Database** / **Run SQL File...**
- The same two actions are in the actions menu and buttons at the top of the Explorer.

Both actions are available for the built-in drivers only (PostgreSQL, MySQL/MariaDB, SQLite); plugin drivers are not supported.
