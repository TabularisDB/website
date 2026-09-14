import {JsonLd} from '@/components/layout/JsonLd';
import {SolutionDetailLayout} from '@/components/pages/solutions/SolutionDetailLayout/SolutionDetailLayout';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {buildArticleJsonLd, buildBreadcrumbJsonLd} from '@/lib/seo';
import {getAdjacentSeoPages, getSeoPageBySlug, getSeoPagePath, getSeoPagesBySection} from '@/lib/seo/seoPages';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';

interface PageProps {
    params: Promise<{slug: string}>;
}

export function generateStaticParams() {
    return getSeoPagesBySection('solutions').map((page) => ({slug: page.slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const page = getSeoPageBySlug('solutions', slug);
    if (!page) return {};

    return {
        title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
        description: page.meta.description || page.meta.excerpt,
        alternates: {
            canonical: getSeoPagePath('solutions', slug),
        },
        openGraph: {
            type: 'article',
            url: getSeoPagePath('solutions', slug),
            title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
            description: page.meta.description || page.meta.excerpt,
        },
        twitter: {
            card: 'summary_large_image',
            title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
            description: page.meta.description || page.meta.excerpt,
        },
    };
}

export default async function SolutionDetailPage({params}: PageProps) {
    const {slug} = await params;
    const page = getSeoPageBySlug('solutions', slug);
    if (!page) notFound();

    const {prev, next} = getAdjacentSeoPages('solutions', slug);

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

            <SolutionDetailLayout pageInfos={page} />
        </div>
    );
}
