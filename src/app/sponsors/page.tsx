import {SponsorsGrid} from '@/components/pages/sponsors/SponsorsGrid/SponsorsGrid';
import {SupportBlock} from '@/components/pages/sponsors/SupportBlock/SupportBlock';
import {StarIcon} from 'lucide-react';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Sponsors and supporters | Tabularis',
    description: 'Organizations supporting Tabularis development. Interested in sponsoring? Get in touch.',
    openGraph: {
        title: 'Sponsors and supporters | Tabularis',
        description: 'Organizations supporting Tabularis development. Interested in sponsoring? Get in touch.',
        url: 'https://tabularis.dev/sponsors',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sponsors and supporters | Tabularis',
        description: 'Organizations supporting Tabularis development. Interested in sponsoring? Get in touch.',
    },
};

export default function SponsorsPage() {
    return (
        <div className="container">
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
