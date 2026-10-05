import {OG_CONTENT_TYPE, OG_SIZE} from '@/lib/og/shared';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';

export const dynamic = 'force-static';
export const alt = 'What should Tabularis build next? Take the 2-minute community survey.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
    return renderSimpleOgImage({
        kicker: 'Community survey',
        title: 'What should Tabularis build next?',
    });
}
