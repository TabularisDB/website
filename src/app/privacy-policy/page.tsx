import {LegalPage} from '@/components/ui/LegalPage/LegalPage';
import {getLegalPage} from '@/lib/legal';
import {OG_IMAGE_URL} from '@/lib/siteConfig';
import type {Metadata} from 'next';

const path = '/privacy-policy';
const title = 'Privacy Policy | Tabularis';
const description =
    'How tabularis.dev collects and uses personal data from the newsletter, survey and sponsor contact forms.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: [OG_IMAGE_URL],
    },
    twitter: {card: 'summary_large_image'},
};

export default function PrivacyPolicyPage() {
    return <LegalPage page={getLegalPage('privacy-policy')} />;
}
