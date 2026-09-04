import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {JsonLd} from '@/components/layout/JsonLd';
import {SiteHeader} from '@/components/layout/SiteHeader/SiteHeader';
import {WikiLayout} from '@/components/pages/wiki/WikiLayout/WikiLayout';
import {WikiTableOfContents} from '@/components/pages/wiki/WikiTableOfContents/WikiTableOfContents';
import {WikiContent} from '@/components/pages/wiki/WikiContent/WikiContent';
import {CategoryLabel} from '@/components/pages/wiki/CategoryLabel/CategoryLabel';
import {PostNav} from '@/components/pages/wiki/PostNav/PostNav';
import {
    getAllWikiPages,
    getWikiPageBySlug,
    getAdjacentWikiPages,
    getWikiPagesByCategory,
    WIKI_CATEGORIES,
} from '@/lib/wiki';
import {buildArticleJsonLd, buildBreadcrumbJsonLd} from '@/lib/seo';
import {getRelatedLinksForWiki} from '@/lib/seo/seoRelated';

interface PageProps {
    params: Promise<{slug: string}>;
}

export function generateStaticParams() {
    return getAllWikiPages().map((p) => ({slug: p.slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const page = getWikiPageBySlug(slug);
    if (!page) return {};

    const {meta} = page;
    const title = `${meta.title} | Tabularis Wiki`;

    return {
        title,
        description: meta.excerpt,
        alternates: {canonical: `/wiki/${slug}`},
        openGraph: {
            type: 'article',
            url: `/wiki/${slug}`,
            title,
            description: meta.excerpt,
            siteName: 'Tabularis',
        },
        twitter: {card: 'summary_large_image', title, description: meta.excerpt},
    };
}

function buildCategories() {
    const map = getWikiPagesByCategory();
    return WIKI_CATEGORIES.filter((c) => map.has(c)).map((c) => ({name: c, pages: map.get(c)!}));
}

export default async function WikiPageDetail({params}: PageProps) {
    const {slug} = await params;
    const page = getWikiPageBySlug(slug);
    if (!page) notFound();

    const {meta, html} = page;
    const {prev, next} = getAdjacentWikiPages(slug);
    const categories = buildCategories();
    const relatedLinks = getRelatedLinksForWiki(slug);

    const crumbTitle = meta.title.length > 40 ? meta.title.slice(0, 40) + '\u2026' : meta.title;

    return (
        <div className="wiki-container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Wiki', path: '/wiki'},
                        {name: meta.title, path: `/wiki/${slug}`},
                    ]),
                    buildArticleJsonLd({
                        title: meta.title,
                        description: meta.excerpt,
                        path: `/wiki/${slug}`,
                        image: '/img/og.png',
                    }),
                ]}
            />

            <WikiLayout categories={categories} rightSidebar={<WikiTableOfContents />}>
                <CategoryLabel category={meta.category} />

                <WikiContent html={html} />

                <PostNav prev={prev} next={next} basePath="/wiki" />
            </WikiLayout>
        </div>
    );
}
