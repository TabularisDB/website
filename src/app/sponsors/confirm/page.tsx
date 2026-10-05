import {ThankYouResources, type ThankYouResource} from '@/components/ui/ThankYouResources/ThankYouResources';
import {SOCIAL_URLS} from '@/lib/social';
import {DownloadIcon, HandHeartIcon, MapIcon, StarIcon} from 'lucide-react';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Thank you | Tabularis Sponsors',
    description: 'Thanks for reaching out about sponsoring Tabularis.',
    robots: {index: false, follow: false},
};

const RESOURCES: ThankYouResource[] = [
    {
        href: '/download',
        icon: <DownloadIcon />,
        title: 'Try Tabularis',
        desc: 'Get to know the product your brand will sit next to. Free on Windows, macOS and Linux.',
    },
    {
        href: SOCIAL_URLS.github,
        external: true,
        icon: <StarIcon />,
        title: 'See the traction on GitHub',
        desc: 'Stars, releases and contributors: the community your sponsorship reaches.',
    },
    {
        href: '/roadmap',
        icon: <MapIcon />,
        title: 'See what your support funds',
        desc: "The features and database drivers we're building next.",
    },
];

export default function SponsorsConfirmPage() {
    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <HandHeartIcon />
                    Request received
                </span>
                <h1 className="title">Thank you for reaching out!</h1>
                <p className="description">We&apos;ll review your sponsorship request and get back to you shortly.</p>
            </header>

            <ThankYouResources resources={RESOURCES} title="In the meantime" />
        </div>
    );
}
