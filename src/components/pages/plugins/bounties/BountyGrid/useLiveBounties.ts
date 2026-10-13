'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {BOUNTY_STATUS, bountyStatus, type BountyClaimer, type PluginBounty} from '@/lib/plugins/bounties';
import {
    fetchLiveRequests,
    fetchSession,
    redirectToSignIn,
    savePendingAction,
    takePendingAction,
    toggleClaim,
    toggleUpvote,
    type LiveRequest,
    type TabulariumSession,
} from '@/lib/plugins/requests';

/** A bounty with the visitor's live votes and claims merged over the build-time data. */
export interface BoardBounty extends PluginBounty {
    claims: number;
    claimedByMe: boolean;
    votedByMe: boolean;
}

function merge(bounty: PluginBounty, live: LiveRequest | undefined): BoardBounty {
    if (!live) return {...bounty, claims: bounty.claimers.length, claimedByMe: false, votedByMe: false};
    const shipped = bounty.status === BOUNTY_STATUS.SHIPPED || live.status === 'fulfilled';
    return {
        ...bounty,
        requestId: live.id,
        upvotes: live.upvotes,
        claimers: live.claimers as BountyClaimer[],
        claims: live.claims,
        claimedByMe: live.claimedByMe,
        votedByMe: live.votedByMe,
        status: bountyStatus(bounty.boardStatus, shipped, live.claims),
    };
}

/**
 * The board is a static export: counts are baked in at build time, then
 * refreshed from Tabularium in the browser with one call, which also carries
 * the visitor's session for `votedByMe` / `claimedByMe`. Votes and claims are
 * applied optimistically; signed-out visitors go through the Tabularium
 * sign-in and the action is replayed when they come back.
 */
export function useLiveBounties(baked: PluginBounty[], onResumed?: (slug: string) => void) {
    const [live, setLive] = useState<Map<string, LiveRequest> | null>(null);
    const [session, setSession] = useState<TabulariumSession>({state: 'checking'});
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        void fetchLiveRequests().then(setLive);
        void fetchSession().then(setSession);
    }, []);

    const bounties = useMemo(() => baked.map((bounty) => merge(bounty, live?.get(bounty.id))), [baked, live]);

    const patch = useCallback((slug: string, update: Partial<LiveRequest>) => {
        setLive((prev) => {
            const current = prev?.get(slug);
            if (!prev || !current) return prev;
            return new Map(prev).set(slug, {...current, ...update});
        });
    }, []);

    const run = useCallback(
        async (action: 'upvote' | 'claim', bounty: BoardBounty) => {
            setError(null);
            if (!bounty.requestId) {
                setError('This bounty is not open on Tabularium yet.');
                return;
            }
            if (session.state === 'signed-out') {
                if (savePendingAction(action, bounty.id)) redirectToSignIn();
                else setError('Your browser blocked storage. Sign in to Tabularium first, then try again.');
                return;
            }
            setBusy(`${action}:${bounty.id}`);
            if (action === 'upvote') {
                const voted = !bounty.votedByMe;
                patch(bounty.id, {votedByMe: voted, upvotes: bounty.upvotes + (voted ? 1 : -1)});
                const result = await toggleUpvote(bounty.requestId);
                if (result.ok) patch(bounty.id, {votedByMe: result.data.voted, upvotes: result.data.upvotes});
                else {
                    patch(bounty.id, {votedByMe: bounty.votedByMe, upvotes: bounty.upvotes});
                    if (result.signedOut) setSession({state: 'signed-out'});
                    setError(result.error);
                }
            } else {
                const result = await toggleClaim(bounty.requestId);
                if (result.ok) {
                    patch(bounty.id, {
                        claimedByMe: result.data.claimed,
                        claims: result.data.claims,
                        claimers: result.data.claimers,
                    });
                } else {
                    if (result.signedOut) setSession({state: 'signed-out'});
                    setError(result.error);
                }
            }
            setBusy(null);
        },
        [patch, session.state],
    );

    // Back from sign-in: replay the vote or claim once both the session and the live data are known.
    useEffect(() => {
        if (!live || session.state !== 'signed-in') return;
        const pending = takePendingAction();
        if (!pending) return;
        const bounty = bounties.find((item) => item.id === pending.slug);
        if (!bounty) return;
        onResumed?.(bounty.id);
        // Already done in an earlier visit: don't toggle it back off.
        if (pending.action === 'upvote' ? bounty.votedByMe : bounty.claimedByMe) return;
        void run(pending.action, bounty);
    }, [live, session.state, bounties, run, onResumed]);

    const setClaimers = useCallback(
        (slug: string, claimers: LiveRequest['claimers']) => patch(slug, {claimers, claims: claimers.length}),
        [patch],
    );

    return {bounties, session, error, clearError: () => setError(null), busy, run, setClaimers, liveLoaded: !!live};
}
