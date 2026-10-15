'use client';

import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {Honeypot} from '@/components/ui/Honeypot/Honeypot';
import {PrivacyConsent} from '@/components/ui/PrivacyConsent/PrivacyConsent';
import {Turnstile} from '@/components/ui/Turnstile/Turnstile';
import {useProtectedForm} from '@/lib/forms';
import {NEWSLETTER_EMAILCHEF} from '@/lib/siteConfig';
import {MailIcon} from 'lucide-react';
import {useId} from 'react';
import styles from './NewsletterForm.module.scss';

interface NewsletterSignupProps {
    buttonLabel?: string;
}

/** The sign-up form on its own: email field, consent and anti-spam checks. */
export function NewsletterSignup({buttonLabel = 'Subscribe'}: NewsletterSignupProps) {
    const guard = useProtectedForm('newsletter', NEWSLETTER_EMAILCHEF.redirect);
    const consentId = useId();
    const errorId = useId();

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void guard.submit(event.currentTarget);
    }

    return (
        <>
            <form className={styles.form} autoComplete="off" onSubmit={onSubmit}>
                <Honeypot />

                <div className={styles.field}>
                    <label className={styles.inputWrapper}>
                        <MailIcon className={styles.inputIcon} aria-hidden="true" />
                        <input
                            type="email"
                            name="field[-1]"
                            placeholder="What's your email?"
                            required
                            className={styles.input}
                            aria-label="Email address"
                            aria-invalid={guard.error ? true : undefined}
                            aria-describedby={guard.error ? errorId : undefined}
                            autoComplete="email"
                            onChange={() => guard.setError(null)}
                        />
                    </label>

                    <Button type="submit" className={styles.button} disabled={guard.pending}>
                        {buttonLabel}
                    </Button>
                </div>

                <PrivacyConsent id={consentId}>
                    I agree to receive the Tabularis newsletter and to the processing of my email address
                </PrivacyConsent>

                {guard.error && (
                    <p id={errorId} className={styles.error} role="alert">
                        {guard.error}
                    </p>
                )}
            </form>

            <Turnstile key={guard.widgetKey} action="newsletter" onToken={guard.onToken} />
        </>
    );
}

interface NewsletterFormProps extends NewsletterSignupProps {
    title?: string;
    description?: string;
}

/** The sign-up form in a callout block, for the end of a page. */
export function NewsletterForm({title, description, buttonLabel}: NewsletterFormProps) {
    return (
        <CalloutBlock title={title} actions={<NewsletterSignup buttonLabel={buttonLabel} />}>
            {description}
        </CalloutBlock>
    );
}
