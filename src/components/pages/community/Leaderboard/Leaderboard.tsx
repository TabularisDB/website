'use client';

import {EmptyState} from '@/components/ui/EmptyState/EmptyState';
import {
    buildLeaderboard,
    CONTRIBUTIONS_FETCHED_AT,
    formatLeaderboardDate,
    GIVEAWAY_RANGE,
    parseRangeBound,
    toZonedInput,
    type LeaderboardRange,
} from '@/lib/community/leaderboard';
import {useCallback, useEffect, useMemo, useState} from 'react';
import styles from './Leaderboard.module.scss';
import {LeaderboardControls, type PresetKey} from './LeaderboardControls/LeaderboardControls';
import {LeaderboardSummary} from './LeaderboardSummary/LeaderboardSummary';
import {LeaderboardTable} from './LeaderboardTable/LeaderboardTable';
import {Podium} from './Podium/Podium';
import {JoinGiveawayModal} from './JoinGiveawayModal/JoinGiveawayModal';

function isGiveawayRange(range: LeaderboardRange): boolean {
    return range.from === GIVEAWAY_RANGE.from && range.to === GIVEAWAY_RANGE.to;
}

export function Leaderboard() {
    const [range, setRange] = useState<LeaderboardRange>(GIVEAWAY_RANGE);
    const [preset, setPreset] = useState<PresetKey | null>('giveaway');
    const [includeTeam, setIncludeTeam] = useState(false);
    const [entrantsOnly, setEntrantsOnly] = useState(false);
    const [now, setNow] = useState<number | null>(null);
    const [joinLogin, setJoinLogin] = useState<string | null>(null);
    const closeJoin = useCallback(() => setJoinLogin(null), []);

    // ?from=2026-10-07T16:00&to=2026-10-13T16:00&team=1&entrants=1 (Europe/Rome wall times, bare dates or ISO instants).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const from = parseRangeBound(params.get('from'), 'from');
        const to = parseRangeBound(params.get('to'), 'to');
        if (from || to) {
            const next = {
                from: from ? toZonedInput(from) : GIVEAWAY_RANGE.from,
                to: to ? toZonedInput(to) : toZonedInput(new Date()),
            };
            setRange(next);
            setPreset(isGiveawayRange(next) ? 'giveaway' : null);
        }
        if (params.get('team') === '1') setIncludeTeam(true);
        if (params.get('entrants') === '1') setEntrantsOnly(true);
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const query = useMemo(() => {
        const params = new URLSearchParams({from: range.from, to: range.to});
        if (includeTeam) params.set('team', '1');
        if (entrantsOnly) params.set('entrants', '1');
        return `?${params.toString()}`;
    }, [range, includeTeam, entrantsOnly]);

    useEffect(() => {
        if (now === null) return; // URL params not read yet
        window.history.replaceState(null, '', `${window.location.pathname}${query}`);
    }, [query, now]);

    const from = parseRangeBound(range.from, 'from');
    const to = parseRangeBound(range.to, 'to');
    const valid = from !== null && to !== null && from < to;
    const {rows, summary} = useMemo(
        () => (valid ? buildLeaderboard(from, to, {includeTeam, entrantsOnly}) : {rows: [], summary: null}),
        [range.from, range.to, includeTeam, entrantsOnly, valid],
    );

    return (
        <div className={styles.leaderboard}>
            <LeaderboardControls
                range={range}
                preset={preset}
                onRangeChange={(next, key) => {
                    setRange(next);
                    setPreset(key ?? null);
                }}
                includeTeam={includeTeam}
                onIncludeTeamChange={setIncludeTeam}
                entrantsOnly={entrantsOnly}
                onEntrantsOnlyChange={setEntrantsOnly}
                shareQuery={query}
            />

            {!valid ? (
                <EmptyState title="Invalid range">Pick a start date before the end date.</EmptyState>
            ) : (
                <>
                    {summary && <LeaderboardSummary from={from} to={to} now={now} summary={summary} />}

                    {rows.length === 0 ? (
                        <EmptyState title="No contributions yet">
                            Nothing was opened in this range. Be the first: pick an issue and open a pull request.
                        </EmptyState>
                    ) : (
                        <>
                            <Podium rows={rows.slice(0, 3)} onJoin={setJoinLogin} />
                            <LeaderboardTable rows={rows} onJoin={setJoinLogin} />
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
