import {formatCountdown, formatLeaderboardDate, type LeaderboardSummary as Summary} from '@/lib/community/leaderboard';
import clsx from 'clsx';
import styles from './LeaderboardSummary.module.scss';

interface LeaderboardSummaryProps {
    from: Date;
    to: Date;
    /** Current time, null before the first client render. */
    now: number | null;
    summary: Summary;
}

const TONE_CLASSES = {upcoming: styles.upcoming, live: styles.live, ended: styles.ended};

function rangeStatus(from: Date, to: Date, now: number) {
    if (now < from.getTime())
        return {tone: 'upcoming', text: `Starts in ${formatCountdown(from.getTime() - now)}`} as const;
    if (now < to.getTime())
        return {tone: 'live', text: `Live · ends in ${formatCountdown(to.getTime() - now)}`} as const;
    return {tone: 'ended', text: 'Window closed'} as const;
}

export function LeaderboardSummary({from, to, now, summary}: LeaderboardSummaryProps) {
    const status = now === null ? null : rangeStatus(from, to, now);
    const stats = [
        {label: 'Contributors', value: summary.contributors},
        {label: 'PRs opened', value: summary.prs},
        {label: 'PRs merged', value: summary.merged},
        {label: 'Issues opened', value: summary.issues},
        {label: 'Projects', value: summary.repos},
    ];

    return (
        <div className={styles.summary}>
            <div className={styles.statusRow}>
                <span className={styles.range}>
                    {formatLeaderboardDate(from)} → {formatLeaderboardDate(to)}
                </span>
                {status && (
                    <span className={clsx(styles.status, TONE_CLASSES[status.tone])}>
                        {status.tone === 'live' && <span className={styles.pulse} aria-hidden="true" />}
                        {status.text}
                    </span>
                )}
            </div>

            <dl className={styles.stats}>
                {stats.map(({label, value}) => (
                    <div key={label} className={styles.stat}>
                        <dt className={styles.statLabel}>{label}</dt>
                        <dd className={styles.statValue}>{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
