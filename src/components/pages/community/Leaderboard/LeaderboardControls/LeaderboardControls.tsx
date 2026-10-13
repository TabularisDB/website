'use client';

import {CheckboxField} from '@/components/ui/CheckboxField/CheckboxField';
import {CopyButton} from '@/components/ui/CopyButton/CopyButton';
import {SITE_URL} from '@/lib/siteConfig';
import {LinkIcon} from 'lucide-react';
import styles from './LeaderboardControls.module.scss';

interface LeaderboardControlsProps {
    includeTeam: boolean;
    onIncludeTeamChange: (value: boolean) => void;
    entrantsOnly: boolean;
    onEntrantsOnlyChange: (value: boolean) => void;
    /** Query string of the current view, for the copied link. */
    shareQuery: string;
}

export function LeaderboardControls({
    includeTeam,
    onIncludeTeamChange,
    entrantsOnly,
    onEntrantsOnlyChange,
    shareQuery,
}: LeaderboardControlsProps) {
    return (
        <div className={styles.controls}>
            <CheckboxField className={styles.checkbox} checked={includeTeam} onChange={onIncludeTeamChange}>
                Include team members
            </CheckboxField>
            <CheckboxField className={styles.checkbox} checked={entrantsOnly} onChange={onEntrantsOnlyChange}>
                Giveaway entrants only
            </CheckboxField>

            <CopyButton
                className={styles.copy}
                text={`${SITE_URL}/contribute/leaderboard${shareQuery}`}
                icon={<LinkIcon />}
                label="Copy link"
            />
        </div>
    );
}
