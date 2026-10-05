import type {ReactNode} from 'react';
import Link from 'next/link';
import {SocialLinks} from '@/components/ui/SocialLinks/SocialLinks';
import styles from './ThankYouResources.module.scss';
import {trackEvent} from '@/lib/analytics';

export interface ThankYouResource {
    href: string;
    external?: boolean;
    icon: ReactNode;
    title: string;
    desc: string;
    track?: {category: string; action: string; name?: string};
}

interface ThankYouResourcesProps {
    resources: ThankYouResource[];
    title?: string;
}

export function ThankYouResources({resources, title = "What's next"}: ThankYouResourcesProps) {
    return (
        <section className={styles.resources} aria-labelledby="thank-you-resources-title">
            <div className={styles.group}>
                <h2 id="thank-you-resources-title" className={styles.sectionTitle}>
                    {title}
                </h2>
                <div className={styles.cards}>
                    {resources.map((resource) => {
                        const {track} = resource;
                        const handleClick = track
                            ? () => trackEvent(track.category, track.action, track.name)
                            : undefined;

                        const content = (
                            <>
                                <div className={styles.cardCover}>
                                    <span className={styles.cardIcon}>{resource.icon}</span>
                                </div>
                                <div className={styles.cardDetails}>
                                    <h3 className={styles.cardTitle}>{resource.title}</h3>
                                    <p className={styles.cardExcerpt}>{resource.desc}</p>
                                </div>
                            </>
                        );

                        return resource.external ? (
                            <a
                                key={resource.title}
                                href={resource.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.card}
                                onClick={handleClick}
                            >
                                {content}
                            </a>
                        ) : (
                            <Link
                                key={resource.title}
                                href={resource.href}
                                className={styles.card}
                                onClick={handleClick}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className={styles.follow}>
                <span className={styles.followLabel}>Follow Tabularis</span>
                <nav className={styles.followLinks} aria-label="Social links">
                    <SocialLinks linkClassName={styles.followPill} showLabel />
                </nav>
            </div>
        </section>
    );
}
