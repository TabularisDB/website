import clsx from 'clsx';
import {GaugeIcon, LayersIcon} from 'lucide-react';
import type {PluginBounty} from '@/lib/plugins/bounties';
import styles from './BountyMeta.module.scss';
import {BountyStatus} from '../BountyStatus/BountyStatus';

interface BountyMetaProps {
    bounty: PluginBounty;
    withStatus?: boolean;
    stacked?: boolean;
    className?: string;
}

export function BountyMeta({bounty, withStatus, stacked, className}: BountyMetaProps) {
    return (
        <div className={clsx(styles.meta, className)} data-stacked={stacked || undefined}>
            {withStatus && <BountyStatus status={bounty.status} />}
            <span className={styles.metaItem}>
                <LayersIcon aria-hidden="true" />
                {bounty.target}
            </span>
            <span className={styles.metaItem}>
                <GaugeIcon aria-hidden="true" />
                {bounty.difficulty} difficulty
            </span>
        </div>
    );
}
