import Link from 'next/link';
import {getChangelog} from '@/lib/changelog';
import {SOCIAL_URLS} from '@/lib/social';
import {VersionCard} from './VersionCard/VersionCard';
import styles from './ChangelogView.module.scss';
import clsx from 'clsx';
import {HistoryIcon} from 'lucide-react';

export function ChangelogView() {
    const versions = getChangelog();

    return (
        <section className="container">
            <header className="page-header">
                <span className="eyebrow">
                    <HistoryIcon />
                    Changelog
                </span>
                <h2 className="title">Every release, documented.</h2>
                <p className={clsx(styles.pageSubtitle, 'description')}>
                    Source of truth is{' '}
                    <a href={`${SOCIAL_URLS.github}/blob/main/CHANGELOG.md`} target="_blank" rel="noopener noreferrer">
                        CHANGELOG.md on GitHub
                    </a>
                </p>
            </header>

            <div className={styles.timeline}>
                {versions.map((v) => (
                    <VersionCard key={v.version} version={v} />
                ))}
            </div>
        </section>
    );
}
