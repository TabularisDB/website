import {SolutionsCatalog} from '@/components/pages/solutions/SolutionsCatalog/SolutionsCatalog';
import {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Solutions | Tabularis',
    description:
        'Explore high-intent Tabularis pages for PostgreSQL, SQL notebooks, MCP workflows, and other database use cases.',
    alternates: {canonical: '/solutions'},
};

export default function SolutionsPage() {
    return (
        <section className="container">
            <header className="page-header">
                <span className="eyebrow">Solutions</span>
                <h2 className="title">One client, many ways in.</h2>
                <p className="description">
                    PostgreSQL, MySQL, SQLite, secure access, AI agents, plugin extensibility. Pick the entry point
                    closest to what you're actually trying to do.
                </p>
            </header>

            <SolutionsCatalog />
        </section>
    );
}
