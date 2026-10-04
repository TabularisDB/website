'use client';

import {useEffect} from 'react';

type MatomoWindow = Window & {_paq?: unknown[][]};

export function MatomoGoal({goalId}: {goalId: number}) {
    useEffect(() => {
        const w = window as MatomoWindow;
        w._paq = w._paq || [];
        w._paq.push(['trackGoal', goalId]);
    }, [goalId]);

    return null;
}
