---
title: "Visual Query Builder"
order: 5
excerpt: "Construct complex SQL queries visually by dragging tables and drawing JOINs."
category: "Core Features"
---

Not every query needs to be handwritten. For exploring data, generating reporting views, or learning SQL structures, the **Visual Query Builder** provides an intuitive, drag-and-drop canvas for generating robust SQL statements.

<video src="/videos/wiki/23-query-builder-settings.mp4" poster="/videos/wiki/23-query-builder-settings.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Workflow: Point, Click, Query

1. **Canvas Setup**: Open a new Query Builder tab. Drag tables from the left sidebar directly onto the infinite canvas.
2. **Define Relationships (JOINs)**: Joins are not created from foreign keys automatically. Drag a line from a column of one table to a column of another to create a `JOIN`. Click the join label to cycle through the join types (`INNER`, `LEFT`, `RIGHT`, `FULL OUTER`, `CROSS`).
3. **Select Columns**: Each table node has a checkbox list of its columns. Check the columns you want to include in the final `SELECT` clause, and optionally give each one an alias.
4. **Filtering, Sorting & Limit**: The collapsible **Query Settings** sidebar on the right holds the **WHERE Conditions** (operators `=`, `!=`, `>`, `<`, `>=`, `<=`, `LIKE`, `IN`, chained with `AND` / `OR`), **GROUP BY**, **ORDER BY** (`ASC` / `DESC`) and **LIMIT** sections.
5. **Aggregations**: Select a column and apply `COUNT`, `COUNT DISTINCT`, `SUM`, `AVG`, `MIN` or `MAX`, with an optional alias. The builder adds the non-aggregated columns to `GROUP BY` automatically, and you can add more grouping columns by hand. A WHERE condition marked **Use aggregate function (HAVING)** goes into the `HAVING` clause instead.

## SQL Generation

As you drag tables and toggle options, the builder regenerates the SQL from the canvas state, quoting identifiers for the connection's dialect (e.g., backticks for MySQL and double quotes for Postgres). Press **Run** to execute it; the canvas is kept with the tab.

Synchronization is one-way, **Visual → SQL**: the builder has no live SQL preview pane and no action that turns the tab into an editable console. To hand-optimize the generated code, add CTEs or use database-specific functions, write the query in a regular console tab.

## Limitations

To maintain a clean and understandable UI, the Visual Query Builder is optimized for standard relational querying. It does not visually support:
- Deeply nested Subqueries (though they can be added as raw SQL fragments in the WHERE clause).
- Complex Window Functions (`OVER (PARTITION BY...)`).
- `UNION` operations between completely disparate data sets.

For these advanced scenarios, the standard **SQL Editor** remains the tool of choice.
