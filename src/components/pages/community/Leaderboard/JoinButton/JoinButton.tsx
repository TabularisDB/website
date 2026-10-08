import {TicketIcon} from 'lucide-react';
import styles from './JoinButton.module.scss';

/** For contributors on the board who have not entered the giveaway yet: opens the how-to-enter modal. */
export function JoinButton({onClick}: {onClick: () => void}) {
    return (
        <button type="button" className={styles.join} onClick={onClick}>
            <TicketIcon aria-hidden="true" />
            Join<span className={styles.long}> the giveaway</span>
        </button>
    );
}
