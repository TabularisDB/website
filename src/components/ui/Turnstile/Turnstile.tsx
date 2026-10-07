'use client';

import {useEffect, useRef} from 'react';
import {TURNSTILE_SITE_KEY} from '@/lib/siteConfig';
import type {FormKey} from '@/lib/forms';

interface TurnstileApi {
    render(el: HTMLElement, options: Record<string, unknown>): string;
    remove(widgetId: string): void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    scriptPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            scriptPromise = null;
            reject(new Error('Turnstile failed to load'));
        };
        document.head.appendChild(script);
    });
    return scriptPromise;
}

interface TurnstileProps {
    action: FormKey;
    onToken: (token: string | null) => void;
    className?: string;
}

// Cloudflare Turnstile in "interaction-only" mode: invisible unless Cloudflare
// decides the visitor needs to click a checkbox.
export function Turnstile({action, onToken, className}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onTokenRef = useRef(onToken);

    useEffect(() => {
        onTokenRef.current = onToken;
    });

    useEffect(() => {
        let widgetId: string | undefined;
        let cancelled = false;

        loadTurnstile()
            .then(() => {
                if (cancelled || !containerRef.current || !window.turnstile) return;
                widgetId = window.turnstile.render(containerRef.current, {
                    sitekey: TURNSTILE_SITE_KEY,
                    action,
                    appearance: 'interaction-only',
                    callback: (token: string) => onTokenRef.current(token),
                    'expired-callback': () => onTokenRef.current(null),
                    'error-callback': () => onTokenRef.current(null),
                });
            })
            .catch(() => onTokenRef.current(null));

        return () => {
            cancelled = true;
            if (widgetId) window.turnstile?.remove(widgetId);
        };
    }, [action]);

    return <div ref={containerRef} className={className} />;
}
