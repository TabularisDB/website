import {Bot, Database, GitCompare, Terminal, HardDrive, Table, ShieldCheck, Puzzle, Layers} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

export interface SolutionItem {
    href: string;
    title: string;
    excerpt: string;
    icon: LucideIcon;
}

export const SEO_ENTRY_POINTS: SolutionItem[] = [
    {
        href: '/solutions/mcp-database-client',
        title: 'Give Your AI Agent Database Access',
        excerpt: 'Let Claude, Cursor, and Devin read your schema and run queries safely, through Tabularis.',
        icon: Bot,
    },
    {
        href: '/solutions/postgresql-client',
        title: 'Work in PostgreSQL',
        excerpt: 'Edit SQL, browse schemas, tunnel over SSH, and keep reusable notebooks — all in one workflow.',
        icon: Database,
    },
    {
        href: '/compare/dbeaver-alternative',
        title: 'Move On From DBeaver',
        excerpt: 'Weighing a more modern open-source workflow against DBeaver? Start here.',
        icon: GitCompare,
    },
    {
        href: '/solutions/open-source-database-client-linux',
        title: 'Run It on Linux',
        excerpt: 'Get the same SQL editing and SSH tooling on Linux, with full cross-platform parity.',
        icon: Terminal,
    },
    {
        href: '/solutions/sqlite-client-for-developers',
        title: 'Prototype With SQLite',
        excerpt: 'Debug local apps, prototypes, and migrations with a workflow built for SQLite files.',
        icon: HardDrive,
    },
    {
        href: '/solutions/mysql-client-for-developers',
        title: 'Work in MySQL / MariaDB',
        excerpt: 'Edit SQL, tunnel over SSH, and keep reusable notebooks for MySQL and MariaDB.',
        icon: Table,
    },
    {
        href: '/solutions/secure-database-client',
        title: 'Keep Access Locked Down',
        excerpt: 'Keep secrets in your system keychain and reach databases through SSH tunnels, entirely local-first.',
        icon: ShieldCheck,
    },
    {
        href: '/solutions/duckdb-redis-database-workflows',
        title: 'Mix DuckDB and Redis',
        excerpt: 'Go beyond built-in engines with plugin-driven workflows for analytical and mixed-stack use cases.',
        icon: Layers,
    },
];
