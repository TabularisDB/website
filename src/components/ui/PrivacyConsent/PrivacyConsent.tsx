import Link from 'next/link';
import type {ReactNode} from 'react';
import styles from './PrivacyConsent.module.scss';

// The field name is not `field[...]`, so the forms Worker never forwards it.
interface PrivacyConsentProps {
    id: string;
    children?: ReactNode;
    className?: string;
}

export function PrivacyConsent({id, children, className}: PrivacyConsentProps) {
    return (
        <label htmlFor={id} className={`${styles.consent} ${className ?? ''}`}>
            <input id={id} type="checkbox" name="privacy_consent" value="1" required />
            <span className={styles.indicator} aria-hidden="true" />
            <span>
                {children ?? 'I agree to the processing of my personal data to handle this request'}, as described in
                the{' '}
                <Link href="/privacy-policy" target="_blank">
                    Privacy Policy
                </Link>
                .{' '}
                <span className={styles.required} aria-hidden="true">
                    *
                </span>
            </span>
        </label>
    );
}
