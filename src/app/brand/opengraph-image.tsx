import {OG_CONTENT_TYPE, OG_SIZE} from '@/lib/og/shared';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';

export const dynamic = 'force-static';
export const alt = 'Tabularis brand assets: logos, icons, colors and fonts to download';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
    return renderSimpleOgImage({
        kicker: 'Brand assets',
        title: 'Logos, colors and fonts',
    });
}
