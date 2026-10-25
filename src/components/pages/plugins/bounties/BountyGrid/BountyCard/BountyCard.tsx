import {DatabaseIcon, GaugeIcon, LayersIcon, PaletteIcon, PlugIcon} from 'lucide-react';
import {getKindBadge} from '@/components/pages/plugins/Plugin.data';
import {BountyClaimers} from '@/components/pages/plugins/bounties/BountyGrid/BountyClaimers/BountyClaimers';
import {BountyIcon} from '@/components/pages/plugins/bounties/BountyGrid/BountyIcon/BountyIcon';
import {BountyStatus} from '@/components/pages/plugins/bounties/BountyGrid/BountyStatus/BountyStatus';
import {BountyVote} from '@/components/pages/plugins/bounties/BountyGrid/BountyVote/BountyVote';
import type {BoardBounty} from '@/components/pages/plugins/bounties/BountyGrid/useLiveBounties';
import {Card} from '@/components/ui/Card/Card';
import {trackEvent} from '@/lib/analytics';
import styles from './BountyCard.module.scss';

interface BountyCardProps {
    bounty: BoardBounty;
    onOpen: (id: string) => void;
    onVote: () => void;
    voteBusy?: boolean;
}

export function BountyCard({bounty, onOpen, onVote, voteBusy}: BountyCardProps) {
    const KindIcon = bounty.kind === 'theme' ? PaletteIcon : bounty.kind === 'driver' ? DatabaseIcon : PlugIcon;

    return (
        <Card>
            <Card.Header
                icon={<BountyIcon bounty={bounty} className={styles.logo} />}
                aside={
                    <>
                        <Card.Label className={styles.kind}>
                            <KindIcon aria-hidden="true" />
                            {bounty.kind ? getKindBadge(bounty.kind) : 'Plugin'}
                        </Card.Label>
                        <BountyStatus status={bounty.status} className={styles.status} />
                    </>
                }
            />
            <Card.Content>
                <Card.Title>{bounty.name}</Card.Title>
                <Card.Description>{bounty.tagline}</Card.Description>
            </Card.Content>
            <Card.Meta>
                <Card.MetaItem icon={<LayersIcon aria-hidden="true" />}>{bounty.target}</Card.MetaItem>
                <Card.MetaItem icon={<GaugeIcon aria-hidden="true" />}>{bounty.difficulty} difficulty</Card.MetaItem>
            </Card.Meta>
            <div className={styles.footer}>
                <BountyVote
                    count={bounty.upvotes}
                    voted={bounty.votedByMe}
                    disabled={voteBusy}
                    onVote={() => {
                        trackEvent('Bounty', 'Upvote', bounty.id);
                        onVote();
                    }}
                />
                <BountyClaimers claimers={bounty.claimers} compact />
            </div>
            <Card.Link
                onClick={() => {
                    trackEvent('Bounty', 'Open Details', bounty.id);
                    onOpen(bounty.id);
                }}
                ariaLabel={`View ${bounty.name} details`}
            >
                View details
            </Card.Link>
        </Card>
    );
}
