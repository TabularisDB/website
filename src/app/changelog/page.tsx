import {ChangelogView} from '@/components/pages/changelog/ChangelogView';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Changelog | Tabularis',
    description: 'Full release history and changelog for Tabularis.',
    alternates: {canonical: '/changelog'},
    openGraph: {
        type: 'website',
        url: 'https://tabularis.dev/changelog/',
        title: 'Changelog | Tabularis',
        description: 'Full release history and changelog for Tabularis.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Changelog | Tabularis',
        description: 'Full release history and changelog for Tabularis.',
    },
};

export default function ChangelogPage() {
    return <ChangelogView />;
}
