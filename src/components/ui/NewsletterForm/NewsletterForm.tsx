'use client';

import {Mail, SendIcon} from 'lucide-react';
import styles from './NewsletterForm.module.scss';
import {NEWSLETTER_EMAILCHEF} from '@/lib/siteConfig';
import {useProtectedForm} from '@/lib/forms';
import {Honeypot} from '@/components/ui/Honeypot/Honeypot';
import {Turnstile} from '@/components/ui/Turnstile/Turnstile';

interface NewsletterFormProps {
    title: string;
    description: string;
    buttonLabel: string;
}

export function NewsletterForm({title, description, buttonLabel}: NewsletterFormProps) {
    const guard = useProtectedForm('newsletter', NEWSLETTER_EMAILCHEF.redirect);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void guard.submit(event.currentTarget);
    }

    return (
        <div className={styles.box}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>

            <form className={styles.form} autoComplete="off" onSubmit={onSubmit}>
                <Honeypot />

                <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} aria-hidden="true" />
                    <input
                        type="email"
                        name="field[-1]"
                        placeholder="What's your email?"
                        required
                        className={styles.input}
                        aria-label="Email address"
                        aria-invalid={guard.error ? true : undefined}
                        aria-describedby={guard.error ? 'newsletter-error' : undefined}
                        autoComplete="email"
                        onChange={() => guard.setError(null)}
                    />
                </div>

                <button type="submit" className={styles.button} disabled={guard.pending}>
                    <span className={styles.buttonLabel}>{buttonLabel}</span>
                    <SendIcon className={styles.sendIcon} aria-hidden="true" />
                </button>
            </form>

            <Turnstile key={guard.widgetKey} action="newsletter" onToken={guard.onToken} />

            {guard.error && (
                <p id="newsletter-error" className={styles.error} role="alert">
                    {guard.error}
                </p>
            )}
        </div>
    );
}
