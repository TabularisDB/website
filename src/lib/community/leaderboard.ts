import {
    CONTRIBUTIONS,
    CONTRIBUTIONS_FETCHED_AT,
    CONTRIBUTIONS_ORG,
    CONTRIBUTIONS_SINCE,
    CONTRIBUTORS,
} from './contributions';
import {GIVEAWAY, GIVEAWAY_ENTRANTS} from './giveaway';
import type {Contribution} from './types';

export {CONTRIBUTIONS_FETCHED_AT, CONTRIBUTIONS_SINCE};

/** Times without an explicit offset (URL params, the range inputs) are read in this zone. */
export const LEADERBOARD_TIME_ZONE = 'Europe/Rome';

export {GIVEAWAY};

/**
 * A PR opened up to this long before the range still counts when it is merged
 * inside the range: work started the day before should not miss out.
 */
export const EARLY_PR_GRACE_MS = 24 * 60 * 60 * 1000;

/** Whether a contribution belongs to the range: opened inside it, or an early PR merged inside it. */
export function inRange(c: Contribution, from: Date, to: Date): boolean {
    const opened = new Date(c.createdAt).getTime();
    if (opened >= from.getTime() && opened <= to.getTime()) return true;
    if (c.type !== 'pr' || !c.mergedAt || opened < from.getTime() - EARLY_PR_GRACE_MS) return false;
    const merged = new Date(c.mergedAt).getTime();
    return merged >= from.getTime() && merged <= to.getTime();
}

/** Merged PRs past this many in the range score half: many tiny PRs should not outrank a few solid ones. */
export const FULL_SCORE_MERGES = 5;

/**
 * Indicative points per contribution, shown on the page. Maintainers pick the
 * winners on usefulness, quality and impact; the score only orders the board.
 */
export const SCORE_RULES: Array<{label: string; points: number; note?: string}> = [
    {label: 'Merged pull request', points: 10, note: `${10 / 2} from the ${FULL_SCORE_MERGES + 1}th merged PR on`},
    {label: 'Issue resolved by someone else', points: 3},
    {label: 'Open issue triaged by a maintainer', points: 2},
    {label: 'Open or draft pull request', points: 0, note: 'Pending until it is merged'},
    {label: 'Open issue not triaged yet', points: 0},
    {label: 'Pull request merged by its own author', points: 0},
    {label: 'Issue closed by its own author', points: 0},
    {label: 'Pull request closed without merging', points: 0},
    {label: 'Issue not planned, duplicate or invalid', points: 0},
];

/** Points of one contribution; `mergeIndex` is the 0-based rank of a merged PR among the author's merges. */
function scoreContribution(c: Contribution, mergeIndex: number): number {
    if (c.type === 'pr') {
        if (c.state !== 'merged') return 0;
        return mergeIndex < FULL_SCORE_MERGES ? 10 : 5;
    }
    if (c.state === 'closed') return 3;
    if (c.state === 'open' && c.triaged) return 2;
    return 0;
}

export function contributionUrl(c: Contribution): string {
    return `https://github.com/${CONTRIBUTIONS_ORG}/${c.repo}/${c.type === 'pr' ? 'pull' : 'issues'}/${c.number}`;
}

export function contributionKey(c: Contribution): string {
    return `${c.type}:${c.repo}#${c.number}`;
}

const ENTRANTS = new Set(GIVEAWAY_ENTRANTS.map((login) => login.toLowerCase()));

export function isEntrant(login: string): boolean {
    return ENTRANTS.has(login.toLowerCase());
}

export interface LeaderboardRow {
    login: string;
    avatarUrl: string;
    team: boolean;
    entrant: boolean;
    firstTime: boolean;
    score: number;
    merged: number;
    pendingPrs: number;
    issues: number;
    repos: string[];
    contributions: Contribution[];
    /** Points per contribution, by contributionKey. */
    points: Map<string, number>;
}

export interface LeaderboardSummary {
    contributors: number;
    prs: number;
    merged: number;
    issues: number;
    repos: number;
}

export interface LeaderboardFilters {
    includeTeam: boolean;
    entrantsOnly: boolean;
}

export function buildLeaderboard(from: Date, to: Date, {includeTeam, entrantsOnly}: LeaderboardFilters) {
    const rows = new Map<string, LeaderboardRow>();
    const repos = new Set<string>();
    const summary: LeaderboardSummary = {contributors: 0, prs: 0, merged: 0, issues: 0, repos: 0};

    // Oldest first, so the half-score merges are an author's latest ones.
    for (const c of [...CONTRIBUTIONS].reverse()) {
        if (!inRange(c, from, to)) continue;
        const profile = CONTRIBUTORS[c.author];
        if (!profile || (profile.team && !includeTeam)) continue;
        const entrant = isEntrant(c.author);
        if (entrantsOnly && !entrant) continue;

        let row = rows.get(c.author);
        if (!row) {
            row = {
                login: c.author,
                avatarUrl: profile.avatarUrl,
                team: profile.team,
                entrant,
                firstTime: false,
                score: 0,
                merged: 0,
                pendingPrs: 0,
                issues: 0,
                repos: [],
                contributions: [],
                points: new Map(),
            };
            rows.set(c.author, row);
        }
        const points = scoreContribution(c, row.merged);
        row.contributions.unshift(c);
        row.points.set(contributionKey(c), points);
        row.score += points;
        row.firstTime ||= c.firstTime;
        if (!row.repos.includes(c.repo)) row.repos.push(c.repo);
        repos.add(c.repo);

        if (c.type === 'pr') {
            summary.prs += 1;
            if (c.state === 'merged' || c.state === 'self-merged') summary.merged += 1;
            if (c.state === 'merged') row.merged += 1;
            else if (c.state === 'open' || c.state === 'draft') row.pendingPrs += 1;
        } else {
            row.issues += 1;
            summary.issues += 1;
        }
    }

    const ranked = [...rows.values()].sort(
        (a, b) =>
            b.score - a.score ||
            b.merged - a.merged ||
            b.contributions.length - a.contributions.length ||
            a.login.localeCompare(b.login),
    );
    summary.contributors = ranked.length;
    summary.repos = repos.size;
    return {rows: ranked, summary};
}

// ---------------------------------------------------------------------------
// Dates. Range values are "YYYY-MM-DDTHH:mm" wall times in LEADERBOARD_TIME_ZONE,
// which is what <input type="datetime-local"> reads and writes.

const PARTS_FORMAT = new Intl.DateTimeFormat('en-US', {
    timeZone: LEADERBOARD_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

function zoneParts(date: Date): Record<string, number> {
    return Object.fromEntries(
        PARTS_FORMAT.formatToParts(date)
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, Number(part.value)]),
    );
}

/** Milliseconds the zone is ahead of UTC at a given instant. */
function zoneOffset(ms: number): number {
    const p = zoneParts(new Date(ms));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

function fromZonedWallTime(year: number, month: number, day: number, hour: number, minute: number): Date {
    const wall = Date.UTC(year, month - 1, day, hour, minute);
    const guess = wall - zoneOffset(wall);
    // Second pass settles the offset when the guess crosses a DST change.
    return new Date(wall - zoneOffset(guess));
}

/** Date to the "YYYY-MM-DDTHH:mm" wall time of LEADERBOARD_TIME_ZONE. */
export function toZonedInput(date: Date): string {
    const p = zoneParts(date);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * Parses a range bound from the URL or an input: an ISO instant with an offset
 * ("2026-10-07T14:00Z"), a wall time ("2026-10-07T16:00") or a bare date
 * ("2026-10-07", the start of the day for `from`, its end for `to`).
 */
export function parseRangeBound(value: string | null | undefined, edge: 'from' | 'to'): Date | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
        const date = new Date(trimmed);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/);
    if (!match) return null;
    const [, y, mo, d, h, mi] = match.map(Number);
    if (match[4] === undefined) {
        const start = fromZonedWallTime(y, mo, d, 0, 0);
        return edge === 'from' ? start : new Date(fromZonedWallTime(y, mo, d + 1, 0, 0).getTime() - 1);
    }
    return fromZonedWallTime(y, mo, d, h, mi);
}

const DISPLAY_FORMAT = new Intl.DateTimeFormat('en-US', {
    timeZone: LEADERBOARD_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

const SHORT_FORMAT = new Intl.DateTimeFormat('en-US', {
    timeZone: LEADERBOARD_TIME_ZONE,
    month: 'short',
    day: 'numeric',
});

export function formatLeaderboardDate(date: Date | string): string {
    return DISPLAY_FORMAT.format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
    return SHORT_FORMAT.format(new Date(date));
}

/** "5d 3h", "3h 12m", "12m" until a date. */
export function formatCountdown(ms: number): string {
    const minutes = Math.max(0, Math.floor(ms / 60_000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
}
