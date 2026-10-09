'use client';

import styles from './SponsorContactForm.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {Honeypot} from '@/components/ui/Honeypot/Honeypot';
import {Turnstile} from '@/components/ui/Turnstile/Turnstile';
import {PrivacyConsent} from '@/components/ui/PrivacyConsent/PrivacyConsent';
import {useProtectedForm} from '@/lib/forms';
import {SendIcon} from 'lucide-react';

export function SponsorContactForm() {
    const guard = useProtectedForm('sponsor', '/sponsors/confirm');

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void guard.submit(event.currentTarget);
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <Honeypot />

            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor="field-2">
                        First name <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="field-2"
                        name="field[-2]"
                        type="text"
                        placeholder="Andrea"
                        required
                        autoComplete="given-name"
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="field-3">
                        Last name <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="field-3"
                        name="field[-3]"
                        type="text"
                        placeholder="Rossi"
                        required
                        autoComplete="family-name"
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor="field211351">
                        Company <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="field211351"
                        name="field[211351]"
                        type="text"
                        placeholder="Acme Inc."
                        required
                        autoComplete="organization"
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="field-1">
                        Email <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="field-1"
                        name="field[-1]"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label htmlFor="field211349">
                    Website <span aria-hidden="true">*</span>
                </label>
                <input
                    id="field211349"
                    name="field[211349]"
                    type="url"
                    placeholder="https://yoursite.com"
                    required
                    autoComplete="url"
                    className={styles.input}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="field211350">Message</label>
                <textarea
                    id="field211350"
                    name="field[211350]"
                    rows={5}
                    placeholder="Tell us about your product and what kind of sponsorship you're interested in..."
                    className={styles.textarea}
                />
            </div>

            <PrivacyConsent id="sponsor-privacy-consent">
                I agree to the processing of my personal data to handle my sponsorship enquiry
            </PrivacyConsent>

            <Turnstile key={guard.widgetKey} action="sponsor" onToken={guard.onToken} />

            {guard.error && (
                <p className={styles.error} role="alert">
                    {guard.error}
                </p>
            )}

            <Button type="submit" className={styles.submitButton} disabled={guard.pending}>
                Send message
                <SendIcon size={16} />
            </Button>
        </form>
    );
}
