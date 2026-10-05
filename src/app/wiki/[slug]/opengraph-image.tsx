import {OG_CONTENT_TYPE, OG_SIZE} from '@/lib/og/shared';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';
import {getAllWikiPages, getWikiPageBySlug} from '@/lib/wiki';

export const alt = 'Tabularis Docs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
    return getAllWikiPages().map((p) => ({slug: p.slug}));
}

export default async function Image({params}: {params: Promise<{slug: string}>}) {
    const {slug} = await params;
    const page = getWikiPageBySlug(slug);
    return renderSimpleOgImage({
        kicker: page ? `Docs · ${page.meta.category}` : 'Docs',
        title: page?.meta.title ?? 'Tabularis Docs',
    });
}
