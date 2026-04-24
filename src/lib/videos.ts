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
];

export function getAllVideoDemos(): VideoDemo[] {
  return VIDEO_DEMOS;
}

export function getVideoDemoBySlug(slug: string): VideoDemo | null {
  return VIDEO_DEMOS.find((video) => video.slug === slug) ?? null;
}
