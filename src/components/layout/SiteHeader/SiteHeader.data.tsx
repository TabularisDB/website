import {SOCIAL_URLS} from '@/lib/social';

export type NavLink = {
    label: string;
    href: string;
    description?: string;
    badge?: string;
    isLink?: boolean;
};

export type NavColumn = {
    title?: string;
    links: NavLink[];
};

export type NavGroup = {
    label: string;
    href?: string;
    matchPrefixes: string[];
    columns?: NavColumn[];
};

export const navGroups: NavGroup[] = [
    {
        label: 'Product',
        matchPrefixes: ['/plugins', '/download', '/roadmap'],
        columns: [
            {
                title: 'Workspace',
                links: [
                    {
                        label: 'Multi-Database',
                        href: '/wiki/connections',
                        description: 'One interface for Postgres, MySQL, SQLite and 20+ others',
                    },
                    {
                        label: 'SQL Notebooks',
                        href: '/wiki/notebooks',
                        description: 'Reusable SQL and Markdown with inline charts',
                    },
                    {
                        label: 'Visual EXPLAIN',
                        href: '/wiki/visual-explain',
                        description: 'Execution plans as interactive graphs',
                    },
                    {
                        label: 'Visual Query Builder',
                        href: '/wiki/visual-query-builder',
                        description: 'Compose joins and filters visually',
                    },
                ],
            },
            {
                title: 'Platform',
                links: [
                    {
                        label: 'MCP Server',
                        href: '/wiki/mcp-server',
                        description: 'Let AI agents run queries through Tabularis',
                    },
                    {
                        label: 'Plugins',
                        href: '/plugins',
                        description: 'Extend any engine with a JSON-RPC driver',
                    },
                    {
                        label: 'Bounty Board',
                        href: '/plugins/bounties',
                        description: 'Claim or sponsor the next database driver',
                    },
                    {
                        label: 'Roadmap',
                        href: '/roadmap',
                        description: "See what's shipping next",
                    },
                ],
            },
        ],
    },
    {
        label: 'Solutions',
        matchPrefixes: ['/solutions'],
        columns: [
            {
                title: 'By engine',
                links: [
                    {
                        label: 'PostgreSQL Client',
                        href: '/solutions/postgresql-client',
                        description: 'SQL editing, schema tools, SSH, and notebooks.',
                    },
                    {
                        label: 'MySQL Client',
                        href: '/solutions/mysql-client-for-developers',
                        description: 'SQL editing, SSH, and reusable notebook analysis.',
                    },
                    {
                        label: 'SQLite Client',
                        href: '/solutions/sqlite-client-for-developers',
                        description: 'A lightweight workflow for local apps and prototypes.',
                    },
                    {
                        label: 'DuckDB and Redis Workflows',
                        href: '/solutions/duckdb-redis-database-workflows',
                        description: 'Plugin-driven workflows for analytical use cases.',
                    },
                ],
            },
            {
                title: 'By workflow',
                links: [
                    {
                        label: 'For AI Agents (MCP-native)',
                        href: '/solutions/mcp-database-client',
                        description: 'Give Claude, Cursor, and Devin schema-aware access.',
                    },
                    {
                        label: 'Secure Database Client',
                        href: '/solutions/secure-database-client',
                        description: 'SSH tunneling and system keychain storage.',
                    },
                    {
                        label: 'Plugin-Based Database Client',
                        href: '/solutions/plugin-based-database-client',
                        description: 'Extend Tabularis with custom engines and workflows.',
                    },
                    {
                        label: 'Database Client for On-Call Engineers',
                        href: '/solutions/database-client-on-call-engineers',
                        description: 'Reach production through SSH or Kubernetes tunnels.',
                    },
                ],
            },
        ],
    },
    {
        label: 'Resources',
        matchPrefixes: ['/blog', '/changelog', '/videos', '/sponsors'],
        columns: [
            {
                title: 'Learn',
                links: [
                    {
                        label: 'Blog',
                        href: '/blog',
                        description: 'Releases, deep dives, and product updates.',
                    },
                    {
                        label: 'Changelog',
                        href: '/changelog',
                        description: 'Track what changed across recent releases.',
                    },
                    {
                        label: 'Product Demos',
                        href: '/videos',
                        description: 'Short videos for the workflows developers evaluate first.',
                    },
                    {
                        label: 'Visual Explain Online',
                        href: 'https://explain.tabularis.dev',
                        description: 'Paste an execution plan and explore it in your browser.',
                        badge: 'New',
                    },
                ],
            },
            {
                title: 'Community',
                links: [
                    {
                        label: 'GitHub',
                        href: SOCIAL_URLS.github,
                        description: 'Source code, issues, discussions, and stars.',
                    },
                    {
                        label: 'Discord',
                        href: SOCIAL_URLS.discord,
                        description: 'Talk to users, contributors, and maintainers.',
                    },
                    {
                        label: 'Sponsors & supporters',
                        href: '/sponsors',
                        description: 'The organizations that help keep Tabularis free and independent.',
                    },
                ],
            },
        ],
    },
    {
        label: 'Compare',
        matchPrefixes: ['/compare'],
        columns: [
            {
                links: [
                    {
                        label: 'DBeaver Alternative',
                        href: '/compare/dbeaver-alternative',
                        description: 'Open-source workspace vs mature IDE.',
                    },
                    {
                        label: 'DataGrip Alternative',
                        href: '/compare/datagrip-alternative',
                        description: 'Open workspace vs JetBrains IDE.',
                    },
                    {
                        label: 'TablePlus Alternative',
                        href: '/compare/tableplus-alternative',
                        description: 'Open workspace vs polished proprietary GUI.',
                    },
                    {
                        label: 'Navicat Alternative',
                        href: '/compare/navicat-alternative',
                        description: 'Open workspace vs per-seat commercial tool.',
                    },
                ],
            },
            {
                links: [
                    {
                        label: 'pgAdmin Alternative',
                        href: '/compare/pgadmin-alternative',
                        description: 'Desktop-first workspace vs PostgreSQL-only tool.',
                    },
                    {
                        label: 'Beekeeper Studio Alternative',
                        href: '/compare/beekeeper-studio-alternative',
                        description: 'Broader workspace vs simple client.',
                    },
                    {
                        label: 'Browse all comparisons →',
                        href: '/compare',
                        isLink: true,
                    },
                ],
            },
        ],
    },
];

export function NavLinkLabel({label, badge}: {label: string; badge?: string}) {
    if (!badge) return <strong>{label}</strong>;
    const words = label.split(' ');
    const last = words.pop();
    return (
        <strong>
            {words.length > 0 && <>{words.join(' ')} </>}
            <span className="nav-badge-keep">
                {last}
                <span className="nav-badge-new">{badge}</span>
            </span>
        </strong>
    );
}

export function isActive(pathname: string, group: NavGroup): boolean {
    if (group.matchPrefixes.some((prefix) => pathname.startsWith(prefix))) {
        return true;
    }
    if (group.columns) {
        return group.columns.some((column) =>
            column.links.some((link) => !link.href.startsWith('http') && pathname.startsWith(link.href)),
        );
    }
    return false;
}
