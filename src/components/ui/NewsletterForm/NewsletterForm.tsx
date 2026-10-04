'use client';

import {useEffect, useRef, useState} from 'react';
import Script from 'next/script';
import {Mail, SendIcon} from 'lucide-react';
import styles from './NewsletterForm.module.scss';
import {NEWSLETTER_EMAILCHEF} from '@/lib/siteConfig';

interface NewsletterFormProps {
    title: string;
    description: string;
    buttonLabel: string;
}

const EMAILCHEF_SCRIPT = `https://app.emailchef.com/signup/form.js/${NEWSLETTER_EMAILCHEF.token}/en/api`;
const EMAILCHEF_ACTION = `https://app.emailchef.com/signupwl/${NEWSLETTER_EMAILCHEF.token}/en`;

const MIN_DWELL_MS = 3000;
const HONEYPOT_NAME = 'website_url';
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

function isSuspiciousEmail(value: string): boolean {
    const email = value.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return true;
    return DISPOSABLE_DOMAINS.has(email.slice(email.lastIndexOf('@') + 1));
}

export function NewsletterForm({title, description, buttonLabel}: NewsletterFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const mountedAt = useRef(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mountedAt.current = Date.now();

        const form = formRef.current;
        if (!form) return;

        const onSubmit = (event: Event) => {
            const data = new FormData(form);
            const honeypot = data.get(HONEYPOT_NAME);
            const email = data.get('field[-1]');
            const elapsed = Date.now() - mountedAt.current;

            let reason: string | null = null;
            if ((typeof honeypot === 'string' && honeypot !== '') || elapsed < MIN_DWELL_MS) {
                reason = 'Something went wrong. Please try again.';
            } else if (typeof email !== 'string' || isSuspiciousEmail(email)) {
                reason = 'Please enter a valid, non-disposable email address.';
            }

            if (reason) {
                event.preventDefault();
                event.stopImmediatePropagation();
                setError(reason);
                return;
            }
            setError(null);
        };

        form.addEventListener('submit', onSubmit, {capture: true});
        return () => form.removeEventListener('submit', onSubmit, {capture: true});
    }, []);

    return (
        <div className={styles.box}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>

            <form ref={formRef} method="POST" action={EMAILCHEF_ACTION} className={styles.form} autoComplete="off">
                <input type="hidden" name="form_id" value={NEWSLETTER_EMAILCHEF.formId} />
                <input type="hidden" name="lang" value="" />
                <input type="hidden" name="referrer" value="" />
                <input type="hidden" name="redirect" value={NEWSLETTER_EMAILCHEF.redirect} />

                <div className={styles.honeypot} aria-hidden="true">
                    <label htmlFor={HONEYPOT_NAME}>Website</label>
                    <input
                        type="text"
                        id={HONEYPOT_NAME}
                        name={HONEYPOT_NAME}
                        tabIndex={-1}
                        autoComplete="off"
                        defaultValue=""
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} aria-hidden="true" />
                    <input
                        type="email"
                        name="field[-1]"
                        placeholder="What's your email?"
                        required
                        className={styles.input}
                        aria-label="Email address"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? 'newsletter-error' : undefined}
                        autoComplete="email"
                        onChange={() => setError(null)}
                    />
                </div>

                <button type="submit" className={styles.button}>
                    <span className={styles.buttonLabel}>{buttonLabel}</span>
                    <SendIcon className={styles.sendIcon} aria-hidden="true" />
                </button>

                {error && (
                    <p id="newsletter-error" className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
            </form>
        </div>
    );
}
