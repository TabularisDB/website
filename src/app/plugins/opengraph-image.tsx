import {OG_CONTENT_TYPE, OG_SIZE} from '@/lib/og/og.utils';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const alt = 'Tabularis Plugins';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
    return renderSimpleOgImage({
        kicker: 'Plugins',
        title: 'Community drivers',
    });
}
