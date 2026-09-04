export interface ComparisonProduct {
  name: string;
  logo: string;
  width: number;
  height: number;
}

export interface ComparisonRow {
  feature: string;
  values: string[];
}

export interface ComparisonTableData {
  products: ComparisonProduct[];
  rows: ComparisonRow[];
}

const TABULARIS: ComparisonProduct = {
  name: "Tabularis",
  logo: "/img/logo.png",
  width: 120,
  height: 120,
};

const DBEAVER: ComparisonProduct = {
  name: "DBeaver",
  logo: "/img/logos/dbeaver.png",
  width: 100,
  height: 100,
};

const TABLEPLUS: ComparisonProduct = {
  name: "TablePlus",
  logo: "/img/logos/tableplus.png",
  width: 100,
  height: 100,
};

const DATAGRIP: ComparisonProduct = {
  name: "DataGrip",
  logo: "/img/logos/datagrip.png",
  width: 100,
  height: 100,
};

const BEEKEEPER: ComparisonProduct = {
  name: "Beekeeper Studio",
  logo: "/img/logos/beekeeper.png",
  width: 100,
  height: 110,
};

const DBGATE: ComparisonProduct = {
  name: "DbGate",
  logo: "/img/logos/dbgate.png",
  width: 100,
  height: 100,
};

const NAVICAT: ComparisonProduct = {
  name: "Navicat",
  logo: "/img/logos/navicat.png",
  width: 312,
  height: 80,
};

const PGADMIN: ComparisonProduct = {
  name: "pgAdmin",
  logo: "/img/logos/pgadmin.png",
  width: 100,
  height: 100,
};

const PHPMYADMIN: ComparisonProduct = {
  name: "phpMyAdmin",
  logo: "/img/logos/phpmyadmin.png",
  width: 170,
  height: 100,
};

const HEIDISQL: ComparisonProduct = {
  name: "HeidiSQL",
  logo: "/img/logos/heidisql.png",
  width: 100,
  height: 100,
};

const TABULARIS_CORE_ROWS = {
  license: "Open-source",
  pricing: "Free",
  notebooks: "✅ Native",
  plugins: "✅ Modern, JSON-RPC drivers",
  mcp: "✅ Built-in",
  editor: "Monaco-based",
  ssh: "✅",
  databases: "PostgreSQL, MySQL/MariaDB, SQLite (+ plugins)",
  platforms: "macOS · Linux · Windows",
};

function table(
  products: ComparisonProduct[],
  rows: ComparisonRow[],
): ComparisonTableData {
  return { products, rows };
}

export const comparisonTables: Record<string, ComparisonTableData> = {
  "dbeaver-alternative": table(
    [TABULARIS, DBEAVER],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (Apache 2.0) / Paid PRO"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free (CE) · Paid (PRO, Enterprise)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "✅ Eclipse-based"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Eclipse text editor"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "80+ via JDBC"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms + " (Tauri)", "macOS · Linux · Windows (Eclipse RCP)"] },
      { feature: "Bundle size", values: ["~15 MB", "~200 MB"] },
    ],
  ),

  "tabularis-vs-dbeaver": table(
    [TABULARIS, DBEAVER],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (Apache 2.0) / Paid PRO"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free (CE) · Paid (PRO, Enterprise)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "✅ Eclipse-based"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Eclipse text editor"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "80+ via JDBC"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms + " (Tauri)", "macOS · Linux · Windows (Eclipse RCP)"] },
      { feature: "Bundle size", values: ["~15 MB", "~200 MB"] },
    ],
  ),

  "tableplus-alternative": table(
    [TABULARIS, TABLEPLUS],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Proprietary"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Freemium · Paid license"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "❌"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Custom native"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "~20 backends"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms, "macOS · Linux · Windows · iOS"] },
      { feature: "Open to community", values: ["✅", "❌"] },
    ],
  ),

  "tabularis-vs-tableplus": table(
    [TABULARIS, TABLEPLUS],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Proprietary"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Freemium · Paid license"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "❌"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Custom native"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "~20 backends"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms, "macOS · Linux · Windows · iOS"] },
      { feature: "Open to community", values: ["✅", "❌"] },
    ],
  ),

  "datagrip-alternative": table(
    [TABULARIS, DATAGRIP],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Proprietary (JetBrains)"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Paid (subscription)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "✅ JetBrains marketplace"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "IntelliJ editor"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "Many via JDBC"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms, "macOS · Linux · Windows"] },
      { feature: "Runtime", values: ["Tauri, native", "IntelliJ platform (JVM)"] },
    ],
  ),

  "beekeeper-studio-alternative": table(
    [TABULARIS, BEEKEEPER],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (GPLv3) / Paid Ultimate"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free (Community) · Paid (Ultimate)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "Limited"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "CodeMirror"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "PG, MySQL, SQLite, SQL Server, MariaDB, others"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms + " (Tauri)", "macOS · Linux · Windows (Electron)"] },
    ],
  ),

  "dbgate-alternative": table(
    [TABULARIS, DBGATE],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (MIT) / Paid Premium"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free (CE) · Paid (Premium)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "Limited"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "✅"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Monaco-based"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "PG, MySQL, SQLite, MS SQL, MongoDB"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms + " (Tauri)", "macOS · Linux · Windows · web (Electron)"] },
    ],
  ),

  "navicat-alternative": table(
    [TABULARIS, NAVICAT],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Proprietary"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Paid (per-seat license)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "❌"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Custom native"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "Many (incl. Oracle, SQL Server)"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms, "macOS · Linux · Windows · iOS"] },
    ],
  ),

  "pgadmin-alternative": table(
    [TABULARIS, PGADMIN],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (PostgreSQL License)"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free"] },
      { feature: "Delivery", values: ["Native desktop app", "Web app / desktop wrapper"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "Limited"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Custom (CodeMirror)"] },
      { feature: "SSH tunneling", values: ["✅ Keychain-backed", "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "PostgreSQL only"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms, "macOS · Linux · Windows · web"] },
    ],
  ),

  "phpmyadmin-alternative": table(
    [TABULARIS, PHPMYADMIN],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (GPLv2)"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free"] },
      { feature: "Delivery", values: ["Native desktop app", "Web app (PHP)"] },
      { feature: "Security model", values: ["Local, keychain-backed", "Web UI next to database"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "Limited"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Basic textarea"] },
      { feature: "SSH tunneling", values: ["✅ Built-in", "Via reverse tunnel only"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "MySQL, MariaDB"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms, "Any browser"] },
    ],
  ),

  "heidisql-alternative": table(
    [TABULARIS, HEIDISQL],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Open-source (GPLv2)"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Free"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "Limited"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Custom (Scintilla)"] },
      { feature: "SSH tunneling", values: ["✅ Keychain-backed", "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "MySQL, MariaDB, PostgreSQL, SQL Server, SQLite"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms + " (native)", "Windows native · Wine elsewhere"] },
      { feature: "Cross-platform parity", values: ["✅ True", "❌"] },
    ],
  ),

  "tableplus-vs-datagrip-vs-tabularis": table(
    [TABULARIS, TABLEPLUS, DATAGRIP],
    [
      { feature: "License", values: [TABULARIS_CORE_ROWS.license, "Proprietary", "Proprietary"] },
      { feature: "Pricing", values: [TABULARIS_CORE_ROWS.pricing, "Freemium · Paid license", "Paid (subscription)"] },
      { feature: "SQL notebooks", values: [TABULARIS_CORE_ROWS.notebooks, "❌", "❌"] },
      { feature: "Plugin system", values: [TABULARIS_CORE_ROWS.plugins, "❌", "✅ JetBrains marketplace"] },
      { feature: "MCP / AI integration", values: [TABULARIS_CORE_ROWS.mcp, "❌", "❌"] },
      { feature: "Editor", values: [TABULARIS_CORE_ROWS.editor, "Custom native", "IntelliJ editor"] },
      { feature: "SSH tunneling", values: [TABULARIS_CORE_ROWS.ssh, "✅", "✅"] },
      { feature: "Databases", values: [TABULARIS_CORE_ROWS.databases, "~20 backends", "Many via JDBC"] },
      { feature: "Platforms", values: [TABULARIS_CORE_ROWS.platforms + " (Tauri)", "macOS · Linux · Windows · iOS", "macOS · Linux · Windows (JVM)"] },
    ],
  ),
};

export function getComparisonTable(slug: string): ComparisonTableData | null {
  return comparisonTables[slug] ?? null;
}
