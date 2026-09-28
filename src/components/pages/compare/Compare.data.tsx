export interface ComparePreview {
    tools: string[];
    accent: string;
    highlights?: string[];
}

export const COMPARE_PREVIEW_MAP: Record<string, ComparePreview> = {
    'dbeaver-alternative': {
        tools: ['tabularis', 'dbeaver'],
        accent: 'Open-source SQL workspace',
        highlights: ['SQL notebooks', 'MCP / AI-native workflows', 'Plugin extensibility'],
    },
    'tableplus-alternative': {
        tools: ['tabularis', 'tableplus'],
        accent: 'Cross-platform SQL workflow',
        highlights: ['Open-source', 'Cross-platform (Win/macOS/Linux)', 'SQL notebooks'],
    },
    'datagrip-alternative': {
        tools: ['tabularis', 'datagrip'],
        accent: 'IDE vs workspace',
        highlights: ['Open-source', 'SQL notebooks', 'MCP / AI-native workflows'],
    },
    'beekeeper-studio-alternative': {
        tools: ['tabularis', 'beekeeper'],
        accent: 'Simple client vs broader workflow',
        highlights: ['SQL notebooks', 'MCP / AI-native workflows', 'Plugin extensibility'],
    },
    'dbgate-alternative': {
        tools: ['tabularis', 'dbgate'],
        accent: 'Modern open-source workflow',
        highlights: ['SQL notebooks', 'MCP / AI-native workflows'],
    },
    'tableplus-vs-datagrip-vs-tabularis': {
        tools: ['tabularis', 'datagrip', 'tableplus'],
        accent: 'Polished GUI vs IDE vs open workspace',
    },
    'navicat-alternative': {
        tools: ['tabularis', 'navicat'],
        accent: 'Commercial admin vs open workspace',
        highlights: ['No per-seat licensing', 'SQL notebooks', 'MCP / AI-native workflows'],
    },
    'pgadmin-alternative': {
        tools: ['tabularis', 'pgadmin'],
        accent: 'PostgreSQL desktop workspace',
        highlights: [
            'Desktop-first (not browser-based)',
            'Built-in SSH tunneling',
            'Multi-database (Postgres + MySQL + SQLite)',
        ],
    },
    'phpmyadmin-alternative': {
        tools: ['tabularis', 'phpmyadmin'],
        accent: 'Desktop client vs web panel',
        highlights: ['No web-exposed admin panel', 'Built-in SSH tunneling', 'Multi-database support'],
    },
    'heidisql-alternative': {
        tools: ['tabularis', 'heidisql'],
        accent: 'Cross-platform native workflow',
        highlights: ['Native macOS/Linux/Windows (no Wine)', 'Monaco-based editor', 'SQL notebooks'],
    },
    'tabularis-vs-dbeaver': {tools: ['tabularis', 'dbeaver'], accent: 'Open workspace vs mature IDE'},
    'tabularis-vs-tableplus': {tools: ['tabularis', 'tableplus'], accent: 'Open workspace vs polished GUI'},
};
