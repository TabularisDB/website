import type {LeaderboardRow} from '@/lib/community/leaderboard';
import {CircleDotIcon, GitMergeIcon, GitPullRequestIcon} from 'lucide-react';
import styles from './RowCounts.module.scss';

/** Merged PRs, pending PRs and issues of a contributor, as icon + number. */
export function RowCounts({row}: {row: LeaderboardRow}) {
    return (
        <span className={styles.counts}>
            <span className={styles.count} title="Merged pull requests">
                <GitMergeIcon aria-hidden="true" />
                {row.merged}
            </span>
            <span className={styles.count} title="Pending pull requests">
                <GitPullRequestIcon aria-hidden="true" />
                {row.pendingPrs}
            </span>
            <span className={styles.count} title="Issues opened">
                <CircleDotIcon aria-hidden="true" />
                {row.issues}
            </span>
        </span>
    );
}
