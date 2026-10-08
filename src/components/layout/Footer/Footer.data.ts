import {SOCIAL_URLS} from '@/lib/social';

export interface ClosingCtaContent {
    title: string;
    description: string;
}

interface ClosingCtaRule {
    path: string;
    matchSubpagesOnly?: boolean;
    excludePrefixes?: string[];
    content: ClosingCtaContent;
}

const CLOSING_CTA_RULES: ClosingCtaRule[] = [
    {
        path: '/',
        content: {
            title: 'No trial. No account. Just the app.',
            description:
                'Free and open source (Apache 2.0). Download it for Windows, macOS, Linux, or Docker. If it looks useful, a star on GitHub helps more developers discover it.',
        },
    },
    {
        path: '/changelog',
        content: {
            title: 'Get the latest version.',
            description:
                'Every release above ships to Windows, macOS, and Linux. Tabularis is free and open source (Apache 2.0), and a star on GitHub helps more developers discover it.',
        },
    },
    {
        path: '/blog',
        matchSubpagesOnly: true,
        excludePrefixes: ['/blog/category', '/blog/author'],
        content: {
            title: 'Enjoyed this post? Try Tabularis.',
            description:
                'Free and open source (Apache 2.0). Download it for Windows, macOS, or Linux, or Docker. If you like what you read, a star on GitHub helps more developers discover it.',
        },
    },
    {
        path: '/brand',
        content: {
            title: 'Know the app behind the logo.',
            description:
                'Whatever you make with these assets, it helps to know the app they represent. Download Tabularis and try it on a real database. It’s free and open source (Apache 2.0).',
        },
    },
    {
        path: '/demos',
        matchSubpagesOnly: true,
        content: {
            title: 'Like what you just saw?',
            description:
                'This demo is a quick way to evaluate the workflow before installing Tabularis locally. If it matches your use case, download the desktop app and test it against a real development database.',
        },
    },
    {
        path: '/wiki',
        matchSubpagesOnly: true,
        content: {
            title: 'Reading the docs without the app?',
            description:
                'Tabularis is free and open source (Apache 2.0). Download it and try this workflow against a real database. If the docs helped, a star on GitHub goes a long way.',
        },
    },
    {
        path: '/plugins',
        excludePrefixes: ['/plugins/bounties'],
        content: {
            title: 'Plugins need the app first.',
            description:
                'Every driver above installs in one click from Settings → Plugins. Tabularis is free and open source (Apache 2.0). Download it and extend it with the engines you actually use.',
        },
    },
    {
        path: '/compare',
        matchSubpagesOnly: true,
        content: {
            title: 'Run the comparison on your own workflow.',
            description:
                'The honest benchmark is your own database. Tabularis is free and open source under Apache 2.0, so you can download it, connect it to a real project, and see how it compares.',
        },
    },
    {
        path: '/solutions',
        matchSubpagesOnly: true,
        content: {
            title: 'Try this workflow locally.',
            description:
                'Tabularis is free and open source (Apache 2.0). Download it for your platform and test it against a real development database. A star on GitHub helps more developers find it.',
        },
    },
    {
        path: '/roadmap',
        matchSubpagesOnly: true,
        content: {
            title: 'Help shape this roadmap.',
            description:
                'The best feedback comes from real usage. Tabularis is free and open source (Apache 2.0). Download it, try it on your databases, and tell us what should come next. A star on GitHub supports the project too.',
        },
    },
];

export function getClosingCtaContent(pathname: string): ClosingCtaContent | null {
    const matches = CLOSING_CTA_RULES.filter((rule) => {
        const isExact = pathname === rule.path;
        const isSubpage = pathname.startsWith(`${rule.path}/`);
        const isExcluded =
            rule.excludePrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ?? false;

        if (isExcluded) return false;
        if (rule.matchSubpagesOnly) return isSubpage;
        return isExact || isSubpage;
    });

    const best = matches.sort((a, b) => b.path.length - a.path.length)[0];
    return best ? best.content : null;
}

export interface FooterColumn {
    title: string;
    links: {label: string; href: string}[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
    {
        title: 'Product',
        links: [
            {label: 'Multi-Database', href: '/wiki/connections'},
            {label: 'SQL Notebooks', href: '/wiki/notebooks'},
            {label: 'Visual EXPLAIN', href: '/wiki/visual-explain'},
            {label: 'MCP Server', href: '/wiki/mcp-server'},
            {label: 'Plugins', href: '/plugins'},
            {label: 'Bounty Board', href: '/plugins/bounties'},
        ],
    },
    {
        title: 'Resources',
        links: [
            {label: 'Blog', href: '/blog'},
            {label: 'Changelog', href: '/changelog'},
            {label: 'Product Demos', href: '/demos'},
            {label: 'Compare', href: '/compare'},
            {label: 'Roadmap', href: '/roadmap'},
            {label: 'Brand Assets', href: '/brand'},
        ],
    },
    {
        title: 'Community',
        links: [
            {label: 'Contribute', href: '/contribute'},
            {label: 'GitHub', href: SOCIAL_URLS.github},
            {label: 'Discord', href: SOCIAL_URLS.discord},
            {label: 'Sponsors & supporters', href: '/sponsors'},
        ],
    },
];
