'use client';

import {useDownloads} from '@/hooks/useDownloads';
import {formatDownloads} from '@/lib/github';
import {REVIEWS, withReviewUtm} from '@/lib/reviews';
import styles from './HeroTrust.module.scss';
import clsx from 'clsx';

export function HeroTrust() {
    const downloads = useDownloads();

    return (
        <div className={styles.trustWrapper}>
            <span className={styles.downloadsCaption}>
                Already downloaded {downloads ? formatDownloads(downloads) : '-k'} times
            </span>

            <div className={clsx(styles.divider, 'divider')}></div>
            <div className={styles.featuredOn}>
                <span className={styles.featuredLabel}>As featured on</span>
                <div className={styles.featuredList}>
                    {REVIEWS.map((review, i) => (
                        <a
                            key={review.id}
                            href={withReviewUtm(review.href)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.featuredAvatar}
                            style={{zIndex: REVIEWS.length - i}}
                            title={review.name}
                            aria-label={`Tabularis on ${review.name}`}
                        >
                            <img src={review.logoImg} alt={review.name} width={16} height={16} />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
