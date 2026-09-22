import type {Metadata} from 'next';
import Link from 'next/link';
import {BookOpen, Bot, Database, LayoutGrid, Plug, Rocket, Settings2, Shield} from 'lucide-react';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {WikiLayout} from '@/components/pages/wiki/WikiLayout/WikiLayout';
import {getWikiPagesByCategory, WIKI_CATEGORIES} from '@/lib/wiki';
import type {WikiCategory} from '@/lib/wiki';
import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Wiki | Tabularis',
    description: 'Learn everything about Tabularis features and how to use them.',
};

const CATEGORY_ICONS: Record<WikiCategory, React.ReactNode> = {
    'Getting Started': <Rocket size={18} />,
    'Core Features': <LayoutGrid size={18} />,
    'Database Objects': <Database size={18} />,
    'Security & Networking': <Shield size={18} />,
    'AI & MCP': <Bot size={18} />,
    Integration: <Plug size={18} />,
    Customization: <Settings2 size={18} />,
    Reference: <BookOpen size={18} />,
};

function buildCategories() {
    const map = getWikiPagesByCategory();
    return WIKI_CATEGORIES.filter((c) => map.has(c)).map((c) => ({name: c, pages: map.get(c)!}));
}

export default function WikiIndexPage() {
    const categories = buildCategories();

    return (
        <div className="wiki-container">
            <WikiLayout categories={categories}>
                <header className={styles.hero}>
                    <h1 className={styles.title}>Documentation</h1>
                    <p className={styles.subtitle}>
                        Everything you need to know about Tabularis, from your first connection to advanced plugin
                        development.
                    </p>
                </header>

                {categories.map(({name, pages}) => (
                    <section key={name} className={styles.section}>
                        <h2 className={styles.heading}>
                            <span className={styles.icon}>{CATEGORY_ICONS[name]}</span>
                            {name}
                        </h2>

                        <div className={styles.grid}>
                            {pages.map((page) => (
                                <Link key={page.slug} href={`/wiki/${page.slug}`} className={styles.card}>
                                    <span className={styles.cardTitle}>{page.title}</span>
                                    <span className={styles.cardExcerpt}>{page.excerpt}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </WikiLayout>
        </div>
    );
}
