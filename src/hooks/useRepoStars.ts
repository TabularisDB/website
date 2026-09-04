'use client';

import {useEffect, useState} from 'react';
import {getRepoStars} from '@/lib/github';

export function useRepoStars() {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        getRepoStars().then((result) => {
            if (!cancelled) setStars(result);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return stars;
}
