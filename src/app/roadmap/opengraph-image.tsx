import {OG_CONTENT_TYPE, OG_SIZE} from '@/lib/og/og.utils';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';

export const dynamic = 'force-static';
export const alt = 'Tabularis Roadmap';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
    return renderSimpleOgImage({
        kicker: 'Roadmap',
        title: "What's shipping next",
    });
}
