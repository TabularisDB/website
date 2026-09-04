import {JsonLd} from '@/components/layout/JsonLd';
import {HomeHero} from '@/components/pages/home/HomeHero/HomeHero';
import {ProductOverview} from '@/components/pages/home/ProductOverview/ProductOverview';
import {SponsorsMarquee} from '@/components/pages/home/SponsorsMarquee/SponsorsMarquee';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';

export default function HomePage() {
    return (
        <div className="container">
            <JsonLd data={[buildBreadcrumbJsonLd([{name: 'Home', path: '/'}]), buildSoftwareApplicationJsonLd()]} />
            <HomeHero />
            <SponsorsMarquee />
            <ProductOverview />
        </div>
    );
}
