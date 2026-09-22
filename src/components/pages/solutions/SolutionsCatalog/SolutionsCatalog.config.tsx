import {MySQLIcon, PostgreSQLIcon, SQLiteIcon} from '@/components/ui/Icons/PluginIcons';
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
import {McpIcon} from '../../home/ProductOverview/Diagram/icons/AgentIcons';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '@/components/ui/Icons/PlatformIcons';

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

    'postgres-gui-mac': 'By platform',
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

const ICON_BY_SLUG: Record<string, React.ReactNode> = {
    'postgresql-client': <PostgreSQLIcon />,
    'mysql-client-for-developers': <MySQLIcon />,
    'sqlite-client-for-developers': <SQLiteIcon />,
    'mcp-database-client': <McpIcon />,
    'sql-notebooks': <NotebookPen />,
    'visual-explain': <LineChart />,
    'visual-query-builder': <MousePointerClick />,
    'postgres-gui-mac': <MacOsIcon />,
    'open-source-database-client-linux': <LinuxIcon />,
    'free-database-client-windows': <WindowsIcon />,
    'secure-database-client': <ShieldCheck />,
    'database-client-for-on-call-engineers': <Siren />,
    'ssh-database-client': <Network />,
    'sqlite-browser-linux': <HardDrive />,
    'mysql-workbench-replacement': <Table />,
    'plugin-based-database-client': <Puzzle />,
    'duckdb-redis-database-workflows': <Layers />,
};

export function getCategoryForSlug(slug: string): string {
    return CATEGORY_BY_SLUG[slug] ?? 'Other';
}

export function getIconForSlug(slug: string): React.ReactNode {
    return ICON_BY_SLUG[slug] ?? <Database />;
}
