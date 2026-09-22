import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {CheckCircle} from 'lucide-react';
import type {ChangelogVersion, SectionType} from '@/lib/changelog';
import styles from './VersionCard.module.scss';

const SECTION_LABELS: Record<SectionType, string> = {
    feat: 'Features',
    fix: 'Bug Fixes',
    breaking: 'Breaking Changes',
    perf: 'Performance',
    other: 'Other',
};

interface VersionCardProps {
    version: ChangelogVersion;
    isLast?: boolean;
}

export function VersionCard({version: v, isLast = false}: VersionCardProps) {
    const totalEntries = v.sections.reduce((s, sec) => s + sec.entries.length, 0);
    if (totalEntries === 0) return null;

    const formattedDate = new Date(v.date + 'T12:00:00Z').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });

    return (
        <div className={`${styles.row} ${isLast ? styles.rowLast : ''}`}>
            <div className={styles.meta}>
                <time className={styles.date} dateTime={v.date}>
                    {formattedDate}
                </time>
                {v.isMajor && <span className={styles.majorBadge}>Major</span>}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h2 className={styles.title}>v{v.version}</h2>

                    {v.compareUrl && (
                        <a href={v.compareUrl} target="_blank" rel="noopener noreferrer" className={styles.compareLink}>
                            <GitHubIcon />
                            View diff
                        </a>
                    )}
                </div>

                <div className={styles.sections}>
                    {v.sections.map((section) => (
                        <div key={section.title} className={styles.section}>
                            <span className={styles.sectionHeader} data-type={section.type}>
                                {SECTION_LABELS[section.type]}
                            </span>
                            <ul className={styles.entryList}>
                                {section.entries.map((entry, i) => (
                                    <li key={i} className={styles.entry}>
                                        <CheckCircle size={14} className={styles.checkIcon} />
                                        <span className={styles.entryContent}>
                                            {entry.scope && <span className={styles.scope}>{entry.scope}</span>}
                                            <span
                                                className={styles.entryDesc}
                                                dangerouslySetInnerHTML={{__html: entry.description}}
                                            />
                                        </span>
                                        {entry.commitHash && entry.commitUrl && (
                                            <a
                                                href={entry.commitUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.commitHash}
                                            >
                                                {entry.commitHash.slice(0, 7)}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
