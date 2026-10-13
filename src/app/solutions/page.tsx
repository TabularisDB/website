import {JsonLd} from '@/components/layout/JsonLd';
import {SolutionsCatalog} from '@/components/pages/solutions/SolutionsCatalog/SolutionsCatalog';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {GitCompareArrowsIcon, LayersIcon} from 'lucide-react';
import {Metadata} from 'next';

const path = '/solutions';
const title = 'Solutions | Tabularis';
const description =
    'Explore high-intent Tabularis pages for PostgreSQL, SQL notebooks, MCP workflows, and other database use cases.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Solutions'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function SolutionsPage() {
    return (
        <section className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Solutions', path: '/solutions'},
                    ]),
                ]}
            />
            <header className="page-header">
                <span className="eyebrow">
                    <LayersIcon />
                    Solutions
                </span>
                <h1 className="title">One client, many ways in.</h1>
                <p className="description">
                    PostgreSQL, MySQL, SQLite, secure access, AI agents, plugin extensibility. Pick the entry point
                    closest to what you're actually trying to do.
                </p>
            </header>

            <SolutionsCatalog />

            <CalloutBlock
                title="Need a different workflow?"
                actions={
                    <Button href="/compare" size="sm">
                        <GitCompareArrowsIcon />
                        Browse comparisons
                    </Button>
                }
            >
                These pages are organized by real use case. If you&apos;re evaluating tools instead of workflows, go to
                the comparison pages next.
            </CalloutBlock>
        </section>
    );
}
