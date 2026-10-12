'use client';

import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {Modal} from '@/components/ui/Modal/Modal';
import {trackEvent} from '@/lib/analytics';
import {BOUNTY_STATUS, type PluginBounty} from '@/lib/plugins/bounties';
import {SOCIAL_URLS} from '@/lib/social';
import {ArrowUpRightIcon, FootprintsIcon, InfoIcon, ListChecksIcon, StarIcon} from 'lucide-react';
import styles from './BountyModal.module.scss';
import {BountyIcon} from '../BountyIcon/BountyIcon';
import {BountyMeta} from '../BountyMeta/BountyMeta';

function claimLabel(status: PluginBounty['status']) {
    return status === BOUNTY_STATUS.CLAIMED ? 'Follow the work' : 'Claim this bounty';
}

interface BountyModalProps {
    bounty: PluginBounty | null;
    onClose: () => void;
}

export function BountyModal({bounty, onClose}: BountyModalProps) {
    return (
        <Modal
            open={bounty !== null}
            onClose={onClose}
            title={bounty?.name ?? ''}
            icon={bounty && <BountyIcon bounty={bounty} className={styles.icon} />}
        >
            {bounty && (
                <>
                    <div className={styles.body}>
                        <BountyMeta bounty={bounty} withStatus />

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <InfoIcon aria-hidden="true" />
                                Overview
                            </h3>

                            <p className={styles.text}>{bounty.description}</p>
                        </section>

                        {bounty.capabilities.length > 0 && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <ListChecksIcon aria-hidden="true" />
                                    Scope
                                </h3>
                                <ul className={styles.capabilities}>
                                    {bounty.capabilities.map((capability) => (
                                        <li
                                            key={capability.label}
                                            className={styles.capability}
                                            data-state={capability.state}
                                        >
                                            {capability.label}
                                        </li>
                                    ))}
                                </ul>
                                <p className={styles.text}>{bounty.signal}</p>
                            </section>
                        )}

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <FootprintsIcon aria-hidden="true" />
                                Next step
                            </h3>
                            <p className={styles.text}>{bounty.nextStep}</p>
                        </section>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            href={SOCIAL_URLS.discord}
                            className={styles.button}
                            variant="secondary"
                            size="sm"
                            onClick={() => trackEvent('Bounty', 'Discuss', bounty.id)}
                        >
                            <DiscordIcon />
                            Discuss
                        </Button>
                        <Button
                            href={bounty.sponsorUrl}
                            className={styles.button}
                            variant="secondary"
                            size="sm"
                            onClick={() => trackEvent('Bounty', 'Sponsor', bounty.id)}
                        >
                            <StarIcon />
                            Sponsor
                        </Button>
                        <Button
                            href={bounty.claimUrl}
                            size="sm"
                            className={styles.ctaButton}
                            onClick={() => trackEvent('Bounty', 'Claim Work', bounty.id)}
                        >
                            {claimLabel(bounty.status)}
                            <ArrowUpRightIcon />
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
}
