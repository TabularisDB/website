import {JsonLd} from '@/components/layout/JsonLd';
import {VideosGrid} from '@/components/pages/demos/VideosGrid/VideosGrid';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {PlayIcon} from 'lucide-react';
import {Metadata} from 'next';

const path = '/demos';
const title = 'Product Demos | Tabularis';

export const metadata: Metadata = {
    title,
    description:
        'Watch short Tabularis demos for database connections, SQL editing, notebooks, Visual EXPLAIN, plugins, and AI workflows.',
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description: 'Short Tabularis product demos for developers evaluating the database client workflow.',
        images: ogImages(path, 'Tabularis product demos'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function DemosPage() {
    return (
        <section className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Demos', path: '/demos'},
                    ]),
                ]}
            />
            <header className="page-header">
                <span className="eyebrow">
                    <PlayIcon />
                    Workflow demos
                </span>
                <h1 className="title">See Tabularis in Action</h1>
                <p className="description">
                    Short, indexable walkthroughs for the Tabularis workflows people evaluate most: SQL editing,
                    notebooks, Visual EXPLAIN, plugins, and AI-assisted database work.
                </p>
            </header>

            <VideosGrid />
        </section>
    );
}
