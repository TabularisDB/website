import {CATEGORY_ICONS} from '@/components/pages/wiki/CategoryLabel/CategoryLabel';
import {WikiLayout} from '@/components/pages/wiki/WikiLayout/WikiLayout';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import {ogImages} from '@/lib/og/registry';
import {getWikiPagesByCategory, WIKI_CATEGORIES} from '@/lib/wiki';
import type {Metadata} from 'next';
import styles from './WikiIndexPage.module.scss';

const path = '/wiki';
const title = 'Docs | Tabularis';
const description = 'Learn everything about Tabularis features and how to use them.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Docs'),
    },
    twitter: {card: 'summary_large_image'},
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

                        <CardGrid minWidth={360} className={styles.compact}>
                            {pages.map((page) => (
                                <Card key={page.slug}>
                                    <Card.Content>
                                        <Card.Title>{page.title}</Card.Title>
                                        <Card.Description>{page.excerpt}</Card.Description>
                                    </Card.Content>
                                    <Card.Link href={`/wiki/${page.slug}`} ariaLabel={page.title} />
                                </Card>
                            ))}
                        </CardGrid>
                    </section>
                ))}
            </WikiLayout>
        </div>
    );
}
