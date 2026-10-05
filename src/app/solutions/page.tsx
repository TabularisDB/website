import {JsonLd} from '@/components/layout/JsonLd';
import {SolutionsCatalog} from '@/components/pages/solutions/SolutionsCatalog/SolutionsCatalog';
import {TransitionBlock} from '@/components/ui/TransitionBlock/TransitionBlock';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {LayersIcon} from 'lucide-react';
import {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Solutions | Tabularis',
    description:
        'Explore high-intent Tabularis pages for PostgreSQL, SQL notebooks, MCP workflows, and other database use cases.',
    alternates: {canonical: '/solutions'},
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

            <TransitionBlock
                title="Need a different workflow?"
                text="These pages are organized by real use case. If you're evaluating tools instead of workflows, go to the comparison pages next."
                buttonHref="/compare"
                buttonText="Browse comparisons"
            />
        </section>
    );
}
