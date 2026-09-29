import {Mail, SendIcon} from 'lucide-react';
import Script from 'next/script';
import styles from './NewsletterForm.module.scss';

interface NewsletterFormProps {
    title: string;
    description: string;
    buttonLabel: string;
}

const EMAILCHEF_SCRIPT = 'https://app.emailchef.com/signup/form.js/7o22666s726q5s6964223n2237353333227q/en/api';
const EMAILCHEF_ACTION = 'https://app.emailchef.com/signupwl/7o22666s726q5s6964223n2237353333227q/en';

export function NewsletterForm({title, description, buttonLabel}: NewsletterFormProps) {
    return (
        <div className={styles.box}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>

            <form method="POST" action={EMAILCHEF_ACTION} className={styles.form} autoComplete="off">
                <input type="hidden" name="form_id" value="7533" />
                <input type="hidden" name="lang" value="" />
                <input type="hidden" name="referrer" value="" />

                <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input
                        type="email"
                        name="field[-1]"
                        placeholder="What's your email?"
                        required
                        className={styles.input}
                        aria-label="Email address"
                        autoComplete="email"
                    />
                </div>
                <button type="submit" className={styles.button}>
                    <span className={styles.buttonLabel}> {buttonLabel}</span>
                    <SendIcon className={styles.sendIcon} />
                </button>

                <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
            </form>
        </div>
    );
}
