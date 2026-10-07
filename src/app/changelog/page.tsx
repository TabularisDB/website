import {VersionCard} from '@/components/pages/changelog/VersionCard/VersionCard';
import {Button} from '@/components/ui/Button/Button';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {getChangelog} from '@/lib/changelog';
import {SOCIAL_URLS} from '@/lib/social';
import {HistoryIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './ChangelogPage.module.scss';
import {ogImages} from '@/lib/og/registry';

const path = '/changelog';
const title = 'Changelog | Tabularis';
const description = 'Full release history and changelog for Tabularis.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Changelog'),
    },
    twitter: {card: 'summary_large_image'},
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
                <h1 className="title">Every release, documented.</h1>
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
