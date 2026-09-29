import {VersionCard} from '@/components/pages/changelog/VersionCard/VersionCard';
import {Button} from '@/components/ui/Button/Button';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {getChangelog} from '@/lib/changelog';
import {SOCIAL_URLS} from '@/lib/social';
import {HistoryIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './ChangelogPage.module.scss';

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
    const versions = getChangelog();

    return (
        <section className="container">
            <header className="page-header">
                <span className="eyebrow">
                    <HistoryIcon />
                    Changelog
                </span>
                <h2 className="title">Every release, documented.</h2>
                <Button
                    className={styles.githubButton}
                    href={`${SOCIAL_URLS.github}/blob/main/CHANGELOG.md`}
                    variant="secondary"
                >
                    <GitHubIcon />
                    View on Github
                </Button>
            </header>

            <div className={styles.timeline}>
                {versions.map((v) => (
                    <VersionCard key={v.version} version={v} />
                ))}
            </div>
        </section>
    );
}
