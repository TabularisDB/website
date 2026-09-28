import {getShippedBounties} from '@/lib/pluginBounties';
import {BountyCard} from '../BountyCard/BountyCard';
import styles from './ShippedBounties.module.scss';

export function ShippedBounties() {
    const bounties = getShippedBounties();

    if (bounties.length === 0) return null;

    return (
        <div className={styles.grid}>
            {bounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
            ))}
        </div>
    );
}
