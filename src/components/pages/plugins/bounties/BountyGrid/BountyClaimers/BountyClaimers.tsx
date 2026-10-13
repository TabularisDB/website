import clsx from 'clsx';
import {GitBranchIcon} from 'lucide-react';
import type {BountyClaimer} from '@/lib/plugins/bounties';
import styles from './BountyClaimers.module.scss';

interface BountyClaimersProps {
    claimers: BountyClaimer[];
    /** Avatars only, for cards. */
    compact?: boolean;
    className?: string;
}

function Avatar({claimer}: {claimer: BountyClaimer}) {
    const name = claimer.username ?? claimer.displayName;
    return claimer.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatar, images are unoptimized anyway
        <img src={claimer.avatarUrl} alt="" width={24} height={24} className={styles.avatar} loading="lazy" />
    ) : (
        <span className={styles.avatar} aria-hidden="true">
            {name.charAt(0).toUpperCase()}
        </span>
    );
}

export function BountyClaimers({claimers, compact, className}: BountyClaimersProps) {
    if (claimers.length === 0) return null;

    if (compact) {
        return (
            <span className={clsx(styles.stack, className)} title={claimers.map((c) => c.username ?? c.displayName).join(', ')}>
                {claimers.slice(0, 4).map((claimer, i) => (
                    <Avatar key={`${claimer.username}-${i}`} claimer={claimer} />
                ))}
                {claimers.length > 4 && <span className={styles.more}>+{claimers.length - 4}</span>}
            </span>
        );
    }

    return (
        <ul className={clsx(styles.list, className)}>
            {claimers.map((claimer, i) => {
                const name = claimer.username ?? claimer.displayName;
                return (
                    <li key={`${name}-${i}`} className={styles.item}>
                        <Avatar claimer={claimer} />
                        {claimer.username ? (
                            <a href={`https://github.com/${claimer.username}`} target="_blank" rel="noopener noreferrer">
                                {name}
                            </a>
                        ) : (
                            <span>{name}</span>
                        )}
                        {claimer.repoUrl && (
                            <a href={claimer.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.repo}>
                                <GitBranchIcon aria-hidden="true" />
                                {claimer.repoUrl.replace(/^https:\/\/[^/]+\//, '')}
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
