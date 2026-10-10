import {LegalPage} from '@/components/ui/LegalPage/LegalPage';
import {getLegalPage} from '@/lib/legal';
import {OG_IMAGE_URL} from '@/lib/siteConfig';
import type {Metadata} from 'next';

const path = '/cookie-policy';
const title = 'Cookie Policy | Tabularis';
const description = 'Learn how Tabularis uses cookies and how you can control them.';

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

export default function CookiePolicyPage() {
    return <LegalPage page={getLegalPage('cookie-policy')} />;
}
