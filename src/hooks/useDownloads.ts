'use client';

import {useEffect, useState} from 'react';
import {getTotalDownloads} from '@/lib/github';

export function useDownloads() {
    const [downloads, setDownloads] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        getTotalDownloads().then((result) => {
            if (!cancelled) setDownloads(result);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return downloads;
}
