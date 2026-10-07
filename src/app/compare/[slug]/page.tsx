import Image from 'next/image';
import {JsonLd} from '@/components/layout/JsonLd';
import {COMPARE_PREVIEW_MAP} from '@/components/pages/compare/Compare.data';
import {ComparisonTable} from '@/components/pages/compare/ComparisonTable/ComparisonTable';
import {WikiContent} from '@/components/pages/wiki/WikiContent/WikiContent';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {SeoCapture} from '@/components/ui/SeoCapture/SeoCapture';
import {getProduct} from '@/lib/compare/products';
import {buildArticleJsonLd, buildBreadcrumbJsonLd} from '@/lib/seo';
import {getSeoPageBySlug, getSeoPagePath, getSeoPagesBySection} from '@/lib/seo/seoPages';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import styles from './CompareDetailPage.module.scss';

import {ogImages} from '@/lib/og/registry';

export function generateStaticParams() {
    return getSeoPagesBySection('compare').map((page) => ({slug: page.slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const page = getSeoPageBySlug('compare', slug);
    if (!page) return {};

    const path = getSeoPagePath('compare', slug);
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
            images: ogImages(path, `Compare: ${page.meta.title}`),
        },
        twitter: {card: 'summary_large_image'},
    };
}

interface PageProps {
    params: Promise<{slug: string}>;
}

export function stripFirstH1(html: string): string {
    return html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '');
}

function ProductLogo({id}: {id: string}) {
    const product = getProduct(id);
    if (!product) {
        return <span className={styles.logoFallback}>{id}</span>;
    }
    return (
        <Image src={product.logo} alt={product.name} width={56} height={56} loading="eager" className={styles.logo} />
    );
}

export default async function CompareDetailPage({params}: PageProps) {
    const {slug} = await params;
    const page = getSeoPageBySlug('compare', slug);
    if (!page) notFound();

    const preview = COMPARE_PREVIEW_MAP[page.meta.slug];

    return (
        <div className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Compare', path: '/compare'},
                        {name: page.meta.title, path: getSeoPagePath('compare', slug)},
                    ]),
                    buildArticleJsonLd({
                        title: page.meta.title,
                        description: page.meta.description || page.meta.excerpt,
                        path: getSeoPagePath('compare', slug),
                        image: page.meta.image,
                    }),
                ]}
            />
            <Breadcrumbs crumbs={[{label: 'Compare', href: '/compare'}, {label: page.meta.title}]} />
            <header className="page-header">
                <div className={styles.tools}>
                    {preview.tools.flatMap((tool, index) => [
                        index > 0 && <div key={`divider-${index}`} className="divider" />,
                        <ProductLogo key={tool} id={tool} />,
                    ])}
                </div>
                <h1 className="title">{page.meta.title}</h1>
                <p className="description">{page.meta.excerpt}</p>
            </header>

            <ComparisonTable slug={page.meta.slug} />

            <div className={styles.content}>
                <h2 className={styles.contentTitle}>Explore more about {page.meta.title}</h2>
                <WikiContent html={stripFirstH1(page.html)} />
            </div>

            <SeoCapture section="compare" title={page.meta.title} />
        </div>
    );
}
