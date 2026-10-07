import {JsonLd} from '@/components/layout/JsonLd';
import {IssueBoard} from '@/components/pages/community/IssueBoard/IssueBoard';
import {Button} from '@/components/ui/Button/Button';
import {BlueskyIcon, DiscordIcon, GitHubIcon, MastodonIcon, XBrandIcon} from '@/components/ui/Icons/SocialIcons';
import {getIssueStats, ISSUES_FETCHED_AT} from '@/lib/community';
import {ogImages} from '@/lib/og/registry';
import {getAllInitiativeMetas} from '@/lib/roadmap';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import {
    ArrowRightIcon,
    BookOpenIcon,
    BugIcon,
    HandCoinsIcon,
    MapIcon,
    MegaphoneIcon,
    PaletteIcon,
    PlugIcon,
    UsersIcon,
} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import type {ReactNode} from 'react';
import styles from './CommunityPage.module.scss';

const path = '/community';
const title = 'Community | Tabularis';
const description =
    'Contribute to Tabularis: open issues across every project, good first issues, plugins, docs, and where the community talks.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Community'),
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
        text: 'The drivers and integrations the community is asking for, with scope and status.',
        href: '/plugins/bounties',
        cta: 'Open the bounty board',
    },
    {
        icon: <PaletteIcon />,
        title: 'Design a theme',
        text: 'Themes are plugins too. Package your palette and publish it to the registry.',
        href: '/wiki/themes',
        cta: 'Theme docs',
    },
    {
        icon: <BookOpenIcon />,
        title: 'Improve the docs',
        text: 'Every wiki page and blog post on this site is Markdown in a public repo. Typos count.',
        href: WEBSITE_REPO,
        cta: 'Edit the website',
    },
];

interface Channel {
    icon: ReactNode;
    name: string;
    text: string;
    href: string;
}

const CHANNELS: Channel[] = [
    {
        icon: <GitHubIcon colored />,
        name: 'GitHub Discussions',
        text: 'Ideas, questions, and proposals for new features.',
        href: `${SOCIAL_URLS.github}/discussions`,
    },
    {
        icon: <DiscordIcon colored />,
        name: 'Discord',
        text: 'Talk to users, contributors, and maintainers in real time.',
        href: SOCIAL_URLS.discord,
    },
    {
        icon: <BlueskyIcon />,
        name: 'Bluesky',
        text: 'Release notes and project news.',
        href: SOCIAL_URLS.bluesky,
    },
    {
        icon: <MastodonIcon />,
        name: 'Mastodon',
        text: 'Release notes and project news.',
        href: SOCIAL_URLS.mastodon,
    },
    {
        icon: <XBrandIcon />,
        name: 'X',
        text: 'Release notes and project news.',
        href: SOCIAL_URLS.x,
    },
    {
        icon: <MegaphoneIcon />,
        name: 'Newsletter',
        text: 'Release announcements and project updates by email.',
        href: '/subscribe',
    },
];

function isExternal(href: string) {
    return href.startsWith('http');
}

function SmartLink({href, className, children}: {href: string; className?: string; children: ReactNode}) {
    if (isExternal(href)) {
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

export default function CommunityPage() {
    const stats = getIssueStats();
    const activeInitiatives = getAllInitiativeMetas().filter((meta) => meta.status === 'in-progress');
    const fetchedOn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeZone: 'UTC'}).format(
        new Date(ISSUES_FETCHED_AT),
    );

    return (
        <div className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Community', path},
                    ]),
                ]}
            />

            <header className="page-header">
                <span className="eyebrow">
                    <UsersIcon />
                    Community
                </span>
                <h1 className="title">Build Tabularis with us.</h1>
                <p className="description">
                    Tabularis is open source and shaped by the people who use it. There are {stats.total} open issues
                    across {stats.repos} projects right now, {stats.goodFirst} of them tagged as good first issues.
                </p>
                <div className={styles.actions}>
                    <Button href="#issues">Find an issue</Button>
                    <Button href={SOCIAL_URLS.discord} variant="secondary">
                        <DiscordIcon />
                        Join Discord
                    </Button>
                </div>
            </header>

            <section className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">Ways to help</span>
                    <h2 className="title">Pick the contribution that fits you.</h2>
                    <p className="description">
                        Code is one way in. Plugins, themes, docs, and bug reports move the project just as much.
                    </p>
                </header>

                <div className={styles.waysGrid}>
                    {WAYS_TO_HELP.map((way) => (
                        <SmartLink key={way.title} href={way.href} className={styles.wayCard}>
                            <span className={styles.iconWrap}>{way.icon}</span>
                            <h3 className={styles.wayTitle}>{way.title}</h3>
                            <p className={styles.wayText}>{way.text}</p>
                            <span className={styles.wayLink}>
                                {way.cta} <ArrowRightIcon size={16} />
                            </span>
                        </SmartLink>
                    ))}
                </div>
            </section>

            <section id="issues" className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">Open issues across the org</span>
                    <h2 className="title">A great place to start.</h2>
                    <p className="description">
                        Every open issue from the Tabularis app and its plugins, with all of their labels. Filter by
                        label or project, then comment on the issue to claim it. Updated {fetchedOn}.
                    </p>
                </header>

                <IssueBoard />
            </section>

            <section className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">Roadmap</span>
                    <h2 className="title">Looking for something bigger?</h2>
                    <p className="description">
                        These initiatives are being built right now. Each one links to a GitHub epic with tasks you can
                        pick up.
                    </p>
                </header>

                {activeInitiatives.length > 0 && (
                    <div className={styles.roadmapGrid}>
                        {activeInitiatives.map((meta) => (
                            <Link key={meta.slug} href={`/roadmap/${meta.slug}`} className={styles.roadmapCard}>
                                {meta.category && <span className={styles.roadmapScope}>{meta.category}</span>}
                                <h3 className={styles.roadmapTitle}>{meta.title}</h3>
                                {meta.lede && <p className={styles.roadmapLede}>{meta.lede}</p>}
                                <span className={styles.wayLink}>
                                    Read details <ArrowRightIcon size={16} />
                                </span>
                            </Link>
                        ))}
                    </div>
                )}

                <div className={styles.centered}>
                    <Button href="/roadmap" variant="secondary">
                        <MapIcon />
                        See the full roadmap
                    </Button>
                </div>
            </section>

            <section className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">Where the community lives</span>
                    <h2 className="title">Come say hi.</h2>
                </header>

                <div className={styles.channelsGrid}>
                    {CHANNELS.map((channel) => (
                        <SmartLink key={channel.name} href={channel.href} className={styles.channel}>
                            <span className={styles.channelIcon}>{channel.icon}</span>
                            <span className={styles.channelBody}>
                                <span className={styles.channelName}>{channel.name}</span>
                                <span className={styles.channelText}>{channel.text}</span>
                            </span>
                        </SmartLink>
                    ))}
                </div>
            </section>
        </div>
    );
}
