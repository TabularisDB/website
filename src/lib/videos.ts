export interface VideoDemo {
  slug: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  uploadDate: string;
  relatedHref: string;
  relatedLabel: string;
}

const VIDEO_DEMOS: VideoDemo[] = [
  {
    slug: "first-connection",
    title: "Create Your First Database Connection",
    description:
      "Connect Tabularis to a local or remote database and understand the connection workflow before your first query.",
    src: "/videos/wiki/01-first-connection.mp4",
    poster: "/videos/wiki/01-first-connection.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/connections",
    relatedLabel: "Read the connections guide",
  },
  {
    slug: "sql-editor",
    title: "Modern SQL Editor Workflow",
    description:
      "See how the SQL editor, result grid, execution controls, and query workflow fit together inside Tabularis.",
    src: "/videos/wiki/02-sql-editor.mp4",
    poster: "/videos/wiki/02-sql-editor.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/editor",
    relatedLabel: "Read the editor guide",
  },
  {
    slug: "visual-query-builder",
    title: "Visual Query Builder Demo",
    description:
      "Build joins, filters, and aggregations visually, then inspect the generated SQL before running it.",
    src: "/videos/wiki/03-visual-query-builder.mp4",
    poster: "/videos/wiki/03-visual-query-builder.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/visual-query-builder",
    relatedLabel: "Read the visual query builder guide",
  },
  {
    slug: "sql-notebooks",
    title: "SQL Notebooks for Reusable Analysis",
    description:
      "Combine SQL cells, markdown, inline results, parameters, and charts in a reusable database analysis workflow.",
    src: "/videos/wiki/04-sql-notebook.mp4",
    poster: "/videos/wiki/04-sql-notebook.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/solutions/sql-notebooks",
    relatedLabel: "Explore SQL notebooks",
  },
  {
    slug: "visual-explain",
    title: "Visual EXPLAIN Query Plan Analysis",
    description:
      "Turn database execution plans into graph views, table details, raw output, and AI-assisted recommendations.",
    src: "/videos/wiki/05-visual-explain.mp4",
    poster: "/videos/wiki/05-visual-explain.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/visual-explain",
    relatedLabel: "Read the Visual EXPLAIN guide",
  },
  {
    slug: "data-grid",
    title: "Interactive Data Grid Demo",
    description:
      "Explore query results in the Tabularis data grid with inline editing, filtering, sorting, and column tools.",
    src: "/videos/wiki/06-data-grid.mp4",
    poster: "/videos/wiki/06-data-grid.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/data-grid",
    relatedLabel: "Read the data grid guide",
  },
  {
    slug: "split-view",
    title: "Split View for Parallel Database Work",
    description:
      "Open multiple editors, notebooks, and result grids side by side to compare queries and work across connections.",
    src: "/videos/wiki/07-split-view.mp4",
    poster: "/videos/wiki/07-split-view.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/split-view",
    relatedLabel: "Read the split view guide",
  },
  {
    slug: "plugins",
    title: "Plugin Manager and Extensible Database Support",
    description:
      "Install, update, and manage external plugins that extend Tabularis beyond the built-in database engines.",
    src: "/videos/wiki/08-plugins.mp4",
    poster: "/videos/wiki/08-plugins.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/plugins",
    relatedLabel: "Browse plugins",
  },
  {
    slug: "ai-assistant",
    title: "AI Assistant for SQL Workflows",
    description:
      "Draft, explain, and refine SQL with an assistant that works inside your local database client workflow.",
    src: "/videos/wiki/09-ai-assistant.mp4",
    poster: "/videos/wiki/09-ai-assistant.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/ai-assistant",
    relatedLabel: "Read the AI assistant guide",
  },
  {
    slug: "keyboard-shortcuts",
    title: "Keyboard Shortcuts for Fast Database Work",
    description:
      "Navigate Tabularis, run queries, and manage tabs with keyboard shortcuts built for keyboard-driven workflows.",
    src: "/videos/wiki/10-keyboard-shortcuts.mp4",
    poster: "/videos/wiki/10-keyboard-shortcuts.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/keyboard-shortcuts",
    relatedLabel: "Read the keyboard shortcuts guide",
  },
  {
    slug: "favorites-history",
    title: "Favorites and Query History",
    description:
      "Save frequently used queries, browse your query history, and quickly return to recent SQL across sessions.",
    src: "/videos/wiki/11-favorites-history.mp4",
    poster: "/videos/wiki/11-favorites-history.jpg",
    uploadDate: "2026-04-24",
    relatedHref: "/wiki/saved-queries",
    relatedLabel: "Read the saved queries guide",
  },
  {
    slug: "ai-approval-gate",
    title: "AI Approval Gate with Pre-flight EXPLAIN",
    description:
      "Pause an MCP write before it runs, review the SQL and the execution plan inside the approval modal, then approve, edit, or deny.",
    src: "/videos/wiki/12-ai-approval-gate.mp4",
    poster: "/videos/wiki/12-ai-approval-gate.jpg",
    uploadDate: "2026-05-13",
    relatedHref: "/wiki/mcp-approval-gates",
    relatedLabel: "Read the approval gates guide",
  },
  {
    slug: "json-viewer",
    title: "JSON / JSONB Cell Viewer with Diff",
    description:
      "Expand JSON and JSONB cells into a Monaco editor with syntax highlighting, open them in a dedicated window, and diff edits before commit.",
    src: "/videos/wiki/13-json-viewer.mp4",
    poster: "/videos/wiki/13-json-viewer.jpg",
    uploadDate: "2026-05-18",
    relatedHref: "/wiki/data-grid#json--long-text-cells",
    relatedLabel: "Read the data grid guide",
  },
  {
    slug: "long-text-cells",
    title: "Long Text Cells with Monaco and Diff",
    description:
      "Edit TEXT, LONGTEXT, and long VARCHAR columns inline with a Monaco editor, resize the pane, and review changes side-by-side before saving.",
    src: "/videos/wiki/14-long-text-cells.mp4",
    poster: "/videos/wiki/14-long-text-cells.jpg",
    uploadDate: "2026-05-18",
    relatedHref: "/wiki/data-grid#json--long-text-cells",
    relatedLabel: "Read the data grid guide",
  },
  {
    slug: "foreign-key-navigation",
    title: "Foreign Key Navigation in the Data Grid",
    description:
      "Click the ↗ icon on a foreign key cell — or use the context menu — to jump straight to the referenced row in the parent table.",
    src: "/videos/wiki/15-foreign-key-navigation.mp4",
    poster: "/videos/wiki/15-foreign-key-navigation.jpg",
    uploadDate: "2026-05-19",
    relatedHref: "/wiki/data-grid#foreign-key-navigation",
    relatedLabel: "Read the data grid guide",
  },
  {
    slug: "per-connection-appearance",
    title: "Per-Connection Accent Color and Icon",
    description:
      "Paint each connection with its own accent color and icon — pick from a curated palette, a 30-icon pack, an emoji, or upload your own image — so two MySQL connections never look the same again.",
    src: "/videos/wiki/16-per-connection-appearance.mp4",
    poster: "/videos/wiki/16-per-connection-appearance.jpg",
    uploadDate: "2026-05-25",
    relatedHref: "/wiki/connections#per-connection-appearance",
    relatedLabel: "Read the connections guide",
  },
  {
    slug: "related-records-panel",
    title: "Related Records Panel for Foreign Keys",
    description:
      "Click any foreign key value to slide up an inline panel with the referenced row — drag to resize, swap content by clicking other FKs, or hand off to a full tab when you're ready to navigate.",
    src: "/videos/wiki/17-related-records-panel.mp4",
    poster: "/videos/wiki/17-related-records-panel.jpg",
    uploadDate: "2026-05-25",
    relatedHref: "/wiki/data-grid#related-records-panel",
    relatedLabel: "Read the data grid guide",
  },
  {
    slug: "delete-row-shortcut",
    title: "Delete Rows with Delete or Backspace",
    description:
      "Select one or more rows and press Delete or Backspace to mark them for deletion — same behavior as the context menu, just reachable from the keyboard.",
    src: "/videos/wiki/18-delete-row-shortcut.mp4",
    poster: "/videos/wiki/18-delete-row-shortcut.jpg",
    uploadDate: "2026-05-25",
    relatedHref: "/wiki/data-grid#deleting-rows",
    relatedLabel: "Read the data grid guide",
  },
  {
    slug: "quick-navigator",
    title: "Quick Navigator for Schema Objects",
    description:
      "Press Cmd+P / Ctrl+P to jump to any table, view, routine, or trigger in any database or schema of the active connection — in the spirit of the \"go to anything\" palette every code editor has.",
    src: "/videos/wiki/19-quick-navigator.mp4",
    poster: "/videos/wiki/19-quick-navigator.jpg",
    uploadDate: "2026-06-03",
    relatedHref: "/wiki/quick-navigator",
    relatedLabel: "Read the Quick Navigator guide",
  },
  {
    slug: "import-connections",
    title: "Import Connections from Other SQL Clients",
    description:
      "Import saved connections from DBeaver, Beekeeper Studio, TablePlus, DataGrip, or Sequel Ace — review what was found, resolve duplicates, and assign groups before merging.",
    src: "/videos/posts/tabularis-import-connections.mp4",
    poster: "/videos/posts/tabularis-import-connections.jpg",
    uploadDate: "2026-07-14",
    relatedHref: "/wiki/connections",
    relatedLabel: "Read the connections guide",
  },
  {
    slug: "nested-connection-groups",
    title: "Nested Connection Groups",
    description:
      "Organize connections in folders inside folders: create whole group chains with slash-separated paths, add subfolders inline, and drag groups into one another.",
    src: "/videos/posts/tabularis-nested-groups.mp4",
    poster: "/videos/posts/tabularis-nested-groups.jpg",
    uploadDate: "2026-07-14",
    relatedHref: "/wiki/connections",
    relatedLabel: "Read the connections guide",
  },
];

export function getAllVideoDemos(): VideoDemo[] {
  return VIDEO_DEMOS;
}

export function getVideoDemoBySlug(slug: string): VideoDemo | null {
  return VIDEO_DEMOS.find((video) => video.slug === slug) ?? null;
}
