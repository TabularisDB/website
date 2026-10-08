import {DuckDBIcon, MySQLIcon, PostgreSQLIcon, SQLiteIcon} from '@/components/ui/Icons/PluginIcons';
import {DiscordIcon, GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import {
    BotIcon,
    DatabaseIcon,
    GitBranchIcon,
    GlobeIcon,
    HandCoinsIcon,
    HistoryIcon,
    MapIcon,
    MousePointerClickIcon,
    NewspaperIcon,
    NotebookIcon,
    PlayIcon,
    PlugIcon,
    ShieldIcon,
    SirenIcon,
    StarIcon,
    UsersIcon,
} from 'lucide-react';
import Image from 'next/image';
import type {ReactNode} from 'react';

export type NavLink = {
    label: string;
    href: string;
    description?: string;
    badge?: string;
    isLink?: boolean;
    icon?: ReactNode;
    /** Image URL for raster logos; rendered lazily via next/image by NavLinkIcon. */
    iconSrc?: string;
    /** Intrinsic [width, height] of `iconSrc` when it isn't square, so next/image keeps the aspect ratio. */
    iconSize?: [number, number];
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
                        description: `One interface for Postgres, MySQL, SQLite and many others`,
                        icon: <DatabaseIcon />,
                    },
                    {
                        label: 'SQL Notebooks',
                        href: '/wiki/notebooks',
                        description: 'Reusable SQL and Markdown with inline charts',
                        icon: <NotebookIcon />,
                    },
                    {
                        label: 'Visual EXPLAIN',
                        href: '/wiki/visual-explain',
                        description: 'Execution plans as interactive graphs',
                        icon: <GitBranchIcon />,
                    },
                    {
                        label: 'Visual Query Builder',
                        href: '/wiki/visual-query-builder',
                        description: 'Compose joins and filters visually',
                        icon: <MousePointerClickIcon />,
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
                        icon: <BotIcon />,
                    },
                    {
                        label: 'Plugins',
                        href: '/plugins',
                        description: 'Extend any engine with a JSON-RPC driver',
                        icon: <PlugIcon />,
                    },
                    {
                        label: 'Bounty Board',
                        href: '/plugins/bounties',
                        description: 'Claim or sponsor the next database driver',
                        icon: <HandCoinsIcon />,
                    },
                    {
                        label: 'Roadmap',
                        href: '/roadmap',
                        description: "See what's shipping next",
                        icon: <MapIcon />,
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
                        icon: <PostgreSQLIcon />,
                    },
                    {
                        label: 'MySQL Client',
                        href: '/solutions/mysql-client-for-developers',
                        description: 'SQL editing, SSH, and reusable notebook analysis.',
                        icon: <MySQLIcon />,
                    },
                    {
                        label: 'SQLite Client',
                        href: '/solutions/sqlite-client-for-developers',
                        description: 'A lightweight workflow for local apps and prototypes.',
                        icon: <SQLiteIcon />,
                    },
                    {
                        label: 'DuckDB and Redis Workflows',
                        href: '/solutions/duckdb-redis-database-workflows',
                        description: 'Plugin-driven workflows for analytical use cases.',
                        icon: <DuckDBIcon />,
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
                        icon: <BotIcon />,
                    },
                    {
                        label: 'Secure Database Client',
                        href: '/solutions/secure-database-client',
                        description: 'SSH tunneling and system keychain storage.',
                        icon: <ShieldIcon />,
                    },
                    {
                        label: 'Database Client for On-Call Engineers',
                        href: '/solutions/database-client-for-on-call-engineers',
                        description: 'Reach production through SSH or Kubernetes tunnels.',
                        icon: <SirenIcon />,
                    },
                    {
                        label: 'Browse all solutions',
                        href: '/solutions',
                        isLink: true,
                    },
                ],
            },
        ],
    },
    {
        label: 'Resources',
        matchPrefixes: ['/blog', '/changelog', '/demos', '/sponsors'],
        columns: [
            {
                title: 'Learn',
                links: [
                    {
                        label: 'Blog',
                        href: '/blog',
                        description: 'Releases, deep dives, and product updates.',
                        icon: <NewspaperIcon />,
                    },
                    {
                        label: 'Changelog',
                        href: '/changelog',
                        description: 'Track what changed across recent releases.',
                        icon: <HistoryIcon />,
                    },
                    {
                        label: 'Product Demos',
                        href: '/demos',
                        description: 'Short videos for the workflows developers evaluate first.',
                        icon: <PlayIcon />,
                    },
                    {
                        label: 'Visual Explain Online',
                        href: 'https://explain.tabularis.dev',
                        description: 'Paste an execution plan and explore it in your browser.',
                        badge: 'New',
                        icon: <GlobeIcon />,
                    },
                ],
            },
            {
                title: 'Community',
                links: [
                    {
                        label: 'Contribute',
                        href: '/contribute',
                        description: 'Open issues across every project, and where to start.',
                        icon: <UsersIcon />,
                    },
                    {
                        label: 'Sponsors & supporters',
                        href: '/sponsors',
                        description: 'The organizations that help keep Tabularis free and independent.',
                        icon: <StarIcon />,
                    },
                    {
                        label: 'GitHub',
                        href: SOCIAL_URLS.github,
                        description: 'Source code, issues, discussions, and stars.',
                        icon: <GitHubIcon colored />,
                    },
                    {
                        label: 'Discord',
                        href: SOCIAL_URLS.discord,
                        description: 'Talk to users, contributors, and maintainers.',
                        icon: <DiscordIcon colored />,
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
                        iconSrc: '/img/logos/dbeaver.png',
                    },
                    {
                        label: 'DataGrip Alternative',
                        href: '/compare/datagrip-alternative',
                        description: 'Open workspace vs JetBrains IDE.',
                        iconSrc: '/img/logos/datagrip.png',
                    },
                    {
                        label: 'TablePlus Alternative',
                        href: '/compare/tableplus-alternative',
                        description: 'Open workspace vs polished proprietary GUI.',
                        iconSrc: '/img/logos/tableplus.png',
                        iconSize: [30, 22],
                    },
                    {
                        label: 'Navicat Alternative',
                        href: '/compare/navicat-alternative',
                        description: 'Open workspace vs per-seat commercial tool.',
                        iconSrc: '/img/logos/navicat.png',
                    },
                ],
            },
            {
                links: [
                    {
                        label: 'pgAdmin Alternative',
                        href: '/compare/pgadmin-alternative',
                        description: 'Desktop-first workspace vs PostgreSQL-only tool.',
                        icon: <PostgreSQLIcon />,
                    },
                    {
                        label: 'Beekeeper Studio Alternative',
                        href: '/compare/beekeeper-studio-alternative',
                        description: 'Broader workspace vs simple client.',
                        iconSrc: '/img/logos/beekeeper.png',
                        iconSize: [20, 22],
                    },
                    {
                        label: 'Browse all comparisons',
                        href: '/compare',
                        isLink: true,
                    },
                ],
            },
        ],
    },
    {
        label: 'Docs',
        href: '/wiki',
        matchPrefixes: ['/wiki'],
    },
];

export function NavLinkLabel({label, badge}: {label: string; badge?: string}) {
    if (!badge) return <strong>{label}</strong>;
    const words = label.split(' ');
    return (
        <strong>
            {words.length > 0 && <>{words.join(' ')} </>}
            <span className="badge">{badge}</span>
        </strong>
    );
}

export function NavLinkIcon({link}: {link: NavLink}) {
    if (link.iconSrc) {
        const [width, height] = link.iconSize ?? [22, 22];
        return <Image src={link.iconSrc} alt="" width={width} height={height} />;
    }
    return link.icon ?? null;
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
