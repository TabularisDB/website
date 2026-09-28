'use client';

import {useState} from 'react';
import {
    BountyFilters,
    DIFFICULTY_FILTERS,
    FOCUS_FILTERS,
    STATUS_FILTERS,
    type DifficultyFilter,
    type FocusFilter,
    type StatusFilter,
} from '../BountyFilters/BountyFilters';
import styles from './BountyGrid.module.scss';
import {BOUNTY_STATUS, getActiveBounties, PluginBounty} from '@/lib/pluginBounties';
import {STATUS_WEIGHT} from '../../Plugin.data';
import {XIcon} from 'lucide-react';
import {BountyCard} from '../BountyCard/BountyCard';

function matchesStatus(bounty: PluginBounty, filter: StatusFilter) {
    if (filter === 'all') return true;
    if (filter === 'motion') return bounty.status === BOUNTY_STATUS.CLAIMED || bounty.status === BOUNTY_STATUS.SCOPED;
    if (filter === 'coming-soon') return bounty.status === BOUNTY_STATUS.COMING_SOON;
    return bounty.status === BOUNTY_STATUS.OPEN;
}

function matchesFocus(bounty: PluginBounty, filter: FocusFilter) {
    if (filter === 'all') return true;
    const tags = FOCUS_FILTERS.find((item) => item.id === filter)?.tags ?? [];
    const bountyTags = bounty.tags.map((tag) => tag.toLowerCase());
    const target = bounty.target.toLowerCase();
    const name = bounty.name.toLowerCase();
    return tags.some((tag) => bountyTags.includes(tag) || target.includes(tag) || name.includes(tag));
}

export function BountyGrid() {
    const [status, setStatus] = useState<StatusFilter>('all');
    const [focus, setFocus] = useState<FocusFilter>('all');
    const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
    const [query, setQuery] = useState('');

    const activeBounties = getActiveBounties().sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]);

    const normalizedQuery = query.trim().toLowerCase();

    const filtered = activeBounties.filter(
        (bounty) =>
            matchesStatus(bounty, status) &&
            matchesFocus(bounty, focus) &&
            (difficulty === 'all' || bounty.difficulty === difficulty) &&
            (!normalizedQuery ||
                [bounty.name, bounty.target, bounty.tagline, bounty.description, ...bounty.tags].some((value) =>
                    value.toLowerCase().includes(normalizedQuery),
                )),
    );

    const activeChips: Array<{key: string; label: string; onRemove: () => void}> = [];
    if (query.trim()) {
        activeChips.push({key: 'query', label: `"${query.trim()}"`, onRemove: () => setQuery('')});
    }
    if (status !== 'all') {
        activeChips.push({
            key: 'status',
            label: STATUS_FILTERS.find((item) => item.id === status)!.label,
            onRemove: () => setStatus('all'),
        });
    }
    if (focus !== 'all') {
        activeChips.push({
            key: 'focus',
            label: FOCUS_FILTERS.find((item) => item.id === focus)!.label,
            onRemove: () => setFocus('all'),
        });
    }
    if (difficulty !== 'all') {
        activeChips.push({
            key: 'difficulty',
            label: DIFFICULTY_FILTERS.find((item) => item.id === difficulty)!.label,
            onRemove: () => setDifficulty('all'),
        });
    }

    return (
        <main className={styles.wrapper}>
            <BountyFilters
                query={query}
                onQueryChange={setQuery}
                status={status}
                onStatusChange={setStatus}
                focus={focus}
                onFocusChange={setFocus}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
            />

            <div className={styles.resultsRow}>
                <span className={styles.count}>{filtered.length} Plugins</span>

                {activeChips.length > 0 && (
                    <div className={styles.chips}>
                        {activeChips.map((chip) => (
                            <button key={chip.key} type="button" className={styles.chip} onClick={chip.onRemove}>
                                {chip.label}
                                <XIcon aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {filtered.length > 0 ? (
                <div className={styles.grid}>
                    {filtered.map((bounty) => (
                        <BountyCard key={bounty.id} bounty={bounty} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <span>No matching target</span>
                    <p>Try clearing one filter or start a new request in GitHub Discussions.</p>
                </div>
            )}
        </main>
    );
}
