import Link from 'next/link';
import type {CSSProperties} from 'react';
import {BOUNTY_STATUS, BOUNTY_STATUS_LABEL, getActiveBounties, getBountyStats} from '@/lib/pluginBounties';
import styles from './PluginBountyTeaser.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {STATUS_WEIGHT} from '../Plugin.data';

type DotStyle = CSSProperties & {'--dot-color': string};

export function PluginBountyTeaser() {
    const comingNext = getActiveBounties()
        .sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status])
        .slice(0, 3);
    const stats = getBountyStats();

    const statItems = [
        {value: stats.activeCount, label: 'up for grabs'},
        {value: stats.claimedCount + stats.scopedCount, label: 'in the works'},
        {value: stats.shippedCount, label: 'already shipped'},
    ];
    return (
        <section className={styles.card}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.eyebrow}>Bounty Market</span>
                    <h2 className={styles.title}>Fund the next database driver.</h2>
                    <p className={styles.description}>
                        Request, sponsor, discuss, or claim the integrations the community wants next. Turn scattered
                        requests into visible work.
                    </p>
                </div>

                <div className={styles.body}>
                    <div className={styles.stats}>
                        {statItems.map((stat) => (
                            <span key={stat.label} className={styles.stat}>
                                {stat.value} {stat.label}
                            </span>
                        ))}
                    </div>

                    <div className={styles.comingNextList}>
                        {comingNext.map((bounty) => (
                            <Link
                                key={bounty.id}
                                href={`/plugins/bounties#${bounty.id}`}
                                className={styles.comingNextItem}
                                style={{'--dot-color': bounty.accent} as DotStyle}
                            >
                                <span className={styles.pulseDot} />
                                {bounty.name}
                                <span className={styles.itemStatus}>({BOUNTY_STATUS_LABEL[bounty.status]})</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <Button href="/plugins/bounties" className={styles.cta}>
                    Enter the Bounty Board
                </Button>
            </div>
        </section>
    );
}
