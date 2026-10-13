'use client';

import clsx from 'clsx';
import {ArrowBigUpIcon} from 'lucide-react';
import styles from './BountyVote.module.scss';

interface BountyVoteProps {
    count: number;
    voted: boolean;
    disabled?: boolean;
    onVote: () => void;
    className?: string;
}

export function BountyVote({count, voted, disabled, onVote, className}: BountyVoteProps) {
    return (
        <button
            type="button"
            className={clsx(styles.vote, className)}
            aria-pressed={voted}
            aria-label={voted ? `Remove your upvote (${count})` : `Upvote (${count})`}
            disabled={disabled}
            onClick={(event) => {
                event.stopPropagation();
                onVote();
            }}
        >
            <ArrowBigUpIcon aria-hidden="true" />
            <span>{count}</span>
        </button>
    );
}
