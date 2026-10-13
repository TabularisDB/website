'use client';

import {BountyClaimers} from '@/components/pages/plugins/bounties/BountyGrid/BountyClaimers/BountyClaimers';
import {BountyIcon} from '@/components/pages/plugins/bounties/BountyGrid/BountyIcon/BountyIcon';
import {BountyMeta} from '@/components/pages/plugins/bounties/BountyGrid/BountyMeta/BountyMeta';
import {BountyVote} from '@/components/pages/plugins/bounties/BountyGrid/BountyVote/BountyVote';
import {ScaffoldForm} from '@/components/pages/plugins/bounties/BountyGrid/ScaffoldForm/ScaffoldForm';
import type {BoardBounty} from '@/components/pages/plugins/bounties/BountyGrid/useLiveBounties';
import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {Modal} from '@/components/ui/Modal/Modal';
import {trackEvent} from '@/lib/analytics';
import {BOUNTY_STATUS} from '@/lib/plugins/bounties';
import type {LiveRequest, TabulariumSession} from '@/lib/plugins/requests';
import {SOCIAL_URLS} from '@/lib/social';
import {
    FootprintsIcon,
    GitBranchIcon,
    HammerIcon,
    InfoIcon,
    ListChecksIcon,
    PackageCheckIcon,
    StarIcon,
    UsersIcon,
} from 'lucide-react';
import styles from './BountyModal.module.scss';

interface BountyModalProps {
    bounty: BoardBounty | null;
    session: TabulariumSession;
    busy: string | null;
    error: string | null;
    onClose: () => void;
    onVote: (bounty: BoardBounty) => void;
    onClaim: (bounty: BoardBounty) => void;
    onScaffolded: (slug: string, claimers: LiveRequest['claimers']) => void;
}

export function BountyModal({bounty, session, busy, error, onClose, onVote, onClaim, onScaffolded}: BountyModalProps) {
    const shipped = bounty?.status === BOUNTY_STATUS.SHIPPED;
    const signedOut = session.state === 'signed-out';
    const myRepoUrl =
        session.state === 'signed-in'
            ? (bounty?.claimers.find((claimer) => claimer.username === session.username)?.repoUrl ?? null)
            : null;

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
                        <div className={styles.headline}>
                            <BountyMeta bounty={bounty} withStatus />
                            {!shipped && (
                                <BountyVote
                                    count={bounty.upvotes}
                                    voted={bounty.votedByMe}
                                    disabled={busy === `upvote:${bounty.id}`}
                                    onVote={() => {
                                        trackEvent('Bounty', 'Upvote', bounty.id);
                                        onVote(bounty);
                                    }}
                                />
                            )}
                        </div>

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
                                {bounty.signal && <Modal.Text>{bounty.signal}</Modal.Text>}
                            </Modal.Section>
                        )}

                        {bounty.claimers.length > 0 && (
                            <Modal.Section
                                title={shipped ? 'Built by' : 'Working on it'}
                                icon={<UsersIcon aria-hidden="true" />}
                            >
                                <BountyClaimers claimers={bounty.claimers} />
                            </Modal.Section>
                        )}

                        {!shipped && (
                            <Modal.Section title="Next step" icon={<FootprintsIcon aria-hidden="true" />}>
                                <Modal.Text>{bounty.nextStep}</Modal.Text>
                            </Modal.Section>
                        )}

                        {!shipped && bounty.claimedByMe && (
                            <Modal.Section
                                title={myRepoUrl ? 'Your repository' : 'Start building'}
                                icon={<GitBranchIcon aria-hidden="true" />}
                            >
                                <ScaffoldForm
                                    key={bounty.id}
                                    bounty={bounty}
                                    currentRepoUrl={myRepoUrl}
                                    onScaffolded={(claimers) => onScaffolded(bounty.id, claimers)}
                                />
                            </Modal.Section>
                        )}

                        {error && (
                            <p className={styles.error} role="alert">
                                {error}
                            </p>
                        )}
                        {!shipped && signedOut && (
                            <p className={styles.hint}>
                                Voting and claiming use your Tabularium account: you&apos;ll sign in and come straight
                                back here.
                            </p>
                        )}
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
                        {shipped ? (
                            <Button
                                href="/plugins"
                                size="sm"
                                className={styles.ctaButton}
                                onClick={() => trackEvent('Bounty', 'View Plugin', bounty.id)}
                            >
                                <PackageCheckIcon />
                                View plugin
                            </Button>
                        ) : (
                            <>
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
                                    size="sm"
                                    variant={bounty.claimedByMe ? 'secondary' : 'primary'}
                                    className={styles.ctaButton}
                                    disabled={busy === `claim:${bounty.id}` || session.state === 'checking'}
                                    onClick={() => {
                                        trackEvent('Bounty', bounty.claimedByMe ? 'Release' : 'Claim', bounty.id);
                                        onClaim(bounty);
                                    }}
                                >
                                    <HammerIcon />
                                    {bounty.claimedByMe
                                        ? 'Release claim'
                                        : signedOut
                                          ? 'Sign in & claim'
                                          : 'Claim this bounty'}
                                </Button>
                            </>
                        )}
                    </Modal.Actions>
                </>
            )}
        </Modal>
    );
}
