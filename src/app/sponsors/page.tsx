import {SponsorsGrid} from '@/components/pages/sponsors/SponsorsGrid/SponsorsGrid';
import {SupportBlock} from '@/components/pages/sponsors/SupportBlock/SupportBlock';
import {StarIcon} from 'lucide-react';
import type {Metadata} from 'next';
import {ogImages} from '@/lib/og/registry';

const path = '/sponsors';
const title = 'Sponsors and supporters | Tabularis';
const description = 'Organizations supporting Tabularis development. Interested in sponsoring? Get in touch.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis sponsors and supporters'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function SponsorsPage() {
    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <StarIcon />
                    Sponsors
                </span>
                <h1 className="title">Our sponsors and supporters</h1>
                <p className="description">
                    These organizations support Tabularis development and help keep it free and open source for
                    everyone. Thank you.
                </p>
            </header>

            <SponsorsGrid />

            <SupportBlock />
        </div>
    );
}
