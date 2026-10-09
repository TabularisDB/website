import {CookieConsent} from '@/components/layout/CookieConsent/CookieConsent';
import {EngagementPrompt} from '@/components/layout/EngagementPrompt/EngagementPrompt';
import {Footer} from '@/components/layout/Footer/Footer';
import {JsonLd} from '@/components/layout/JsonLd';
import {SearchModal} from '@/components/layout/SearchModal/SearchModal';
import {SiteHeader} from '@/components/layout/SiteHeader/SiteHeader';
import {buildOrganizationJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {FEED_ALTERNATES, OG_IMAGE_URL, SITE_DESCRIPTION, SITE_TITLE} from '@/lib/siteConfig';
import {THEME_INIT_SCRIPT} from '@/lib/theme';
import 'highlight.js/styles/atom-one-dark.css';
import type {Metadata} from 'next';
import {jetbrainsMono, urbanist} from './font';
import '@/styles/highlight-light.scss';
import './globals.scss';

export const metadata: Metadata = {
    metadataBase: new URL('https://tabularis.dev'),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    icons: {icon: '/img/brand/tabularis-icon-color.svg'},
    alternates: {types: FEED_ALTERNATES},
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
        // suppressHydrationWarning: THEME_INIT_SCRIPT sets data-theme on <html>
        // before React hydrates, so the attribute intentionally differs.
        <html
            lang="en"
            data-scroll-behavior="smooth"
            className={`${urbanist.variable} ${jetbrainsMono.variable}`}
            suppressHydrationWarning
        >
            <head>
                <script dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}} />
            </head>
            <body>
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
