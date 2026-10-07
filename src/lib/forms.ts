'use client';

import {useEffect, useRef, useState} from 'react';
import {FORMS_ENDPOINT} from '@/lib/siteConfig';

// Client side of the emailchef forms proxy (workers/forms/). The checks here
// only spare the Worker obvious junk and give users instant feedback; the
// real gate is the Turnstile token the Worker verifies server-side.

export type FormKey = 'newsletter' | 'survey' | 'sponsor';

export const HONEYPOT_NAME = 'website_url';

const MIN_DWELL_MS = 3000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com',
    'guerrillamail.com',
    '10minutemail.com',
    'tempmail.com',
    'temp-mail.org',
    'yopmail.com',
    'trashmail.com',
    'sharklasers.com',
    'getnada.com',
    'dispostable.com',
    'maildrop.cc',
    'throwawaymail.com',
    'fakeinbox.com',
    'mohmal.com',
    'emailondeck.com',
]);

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const EMAIL_ERROR = 'Please enter a valid, non-disposable email address.';
const CAPTCHA_ERROR = "We couldn't verify you're human. Please try again.";
const PENDING_CAPTCHA_ERROR = 'Still checking your browser — please try again in a moment.';

function isSuspiciousEmail(value: string): boolean {
    const email = value.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return true;
    return DISPOSABLE_DOMAINS.has(email.slice(email.lastIndexOf('@') + 1));
}

export function useProtectedForm(key: FormKey, redirect: string) {
    const mountedAt = useRef(0);
    const [token, setToken] = useState<string | null>(null);
    const [widgetKey, setWidgetKey] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        mountedAt.current = Date.now();
    }, []);

    async function submit(form: HTMLFormElement, onSuccess?: () => void) {
        const data = new FormData(form);
        const honeypot = data.get(HONEYPOT_NAME);
        const email = data.get('field[-1]');

        if ((typeof honeypot === 'string' && honeypot !== '') || Date.now() - mountedAt.current < MIN_DWELL_MS) {
            setError(GENERIC_ERROR);
            return;
        }
        if (typeof email !== 'string' || isSuspiciousEmail(email)) {
            setError(EMAIL_ERROR);
            return;
        }
        if (!token) {
            setError(PENDING_CAPTCHA_ERROR);
            return;
        }

        data.set('cf-turnstile-response', token);
        setError(null);
        setPending(true);

        try {
            const res = await fetch(`${FORMS_ENDPOINT}/${key}`, {method: 'POST', body: data});
            const body = (await res.json().catch(() => null)) as {ok?: boolean; error?: string} | null;
            if (body?.ok) {
                onSuccess?.();
                window.location.assign(redirect);
                return;
            }
            setError(
                body?.error === 'captcha' ? CAPTCHA_ERROR : body?.error === 'invalid' ? EMAIL_ERROR : GENERIC_ERROR,
            );
        } catch {
            setError(GENERIC_ERROR);
        }

        // Turnstile tokens are single-use: remount the widget for a fresh one.
        setToken(null);
        setWidgetKey((k) => k + 1);
        setPending(false);
    }

    return {submit, error, setError, pending, widgetKey, onToken: setToken};
}
