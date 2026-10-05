'use client';

import Image from 'next/image';
import {formatDownloads, TOTAL_DOWNLOADS} from '@/lib/github';
import {REVIEWS, withReviewUtm} from '@/lib/reviews';
import styles from './TrustRow.module.scss';
import clsx from 'clsx';

export function TrustRow() {
    return (
        <div className={styles.trustWrapper}>
            <div className={styles.downloads}>
                <span className={styles.downloadsCaption}>
                    Already downloaded {formatDownloads(TOTAL_DOWNLOADS)} times
                </span>
            </div>

            <div className={clsx(styles.divider, 'divider')}></div>
            <div className={styles.featuredOn}>
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
                            <Image
                                src={`/img/logos/reviews/${review.logoImg}`}
                                alt={review.name}
                                width={16}
                                height={16}
                            />
                        </a>
                    ))}
                </div>
                <span className={styles.featuredLabel}>As featured on</span>
            </div>
        </div>
    );
}
