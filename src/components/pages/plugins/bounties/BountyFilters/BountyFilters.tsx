'use client';

import {SearchIcon} from 'lucide-react';
import {BOUNTY_DIFFICULTY} from '@/lib/pluginBounties';
import styles from './BountyFilters.module.scss';

export type StatusFilter = 'all' | 'priority' | 'motion' | 'coming-soon' | 'open';
export type FocusFilter = 'all' | 'compatibility' | 'warehouse' | 'nosql' | 'sql' | 'docs';
export type DifficultyFilter = 'all' | BOUNTY_DIFFICULTY;

export const FOCUS_FILTERS: Array<{id: FocusFilter; label: string; tags: string[]}> = [
    {id: 'all', label: 'All focus', tags: []},
    {
        id: 'compatibility',
        label: 'Compatibility',
        tags: ['postgres-compatible', 'mysql-compatible', 'drop-in', 'compatibility'],
    },
    {id: 'warehouse', label: 'Warehouse', tags: ['warehouse', 'analytics', 'federated']},
    {id: 'nosql', label: 'NoSQL', tags: ['nosql', 'document', 'key-value', 'wide-column']},
    {id: 'sql', label: 'SQL', tags: ['enterprise', 'distributed-sql', 'embedded', 'sql']},
    {id: 'docs', label: 'Docs', tags: ['docs']},
];

const STATUS_FILTERS: Array<{id: StatusFilter; label: string}> = [
    {id: 'all', label: 'All statuses'},
    {id: 'priority', label: 'Most wanted'},
    {id: 'motion', label: 'In motion'},
    {id: 'coming-soon', label: 'Coming soon'},
    {id: 'open', label: 'Open brief'},
];

const DIFFICULTY_FILTERS: Array<{id: DifficultyFilter; label: string}> = [
    {id: 'all', label: 'Any difficulty'},
    {id: BOUNTY_DIFFICULTY.MEDIUM, label: 'Medium'},
    {id: BOUNTY_DIFFICULTY.HIGH, label: 'High'},
    {id: BOUNTY_DIFFICULTY.LOW, label: 'Extreme'},
];

interface BountyFiltersProps {
    query: string;
    onQueryChange: (value: string) => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    focus: FocusFilter;
    onFocusChange: (value: FocusFilter) => void;
    difficulty: DifficultyFilter;
    onDifficultyChange: (value: DifficultyFilter) => void;
}

export function BountyFilters({
    query,
    onQueryChange,
    status,
    onStatusChange,
    focus,
    onFocusChange,
    difficulty,
    onDifficultyChange,
}: BountyFiltersProps) {
    return (
        <div className={styles.bar}>
            <div className={styles.searchWrap}>
                <SearchIcon aria-hidden="true" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Database, capability, or tag…"
                    aria-label="Search bounty targets"
                />
            </div>

            <select
                className={styles.select}
                value={status}
                onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
                aria-label="Filter by status"
            >
                {STATUS_FILTERS.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                ))}
            </select>

            <select
                className={styles.select}
                value={focus}
                onChange={(event) => onFocusChange(event.target.value as FocusFilter)}
                aria-label="Filter by focus"
            >
                {FOCUS_FILTERS.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                ))}
            </select>

            <select
                className={styles.select}
                value={difficulty}
                onChange={(event) => onDifficultyChange(event.target.value as DifficultyFilter)}
                aria-label="Filter by difficulty"
            >
                {DIFFICULTY_FILTERS.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
