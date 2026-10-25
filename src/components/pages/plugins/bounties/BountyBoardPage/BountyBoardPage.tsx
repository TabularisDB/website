import {JsonLd} from '@/components/layout/JsonLd';
import {BountyGrid} from '@/components/pages/plugins/bounties/BountyGrid/BountyGrid';
import {BountySchema} from '@/components/pages/plugins/bounties/BountySchema/BountySchema';
import {RequestPluginButton} from '@/components/pages/plugins/bounties/RequestPluginButton/RequestPluginButton';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {getBountyStats} from '@/lib/plugins/bounties';
import {getRequestKinds} from '@/lib/plugins/kinds';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import {TABULARIUM_REQUESTS_URL} from '@/lib/tabularium';
import {ArrowRightIcon, GitBranchIcon, HandCoinsIcon, PackageCheckIcon, TargetIcon} from 'lucide-react';
import Link from 'next/link';
import styles from './BountyBoardPage.module.scss';
import {getAllPlugins} from '@/lib/plugins';

/** The bounty board; `bountyId` opens that bounty's modal on load (the `/plugins/bounties/<slug>` pages). */
export function BountyBoardPage({bountyId}: {bountyId?: string}) {
    const stats = getBountyStats();
    const kinds = getRequestKinds();

    return (
        <div className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Plugins', path: '/plugins'},
                        {name: 'Bounties', path: '/plugins/bounties'},
                    ]),
                ]}
            />
            <header className="page-header">
                <Breadcrumbs crumbs={[{label: 'Plugins', href: '/plugins'}, {label: 'Plugin Bounty board'}]} />
                <span className="eyebrow">
                    <HandCoinsIcon />
                    Plugin Bounty Board
                </span>
                <h1 className="title">Help ship the next plugin.</h1>
                <p className="description">
                    See what the community is building, upvote what you need, or claim a target and get a repository
                    scaffolded for it. Every bounty is a reviewed request on the Tabularium registry, and ships as soon
                    as its plugin is listed there.
                </p>

                <Link href="/plugins" className={styles.shipped}>
                    <PackageCheckIcon aria-hidden="true" />
                    {getAllPlugins().length} plugins already shipped from this board
                    <ArrowRightIcon aria-hidden="true" />
                </Link>

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
                            Drivers, themes and integrations waiting for scope, funding, or a maintainer.
                        </p>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.titleRow}>
                            <div className={styles.iconWrap}>
                                <GitBranchIcon size={20} />
                            </div>
                            <h3 className={styles.title}>{stats.inProgressCount + stats.scopedCount} In motion</h3>
                        </div>
                        <p className={styles.text}>
                            Targets someone is building, or that already have an initial scope.
                        </p>
                    </div>
                </div>
            </header>

            <section className={styles.category}>
                <header className="section-header">
                    <span className="eyebrow">
                        <TargetIcon />
                        Active bounties
                    </span>
                    <h2 className="title">Find the right target.</h2>
                    <p className="description">
                        Search by plugin or filter by kind, status, focus and difficulty, then pick a bounty to upvote
                        it, claim it, sponsor it or discuss it with the community.
                    </p>
                </header>
                <BountyGrid initialBountyId={bountyId} kinds={kinds} />
            </section>

            <CalloutBlock
                title="Not on the board yet?"
                actions={
                    <>
                        <RequestPluginButton kinds={kinds}>Request a plugin</RequestPluginButton>
                        <Button href={SOCIAL_URLS.discord} variant="secondary" size="sm">
                            <DiscordIcon />
                            Discuss on Discord
                        </Button>
                    </>
                }
            >
                Request the driver or theme you need. A maintainer reviews it on the{' '}
                <a href={TABULARIUM_REQUESTS_URL} target="_blank" rel="noopener noreferrer">
                    Tabularium wishlist
                </a>
                , then it lands here as a bounty the community can upvote and claim.
            </CalloutBlock>
        </div>
    );
}
