import {contributionKey, contributionUrl, formatShortDate, type LeaderboardRow} from '@/lib/community/leaderboard';
import type {Contribution} from '@/lib/community/types';
import clsx from 'clsx';
import {CircleDotIcon, GitMergeIcon, GitPullRequestIcon} from 'lucide-react';
import styles from './ContributionList.module.scss';

const STATE_LABELS: Record<Contribution['type'], Partial<Record<Contribution['state'], string>>> = {
    pr: {merged: 'Merged', 'self-merged': 'Self-merged', open: 'Pending', draft: 'Draft', closed: 'Closed'},
    issue: {closed: 'Resolved', rejected: 'Not planned', withdrawn: 'Self-closed'},
};

function stateLabel(c: Contribution): string {
    if (c.type === 'issue' && c.state === 'open') {
        if (!c.triaged) return 'Untriaged';
        return c.maintainer ? 'Self-triaged' : 'Triaged';
    }
    if (c.state === 'self-merged' && c.approvedBy) return 'Self-merged, approved';
    return STATE_LABELS[c.type][c.state] ?? c.state;
}

/** Same colors as the issue board: purple merged, teal open, amber resolved; struck through when it earns nothing. */
function stateClass(c: Contribution): string | undefined {
    if (c.type === 'pr' && c.state === 'merged') return styles.merged;
    if (c.state === 'open') return styles.open;
    if (c.type === 'issue' && c.state === 'closed') return styles.resolved;
    if (c.state === 'closed' || c.state === 'rejected' || c.state === 'withdrawn') return styles.dropped;
    return undefined;
}

function StateIcon({c}: {c: Contribution}) {
    if (c.type === 'issue') return <CircleDotIcon aria-hidden="true" />;
    return c.state === 'merged' || c.state === 'self-merged' ? (
        <GitMergeIcon aria-hidden="true" />
    ) : (
        <GitPullRequestIcon aria-hidden="true" />
    );
}

/** The pull requests and issues behind a row's score, shown when the row is expanded. */
export function ContributionList({row}: {row: LeaderboardRow}) {
    return (
        <div className={styles.details}>
            <ul className={styles.list} aria-label={`Contributions by @${row.login}`}>
                {row.contributions.map((c) => (
                    <li key={contributionKey(c)} className={styles.item}>
                        <span className={clsx(styles.state, stateClass(c))}>
                            <StateIcon c={c} />
                            {stateLabel(c)}
                        </span>
                        <a href={contributionUrl(c)} target="_blank" rel="noopener noreferrer" className={styles.title}>
                            {c.title}
                        </a>
                        <span className={styles.meta}>
                            {c.repo} #{c.number} · {formatShortDate(c.createdAt)}
                        </span>
                        <span className={styles.points}>+{row.points.get(contributionKey(c)) ?? 0}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
