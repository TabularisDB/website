'use client';

import {BountyIcon} from '@/components/pages/plugins/bounties/BountyGrid/BountyIcon/BountyIcon';
import {BountyMeta} from '@/components/pages/plugins/bounties/BountyGrid/BountyMeta/BountyMeta';
import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {Modal} from '@/components/ui/Modal/Modal';
import {trackEvent} from '@/lib/analytics';
import {BOUNTY_STATUS, type PluginBounty} from '@/lib/plugins/bounties';
import {SOCIAL_URLS} from '@/lib/social';
import {ArrowUpRightIcon, FootprintsIcon, InfoIcon, ListChecksIcon, StarIcon} from 'lucide-react';
import styles from './BountyModal.module.scss';

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
                    <Modal.Body>
                        <BountyMeta bounty={bounty} withStatus />

                        <Modal.Section title="Overview" icon={<InfoIcon aria-hidden="true" />}>
                            <Modal.Text>{bounty.description}</Modal.Text>
                        </Modal.Section>

                        {bounty.capabilities.length > 0 && (
                            <Modal.Section title="Scope" icon={<ListChecksIcon aria-hidden="true" />}>
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
                                <Modal.Text>{bounty.signal}</Modal.Text>
                            </Modal.Section>
                        )}

                        <Modal.Section title="Next step" icon={<FootprintsIcon aria-hidden="true" />}>
                            <Modal.Text>{bounty.nextStep}</Modal.Text>
                        </Modal.Section>
                    </Modal.Body>

                    <Modal.Actions>
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
                    </Modal.Actions>
                </>
            )}
        </Modal>
    );
}
