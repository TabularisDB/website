import {JsonLd} from '@/components/layout/JsonLd';
import {BountySchema} from '@/components/pages/plugins/bounties/BountySchema/BountySchema';
import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {getBountyStats} from '@/lib/pluginBounties';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import clsx from 'clsx';
import {GitBranchIcon, HandCoinsIcon, PackageCheckIcon, TargetIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Plugin Bounty Board | Tabularis',
    description:
        'Request, sponsor, discuss, or claim the database drivers and plugins the Tabularis community wants next.',
    alternates: {canonical: '/plugins/bounties'},
    openGraph: {
        type: 'website',
        url: 'https://tabularis.dev/plugins/bounties/',
        title: 'Plugin Bounty Board | Tabularis',
        description: 'A public market for the next Tabularis database drivers and plugin integrations.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Plugin Bounty Board | Tabularis',
        description: 'Request, sponsor, discuss, or claim the database drivers and plugins the community wants next.',
    },
};

export default function PluginBountyBoardPage() {
    const stats = getBountyStats();

    return (
        <div className={clsx('container', styles.layout)}>
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Plugins', path: '/plugins'},
                        {name: 'Bounties', path: '/plugins/bounties'},
                    ]),
                ]}
            />
            <header className={clsx('page-header', styles.header)}>
                <span className="eyebrow">
                    <HandCoinsIcon />
                    Plugin Bounty Board
                </span>
                <h2 className="title">Help ship the next driver.</h2>
                <p className="description">
                    See what the community is building, find a concrete contribution, or propose the integration
                    Tabularis should support next. GitHub tracks the work; Discord is the fastest place to shape an
                    idea.
                </p>
                <div className={styles.actions}>
                    <Button
                        className={styles.button}
                        href={`${SOCIAL_URLS.github}/discussions`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Request a plugin
                    </Button>
                    <Button className={styles.button} href={SOCIAL_URLS.discord} variant="secondary">
                        <DiscordIcon />
                        Discuss on Discord
                    </Button>
                </div>

                <div className={styles.bountySchema}>
                    <BountySchema />
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <div className={styles.titleRow}>
                            <div className={styles.iconWrap}>
                                <TargetIcon size={20} />
                            </div>
                            <h3 className={styles.title}>{stats.activeCount} Open targets</h3>
                        </div>
                        <p className={styles.text}>
                            Drivers and integrations waiting for scope, funding, or a maintainer.
                        </p>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.titleRow}>
                            <div className={styles.iconWrap}>
                                <GitBranchIcon size={20} />
                            </div>
                            <h3 className={styles.title}>{stats.claimedCount + stats.scopedCount} In motion</h3>
                        </div>
                        <p className={styles.text}>Targets that already have a claim, branch, or initial scope.</p>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.titleRow}>
                            <div className={styles.iconWrap}>
                                <PackageCheckIcon size={20} />
                            </div>
                            <h3 className={styles.title}>{stats.shippedCount} Shipped proofs</h3>
                        </div>
                        <p className={styles.text}>Existing plugin wins that prove external drivers can land.</p>
                    </div>
                </div>
            </header>

            <section className={styles.market}>
                <div className="section-header">
                    <h3 className="title">Find the right target.</h3>
                    <p className="description">
                        Search by database or narrow the board by status, focus, and difficulty. Each card points to the
                        discussion, issue, or repository where work happens.
                    </p>
                </div>
            </section>
        </div>
    );
}
