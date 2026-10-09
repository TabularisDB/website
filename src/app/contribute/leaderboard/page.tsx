import {JsonLd} from '@/components/layout/JsonLd';
import {Leaderboard} from '@/components/pages/community/Leaderboard/Leaderboard';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {formatLeaderboardDate, GIVEAWAY, parseRangeBound, SCORE_RULES} from '@/lib/community/leaderboard';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import {
    AwardIcon,
    BadgeCheckIcon,
    CalculatorIcon,
    CalendarDaysIcon,
    CircleDotIcon,
    GiftIcon,
    TrophyIcon,
    UserPlusIcon,
} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './LeaderboardPage.module.scss';
import {Accordion, AccordionItem} from '@/components/ui/Accordion/Accordion';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';

const path = '/contribute/leaderboard';
const title = 'Contributor Leaderboard | Tabularis';
const description =
    'Who is moving Tabularis forward: pull requests and issues across every Tabularis project, ranked over any date range. Home of the community giveaway.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis contributor leaderboard'),
    },
    twitter: {card: 'summary_large_image'},
};

const giveawayFrom = formatLeaderboardDate(parseRangeBound(GIVEAWAY.from, 'from')!);
const giveawayTo = formatLeaderboardDate(parseRangeBound(GIVEAWAY.to, 'to')!);

const GIVEAWAY_QUESTIONS: AccordionItem[] = [
    {
        icon: GiftIcon,
        question: 'What can I win in the giveaway?',
        answer: (
            <p>
                The top {GIVEAWAY.winners} eligible contributors win a prize. The prizes are listed in the giveaway
                announcement on <a href={SOCIAL_URLS.discord}>Discord</a>.
            </p>
        ),
    },
    {
        icon: CalendarDaysIcon,
        question: 'When does the giveaway start and end?',
        answer: (
            <p>
                From {giveawayFrom} to {giveawayTo}, Europe/Rome time. A pull request or issue counts when it is opened
                in this window. A pull request opened up to a day before the start counts too, if it is merged inside
                the window.
            </p>
        ),
    },
    {
        icon: UserPlusIcon,
        question: 'How do I enter the giveaway?',
        answer: (
            <p>
                Reply to the giveaway announcement on <a href={SOCIAL_URLS.discord}>Discord</a> with your GitHub
                username and what you plan to work on. A maintainer then marks you as entered on this board. Looking for
                ideas? Start with the <Link href="/contribute?label=good+first+issue#issues">good first issues</Link>.
            </p>
        ),
    },
    {
        icon: AwardIcon,
        question: 'How are the winners chosen?',
        answer: (
            <p>
                The score orders the board, but it does not pick the winners. After the deadline, maintainers review
                every contribution for usefulness, quality and impact. Translations, docs, themes, testing and help on
                Discord count too, even when they earn no points.
            </p>
        ),
    },
    {
        icon: BadgeCheckIcon,
        question: 'Who is eligible to win?',
        answer: (
            <p>
                The eligibility rules are in the Discord announcement: read them before you enter. The selection runs on
                trust, and everyone is welcome to contribute and climb the board, whether or not they enter.
            </p>
        ),
    },
];

export default function LeaderboardPage() {
    return (
        <div className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Contribute', path: '/contribute'},
                        {name: 'Leaderboard', path},
                    ]),
                ]}
            />

            <header className="page-header">
                <Breadcrumbs crumbs={[{label: 'Contribute', href: '/contribute'}, {label: 'Leaderboard'}]} />
                <span className="eyebrow">
                    <TrophyIcon />
                    Leaderboard
                </span>
                <h1 className="title">Make an impact. Earn your place.</h1>
                <p className="description">
                    Every pull request and issue opened across the Tabularis projects, ranked over a date range. Pick
                    the giveaway window or any range you like, and share the link.
                </p>
            </header>

            <section className={styles.faq}>
                <Accordion items={GIVEAWAY_QUESTIONS} />
            </section>

            <section className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">
                        <TrophyIcon />
                        Standings
                    </span>
                    <h2 className="title">Who is moving Tabularis forward.</h2>
                    <p className="description">
                        Click a contributor to see what they opened and what each item scored. Team members are hidden
                        by default.
                    </p>
                </header>

                <Leaderboard />
            </section>

            <section className={styles.section}>
                <header className="section-header">
                    <span className="eyebrow">
                        <CalculatorIcon />
                        Scoring
                    </span>
                    <h2 className="title">How points are counted.</h2>
                    <p className="description">
                        Only work that lands earns points. The score orders the board, but maintainers pick the winners
                        after reviewing every contribution.
                    </p>
                </header>

                <ul className={styles.rules}>
                    {SCORE_RULES.map((rule) => (
                        <li key={rule.title} className={styles.rule}>
                            <span className={styles.rulePoints}>
                                {rule.points > 0 ? `+${rule.points}` : rule.points}
                                <small>{rule.points === 1 ? 'pt' : 'pts'}</small>
                            </span>
                            <h3 className={styles.ruleTitle}>{rule.title}</h3>
                            <p className={styles.ruleText}>{rule.description}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <CalloutBlock
                title="Ready to climb the board?"
                actions={
                    <>
                        <Button href="/contribute#issues" size="sm">
                            <CircleDotIcon />
                            Find an issue
                        </Button>
                        <Button href={SOCIAL_URLS.discord} variant="secondary" size="sm">
                            <DiscordIcon />
                            Enter on Discord
                        </Button>
                    </>
                }
            >
                Pick an issue, open a pull request, and reply to the announcement on Discord to enter the giveaway.
                Everyone can climb the board, whether or not they enter.
            </CalloutBlock>
        </div>
    );
}
