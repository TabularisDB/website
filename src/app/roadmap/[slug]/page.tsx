import {JsonLd} from '@/components/layout/JsonLd';
import {getAllInitiativeSlugs, getInitiativeBySlug, InitiativeStatus} from '@/lib/roadmap';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import styles from './InitiativePage.module.scss';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import Link from 'next/link';
import clsx from 'clsx';

interface PageProps {
    params: Promise<{slug: string}>;
}

export function generateStaticParams() {
    return getAllInitiativeSlugs().map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const initiative = getInitiativeBySlug(slug);
    if (!initiative) return {};

    const {title, lede} = initiative.meta;
    const pageTitle = `${title} — Roadmap | Tabularis`;
    const pageDesc = lede || 'Tabularis roadmap initiative details.';

    return {
        title: pageTitle,
        description: pageDesc,
        alternates: {canonical: `/roadmap/${slug}`},
        openGraph: {
            type: 'article',
            url: `https://tabularis.dev/roadmap/${slug}/`,
            title: pageTitle,
            description: pageDesc,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDesc,
        },
    };
}

const STATUS_LABEL: Record<InitiativeStatus, string> = {
    'in-progress': 'In progress',
    planned: 'Planned',
    done: 'Shipped',
};

export default async function InitiativePage({params}: PageProps) {
    const {slug} = await params;
    const initiative = getInitiativeBySlug(slug);
    if (!initiative) notFound();

    const {meta, html} = initiative;
    const pct =
        meta.progressDone !== undefined && meta.progressTotal
            ? Math.round((meta.progressDone / meta.progressTotal) * 100)
            : undefined;

    return (
        <main className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Roadmap', path: '/roadmap'},
                        {name: meta.title, path: `/roadmap/${slug}`},
                    ]),
                ]}
            />

            <div className={styles.layout}>
                <Breadcrumbs crumbs={[{label: 'Roadmap', href: '/roadmap'}, {label: meta.title}]} />

                <article className={styles.initiative}>
                    <header className={styles.header}>
                        <div className={styles.meta}>
                            <span className={clsx(styles.badge, styles[meta.status])}>{STATUS_LABEL[meta.status]}</span>
                            {meta.category && <span className={styles.category}>{meta.category}</span>}
                        </div>

                        <h1 className={styles.title}>{meta.title}</h1>
                        {meta.lede && <p className={styles.lede}>{meta.lede}</p>}

                        <div className={styles.details}>
                            {meta.links && meta.links.length > 0 && (
                                <div className={styles.linksSection}>
                                    <span className={styles.linksLabel}>Related Links</span>
                                    <div className={styles.links}>
                                        {meta.links.map((link) =>
                                            link.external ? (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link key={link.href} href={link.href}>
                                                    {link.label}
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {pct !== undefined && (
                                <div className={styles.progression}>
                                    <span className={styles.progressionLabel}>Progress</span>
                                    <div className={styles.progressRow}>
                                        <span className={clsx(styles.progressValue, styles[meta.status])}>
                                            {pct}% completed
                                        </span>
                                        {meta.progressLabel && (
                                            <span className={styles.progressCaption}>{meta.progressLabel}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {meta.contributors && meta.contributors.length > 0 && (
                                <div className={styles.contributors}>
                                    <span className={styles.contributorsLabel}>Working on this</span>
                                    <div className={styles.contributorsList}>
                                        {meta.contributors.map((c, index) => (
                                            <a
                                                key={index}
                                                href={`https://github.com/${c.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.contributorLink}
                                            >
                                                <img
                                                    src={c.avatar}
                                                    alt={`@${c.username}`}
                                                    className={styles.contributorAvatar}
                                                    loading="lazy"
                                                />
                                                <span className={styles.contributorMeta}>
                                                    <span className={styles.contributorUsername}>@{c.username}</span>
                                                    {c.role && <span className={styles.contributorRole}>{c.role}</span>}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className={styles.mdBody} dangerouslySetInnerHTML={{__html: html}} />
                </article>
            </div>
        </main>
    );
}
