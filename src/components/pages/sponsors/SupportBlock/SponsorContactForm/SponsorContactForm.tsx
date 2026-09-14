'use client';

import Script from 'next/script';
import styles from './SponsorContactForm.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {SendIcon} from 'lucide-react';

export function SponsorContactForm() {
    return (
        <>
            <form
                method="POST"
                action="https://app.emailchef.com/signupwl/7o22666s726q5s6964223n2237353130227q/en"
                id="form1"
                className={styles.form}
            >
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

                <input type="hidden" name="form_id" value="7510" />
                <input type="hidden" name="lang" value="" />
                <input type="hidden" name="referrer" id="ec_referrer" value="" />
                <input type="hidden" name="redirect" value="/sponsors/confirm" />

                <Button
                    type="submit"
                    id="mc-signup-form-button-submit"
                    name="mc-signup-form-button-submit"
                    className={styles.submitButton}
                >
                    Send message
                    <SendIcon size={16} />
                </Button>
            </form>

            <Script
                src="https://app.emailchef.com/signup/form.js/7o22666s726q5s6964223n2237353130227q/en/api"
                strategy="lazyOnload"
            />
        </>
    );
}
