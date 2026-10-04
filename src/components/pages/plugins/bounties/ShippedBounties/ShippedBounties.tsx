import {getShippedBounties} from '@/lib/plugins/bounties';
import {BountyCard} from '@/components/pages/plugins/bounties/BountyCard/BountyCard';
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
