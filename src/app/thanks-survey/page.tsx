import {ThankYouResources} from '@/components/ui/ThankYouResources/ThankYouResources';
import {SOCIAL_URLS} from '@/lib/social';
import {DownloadIcon, HeartHandshakeIcon, MapIcon, StarIcon} from 'lucide-react';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Thanks for your feedback | Tabularis',
    description: 'Thank you for sharing what you expect from a database tool.',
    robots: {index: false, follow: false},
};

const RESOURCES = [
    {
        href: '/download',
        external: false,
        icon: <DownloadIcon />,
        title: 'Download Tabularis',
        desc: 'Try it on Windows, macOS or Linux and start working with your databases.',
    },
    {
        href: '/roadmap',
        external: false,
        icon: <MapIcon />,
        title: 'See the roadmap',
        desc: "Track what we're building next and where your feedback fits in.",
    },
    {
        href: SOCIAL_URLS.github,
        external: true,
        icon: <StarIcon />,
        title: 'Star us on GitHub',
        desc: 'A star takes 2 seconds and is the single biggest way to help an open-source project grow.',
    },
];

export default function ThanksSurveyPage() {
    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <HeartHandshakeIcon />
                    Survey received
                </span>
                <h1 className="title">Thanks for your feedback!</h1>
                <p className="description">
                    Your answers go straight into how we prioritise Tabularis. If we follow up, it will only be about
                    what you told us. No spam.
                </p>
            </header>

            <ThankYouResources resources={RESOURCES} />
        </div>
    );
}
