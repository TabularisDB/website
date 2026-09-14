import type {ReactNode} from 'react';
import {Network, NotebookText, Blocks, Sparkles} from 'lucide-react';

export interface Feature {
    id: string;
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    linkLabel: string;
    videoSlug: string;
}

export const FEATURES: Feature[] = [
    {
        id: 'visual-explain',
        icon: <Network />,
        eyebrow: 'Visual EXPLAIN',
        title: 'See exactly why a query is slow.',
        description:
            'Turn execution plans into interactive graphs, exact node tables, raw output, and optional AI analysis. Spot costly scans, estimate gaps, and optimizer choices faster.',
        href: '/wiki/visual-explain',
        linkLabel: 'See it in the docs',
        videoSlug: 'visual-explain',
    },
    {
        id: 'notebooks',
        icon: <NotebookText />,
        eyebrow: 'SQL Notebooks',
        title: 'SQL and Markdown, in one reusable document.',
        description:
            'Combine SQL and Markdown in multi-cell workflows. Keep inline results, lightweight charts, shared variables, and parameters — repeatable analysis, not throwaway scratch files.',
        href: '/wiki/notebooks',
        linkLabel: 'Read the Notebooks guide',
        videoSlug: 'sql-notebooks',
    },
    {
        id: 'query-builder',
        icon: <Blocks />,
        eyebrow: 'Visual Query Builder',
        title: 'Build the query, read the SQL it generates.',
        description:
            'Build joins, filters, and aggregations visually, then inspect the generated SQL. Useful when exploring a schema or assembling a query before dropping down to raw SQL.',
        href: '/wiki/visual-query-builder',
        linkLabel: 'Explore the Query Builder',
        videoSlug: 'visual-query-builder',
    },
    {
        id: 'ai-assistant',
        icon: <Sparkles />,
        eyebrow: 'AI Assistance',
        title: 'Draft SQL from plain English, your provider.',
        description:
            'Explain unfamiliar queries and iterate faster while staying in control of your provider. Works with OpenAI, Anthropic, OpenRouter, or Ollama for fully local use.',
        href: '/wiki/ai-assistant',
        linkLabel: 'See how AI Assistance works',
        videoSlug: 'ai-assistant',
    },
];
