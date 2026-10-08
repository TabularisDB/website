'use client';

import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {Modal} from '@/components/ui/Modal/Modal';
import {SOCIAL_URLS} from '@/lib/social';
import {TicketIcon} from 'lucide-react';
import styles from './JoinGiveawayModal.module.scss';

interface JoinGiveawayModalProps {
    /** GitHub login of the row the visitor clicked, null when closed. */
    login: string | null;
    onClose: () => void;
}

export function JoinGiveawayModal({login, onClose}: JoinGiveawayModalProps) {
    return (
        <Modal
            open={login !== null}
            onClose={onClose}
            title="Join the giveaway"
            icon={<TicketIcon aria-hidden="true" className={styles.icon} />}
            className={styles.panel}
        >
            <div className={styles.body}>
                <p className={styles.intro}>
                    Is this you, <strong>@{login}</strong>? You are already on the board. Entering takes one reply on
                    Discord:
                </p>

                <ol className={styles.steps}>
                    <li className={styles.step}>
                        <span className={styles.stepTitle}>Join the Tabularis Discord server</span>
                        <span className={styles.stepText}>Skip this if you are already a member.</span>
                    </li>
                    <li className={styles.step}>
                        <span className={styles.stepTitle}>
                            Find the giveaway announcement in <code>#general</code>
                        </span>
                        <span className={styles.stepText}>
                            It is the &ldquo;Tabularis Community Giveaway&rdquo; post, with a thread below it.
                        </span>
                    </li>
                    <li className={styles.step}>
                        <span className={styles.stepTitle}>Reply in the thread</span>
                        <span className={styles.stepText}>
                            Tell us your GitHub username (<strong>{login}</strong>) and what you are working on. To be
                            considered for a prize, say so in your reply.
                        </span>
                    </li>
                </ol>

                <p className={styles.note}>
                    A maintainer adds you to the entrants, and the Entered badge shows up next to your name after the
                    next refresh.
                </p>

                <Button href={SOCIAL_URLS.discord} className={styles.cta}>
                    <DiscordIcon />
                    Open Discord
                </Button>
            </div>
        </Modal>
    );
}
