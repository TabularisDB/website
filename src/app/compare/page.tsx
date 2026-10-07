import {JsonLd} from '@/components/layout/JsonLd';
import {CompareGrid} from '@/components/pages/compare/CompareGrid/CompareGrid';
import {TransitionBlock} from '@/components/ui/TransitionBlock/TransitionBlock';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {getSeoPagesBySection} from '@/lib/seo/seoPages';
import {ArrowLeftRight} from 'lucide-react';
import type {Metadata} from 'next';
import {ogImages} from '@/lib/og/registry';

const path = '/compare';
const title = 'Compare | Tabularis';
const description = 'Comparison pages for teams evaluating Tabularis against other database clients and SQL tools.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Compare Tabularis'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function ComparePage() {
    const comparePages = getSeoPagesBySection('compare');

    return (
        <div className="container with-gap">
            <JsonLd
                data={buildBreadcrumbJsonLd([
                    {name: 'Home', path: '/'},
                    {name: 'Compare', path: '/compare'},
                ])}
            />
            <header className="page-header">
                <span className="eyebrow">
                    <ArrowLeftRight />
                    Compare
                </span>
                <h1 className="title">See how Tabularis stacks up</h1>
                <p className="description">
                    Straight comparisons against the tools developers move away from, covering features, pricing, and
                    workflow differences side by side.
                </p>
            </header>

            <CompareGrid
                items={comparePages.map((page) => ({
                    slug: page.slug,
                    href: `/compare/${page.slug}`,
                    title: page.title,
                }))}
            />

            <TransitionBlock
                title="Prefer to explore by use case?"
                text="If you are earlier in the decision process, start from the workflow itself instead of the tool comparison."
                buttonHref="/solutions"
                buttonText="Browse solutions"
            />
        </div>
    );
}
