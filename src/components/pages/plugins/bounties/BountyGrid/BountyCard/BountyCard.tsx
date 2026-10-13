import {GaugeIcon, LayersIcon} from 'lucide-react';
import {BountyIcon} from '@/components/pages/plugins/bounties/BountyGrid/BountyIcon/BountyIcon';
import {BountyStatus} from '@/components/pages/plugins/bounties/BountyGrid/BountyStatus/BountyStatus';
import {Card} from '@/components/ui/Card/Card';
import {trackEvent} from '@/lib/analytics';
import type {PluginBounty} from '@/lib/plugins/bounties';
import styles from './BountyCard.module.scss';

interface BountyCardProps {
    bounty: PluginBounty;
    onOpen: (id: string) => void;
}

export function BountyCard({bounty, onOpen}: BountyCardProps) {
    return (
        <Card>
            <Card.Header
                icon={<BountyIcon bounty={bounty} className={styles.logo} />}
                aside={<BountyStatus status={bounty.status} className={styles.status} />}
            />
            <Card.Content>
                <Card.Title>{bounty.name}</Card.Title>
                <Card.Description>{bounty.tagline}</Card.Description>
            </Card.Content>
            <Card.Meta>
                <Card.MetaItem icon={<LayersIcon aria-hidden="true" />}>{bounty.target}</Card.MetaItem>
                <Card.MetaItem icon={<GaugeIcon aria-hidden="true" />}>{bounty.difficulty} difficulty</Card.MetaItem>
            </Card.Meta>
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
