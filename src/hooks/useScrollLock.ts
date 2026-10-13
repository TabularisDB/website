import {useEffect} from 'react';

/**
 * Stops the page from scrolling while `locked` is true. Locks <html> rather than
 * <body>: html has `overflow-x: clip`, which keeps a body lock from reaching the
 * viewport.
 */
export function useScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;
        const root = document.documentElement;
        const previous = root.style.overflow;
        root.style.overflow = 'hidden';
        return () => {
            root.style.overflow = previous;
        };
    }, [locked]);
}
