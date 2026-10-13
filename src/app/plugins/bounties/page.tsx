import {BountyBoardPage} from '@/components/pages/plugins/bounties/BountyBoardPage/BountyBoardPage';
import {ogImages} from '@/lib/og/registry';
import type {Metadata} from 'next';

const path = '/plugins/bounties';
const title = 'Plugin Bounty Board | Tabularis';

export const metadata: Metadata = {
    title,
    description:
        'Request, sponsor, discuss, or claim the database drivers and plugins the Tabularis community wants next.',
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description: 'A public market for the next Tabularis database drivers and plugin integrations.',
        images: ogImages(path, 'Tabularis Plugin Bounties'),
    },
    twitter: {
        card: 'summary_large_image',
        description: 'Request, sponsor, discuss, or claim the database drivers and plugins the community wants next.',
    },
};

export default function PluginBountyBoardPage() {
    return <BountyBoardPage />;
}
