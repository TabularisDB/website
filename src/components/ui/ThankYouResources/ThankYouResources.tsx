import {SocialLinks} from '@/components/ui/SocialLinks/SocialLinks';
import {trackEvent} from '@/lib/analytics';
import type {ReactNode} from 'react';
import {Card} from '../Card/Card';
import {CardGrid} from '../CardGrid/CardGrid';
import styles from './ThankYouResources.module.scss';

export interface ThankYouResource {
    href: string;
    icon: ReactNode;
    title: string;
    desc: string;
    linkLabel: string;
    track?: {category: string; action: string; name: string};
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
                <CardGrid variant="joined">
                    {resources.map((resource) => {
                        const {track} = resource;

                        return (
                            <Card key={resource.title}>
                                <Card.Header icon={resource.icon} />
                                <Card.Content>
                                    <Card.Title>{resource.title}</Card.Title>
                                    <Card.Description>{resource.desc}</Card.Description>
                                </Card.Content>
                                <Card.Link
                                    href={resource.href}
                                    onClick={
                                        track ? () => trackEvent(track.category, track.action, track.name) : undefined
                                    }
                                >
                                    {resource.linkLabel}
                                </Card.Link>
                            </Card>
                        );
                    })}
                </CardGrid>
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
