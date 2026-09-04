import {WikiLayout} from '@/components/pages/wiki/WikiLayout/WikiLayout';
import {getWikiPageBySlug, getWikiPagesByCategory, WIKI_CATEGORIES} from '@/lib/wiki';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';

export const metadata: Metadata = {
    title: 'Wiki | Tabularis',
    description: 'Learn everything about Tabularis features and how to use them.',
};

function buildCategories() {
    const map = getWikiPagesByCategory();
    return WIKI_CATEGORIES.filter((c) => map.has(c)).map((c) => ({
        name: c,
        pages: map.get(c)!,
    }));
}

export default async function DocsPage() {
    const categories = buildCategories();
    const intro = getWikiPageBySlug('intro');
    if (!intro) notFound();

    return (
        <div className="wiki-container">
            <WikiLayout categories={categories}>
                <article className="wiki-content" dangerouslySetInnerHTML={{__html: intro.html}} />
            </WikiLayout>
        </div>
    );
}
