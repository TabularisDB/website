'use client';

import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import clsx from 'clsx';
import {TicketIcon, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './JoinGiveawayModal.module.scss';

interface JoinGiveawayModalProps {
    /** GitHub login of the row the visitor clicked, null when closed. */
    login: string | null;
    onClose: () => void;
}

export function JoinGiveawayModal({login, onClose}: JoinGiveawayModalProps) {
    const open = login !== null;
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) onClose();
    }

    const modal = (
        <div className={clsx(styles.overlay, open && styles.open)} onClick={handleOverlayClick} aria-hidden={!open}>
            {login && (
                <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="join-giveaway-title">
                    <div className={styles.header}>
                        <span id="join-giveaway-title" className={styles.title}>
                            <TicketIcon aria-hidden="true" />
                            Join the giveaway
                        </span>
                        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
                            <X size={15} />
                        </button>
                    </div>

                    <div className={styles.body}>
                        <p className={styles.intro}>
                            Is this you, <strong>@{login}</strong>? You are already on the board. Entering takes one
                            reply on Discord:
                        </p>

                        <ol className={styles.steps}>
                            <li>
                                <span className={styles.stepTitle}>Join the Tabularis Discord server</span>
                                <span className={styles.stepText}>Skip this if you are already a member.</span>
                            </li>
                            <li>
                                <span className={styles.stepTitle}>
                                    Find the giveaway announcement in <code>#general</code>
                                </span>
                                <span className={styles.stepText}>
                                    It is the &ldquo;Tabularis Community Giveaway&rdquo; post, with a thread below it.
                                </span>
                            </li>
                            <li>
                                <span className={styles.stepTitle}>Reply in the thread</span>
                                <span className={styles.stepText}>
                                    Tell us your GitHub username (<strong>{login}</strong>) and what you are working on.
                                    To be considered for a prize, say so in your reply.
                                </span>
                            </li>
                        </ol>

                        <p className={styles.note}>
                            A maintainer adds you to the entrants, and the Entered badge shows up next to your name
                            after the next refresh.
                        </p>

                        <Button href={SOCIAL_URLS.discord} className={styles.cta}>
                            <DiscordIcon />
                            Open Discord
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    if (!mounted) return null;

    return createPortal(modal, document.body);
}
