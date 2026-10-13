import {BountyBoardPage} from '@/components/pages/plugins/bounties/BountyBoardPage/BountyBoardPage';
import {ogImages} from '@/lib/og/registry';
import {getActiveBounties} from '@/lib/plugins/bounties';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';

interface PageProps {
    params: Promise<{slug: string}>;
}

function findBounty(slug: string) {
    return getActiveBounties().find((bounty) => bounty.id === slug);
}

export function generateStaticParams() {
    return getActiveBounties().map((bounty) => ({slug: bounty.id}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const bounty = findBounty((await params).slug);
    if (!bounty) return {};

    const path = `/plugins/bounties/${bounty.id}`;
    const title = `${bounty.name} plugin bounty | Tabularis`;
    const description = bounty.tagline || bounty.description;
    return {
        title,
        description,
        alternates: {canonical: path},
        openGraph: {
            type: 'website',
            url: path,
            title,
            description,
            images: ogImages(path, `${bounty.name} — Tabularis plugin bounty`),
        },
        twitter: {card: 'summary_large_image', description},
    };
}

export default async function BountyPage({params}: PageProps) {
    const bounty = findBounty((await params).slug);
    if (!bounty) notFound();
    return <BountyBoardPage bountyId={bounty.id} />;
}
