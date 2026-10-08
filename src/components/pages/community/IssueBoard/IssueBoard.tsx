'use client';

import {Button} from '@/components/ui/Button/Button';
import {
    COMMUNITY_ISSUES,
    FEATURED_LABELS,
    getIssueLabels,
    ISSUE_PROJECT_GROUPS,
    issueSearchUrl,
    type CommunityIssue,
    type LabelCount,
} from '@/lib/community';
import {ArrowUpRightIcon, SearchIcon, XIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import {FilterSelect, type FilterOption, type FilterOptionGroup} from './FilterSelect/FilterSelect';
import styles from './IssueBoard.module.scss';
import {IssueCard} from './IssueCard/IssueCard';

const PAGE_SIZE = 12;
const ALL = 'all';

const countIssues = (match: (issue: CommunityIssue) => boolean) => COMMUNITY_ISSUES.filter(match).length;

const ALL_PROJECTS: FilterOption<string>[] = [{value: ALL, label: 'All projects', count: COMMUNITY_ISSUES.length}];
const PROJECT_GROUPS: FilterOptionGroup<string>[] = ISSUE_PROJECT_GROUPS.map((group) => ({
    key: group.kind,
    label: group.label,
    options: group.repos.map((repo) => ({
        value: repo,
        label: repo,
        count: countIssues((issue) => issue.repo === repo),
    })),
}));

const LABELS = getIssueLabels();
const toLabelOption = (label: LabelCount): FilterOption<string> => ({
    value: label.name,
    label: label.name,
    count: label.count,
    color: label.color,
});

const ALL_LABELS: FilterOption<string>[] = [{value: ALL, label: 'All labels', count: COMMUNITY_ISSUES.length}];
const LABEL_GROUPS: FilterOptionGroup<string>[] = [
    {
        key: 'featured',
        label: 'Good places to start',
        options: LABELS.filter((item) => FEATURED_LABELS.includes(item.name)).map(toLabelOption),
    },
    {
        key: 'other',
        label: 'Other labels',
        options: LABELS.filter((item) => !FEATURED_LABELS.includes(item.name)).map(toLabelOption),
    },
].filter((group) => group.options.length > 0);

export function IssueBoard() {
    const [label, setLabel] = useState<string>(ALL);
    const [repo, setRepo] = useState<string>(ALL);
    const [query, setQuery] = useState('');
    const [unclaimedOnly, setUnclaimedOnly] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);

    // Deep links such as /contribute?label=good+first+issue#issues preselect a label.
    useEffect(() => {
        const fromUrl = new URLSearchParams(window.location.search).get('label');
        if (fromUrl && LABELS.some((l) => l.name === fromUrl)) setLabel(fromUrl);
    }, []);

    useEffect(() => setVisible(PAGE_SIZE), [label, repo, query, unclaimedOnly]);

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = COMMUNITY_ISSUES.filter(
        (issue) =>
            (label === ALL || issue.labels.some((l) => l.name === label)) &&
            (repo === ALL || issue.repo === repo) &&
            (!unclaimedOnly || (issue.assignees.length === 0 && issue.pullRequests.length === 0)) &&
            (!normalizedQuery ||
                issue.title.toLowerCase().includes(normalizedQuery) ||
                String(issue.number) === normalizedQuery.replace(/^#/, '')),
    );
    const shown = filtered.slice(0, visible);

    const activeChips: Array<{key: string; label: string; onRemove: () => void}> = [];
    if (normalizedQuery) activeChips.push({key: 'query', label: `"${query.trim()}"`, onRemove: () => setQuery('')});
    if (label !== ALL) activeChips.push({key: 'label', label, onRemove: () => setLabel(ALL)});
    if (repo !== ALL) activeChips.push({key: 'repo', label: repo, onRemove: () => setRepo(ALL)});
    if (unclaimedOnly)
        activeChips.push({key: 'unclaimed', label: 'Unclaimed', onRemove: () => setUnclaimedOnly(false)});

    return (
        <div className={styles.wrapper}>
            <div className={styles.bar}>
                <div className={styles.searchWrap}>
                    <SearchIcon aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search issue titles or #number…"
                        aria-label="Search issues"
                    />
                </div>

                <FilterSelect
                    label="Filter by project"
                    value={repo}
                    onChange={setRepo}
                    options={ALL_PROJECTS}
                    groups={PROJECT_GROUPS}
                    searchPlaceholder="Search projects…"
                />

                <FilterSelect
                    label="Filter by label"
                    value={label}
                    onChange={setLabel}
                    options={ALL_LABELS}
                    groups={LABEL_GROUPS}
                    searchPlaceholder="Search labels…"
                />

                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={unclaimedOnly}
                        onChange={(event) => setUnclaimedOnly(event.target.checked)}
                        aria-describedby="unclaimed-note"
                    />
                    Unclaimed only*
                </label>
            </div>

            <p id="unclaimed-note" className={styles.note}>
                * Unclaimed means no assignee and no open pull request: an open PR usually means someone is already
                working on it.
            </p>

            <div className={styles.resultsRow}>
                <span className={styles.count}>
                    {filtered.length} {filtered.length === 1 ? 'issue' : 'issues'}
                </span>

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

                <a
                    className={styles.githubLink}
                    href={issueSearchUrl({
                        label: label === ALL ? undefined : label,
                        repo: repo === ALL ? undefined : repo,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View on GitHub
                    <ArrowUpRightIcon aria-hidden="true" />
                </a>
            </div>

            {shown.length > 0 ? (
                <div className={styles.grid}>
                    {shown.map((issue) => (
                        <IssueCard key={issue.url} issue={issue} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <span>No matching issue</span>
                    <p>Try clearing a filter, or browse every open issue on GitHub.</p>
                </div>
            )}

            {filtered.length > visible && (
                <Button
                    variant="secondary"
                    size="sm"
                    className={styles.more}
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                    Show more
                </Button>
            )}
        </div>
    );
}
