'use client';

import {SearchIcon} from 'lucide-react';
import {BOUNTY_DIFFICULTY} from '@/lib/plugins/bounties';
import styles from './BountyFilters.module.scss';
import clsx from 'clsx';

export type StatusFilter = 'all' | 'motion' | 'coming-soon' | 'open';
export type BountySort = 'status' | 'votes';
export type FocusFilter = 'all' | 'compatibility' | 'warehouse' | 'nosql' | 'sql' | 'docs';
export type DifficultyFilter = 'all' | BOUNTY_DIFFICULTY.MEDIUM | BOUNTY_DIFFICULTY.HIGH | BOUNTY_DIFFICULTY.EXTREME;

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

export const STATUS_FILTERS: Array<{id: StatusFilter; label: string}> = [
    {id: 'all', label: 'All statuses'},
    {id: 'motion', label: 'In motion'},
    {id: 'coming-soon', label: 'Coming soon'},
    {id: 'open', label: 'Open brief'},
];

export const SORTS: Array<{id: BountySort; label: string}> = [
    {id: 'votes', label: 'Most voted'},
    {id: 'status', label: 'By status'},
];

export const DIFFICULTY_FILTERS: Array<{id: DifficultyFilter; label: string}> = [
    {id: 'all', label: 'Any difficulty'},
    {id: BOUNTY_DIFFICULTY.MEDIUM, label: 'Medium'},
    {id: BOUNTY_DIFFICULTY.HIGH, label: 'High'},
    {id: BOUNTY_DIFFICULTY.EXTREME, label: 'Extreme'},
];

interface BountyFiltersProps {
    kind: string | null;
    onKindChange: (value: string | null) => void;
    kinds: Array<{key: string; label: string; count: number}>;
    total: number;
    query: string;
    onQueryChange: (value: string) => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    focus: FocusFilter;
    onFocusChange: (value: FocusFilter) => void;
    difficulty: DifficultyFilter;
    onDifficultyChange: (value: DifficultyFilter) => void;
    sort: BountySort;
    onSortChange: (value: BountySort) => void;
}

export function BountyFilters({
    kind,
    onKindChange,
    kinds,
    total,
    query,
    onQueryChange,
    status,
    onStatusChange,
    focus,
    onFocusChange,
    difficulty,
    onDifficultyChange,
    sort,
    onSortChange,
}: BountyFiltersProps) {
    return (
        <>
            <div className={styles.kinds} role="group" aria-label="Plugin types">
                {[{key: null, label: 'All', count: total}, ...kinds].map((item) => (
                    <button
                        key={item.key ?? 'all'}
                        type="button"
                        aria-pressed={kind === item.key}
                        className={clsx(styles.kind, kind === item.key && styles.kindActive)}
                        onClick={() => onKindChange(item.key)}
                    >
                        {item.label}
                        <span className={styles.kindCount}>{item.count}</span>
                    </button>
                ))}
            </div>
            <div className={styles.bar}>
                <div className={styles.searchWrap}>
                    <SearchIcon aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Plugin, capability, or tag…"
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

                <select
                    className={styles.select}
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as BountySort)}
                    aria-label="Sort targets"
                >
                    {SORTS.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}
