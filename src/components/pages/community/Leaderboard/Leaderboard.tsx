'use client';

import {EmptyState} from '@/components/ui/EmptyState/EmptyState';
import {
    buildLeaderboard,
    CONTRIBUTIONS_FETCHED_AT,
    formatLeaderboardDate,
    giveawayDates,
    type Giveaway,
} from '@/lib/community/leaderboard';
import {useCallback, useEffect, useMemo, useState} from 'react';
import styles from './Leaderboard.module.scss';
import {JoinGiveawayModal} from './JoinGiveawayModal/JoinGiveawayModal';
import {LeaderboardControls} from './LeaderboardControls/LeaderboardControls';
import {LeaderboardSummary} from './LeaderboardSummary/LeaderboardSummary';
import {LeaderboardTable} from './LeaderboardTable/LeaderboardTable';
import {Podium} from './Podium/Podium';

interface LeaderboardProps {
    /** The giveaway whose window the board covers. */
    giveaway: Giveaway;
}

export function Leaderboard({giveaway}: LeaderboardProps) {
    const [includeTeam, setIncludeTeam] = useState(false);
    const [entrantsOnly, setEntrantsOnly] = useState(false);
    const [now, setNow] = useState<number | null>(null);
    const [joinLogin, setJoinLogin] = useState<string | null>(null);
    const closeJoin = useCallback(() => setJoinLogin(null), []);

    const {from, to} = useMemo(() => giveawayDates(giveaway), [giveaway]);

    // ?team=1&entrants=1
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('team') === '1') setIncludeTeam(true);
        if (params.get('entrants') === '1') setEntrantsOnly(true);
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const query = useMemo(() => {
        const params = new URLSearchParams();
        if (includeTeam) params.set('team', '1');
        if (entrantsOnly) params.set('entrants', '1');
        const search = params.toString();
        return search ? `?${search}` : '';
    }, [includeTeam, entrantsOnly]);

    useEffect(() => {
        if (now === null) return; // URL params not read yet
        window.history.replaceState(null, '', `${window.location.pathname}${query}`);
    }, [query, now]);

    const {rows, summary} = useMemo(
        () => buildLeaderboard(from, to, {includeTeam, entrantsOnly, entrants: giveaway.entrants}),
        [from, to, includeTeam, entrantsOnly, giveaway.entrants],
    );

    // Entries close with the window, checked in the browser so the Join buttons
    // disappear on time even before the next build.
    const open = now !== null && now < to.getTime();
    const onJoin = open ? setJoinLogin : undefined;

    return (
        <div className={styles.leaderboard}>
            <LeaderboardControls
                includeTeam={includeTeam}
                onIncludeTeamChange={setIncludeTeam}
                entrantsOnly={entrantsOnly}
                onEntrantsOnlyChange={setEntrantsOnly}
                shareQuery={query}
            />

            {summary && <LeaderboardSummary from={from} to={to} now={now} summary={summary} />}

            {rows.length === 0 ? (
                <EmptyState title="No contributions yet">
                    Nothing was opened in this window yet. Be the first: pick an issue and open a pull request.
                </EmptyState>
            ) : (
                <>
                    <Podium rows={rows.slice(0, 3)} onJoin={onJoin} />
                    <LeaderboardTable rows={rows} onJoin={onJoin} />
                </>
            )}

            {open && <JoinGiveawayModal login={joinLogin} onClose={closeJoin} />}

            <p className={styles.note}>
                Data from the GitHub API as of {formatLeaderboardDate(CONTRIBUTIONS_FETCHED_AT)}, refreshed every few
                hours. Public repos of the TabularisDB organization only; bots are excluded.
            </p>
        </div>
    );
}
