'use client';

import {CheckboxField} from '@/components/ui/CheckboxField/CheckboxField';
import {
    CONTRIBUTIONS_SINCE,
    formatShortDate,
    GIVEAWAY_RANGE,
    LEADERBOARD_TIME_ZONE,
    parseRangeBound,
    toZonedInput,
    type LeaderboardRange,
} from '@/lib/community/leaderboard';
import clsx from 'clsx';
import {DateTimeField} from '../DateTimeField/DateTimeField';
import styles from './LeaderboardControls.module.scss';

const DAY = 24 * 60 * 60 * 1000;

function lastDays(days: number): LeaderboardRange {
    return {from: toZonedInput(new Date(Date.now() - days * DAY)), to: toZonedInput(new Date())};
}

const PRESETS = [
    {key: 'giveaway', label: 'Giveaway window', range: () => GIVEAWAY_RANGE},
    {key: '7d', label: 'Last 7 days', range: () => lastDays(7)},
    {key: '30d', label: 'Last 30 days', range: () => lastDays(30)},
] as const;

export type PresetKey = (typeof PRESETS)[number]['key'];

interface LeaderboardControlsProps {
    range: LeaderboardRange;
    /** The preset the range came from, null once a date is edited by hand. */
    preset: PresetKey | null;
    onRangeChange: (range: LeaderboardRange, preset?: PresetKey) => void;
    includeTeam: boolean;
    onIncludeTeamChange: (value: boolean) => void;
    entrantsOnly: boolean;
    onEntrantsOnlyChange: (value: boolean) => void;
    /** Query string of the current view, for the copied link. */
    shareQuery: string;
}

export function LeaderboardControls({
    range,
    preset,
    onRangeChange,
    includeTeam,
    onIncludeTeamChange,
    entrantsOnly,
    onEntrantsOnlyChange,
}: LeaderboardControlsProps) {
    const from = parseRangeBound(range.from, 'from');
    const truncated = from !== null && from < new Date(CONTRIBUTIONS_SINCE);

    return (
        <div className={styles.controls}>
            <div className={styles.presets} role="group" aria-label="Date range presets">
                {PRESETS.map(({key, label, range: presetRange}) => (
                    <button
                        key={key}
                        type="button"
                        className={clsx(styles.preset, preset === key && styles.presetActive)}
                        aria-pressed={preset === key}
                        onClick={() => onRangeChange(presetRange(), key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className={styles.fields}>
                <DateTimeField label="From" value={range.from} onChange={(from) => onRangeChange({...range, from})} />
                <DateTimeField label="To" value={range.to} onChange={(to) => onRangeChange({...range, to})} />

                <CheckboxField className={styles.checkbox} checked={includeTeam} onChange={onIncludeTeamChange}>
                    Include team members
                </CheckboxField>
                <CheckboxField className={styles.checkbox} checked={entrantsOnly} onChange={onEntrantsOnlyChange}>
                    Giveaway entrants only
                </CheckboxField>
            </div>

            <p className={styles.note}>
                Times are {LEADERBOARD_TIME_ZONE} time, on a 24-hour clock.
                {truncated && ` Data only goes back to ${formatShortDate(CONTRIBUTIONS_SINCE)}.`}
            </p>
        </div>
    );
}
