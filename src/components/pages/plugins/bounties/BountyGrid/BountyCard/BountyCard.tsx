import {ArrowRightIcon} from 'lucide-react';
import {trackEvent} from '@/lib/analytics';
import type {PluginBounty} from '@/lib/plugins/bounties';
import styles from './BountyCard.module.scss';
import {BountyIcon} from '../BountyIcon/BountyIcon';
import {BountyMeta} from '../BountyMeta/BountyMeta';
import {BountyStatus} from '../BountyStatus/BountyStatus';

interface BountyCardProps {
    bounty: PluginBounty;
    onOpen: (id: string) => void;
}

export function BountyCard({bounty, onOpen}: BountyCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.cardHeader}>
                <BountyIcon bounty={bounty} className={styles.cardIcon} />
                <BountyStatus status={bounty.status} className={styles.cardStatus} />
            </div>

            <div className={styles.cardDetails}>
                <h3 className={styles.cardTitle}>{bounty.name}</h3>
                <p className={styles.cardExcerpt}>{bounty.tagline}</p>
            </div>

            <BountyMeta bounty={bounty} stacked className={styles.cardMeta} />

            <button
                type="button"
                className={styles.cardLink}
                aria-label={`View ${bounty.name} details`}
                onClick={() => {
                    trackEvent('Bounty', 'Open Details', bounty.id);
                    onOpen(bounty.id);
                }}
            >
                View details <ArrowRightIcon aria-hidden="true" />
            </button>
        </article>
    );
}
