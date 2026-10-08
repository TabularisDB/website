import {JsonLd} from '@/components/layout/JsonLd';
import {IssueBoard} from '@/components/pages/community/IssueBoard/IssueBoard';
import {InitiativeCard} from '@/components/pages/roadmap/InitiativeCard/InitiativeCard';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {DiscordIcon, GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {formatIssueDate, getIssueStats, ISSUES_FETCHED_AT} from '@/lib/community';
import {ogImages} from '@/lib/og/registry';
import {getAllInitiativeMetas} from '@/lib/roadmap';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import {
    ArrowRightIcon,
    BookOpenIcon,
    BugIcon,
    CircleDotIcon,
    HandCoinsIcon,
    MapIcon,
    PaletteIcon,
    PlugIcon,
    TrophyIcon,
    UsersIcon,
} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import type {ReactNode} from 'react';
import styles from './ContributePage.module.scss';

const path = '/contribute';
const title = 'Contribute | Tabularis';
const description =
    'Contribute to Tabularis: open issues across every project, good first issues, roadmap initiatives, plugins, themes and docs.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Contribute to Tabularis'),
    },
    twitter: {card: 'summary_large_image'},
};

const WEBSITE_REPO = 'https://github.com/TabularisDB/website';

interface WayToHelp {
    icon: ReactNode;
    title: string;
    text: string;
    href: string;
    cta: string;
}

const WAYS_TO_HELP: WayToHelp[] = [
    {
        icon: <BugIcon />,
        title: 'Fix a bug or ship a feature',
        text: 'Pick an open issue below. Good first issues are scoped small and come with pointers to the code.',
        href: '#issues',
        cta: 'Browse open issues',
    },
    {
        icon: <MapIcon />,
        title: 'Join a roadmap initiative',
        text: 'Bigger efforts are split into epics with open tasks you can claim one at a time.',
        href: '/roadmap',
        cta: 'See the roadmap',
    },
    {
        icon: <PlugIcon />,
        title: 'Build a plugin',
        text: 'Drivers run as separate processes speaking JSON-RPC, so you can write one in any language.',
        href: '/wiki/plugin-development',
        cta: 'Plugin development guide',
    },
    {
        icon: <HandCoinsIcon />,
        title: 'Claim a bounty',
        text: 'Drivers and integrations the community is asking for, each with a scope and a status.',
        href: '/plugins/bounties',
        cta: 'Open the bounty board',
    },
    {
        icon: <PaletteIcon />,
        title: 'Design a theme',
        text: 'Themes are plugins too. Package your palette and publish it to the registry.',
        href: '/wiki/themes',
        cta: 'Theme author guide',
    },
    {
        icon: <BookOpenIcon />,
        title: 'Improve the docs',
        text: 'Every wiki page and blog post on this site is Markdown in a public repo. Typos count.',
        href: WEBSITE_REPO,
        cta: 'Edit the website',
    },
];

function SmartLink({href, className, children}: {href: string; className?: string; children: ReactNode}) {
    if (href.startsWith('http')) {
        return (
            <a href={href} className={className} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    }
    if (href.startsWith('#')) {
        return (
            <a href={href} className={className}>
                {children}
            </a>
        );
    }
    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}

export default function ContributePage() {
    const stats = getIssueStats();
    const activeInitiatives = getAllInitiativeMetas().filter((meta) => meta.status === 'in-progress');

    return (
        <div className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Contribute', path},
                    ]),
                ]}
            />

            <header className="page-header">
                <span className="eyebrow">
                    <UsersIcon />
                    Contribute
                </span>
                <h1 className="title">Build Tabularis with us.</h1>
                <p className="description">
                    Tabularis is open source and shaped by the people who use it. There are {stats.total} open issues
                    across {stats.repos} projects right now
                    {stats.goodFirst > 0 ? `, ${stats.goodFirst} of them tagged as good first issues.` : '.'}
                </p>
            </header>

            <div className={styles.waysGrid}>
                {WAYS_TO_HELP.map((way) => (
                    <SmartLink key={way.title} href={way.href} className={styles.wayCard}>
                        <span className={styles.wayIcon}>{way.icon}</span>
                        <div className={styles.wayDetails}>
                            <h3 className={styles.wayTitle}>{way.title}</h3>
                            <p className={styles.wayText}>{way.text}</p>
                        </div>
                        <span className={styles.wayLink}>
                            {way.cta} <ArrowRightIcon size={16} />
                        </span>
                    </SmartLink>
                ))}
            </div>

            <CalloutBlock
                title="Community giveaway: Oct 7 to Oct 13"
                actions={
                    <Button href="/contribute/leaderboard" size="sm">
                        <TrophyIcon />
                        See the leaderboard
                    </Button>
                }
            >
                The top three contributors win a prize. Every PR and issue opened in the window shows up on the
                leaderboard.
            </CalloutBlock>

            <section id="issues" className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">
                        <CircleDotIcon />
                        Open issues
                    </span>
                    <h2 className="title">Pick an issue and claim it.</h2>
                    <p className="description">
                        Every open issue from the Tabularis app and its plugins, as of{' '}
                        {formatIssueDate(ISSUES_FETCHED_AT)}. Filter by label or project, then comment on an issue to
                        claim it.
                    </p>
                </header>

                <IssueBoard />
            </section>

            {activeInitiatives.length > 0 && (
                <section id="roadmap" className={styles.section}>
                    <header className="section-header">
                        <span className="eyebrow">
                            <MapIcon />
                            Roadmap
                        </span>
                        <h2 className="title">Looking for something bigger?</h2>
                        <p className="description">
                            These initiatives are being built right now. Each one links to a GitHub epic with tasks you
                            can pick up.
                        </p>
                    </header>

                    <div className={styles.roadmapGrid}>
                        {activeInitiatives.map((meta) => (
                            <InitiativeCard key={meta.slug} meta={meta} />
                        ))}
                    </div>

                    <div className={styles.centered}>
                        <Button href="/roadmap" variant="secondary">
                            <MapIcon />
                            See the full roadmap
                        </Button>
                    </div>
                </section>
            )}

            <CalloutBlock
                title="Not sure where to start?"
                actions={
                    <>
                        <Button href={SOCIAL_URLS.discord} size="sm">
                            <DiscordIcon />
                            Ask on Discord
                        </Button>
                        <Button href={`${SOCIAL_URLS.github}/discussions`} variant="secondary" size="sm">
                            <GitHubIcon />
                            Open a discussion
                        </Button>
                    </>
                }
            >
                Ask before you pick something up. Maintainers answer on Discord, and ideas or proposals belong in GitHub
                Discussions.
            </CalloutBlock>
        </div>
    );
}
