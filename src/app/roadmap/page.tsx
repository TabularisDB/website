import {JsonLd} from '@/components/layout/JsonLd';
import {getAllInitiativeMetas, type InitiativeMeta, type InitiativeStatus} from '@/lib/roadmap';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {ArrowRight, Hammer, MapIcon, Milestone, Rocket, UsersIcon} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './RoadmapPage.module.scss';
import clsx from 'clsx';
import {ComponentType} from 'react';
import {Button} from '@/components/ui/Button/Button';
import {GitHubIcon, DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import {ogImages} from '@/lib/og/registry';

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

export const STATUS_LABEL: Record<InitiativeStatus, string> = {
    'in-progress': 'Being built right now',
    planned: "What's next",
    done: 'Already shipped',
};

const STATUS_ICON: Record<InitiativeStatus, ComponentType<{className?: string}>> = {
    'in-progress': Hammer,
    planned: Milestone,
    done: Rocket,
};

function InitiativeCard({meta}: {meta: InitiativeMeta}) {
    return (
        <Link href={`/roadmap/${meta.slug}`} className={styles.card}>
            <div className={styles.cardDetails}>
                {meta.category && <span className={styles.cardScope}>{meta.category}</span>}
                <h3 className={styles.cardTitle}>{meta.title}</h3>
                {meta.lede && <p className={styles.cardExcerpt}>{meta.lede}</p>}
            </div>

            <span className={styles.cardLink}>
                Read details <ArrowRight size={16} />
            </span>
        </Link>
    );
}

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
                    <Link href="/community#issues" className={styles.headerLink}>
                        Browse every open issue
                    </Link>.
                </p>
            </header>

            <div className={styles.categoriesWrapper}>
                {groups.map((group) => {
                    const StatusIcon = STATUS_ICON[group.status];

                    return (
                        <section key={group.status} className={clsx(styles.category, group.status)}>
                            <h2 className={styles.categoryTitle}>
                                <StatusIcon className={styles.categoryIcon} />
                                {STATUS_LABEL[group.status]}
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

            <section className={styles.future}>
                <h2 className={styles.futureTitle}>Not yet on the board</h2>
                <p className={styles.futureText}>
                    Other drivers and major features land here as they move from idea to scoped work. Propose one in a{' '}
                    <a href={`${SOCIAL_URLS.github}/discussions`} target="_blank" rel="noopener noreferrer">
                        GitHub Discussion
                    </a>
                    .
                </p>
                <div className={styles.futureActions}>
                    <Button href="/community#issues">
                        <UsersIcon />
                        Find an issue
                    </Button>
                    <Button href={SOCIAL_URLS.github} variant="secondary">
                        <GitHubIcon />
                        Star on GitHub
                    </Button>
                    <Button href={SOCIAL_URLS.discord} variant="secondary">
                        <DiscordIcon />
                        Join Discord
                    </Button>
                </div>
            </section>
        </div>
    );
}
