import {
    Bot,
    Database,
    NotebookPen,
    LineChart,
    MousePointerClick,
    Terminal,
    HardDrive,
    ShieldCheck,
    Siren,
    Network,
    Table,
    Puzzle,
    Layers,
    Apple,
    MonitorSmartphone,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

export const CATEGORY_ORDER = [
    'By database engine',
    'By workflow',
    'By platform',
    'By team & access',
    'Alternatives & extensibility',
];

const CATEGORY_BY_SLUG: Record<string, string> = {
    'postgresql-client': 'By database engine',
    'mysql-client-for-developers': 'By database engine',
    'sqlite-client-for-developers': 'By database engine',

    'mcp-database-client': 'By workflow',
    'sql-notebooks': 'By workflow',
    'visual-explain': 'By workflow',
    'visual-query-builder': 'By workflow',

    'postgres-gui-for-mac': 'By platform',
    'open-source-database-client-linux': 'By platform',
    'free-database-client-windows': 'By platform',

    'secure-database-client': 'By team & access',
    'database-client-for-on-call-engineers': 'By team & access',
    'ssh-database-client': 'By team & access',

    'sqlite-browser-linux': 'Alternatives & extensibility',
    'mysql-workbench-replacement': 'Alternatives & extensibility',
    'plugin-based-database-client': 'Alternatives & extensibility',
    'duckdb-redis-database-workflows': 'Alternatives & extensibility',
};

const ICON_BY_SLUG: Record<string, LucideIcon> = {
    'postgresql-client': Database,
    'mysql-client-for-developers': Table,
    'sqlite-client-for-developers': HardDrive,
    'mcp-database-client': Bot,
    'sql-notebooks': NotebookPen,
    'visual-explain': LineChart,
    'visual-query-builder': MousePointerClick,
    'postgres-gui-for-mac': Apple,
    'open-source-database-client-linux': Terminal,
    'free-database-client-windows': MonitorSmartphone,
    'secure-database-client': ShieldCheck,
    'database-client-for-on-call-engineers': Siren,
    'ssh-database-client': Network,
    'sqlite-browser-linux': HardDrive,
    'mysql-workbench-replacement': Table,
    'plugin-based-database-client': Puzzle,
    'duckdb-redis-database-workflows': Layers,
};

export function getCategoryForSlug(slug: string): string {
    return CATEGORY_BY_SLUG[slug] ?? 'Other';
}

export function getIconForSlug(slug: string): LucideIcon {
    return ICON_BY_SLUG[slug] ?? Database;
}
