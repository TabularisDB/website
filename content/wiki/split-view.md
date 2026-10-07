---
title: "Split View"
order: 11
excerpt: "Work with multiple database connections simultaneously in a side-by-side layout."
category: "Core Features"
---

**Split View** lets you open up to four database connections side by side in the same window. Each pane has its own SQL editor and data grid. The left sidebar is shared — clicking inside a pane makes that connection the active one in the explorer. This is useful for comparing query results across environments, migrating data, or working on two databases at the same time.

<video src="/videos/wiki/07-split-view.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Activating Split View

1. In the open connections rail of the sidebar, **select at least two connections** (hold `Ctrl`/`Cmd` and click each one).
2. Right-click one of the selected connections and choose **Split Vertical** or **Split Horizontal**.
3. The workspace divides into panes, each showing one connection.

A split group can hold **up to four connections** (since v0.17.0). Add another open connection to an existing group from its context menu (**Add to Split Group**) or by dragging it onto the group badge in the connection rail. The badge renders the driver icons of its members in pane order — drag one icon over another to swap the two panels, or right-click an icon to remove just that connection from the group.

<video src="/videos/posts/tabularis-split-four-panes.mp4" poster="/videos/posts/tabularis-split-four-panes.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Layout Modes

The orientation is picked when you activate the split:

| Mode | Description |
|------|-------------|
| **Vertical** | Panes are placed side by side (left / right). Best for wide monitors. |
| **Horizontal** | Panes are stacked (top / bottom). Useful on portrait or narrow screens. |

To rearrange panels afterwards, drag a panel's **Move panel** grip onto an edge (left, right, top or bottom) of another panel; the dragged panel docks on that side, so a group can mix side-by-side and stacked panels.

## Working in Split Panes

Each pane behaves exactly like a standalone Tabularis session:

- Browse schemas, tables, views, and routines in the sidebar.
- Open the SQL editor, run queries, and inspect results in the data grid.
- Open the Visual Query Builder or ER Diagram for that connection.
- Execute exports (CSV, JSON, Markdown) independently per pane.

Tabs are local to each pane — closing a tab in the left pane does not affect the right pane.

## Resizing Panes

Drag a **divider** between panes to adjust their relative widths or heights. A focused divider can also be moved with the arrow keys, 5% per press.

## Closing Split View

Click the **X** on a pane's header to close that connection and collapse the split. The remaining connection returns to the full-width view. Alternatively, close all but one connection to exit split view automatically, or pick **Separate Connections** from the group badge's context menu to dissolve the group.

## Use Cases

**Environment comparison**
Open production and staging databases side by side. Run the same query in both editors and compare results without switching tabs.

**Live data migration**
Browse the source schema in one pane while writing `INSERT` statements in the other. Verify row counts after each batch.

**Cross-database joins (manual)**
Run a query in one pane, copy the result set, and use it as input for a query in the other pane — useful when the databases aren't on the same server and a federated query isn't possible.

**Plugin vs. native driver**
Open the same data in a native MySQL connection on the left and a DuckDB plugin connection on the right to compare results or test a migration.

## Notes

- Split View works with any combination of connection types: native drivers (PostgreSQL, MySQL, SQLite) and plugin drivers can coexist in the same split workspace.
- Each pane maintains its own connection state independently — active schema selection, open transactions, and query history are not shared between panes.
