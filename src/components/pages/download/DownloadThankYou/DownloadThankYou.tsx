'use client';

import {useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
import {BookOpenIcon, PartyPopperIcon, StarIcon} from 'lucide-react';
import {DiscordIcon, GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import styles from './DownloadThankYou.module.scss';

const RESOURCES = [
    {
        href: SOCIAL_URLS.github,
        external: true,
        icon: <StarIcon />,
        title: 'Star us on GitHub',
        desc: 'A star takes 2 seconds and is the single biggest way to help an open-source project grow.',
    },
    {
        href: SOCIAL_URLS.discord,
        external: true,
        icon: <DiscordIcon />,
        title: 'Join our Discord Community',
        desc: 'Connect with other developers using Tabularis. Get help, share tips, and stay updated on the latest features.',
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
    const url = searchParams.get('url');

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
        <>
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

            <h2 className={styles.sectionTitle}>While you wait</h2>
            <div className={styles.cards}>
                {RESOURCES.map((resource) => (
                    <a
                        key={resource.title}
                        href={resource.href}
                        {...(resource.external && {target: '_blank', rel: 'noopener noreferrer'})}
                        className={styles.card}
                    >
                        <div className={styles.cardCover}>
                            <span className={styles.cardIcon}>{resource.icon}</span>
                        </div>
                        <div className={styles.cardDetails}>
                            <h3 className={styles.cardTitle}>{resource.title}</h3>
                            <p className={styles.cardExcerpt}>{resource.desc}</p>
                        </div>
                    </a>
                ))}
            </div>
        </>
    );
}
