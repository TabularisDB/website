'use client';

import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {ThankYouResources} from '@/components/ui/ThankYouResources/ThankYouResources';
import {SOCIAL_URLS} from '@/lib/social';
import {BookOpenIcon, PartyPopperIcon, StarIcon} from 'lucide-react';
import {useSearchParams} from 'next/navigation';
import {useEffect} from 'react';
import styles from './DownloadThankYou.module.scss';

const RESOURCES = [
    {
        href: SOCIAL_URLS.github,
        external: true,
        icon: <StarIcon />,
        title: 'Star us on GitHub',
        desc: 'A star takes 2 seconds and is the single biggest way to help an open-source project grow.',
        track: {category: 'invite-github-star', action: 'click', name: 'thank-you'},
    },
    {
        href: '/wiki',
        external: false,
        icon: <BookOpenIcon />,
        title: 'Explore our Documentation',
        desc: 'Learn about Tabularis features, keyboard shortcuts, configuration options, and how to make the most of your new database client.',
    },
    {
        href: SOCIAL_URLS.github,
        external: true,
        icon: <GitHubIcon />,
        title: 'Contribute on GitHub',
        desc: 'Check out the source code, report bugs, request features, and contribute to the project on GitHub.',
    },
];

export function DownloadThankYou() {
    const searchParams = useSearchParams();
    const rawUrl = searchParams.get('url');
    const url = rawUrl?.startsWith('https://github.com/TabularisDB/') ? rawUrl : null;

    useEffect(() => {
        if (!url) return;
        const timer = setTimeout(() => {
            const a = document.createElement('a');
            a.href = url;
            a.download = '';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }, 500);
        return () => clearTimeout(timer);
    }, [url]);

    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <PartyPopperIcon />
                    Welcome to Tabularis
                </span>
                <h1 className="title">Your download has started!</h1>
                <p className="description">
                    While Tabularis is downloading, here are some great ways to get started with our community and
                    resources.
                </p>
                {url && (
                    <p className={styles.fallback}>
                        If your download didn&apos;t start automatically,{' '}
                        <a href={url} download>
                            click here
                        </a>
                        .
                    </p>
                )}
            </header>

            <ThankYouResources resources={RESOURCES} title="While you wait" />
        </div>
    );
}
