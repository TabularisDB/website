import {JsonLd} from '@/components/layout/JsonLd';
import {WikiContent} from '@/components/pages/wiki/WikiContent/WikiContent';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {buildArticleJsonLd, buildBreadcrumbJsonLd} from '@/lib/seo';
import {getSeoPageBySlug, getSeoPagePath, getSeoPagesBySection} from '@/lib/seo/seoPages';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import styles from './SolutionDetailPage.module.scss';
import {SeoCapture} from '@/components/ui/SeoCapture/SeoCapture';
import {ogImages} from '@/lib/og/registry';

export function generateStaticParams() {
    return getSeoPagesBySection('solutions').map((page) => ({slug: page.slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const page = getSeoPageBySlug('solutions', slug);
    if (!page) return {};

    const path = getSeoPagePath('solutions', slug);
    const title = page.meta.metaTitle || `${page.meta.title} | Tabularis`;
    const description = page.meta.description || page.meta.excerpt;

    return {
        title,
        description,
        alternates: {canonical: path},
        openGraph: {
            type: 'article',
            url: path,
            title,
            description,
            images: ogImages(path, `Tabularis Solutions: ${page.meta.title}`),
        },
        twitter: {card: 'summary_large_image'},
    };
}

interface PageProps {
    params: Promise<{slug: string}>;
}

export default async function SolutionDetailPage({params}: PageProps) {
    const {slug} = await params;
    const page = getSeoPageBySlug('solutions', slug);
    if (!page) notFound();

    return (
        <div className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Solutions', path: '/solutions'},
                        {name: page.meta.title, path: getSeoPagePath('solutions', slug)},
                    ]),
                    buildArticleJsonLd({
                        title: page.meta.title,
                        description: page.meta.description || page.meta.excerpt,
                        path: getSeoPagePath('solutions', slug),
                        image: page.meta.image,
                    }),
                ]}
            />

            <article className={styles.wrapper}>
                <Breadcrumbs crumbs={[{label: 'Solutions', href: '/solutions'}, {label: page.meta.title}]} />
                <WikiContent html={page.html} />
                <SeoCapture section="solutions" title={page.meta.title} />
            </article>
        </div>
    );
}
