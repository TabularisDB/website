import {JsonLd} from '@/components/layout/JsonLd';
import {InitiativeCard} from '@/components/pages/roadmap/InitiativeCard/InitiativeCard';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {DiscordIcon, GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {ogImages} from '@/lib/og/registry';
import {getAllInitiativeMetas, type InitiativeStatus} from '@/lib/roadmap';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import {Hammer, MapIcon, Milestone, Rocket, UsersIcon} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import type {ComponentType} from 'react';
import styles from './RoadmapPage.module.scss';

const path = '/roadmap';
const title = 'Roadmap | Tabularis';
const description = 'Tabularis roadmap. Active initiatives, open tasks, planned work.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Roadmap'),
    },
    twitter: {card: 'summary_large_image'},
};

const STATUS_ORDER: InitiativeStatus[] = ['in-progress', 'planned', 'done'];

const CATEGORY_LABEL: Record<InitiativeStatus, string> = {
    'in-progress': 'Being built right now',
    planned: "What's next",
    done: 'Already shipped',
};

const STATUS_ICON: Record<InitiativeStatus, ComponentType<{className?: string}>> = {
    'in-progress': Hammer,
    planned: Milestone,
    done: Rocket,
};

export default function RoadmapPage() {
    const metas = getAllInitiativeMetas();

    const groups = STATUS_ORDER.map((status) => ({
        status,
        items: metas.filter((meta) => meta.status === status),
    })).filter((group) => group.items.length > 0);

    return (
        <div className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Roadmap', path: '/roadmap'},
                    ]),
                ]}
            />

            <header className="page-header">
                <span className="eyebrow">
                    <MapIcon />
                    Roadmap
                </span>
                <h1 className="title">What we're building next.</h1>
                <p className="description">
                    Active initiatives and the work queued behind them. Each card links to a GitHub epic, its open
                    tasks, and how to claim one. Looking for something smaller?{' '}
                    <Link href="/contribute#issues" className={styles.headerLink}>
                        Browse open issues
                    </Link>
                    .
                </p>
            </header>

            <div className={styles.categoriesWrapper}>
                {groups.map((group) => {
                    const StatusIcon = STATUS_ICON[group.status];

                    return (
                        <section key={group.status} className={styles.category}>
                            <h2 className={styles.categoryTitle}>
                                <StatusIcon className={styles.categoryIcon} />
                                {CATEGORY_LABEL[group.status]}
                            </h2>

                            <div className={styles.grid}>
                                {group.items.map((meta) => (
                                    <InitiativeCard key={meta.slug} meta={meta} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <CalloutBlock
                title="Not yet on the board"
                actions={
                    <>
                        <Button href="/contribute#issues" size="sm">
                            <UsersIcon />
                            Find an issue
                        </Button>
                        <Button href={SOCIAL_URLS.github} variant="secondary" size="sm">
                            <GitHubIcon />
                            Star on GitHub
                        </Button>
                        <Button href={SOCIAL_URLS.discord} variant="secondary" size="sm">
                            <DiscordIcon />
                            Join Discord
                        </Button>
                    </>
                }
            >
                Other drivers and major features land here as they move from idea to scoped work. Propose one in a{' '}
                <a href={`${SOCIAL_URLS.github}/discussions`} target="_blank" rel="noopener noreferrer">
                    GitHub Discussion
                </a>
                .
            </CalloutBlock>
        </div>
    );
}
