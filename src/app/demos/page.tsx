import {JsonLd} from '@/components/layout/JsonLd';
import {VideosGrid} from '@/components/pages/demos/VideosGrid/VideosGrid';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {PlayIcon} from 'lucide-react';
import {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Product Demos | Tabularis',
    description:
        'Watch short Tabularis demos for database connections, SQL editing, notebooks, Visual EXPLAIN, plugins, and AI workflows.',
    alternates: {canonical: '/demos'},
    openGraph: {
        type: 'website',
        url: '/demos',
        title: 'Product Demos | Tabularis',
        description: 'Short Tabularis product demos for developers evaluating the database client workflow.',
        // /demos has no opengraph-image.tsx of its own and the convention does not
        // cascade here, so reference the generated site card (renamed to `.png` by
        // scripts/finalize-og-images.mjs). Without an explicit `images` an openGraph
        // block emits no og:image at all.
        images: [
            {
                url: 'https://tabularis.dev/opengraph-image.png',
                width: 1200,
                height: 630,
                alt: 'Tabularis product demos',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Product Demos | Tabularis',
        description: 'Short Tabularis product demos for developers evaluating the database client workflow.',
        images: ['https://tabularis.dev/opengraph-image.png'],
    },
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
