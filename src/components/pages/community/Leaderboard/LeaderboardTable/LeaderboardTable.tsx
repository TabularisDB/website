'use client';

import {avatarUrl, type LeaderboardRow} from '@/lib/community/leaderboard';
import clsx from 'clsx';
import {ChevronDownIcon, SparklesIcon, TicketIcon} from 'lucide-react';
import Image from 'next/image';
import {Fragment, useState} from 'react';
import {ContributionList} from '../ContributionList/ContributionList';
import {JoinButton} from '../JoinButton/JoinButton';
import {RowCounts} from '../RowCounts/RowCounts';
import styles from './LeaderboardTable.module.scss';

const MEDAL_CLASSES = [styles.medal1, styles.medal2, styles.medal3];

/** Count columns, hidden on mobile where RowCounts shows them under the login. */
const COLUMNS: Array<{label: string; value: (row: LeaderboardRow) => number}> = [
    {label: 'Merged', value: (row) => row.merged},
    {label: 'Pending', value: (row) => row.pendingPrs},
    {label: 'Issues', value: (row) => row.issues},
    {label: 'Projects', value: (row) => row.repos.length},
];

interface LeaderboardTableProps {
    rows: LeaderboardRow[];
    onJoin: (login: string) => void;
}

export function LeaderboardTable({rows, onJoin}: LeaderboardTableProps) {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className={styles.table}>
            <div className={clsx(styles.row, styles.head)} aria-hidden="true">
                <span>#</span>
                <span>Contributor</span>
                {COLUMNS.map(({label}) => (
                    <span key={label} className={clsx(styles.num, styles.countColumn)}>
                        {label}
                    </span>
                ))}
                <span className={styles.num}>Score</span>
            </div>

            {rows.map((row, i) => {
                const open = expanded === row.login;
                return (
                    <Fragment key={row.login}>
                        <div className={clsx(styles.row, styles.bodyRow, open && styles.open)}>
                            <span className={clsx(styles.rank, MEDAL_CLASSES[i])}>{i + 1}</span>

                            <span className={styles.user}>
                                {/* Covers the whole row (::after), so a click anywhere expands it. */}
                                <button
                                    type="button"
                                    className={styles.expand}
                                    aria-expanded={open}
                                    onClick={() => setExpanded(open ? null : row.login)}
                                >
                                    <Image
                                        src={avatarUrl(row.avatarUrl, 28)}
                                        alt=""
                                        width={28}
                                        height={28}
                                        className={styles.avatar}
                                    />
                                    <span className={styles.login}>@{row.login}</span>
                                </button>

                                <span className={styles.meta}>
                                    <span className={styles.mobileCounts}>
                                        <RowCounts row={row} />
                                    </span>
                                    {row.team && <span className={styles.badge}>Team</span>}
                                    {row.entrant && (
                                        <span
                                            className={clsx(styles.badge, styles.badgeEntrant)}
                                            title="Entered the giveaway on Discord"
                                        >
                                            <TicketIcon aria-hidden="true" />
                                            Entered
                                        </span>
                                    )}
                                    {row.firstTime && (
                                        <span
                                            className={clsx(styles.badge, styles.badgeNew)}
                                            title="First contribution to a Tabularis project"
                                        >
                                            <SparklesIcon aria-hidden="true" />
                                            First-timer
                                        </span>
                                    )}
                                    {!row.entrant && !row.team && <JoinButton onClick={() => onJoin(row.login)} />}
                                </span>
                            </span>

                            {COLUMNS.map(({label, value}) => (
                                <span key={label} className={clsx(styles.num, styles.countColumn)}>
                                    {value(row)}
                                </span>
                            ))}

                            <span className={clsx(styles.num, styles.score)}>
                                {row.score}
                                <ChevronDownIcon aria-hidden="true" className={styles.chevron} />
                            </span>
                        </div>

                        {open && <ContributionList row={row} />}
                    </Fragment>
                );
            })}
        </div>
    );
}
