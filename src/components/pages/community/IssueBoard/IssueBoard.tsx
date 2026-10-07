'use client';

import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {ArrowUpRightIcon, MessageSquareIcon, SearchIcon, XIcon} from 'lucide-react';
import Image from 'next/image';
import {
    cleanIssueTitle,
    COMMUNITY_ISSUES,
    getIssueLabels,
    issueSearchUrl,
    type CommunityIssue,
} from '@/lib/community';
import styles from './IssueBoard.module.scss';

const PAGE_SIZE = 12;
const ALL = 'all';

type KindFilter = typeof ALL | 'bug' | 'feature';

const KIND_FILTERS: Array<{id: KindFilter; label: string}> = [
    {id: ALL, label: 'Bugs and features'},
    {id: 'bug', label: 'Bugs'},
    {id: 'feature', label: 'Features'},
];

const LABELS = getIssueLabels();
const REPOS = [...new Set(COMMUNITY_ISSUES.map((issue) => issue.repo))].sort((a, b) =>
    a === 'tabularis' ? -1 : b === 'tabularis' ? 1 : a.localeCompare(b),
);

// Fixed locale and time zone so the server-rendered date matches the hydrated one.
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'});

function repoLabel(repo: string) {
    return repo === 'tabularis' ? 'Tabularis app' : repo.replace(/^tabularis-/, '');
}

function IssueCard({issue}: {issue: CommunityIssue}) {
    return (
        <article className={styles.card}>
            <div className={styles.cardMeta}>
                <span className={styles.cardRepo}>
                    {repoLabel(issue.repo)} #{issue.number}
                </span>
                {issue.kind && <span className={clsx(styles.kind, styles[issue.kind])}>{issue.kind}</span>}
            </div>

            <h3 className={styles.cardTitle}>
                {/* Stretched over the whole card; the assignee links sit above it. */}
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
            (!unclaimedOnly || issue.assignees.length === 0) &&
            (!normalizedQuery ||
                issue.title.toLowerCase().includes(normalizedQuery) ||
                String(issue.number) === normalizedQuery.replace(/^#/, '')),
    );
    const shown = filtered.slice(0, visible);

    const activeChips: Array<{key: string; label: string; onRemove: () => void}> = [];
    if (normalizedQuery) activeChips.push({key: 'query', label: `"${query.trim()}"`, onRemove: () => setQuery('')});
    if (repo !== ALL) activeChips.push({key: 'repo', label: repoLabel(repo), onRemove: () => setRepo(ALL)});
    if (kind !== ALL) {
        activeChips.push({
            key: 'kind',
            label: KIND_FILTERS.find((item) => item.id === kind)!.label,
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

                <select
                    className={styles.select}
                    value={repo}
                    onChange={(event) => setRepo(event.target.value)}
                    aria-label="Filter by project"
                >
                    <option value={ALL}>All projects</option>
                    {REPOS.map((name) => (
                        <option key={name} value={name}>
                            {repoLabel(name)}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.select}
                    value={kind}
                    onChange={(event) => setKind(event.target.value as KindFilter)}
                    aria-label="Filter by type"
                >
                    {KIND_FILTERS.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>

                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={unclaimedOnly}
                        onChange={(event) => setUnclaimedOnly(event.target.checked)}
                    />
                    Unclaimed only
                </label>
            </div>

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
