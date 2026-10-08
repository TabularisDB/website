import {avatarUrl, type LeaderboardRow} from '@/lib/community/leaderboard';
import clsx from 'clsx';
import Image from 'next/image';
import {JoinButton} from '../JoinButton/JoinButton';
import {RowCounts} from '../RowCounts/RowCounts';
import styles from './Podium.module.scss';

const PLACE_CLASSES = [styles.place1, styles.place2, styles.place3];

interface PodiumProps {
    /** The top three rows, in rank order. */
    rows: LeaderboardRow[];
    onJoin: (login: string) => void;
}

/** The top three, first place in the middle and raised. Hidden on mobile, where the table ranks carry the medals. */
export function Podium({rows, onJoin}: PodiumProps) {
    return (
        <ol className={styles.podium}>
            {rows.map((row, i) => (
                <li key={row.login} className={clsx(styles.card, PLACE_CLASSES[i])}>
                    <span className={styles.rank}>#{i + 1}</span>
                    <a
                        href={`https://github.com/${row.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.user}
                    >
                        <Image
                            src={avatarUrl(row.avatarUrl, 64)}
                            alt=""
                            width={64}
                            height={64}
                            className={styles.avatar}
                        />
                        <span className={styles.login}>@{row.login}</span>
                    </a>
                    {!row.entrant && !row.team && <JoinButton onClick={() => onJoin(row.login)} />}
                    <span className={styles.score}>
                        {row.score} <small>pts</small>
                    </span>
                    <span className={styles.counts}>
                        <RowCounts row={row} />
                    </span>
                </li>
            ))}
        </ol>
    );
}
