'use client';

import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {ArrowUpRightIcon, GitPullRequestIcon, MessageSquareIcon, SearchIcon, XIcon} from 'lucide-react';
import Image from 'next/image';
import {
    cleanIssueTitle,
    COMMUNITY_ISSUES,
    getIssueLabels,
    ISSUE_PROJECT_GROUPS,
    issueSearchUrl,
    type CommunityIssue,
} from '@/lib/community';
import {FilterSelect, type FilterOption, type FilterOptionGroup} from './FilterSelect';
import styles from './IssueBoard.module.scss';

const PAGE_SIZE = 12;
const ALL = 'all';

type KindFilter = typeof ALL | 'bug' | 'feature';

const countIssues = (match: (issue: CommunityIssue) => boolean) => COMMUNITY_ISSUES.filter(match).length;

const KIND_FILTERS: FilterOption<KindFilter>[] = [
    {value: ALL, label: 'Bugs and features', count: COMMUNITY_ISSUES.length},
    {value: 'bug', label: 'Bugs', count: countIssues((issue) => issue.kind === 'bug')},
    {value: 'feature', label: 'Features', count: countIssues((issue) => issue.kind === 'feature')},
];

const ALL_PROJECTS: FilterOption<string>[] = [{value: ALL, label: 'All projects', count: COMMUNITY_ISSUES.length}];
const PROJECT_GROUPS: FilterOptionGroup<string>[] = ISSUE_PROJECT_GROUPS.map((group) => ({
    key: group.kind,
    label: group.label,
    options: group.repos.map((repo) => ({value: repo, label: repo, count: countIssues((issue) => issue.repo === repo)})),
}));

const LABELS = getIssueLabels();

// Fixed locale and time zone so the server-rendered date matches the hydrated one.
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'});

function IssueCard({issue}: {issue: CommunityIssue}) {
    return (
        <article className={styles.card}>
            <div className={styles.cardMeta}>
                <span className={styles.cardRepo}>
                    {issue.repo} #{issue.number}
                </span>
                {issue.kind && <span className={clsx(styles.kind, styles[issue.kind])}>{issue.kind}</span>}
            </div>

            <h3 className={styles.cardTitle}>
                {/* Stretched over the whole card; the assignee and PR links sit above it. */}
                <a href={issue.url} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                    {cleanIssueTitle(issue.title)}
                </a>
            </h3>

            {issue.labels.length > 0 && (
                <ul className={styles.labels}>
                    {issue.labels.map((label) => (
                        <li key={label.name} className={styles.label}>
                            <span className={styles.dot} style={{background: `#${label.color}`}} aria-hidden="true" />
                            {label.name}
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.cardFooter}>
                <span>Opened {DATE_FORMAT.format(new Date(issue.createdAt))}</span>
                {issue.comments > 0 && (
                    <span className={styles.footerItem}>
                        <MessageSquareIcon aria-hidden="true" />
                        {issue.comments}
                    </span>
                )}
                {issue.assignees.length > 0 && (
                    <span className={clsx(styles.footerItem, styles.claimed)}>
                        Claimed by
                        <span className={styles.assignees}>
                            {issue.assignees.map((assignee) => (
                                <a
                                    key={assignee.login}
                                    href={`https://github.com/${assignee.login}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.assignee}
                                    title={`@${assignee.login}`}
                                >
                                    <Image
                                        src={`${assignee.avatarUrl}${assignee.avatarUrl.includes('?') ? '&' : '?'}s=48`}
                                        alt={`@${assignee.login}`}
                                        width={22}
                                        height={22}
                                        className={styles.avatar}
                                    />
                                </a>
                            ))}
                        </span>
                    </span>
                )}
                {issue.pullRequests.length > 0 && (
                    <span className={clsx(styles.footerItem, styles.pullRequests)}>
                        <GitPullRequestIcon aria-hidden="true" />
                        {issue.pullRequests.length} open {issue.pullRequests.length === 1 ? 'PR' : 'PRs'}
                        {issue.pullRequests.map((pr) => (
                            <a
                                key={pr.url}
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.prLink}
                                title={pr.author ? `#${pr.number} by @${pr.author}` : `#${pr.number}`}
                            >
                                #{pr.number}
                            </a>
                        ))}
                    </span>
                )}
                <ArrowUpRightIcon className={styles.cardArrow} aria-hidden="true" />
            </div>
        </article>
    );
}

export function IssueBoard() {
    const [label, setLabel] = useState<string>(ALL);
    const [repo, setRepo] = useState<string>(ALL);
    const [kind, setKind] = useState<KindFilter>(ALL);
    const [query, setQuery] = useState('');
    const [unclaimedOnly, setUnclaimedOnly] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);

    // Deep links such as /community?label=good+first+issue#issues preselect a label.
    useEffect(() => {
        const fromUrl = new URLSearchParams(window.location.search).get('label');
        if (fromUrl && LABELS.some((l) => l.name === fromUrl)) setLabel(fromUrl);
    }, []);

    useEffect(() => setVisible(PAGE_SIZE), [label, repo, kind, query, unclaimedOnly]);

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = COMMUNITY_ISSUES.filter(
        (issue) =>
            (label === ALL || issue.labels.some((l) => l.name === label)) &&
            (repo === ALL || issue.repo === repo) &&
            (kind === ALL || issue.kind === kind) &&
            (!unclaimedOnly || (issue.assignees.length === 0 && issue.pullRequests.length === 0)) &&
            (!normalizedQuery ||
                issue.title.toLowerCase().includes(normalizedQuery) ||
                String(issue.number) === normalizedQuery.replace(/^#/, '')),
    );
    const shown = filtered.slice(0, visible);

    const activeChips: Array<{key: string; label: string; onRemove: () => void}> = [];
    if (normalizedQuery) activeChips.push({key: 'query', label: `"${query.trim()}"`, onRemove: () => setQuery('')});
    if (repo !== ALL) activeChips.push({key: 'repo', label: repo, onRemove: () => setRepo(ALL)});
    if (kind !== ALL) {
        activeChips.push({
            key: 'kind',
            label: KIND_FILTERS.find((item) => item.value === kind)!.label,
            onRemove: () => setKind(ALL),
        });
    }
    if (unclaimedOnly) activeChips.push({key: 'unclaimed', label: 'Unclaimed', onRemove: () => setUnclaimedOnly(false)});

    return (
        <div className={styles.wrapper}>
            <div className={styles.labelRow} role="group" aria-label="Filter by label">
                <button
                    type="button"
                    className={clsx(styles.pill, label === ALL && styles.pillActive)}
                    aria-pressed={label === ALL}
                    onClick={() => setLabel(ALL)}
                >
                    All issues
                    <span className={styles.pillCount}>{COMMUNITY_ISSUES.length}</span>
                </button>
                {LABELS.map((item) => (
                    <button
                        key={item.name}
                        type="button"
                        className={clsx(styles.pill, label === item.name && styles.pillActive)}
                        aria-pressed={label === item.name}
                        onClick={() => setLabel(item.name)}
                    >
                        <span className={styles.dot} style={{background: `#${item.color}`}} aria-hidden="true" />
                        {item.name}
                        <span className={styles.pillCount}>{item.count}</span>
                    </button>
                ))}
            </div>

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

                <FilterSelect label="Filter by type" value={kind} onChange={setKind} options={KIND_FILTERS} />

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
                    href={issueSearchUrl(label === ALL ? undefined : label)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open this list on GitHub
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
                <button type="button" className={styles.more} onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Show more ({filtered.length - visible} left)
                </button>
            )}
        </div>
    );
}
