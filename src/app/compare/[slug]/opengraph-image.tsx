import {getSeoPageBySlug, getSeoPagesBySection} from '@/lib/seo/seoPages';
import {OG_CONTENT_TYPE, OG_SIZE} from '@/lib/og/og.utils';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';

export const alt = 'Compare Tabularis';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
    return getSeoPagesBySection('compare').map((page) => ({slug: page.slug}));
}

export default async function Image({params}: {params: Promise<{slug: string}>}) {
    const {slug} = await params;
    const page = getSeoPageBySlug('compare', slug);
    return renderSimpleOgImage({
        kicker: 'Compare',
        title: page?.meta.title ?? 'Compare Tabularis',
    });
}
