import {GradientBackground} from '@/components/layout/GradientBackground/GradientBackground';
import {JsonLd} from '@/components/layout/JsonLd';
import {buildOrganizationJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {OG_IMAGE_URL, SITE_DESCRIPTION, SITE_TITLE} from '@/lib/siteConfig';
import 'highlight.js/styles/atom-one-dark.css';
import type {Metadata} from 'next';
import {jetbrainsMono, outfit, urbanist} from './font';
import './globals.scss';
import {SearchModal} from '@/components/layout/SearchModal/SearchModal';
import {SiteHeader} from '@/components/layout/SiteHeader/SiteHeader';
import {Footer} from '@/components/layout/Footer/Footer';
import {CookieConsent} from '@/components/layout/CookieConsent/CookieConsent';
import {EngagementPrompt} from '@/components/layout/EngagementPrompt/EngagementPrompt';

export const metadata: Metadata = {
    metadataBase: new URL('https://tabularis.dev'),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    icons: {icon: '/img/logo-compact.svg'},
    alternates: {
        types: {
            'application/rss+xml': [{url: '/feed.xml', title: 'Tabularis Blog'}],
            'application/feed+json': [{url: '/feed.json', title: 'Tabularis Blog'}],
        },
    },
    openGraph: {
        type: 'website',
        url: 'https://tabularis.dev/',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: [OG_IMAGE_URL],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: [OG_IMAGE_URL],
    },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            className={`${urbanist.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
        >
            <body>
                <GradientBackground />
                <SiteHeader />
                <JsonLd data={[buildOrganizationJsonLd(), buildSoftwareApplicationJsonLd()]} />
                {children}
                <Footer />
                <CookieConsent />
                <EngagementPrompt />
                <SearchModal />
            </body>
        </html>
    );
}
