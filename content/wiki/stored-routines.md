---
title: "Stored Procedures & Routines"
order: 6.6
excerpt: "Browse, run, create, edit, and drop stored procedures and functions from the Explorer sidebar."
category: "Database Objects"
---

Tabularis manages stored procedures and functions (collectively called **routines**) from the Explorer sidebar. Beyond browsing definitions and parameters, you can **run** a routine with parameters, **create** one from a dialect-aware template, **edit** its definition, and **drop** it — the same full lifecycle it offers for tables and views.

Management is gated on a `routine_management` driver capability, enabled out of the box for PostgreSQL and MySQL/MariaDB. Plugin drivers can opt in through their manifest (see [Driver Support](#driver-support)).

## Browsing Routines

Routines appear in the sidebar under the **Routines** section for each database or schema. They are grouped by type:

- **Functions** — routines that return a value.
- **Procedures** — routines that perform actions without a direct return value.

Each group is collapsible. The routine name and type icon help distinguish functions from procedures at a glance.

## Viewing Parameters

Expand a routine in the sidebar to see its parameter list. Each parameter shows:

| Field | Description |
| :--- | :--- |
| **Name** | Parameter name |
| **Data type** | The SQL type (e.g., `INTEGER`, `VARCHAR`, `JSONB`) |
| **Mode** | Direction badge: `IN`, `OUT`, or `INOUT` |

Parameters are listed in ordinal order as defined in the routine signature.

## Viewing the Definition

Double-click a routine — or right-click → **View Definition** — to open the full routine SQL in a read-only editor tab. This shows the complete `CREATE FUNCTION` or `CREATE PROCEDURE` statement as stored by the database.

The definition is fetched directly from the database catalog, so it always reflects the current state of the server.

## Running a Routine

<video src="/videos/wiki/20-run-routine.mp4" poster="/videos/wiki/20-run-routine.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

Right-click a routine → **Run…**. A modal titled **Run &lt;name&gt;** collects one input per `IN`/`INOUT` parameter (the [Command Palette](/wiki/quick-navigator) only opens a routine's definition):

- A **NULL** checkbox to pass `NULL` explicitly.
- A **raw value** toggle — on by default for numeric types — that controls whether the value is inlined verbatim or quoted as a literal.

Clicking **Open in Editor** builds the invocation script and opens it in a new editor tab **without running it**, so you can review the call before executing it (since v0.27.0; earlier versions ran it straight away):

- **MySQL / MariaDB** — functions run as `SELECT fn(...) AS result;`. For procedures, `OUT`/`INOUT` parameters are threaded through session variables (`SET @p = …;` for `INOUT` inputs, then `CALL routine(@p); SELECT @p;`), and the multi-statement script runs on a single pooled connection so the session variables survive across statements.
- **PostgreSQL** — functions run as `SELECT * FROM fn(...)` (pure `OUT` parameters are left out of the call), so a set-returning function comes back as a full result set in the grid. Procedures run as `CALL proc(...)`, with `OUT` parameters passed as `NULL` placeholders.

## Creating a Routine

Click the **+** button on the **Routines** section header (tooltip **New routine**) and choose **New procedure** or **New function**. Tabularis opens the editor pre-filled with a **dialect-aware starter template**:

- **MySQL / MariaDB** — a `DELIMITER`-wrapped `CREATE PROCEDURE` / `CREATE FUNCTION` skeleton.
- **PostgreSQL** — a `CREATE OR REPLACE FUNCTION` or `CREATE OR REPLACE PROCEDURE` skeleton (`LANGUAGE plpgsql`) with dollar-quoting.

The **+** button appears only on the connection-level Routines section. Routines sections nested under a schema (PostgreSQL) or under one of several databases do not have it, so on those connections write the `CREATE` statement in a console instead.

Fill in the body and run it like any other statement.

## Editing a Routine

Right-click a routine → **Edit**. Tabularis opens a **re-runnable** script that recreates the routine in place:

- **MySQL / MariaDB** — the `SHOW CREATE` output wrapped in a `DROP … IF EXISTS` + `DELIMITER` block.
- **PostgreSQL** — the definition from `pg_get_functiondef`, which is already a `CREATE OR REPLACE`.

## Dropping a Routine

Right-click a routine → **Drop**. A **Drop routine** confirmation dialog is shown before the statement runs. On PostgreSQL, Tabularis resolves the exact identity signature via `pg_get_function_identity_arguments` and **refuses to guess** between overloads, so it never drops the wrong function when several share a name.

## Context Menu Actions

Right-click any routine in the sidebar:

| Action | Description |
| :--- | :--- |
| **Run…** | Opens the Run modal to build the call with parameters and open it in the editor for review |
| **View Definition** | Opens the routine SQL in a read-only tab |
| **Edit** | Opens a re-runnable script to change the definition |
| **Drop** | Drops the routine after a confirmation |
| **Copy Name** | Copies the routine name to the clipboard |

The **Run…** / **Edit** / **Drop** actions appear only when the connection's driver declares the `routine_management` capability.

## Driver Support

| Feature | PostgreSQL | MySQL / MariaDB | SQLite | Plugin drivers |
| :--- | :--- | :--- | :--- | :--- |
| List routines | Yes | Yes | Not applicable* | Per manifest |
| View definition | Yes | Yes | Not applicable* | Per manifest |
| View parameters | Yes | Yes | Not applicable* | Per manifest |
| Run / Create / Edit / Drop | Yes | Yes | Not applicable* | Opt-in** |

*SQLite does not support stored procedures or functions at the SQL level.

**For plugin drivers the four management methods are **optional** JSON-RPC calls. A plugin only overrides what its dialect needs; when a method isn't implemented, the host falls back to generic SQL — for example a bare `CREATE PROCEDURE|FUNCTION my_routine() BEGIN … END` template, and the routine definition for **Edit** — so basic routine management works even without a custom implementation.

## Data Model

Each routine is represented as:

- **RoutineInfo**: name, type (`PROCEDURE` or `FUNCTION`), and optional definition text.
- **RoutineParameter**: name, data type, mode (`IN`/`OUT`/`INOUT`), and ordinal position.

This metadata is queried from `INFORMATION_SCHEMA.ROUTINES` and `INFORMATION_SCHEMA.PARAMETERS` (or the driver-equivalent catalog views).

## Related

- [Triggers](/wiki/triggers) — managed alongside routines from the same sidebar accordion pattern.
