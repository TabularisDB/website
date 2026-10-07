import {HONEYPOT_NAME} from '@/lib/forms';
import styles from './Honeypot.module.scss';

// Off-screen field that humans never see; bots that fill every input do.
export function Honeypot() {
    return (
        <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor={HONEYPOT_NAME}>Website</label>
            <input type="text" id={HONEYPOT_NAME} name={HONEYPOT_NAME} tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
    );
}
