'use client';

import {
    buildLeaderboard,
    contributionKey,
    contributionUrl,
    CONTRIBUTIONS_FETCHED_AT,
    CONTRIBUTIONS_SINCE,
    formatCountdown,
    formatLeaderboardDate,
    formatShortDate,
    GIVEAWAY,
    LEADERBOARD_TIME_ZONE,
    parseRangeBound,
    toZonedInput,
    type LeaderboardRow,
} from '@/lib/community/leaderboard';
import type {Contribution} from '@/lib/community/types';
import clsx from 'clsx';
import {
    CheckIcon,
    ChevronDownIcon,
    CircleDotIcon,
    GitMergeIcon,
    GitPullRequestIcon,
    LinkIcon,
    SparklesIcon,
    TicketIcon,
} from 'lucide-react';
import Image from 'next/image';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {JoinGiveawayModal} from './JoinGiveawayModal/JoinGiveawayModal';
import styles from './Leaderboard.module.scss';

const DAY = 24 * 60 * 60 * 1000;

interface Range {
    from: string;
    to: string;
}

const GIVEAWAY_RANGE: Range = {from: GIVEAWAY.from, to: GIVEAWAY.to};

const PRESETS: Array<{key: string; label: string; range: () => Range}> = [
    {key: 'giveaway', label: 'Giveaway window', range: () => GIVEAWAY_RANGE},
    {
        key: '7d',
        label: 'Last 7 days',
        range: () => ({from: toZonedInput(new Date(Date.now() - 7 * DAY)), to: toZonedInput(new Date())}),
    },
    {
        key: '30d',
        label: 'Last 30 days',
        range: () => ({from: toZonedInput(new Date(Date.now() - 30 * DAY)), to: toZonedInput(new Date())}),
    },
];

const STATE_LABELS: Record<Contribution['type'], Partial<Record<Contribution['state'], string>>> = {
    pr: {merged: 'Merged', 'self-merged': 'Self-merged', open: 'Pending', draft: 'Draft', closed: 'Closed'},
    issue: {closed: 'Resolved', rejected: 'Not planned', withdrawn: 'Self-closed'},
};

function stateLabel(c: Contribution): string {
    if (c.type === 'issue' && c.state === 'open') {
        if (!c.triaged) return 'Untriaged';
        return c.maintainer ? 'Self-triaged' : 'Triaged';
    }
    return STATE_LABELS[c.type][c.state] ?? c.state;
}

function avatar(url: string, size: number) {
    return `${url}${url.includes('?') ? '&' : '?'}s=${size * 2}`;
}

export function Leaderboard() {
    const [range, setRange] = useState<Range>(GIVEAWAY_RANGE);
    const [includeTeam, setIncludeTeam] = useState(false);
    const [entrantsOnly, setEntrantsOnly] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [now, setNow] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [joinLogin, setJoinLogin] = useState<string | null>(null);
    const closeJoin = useCallback(() => setJoinLogin(null), []);

    // ?from=2026-10-07T16:00&to=2026-10-13T16:00&team=1&entrants=1 (Europe/Rome wall times, bare dates or ISO instants).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const from = parseRangeBound(params.get('from'), 'from');
        const to = parseRangeBound(params.get('to'), 'to');
        if (from || to) {
            setRange({
                from: from ? toZonedInput(from) : GIVEAWAY_RANGE.from,
                to: to ? toZonedInput(to) : toZonedInput(new Date()),
            });
        }
        if (params.get('team') === '1') setIncludeTeam(true);
        if (params.get('entrants') === '1') setEntrantsOnly(true);
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const shareUrl = useMemo(() => {
        const params = new URLSearchParams({from: range.from, to: range.to});
        if (includeTeam) params.set('team', '1');
        if (entrantsOnly) params.set('entrants', '1');
        return `?${params.toString()}`;
    }, [range, includeTeam, entrantsOnly]);

    useEffect(() => {
        if (now === null) return; // URL params not read yet
        window.history.replaceState(null, '', `${window.location.pathname}${shareUrl}`);
    }, [shareUrl, now]);

    const from = parseRangeBound(range.from, 'from');
    const to = parseRangeBound(range.to, 'to');
    const valid = from !== null && to !== null && from < to;
    const {rows, summary} = useMemo(
        () => (valid ? buildLeaderboard(from, to, {includeTeam, entrantsOnly}) : {rows: [], summary: null}),
        [range.from, range.to, includeTeam, entrantsOnly, valid],
    );

    const isGiveaway = range.from === GIVEAWAY_RANGE.from && range.to === GIVEAWAY_RANGE.to;
    const activePreset = isGiveaway ? 'giveaway' : null;
    const truncated = valid && from < new Date(CONTRIBUTIONS_SINCE);

    let status: {tone: 'live' | 'upcoming' | 'ended'; text: string} | null = null;
    if (valid && now !== null) {
        if (now < from.getTime()) status = {tone: 'upcoming', text: `Starts in ${formatCountdown(from.getTime() - now)}`};
        else if (now < to.getTime()) status = {tone: 'live', text: `Live · ends in ${formatCountdown(to.getTime() - now)}`};
        else status = {tone: 'ended', text: 'Window closed'};
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked: the address bar already holds the link.
        }
    };

    const podium = rows.slice(0, 3);

    return (
        <div className={styles.wrapper}>
            <div className={styles.controls}>
                <div className={styles.presets} role="group" aria-label="Date range presets">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.key}
                            type="button"
                            className={clsx(styles.preset, activePreset === preset.key && styles.presetActive)}
                            onClick={() => setRange(preset.range())}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className={styles.rangeRow}>
                    <label className={styles.field}>
                        <span>From</span>
                        <input
                            type="datetime-local"
                            value={range.from}
                            onChange={(event) => setRange((r) => ({...r, from: event.target.value}))}
                        />
                    </label>
                    <label className={styles.field}>
                        <span>To</span>
                        <input
                            type="datetime-local"
                            value={range.to}
                            onChange={(event) => setRange((r) => ({...r, to: event.target.value}))}
                        />
                    </label>

                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={includeTeam}
                            onChange={(event) => setIncludeTeam(event.target.checked)}
                        />
                        Include team members
                    </label>

                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={entrantsOnly}
                            onChange={(event) => setEntrantsOnly(event.target.checked)}
                        />
                        Giveaway entrants only
                    </label>

                    <button type="button" className={styles.copy} onClick={copyLink}>
                        {copied ? <CheckIcon aria-hidden="true" /> : <LinkIcon aria-hidden="true" />}
                        {copied ? 'Copied' : 'Copy link'}
                    </button>
                </div>

                <p className={styles.note}>
                    Times are {LEADERBOARD_TIME_ZONE}. A PR or issue counts when it was opened inside the range, whenever
                    it gets merged or closed. A PR opened up to a day before the start counts too, if it is merged
                    inside the range.
                    {truncated && ` Data only goes back to ${formatShortDate(CONTRIBUTIONS_SINCE)}.`}
                </p>
            </div>

            {!valid ? (
                <div className={styles.empty}>
                    <span>Invalid range</span>
                    <p>Pick a start date before the end date.</p>
                </div>
            ) : (
                <>
                    <div className={styles.statusRow}>
                        <span className={styles.rangeLabel}>
                            {formatLeaderboardDate(from)} → {formatLeaderboardDate(to)}
                        </span>
                        {status && (
                            <span className={clsx(styles.status, styles[status.tone])}>
                                {status.tone === 'live' && <span className={styles.pulse} aria-hidden="true" />}
                                {status.text}
                            </span>
                        )}
                    </div>

                    {summary && (
                        <dl className={styles.stats}>
                            <div>
                                <dt>Contributors</dt>
                                <dd>{summary.contributors}</dd>
                            </div>
                            <div>
                                <dt>PRs opened</dt>
                                <dd>{summary.prs}</dd>
                            </div>
                            <div>
                                <dt>PRs merged</dt>
                                <dd>{summary.merged}</dd>
                            </div>
                            <div>
                                <dt>Issues opened</dt>
                                <dd>{summary.issues}</dd>
                            </div>
                            <div>
                                <dt>Projects</dt>
                                <dd>{summary.repos}</dd>
                            </div>
                        </dl>
                    )}

                    {rows.length === 0 ? (
                        <div className={styles.empty}>
                            <span>No contributions yet</span>
                            <p>Nothing was opened in this range. Be the first: pick an issue and open a PR.</p>
                        </div>
                    ) : (
                        <>
                            <ol className={styles.podium}>
                                {podium.map((row, i) => (
                                    <li key={row.login} className={clsx(styles.podiumCard, styles[`place${i + 1}`])}>
                                        <span className={styles.place}>#{i + 1}</span>
                                        <a
                                            href={`https://github.com/${row.login}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.podiumUser}
                                        >
                                            <Image
                                                src={avatar(row.avatarUrl, 64)}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className={styles.podiumAvatar}
                                            />
                                            <span className={styles.podiumLogin}>@{row.login}</span>
                                        </a>
                                        {!row.entrant && !row.team && (
                                            <JoinButton onClick={() => setJoinLogin(row.login)} />
                                        )}
                                        <span className={styles.podiumScore}>
                                            {row.score} <small>pts</small>
                                        </span>
                                        <RowCounts row={row} />
                                    </li>
                                ))}
                            </ol>

                            <div className={styles.table}>
                                <div className={clsx(styles.row, styles.head)} aria-hidden="true">
                                    <span>#</span>
                                    <span>Contributor</span>
                                    <span className={styles.num}>
                                        Merged
                                    </span>
                                    <span className={styles.num}>
                                        Pending
                                    </span>
                                    <span className={styles.num}>
                                        Issues
                                    </span>
                                    <span className={styles.num}>
                                        Projects
                                    </span>
                                    <span className={styles.num}>
                                        Score
                                    </span>
                                </div>

                                {rows.map((row, i) => {
                                    const open = expanded === row.login;
                                    return (
                                        <Fragment key={row.login}>
                                            <div className={clsx(styles.row, styles.bodyRow, open && styles.rowOpen)}>
                                                <span className={clsx(styles.rank, i < 3 && styles[`rank${i + 1}`])}>
                                                    {i + 1}
                                                </span>
                                                <span className={styles.user}>
                                                    {/* Covers the whole row (::after), so a click anywhere expands it. */}
                                                    <button
                                                        type="button"
                                                        className={styles.expand}
                                                        aria-expanded={open}
                                                        onClick={() => setExpanded(open ? null : row.login)}
                                                    >
                                                        <Image
                                                            src={avatar(row.avatarUrl, 28)}
                                                            alt=""
                                                            width={28}
                                                            height={28}
                                                            className={styles.avatar}
                                                        />
                                                        <span className={styles.login}>@{row.login}</span>
                                                    </button>
                                                    <span className={styles.meta}>
                                                        {row.team && <span className={styles.badge}>Team</span>}
                                                        {row.entrant && (
                                                            <span
                                                                className={clsx(styles.badge, styles.badgeEntrant)}
                                                                title="Entered the giveaway on Discord"
                                                            >
                                                                <TicketIcon aria-hidden="true" />
                                                                Entered
                                                            </span>
                                                        )}
                                                        {row.firstTime && (
                                                            <span
                                                                className={clsx(styles.badge, styles.badgeNew)}
                                                                title="First contribution to a Tabularis project"
                                                            >
                                                                <SparklesIcon aria-hidden="true" />
                                                                First-timer
                                                            </span>
                                                        )}
                                                        {!row.entrant && !row.team && (
                                                            <JoinButton onClick={() => setJoinLogin(row.login)} />
                                                        )}
                                                        {/* The count columns are hidden on mobile; their values move here. */}
                                                        <RowCounts row={row} className={styles.mobileCounts} />
                                                    </span>
                                                </span>
                                                <span className={styles.num}>
                                                    {row.merged}
                                                </span>
                                                <span className={styles.num}>
                                                    {row.pendingPrs}
                                                </span>
                                                <span className={styles.num}>
                                                    {row.issues}
                                                </span>
                                                <span className={styles.num}>
                                                    {row.repos.length}
                                                </span>
                                                <span className={clsx(styles.num, styles.score)}>
                                                    {row.score}
                                                    <ChevronDownIcon aria-hidden="true" className={styles.chevron} />
                                                </span>
                                            </div>
                                            {open && <ContributionList row={row} />}
                                        </Fragment>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}

            <JoinGiveawayModal login={joinLogin} onClose={closeJoin} />

            <p className={styles.note}>
                Data from the GitHub API as of {formatLeaderboardDate(CONTRIBUTIONS_FETCHED_AT)}, refreshed every few
                hours. Public repos of the TabularisDB organization only; bots are excluded.
            </p>
        </div>
    );
}

function RowCounts({row, className}: {row: LeaderboardRow; className?: string}) {
    return (
        <span className={clsx(styles.counts, className)}>
            <span title="Merged pull requests">
                <GitMergeIcon aria-hidden="true" />
                {row.merged}
            </span>
            <span title="Pending pull requests">
                <GitPullRequestIcon aria-hidden="true" />
                {row.pendingPrs}
            </span>
            <span title="Issues opened">
                <CircleDotIcon aria-hidden="true" />
                {row.issues}
            </span>
        </span>
    );
}

/** For contributors on the board who have not entered the giveaway yet: opens the how-to-enter modal. */
function JoinButton({onClick}: {onClick: () => void}) {
    return (
        <button type="button" className={styles.join} onClick={onClick}>
            <TicketIcon aria-hidden="true" />
            Join<span className={styles.joinLong}> the giveaway</span>
        </button>
    );
}

function ContributionList({row}: {row: LeaderboardRow}) {
    return (
        <div className={styles.details}>
            <ul className={styles.contributions} aria-label={`Contributions by @${row.login}`}>
                {row.contributions.map((c) => (
                    <li key={contributionKey(c)}>
                        <span className={clsx(styles.kind, styles[`state_${c.type}_${c.state}`])}>
                            {c.type === 'pr' ? (
                                c.state === 'merged' ? (
                                    <GitMergeIcon aria-hidden="true" />
                                ) : (
                                    <GitPullRequestIcon aria-hidden="true" />
                                )
                            ) : (
                                <CircleDotIcon aria-hidden="true" />
                            )}
                            {stateLabel(c)}
                        </span>
                        <a href={contributionUrl(c)} target="_blank" rel="noopener noreferrer" className={styles.cTitle}>
                            {c.title}
                        </a>
                        <span className={styles.cMeta}>
                            {c.repo} #{c.number} · {formatShortDate(c.createdAt)}
                        </span>
                        <span className={styles.cPoints}>+{row.points.get(contributionKey(c)) ?? 0}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
