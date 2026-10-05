import {WikiLayout} from '@/components/pages/wiki/WikiLayout/WikiLayout';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {getWikiPagesByCategory, WIKI_CATEGORIES} from '@/lib/wiki';
import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './WikiIndexPage.module.scss';
import {CATEGORY_ICONS} from '@/components/pages/wiki/CategoryLabel/CategoryLabel';

export const metadata: Metadata = {
    title: 'Docs | Tabularis',
    description: 'Learn everything about Tabularis features and how to use them.',
};

function buildCategories() {
    const map = getWikiPagesByCategory();
    return WIKI_CATEGORIES.filter((c) => map.has(c)).map((c) => ({name: c, pages: map.get(c)!}));
}

export default function WikiIndexPage() {
    const categories = buildCategories();

    return (
        <div className="wiki-container">
            <Breadcrumbs crumbs={[{label: 'Docs', href: '/wiki/'}]} />
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
