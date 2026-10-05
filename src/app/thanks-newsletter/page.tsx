import {MatomoGoal} from '@/components/layout/MatomoGoal';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {ThankYouResources} from '@/components/ui/ThankYouResources/ThankYouResources';
import {SOCIAL_URLS} from '@/lib/social';
import {BookOpenIcon, DownloadIcon, MailCheckIcon} from 'lucide-react';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: "You're subscribed! | Tabularis",
    description: 'Thank you for subscribing to the Tabularis newsletter.',
    robots: {index: false, follow: false},
};

const RESOURCES = [
    {
        href: '/download',
        external: false,
        icon: <DownloadIcon />,
        title: 'Download Tabularis',
        desc: 'Get the latest version for Windows, macOS or Linux and start working with your databases.',
    },
    {
        href: SOCIAL_URLS.discord,
        external: true,
        icon: <DiscordIcon />,
        title: 'Join our Discord',
        desc: 'Connect with the community, share feedback and get help from other developers.',
    },
    {
        href: '/blog',
        external: false,
        icon: <BookOpenIcon />,
        title: 'Read the blog',
        desc: 'Release notes, tutorials and behind-the-scenes posts about Tabularis development.',
    },
];

export default function ThanksNewsletterPage() {
    return (
        <div className="container with-gap">
            <MatomoGoal goalId={1} />

            <header className="page-header">
                <span className="eyebrow">
                    <MailCheckIcon />
                    You&apos;re in!
                </span>
                <h1 className="title">Thanks for subscribing</h1>
                <p className="description">
                    Release announcements, development insights and project updates, straight to your inbox. No spam,
                    ever.
                </p>
            </header>

            <ThankYouResources resources={RESOURCES} />
        </div>
    );
}
