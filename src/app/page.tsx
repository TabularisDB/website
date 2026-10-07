import {JsonLd} from '@/components/layout/JsonLd';
import {BlogOverview} from '@/components/pages/home/BlogOverview/BlogOverview';
import {CompareOverview} from '@/components/pages/home/CompareOverview/CompareOverview';
import {Features} from '@/components/pages/home/Features/Features';
import {HomeHero} from '@/components/pages/home/HomeHero/HomeHero';
import {PluginEcosystem} from '@/components/pages/home/PluginEcosystem/PluginEcosystem';
import {ProductOverview} from '@/components/pages/home/ProductOverview/ProductOverview';
import {SolutionsOverview} from '@/components/pages/home/SolutionsOverview/SolutionsOverview';
import {SponsorsMarquee} from '@/components/pages/home/SponsorsMarquee/SponsorsMarquee';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd, buildVideoObjectJsonLd} from '@/lib/seo';
import type {Metadata} from 'next';
import {FEED_ALTERNATES} from '@/lib/siteConfig';

export const metadata: Metadata = {
    alternates: {canonical: '/', types: FEED_ALTERNATES},
};

export default function HomePage() {
    return (
        <div className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([{name: 'Home', path: '/'}]),
                    buildSoftwareApplicationJsonLd(),
                    buildVideoObjectJsonLd({
                        title: 'Tabularis Product Overview',
                        description:
                            'A 53-second tour of Tabularis: connect to a database, browse tables, run queries with the visual query builder, and inspect results.',
                        src: '/videos/overview.mp4',
                        poster: '/videos/overview-hero.webp',
                        uploadDate: '2026-07-21',
                        duration: 'PT53S',
                    }),
                ]}
            />
            <HomeHero />
            <SponsorsMarquee />
            <ProductOverview />
            <Features />
            <SolutionsOverview />
            <CompareOverview />
            <PluginEcosystem />
            <BlogOverview />
        </div>
    );
}
