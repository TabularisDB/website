import {JsonLd} from '@/components/layout/JsonLd';
import {Leaderboard} from '@/components/pages/community/Leaderboard/Leaderboard';
import {Accordion, type AccordionItem} from '@/components/ui/Accordion/Accordion';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import {EmptyState} from '@/components/ui/EmptyState/EmptyState';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {
    formatLeaderboardDate,
    formatShortDate,
    getCurrentGiveaway,
    getLastGiveaway,
    giveawayDates,
    SCORE_RULES,
    type Giveaway,
} from '@/lib/community/leaderboard';
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

const path = '/contribute/leaderboard';
const title = 'Contributor Leaderboard | Tabularis';
const description =
    'Who is moving Tabularis forward: pull requests and issues across every Tabularis project, ranked for the community giveaway.';

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

function formatWindow(giveaway: Giveaway) {
    const {from, to} = giveawayDates(giveaway);
    return {from: formatLeaderboardDate(from), to: formatLeaderboardDate(to)};
}

function giveawayQuestions(giveaway: Giveaway): AccordionItem[] {
    const dates = formatWindow(giveaway);

    return [
        {
            icon: GiftIcon,
            question: 'What can I win in the giveaway?',
            answer: (
                <p>
                    The top {giveaway.winners} eligible contributors win a prize. The prizes are listed in the giveaway
                    announcement on <a href={SOCIAL_URLS.discord}>Discord</a>.
                </p>
            ),
        },
        {
            icon: CalendarDaysIcon,
            question: 'When does the giveaway start and end?',
            answer: (
                <p>
                    From {dates.from} to {dates.to}, Europe/Rome time. A pull request or issue counts when it is opened
                    in this window. A pull request opened up to a day before the start counts too, if it is merged
                    inside the window.
                </p>
            ),
        },
        {
            icon: UserPlusIcon,
            question: 'How do I enter the giveaway?',
            answer: (
                <p>
                    Reply to the giveaway announcement on <a href={SOCIAL_URLS.discord}>Discord</a> with your GitHub
                    username and what you plan to work on. A maintainer then marks you as entered on this board. Looking
                    for ideas? Start with the{' '}
                    <Link href="/contribute?label=good+first+issue#issues">good first issues</Link>.
                </p>
            ),
        },
        {
            icon: AwardIcon,
            question: 'How are the winners chosen?',
            answer: (
                <p>
                    The score orders the board, but it does not pick the winners. After the deadline, maintainers review
                    every contribution for usefulness, quality and impact. Translations, docs, themes, testing and help
                    on Discord count too, even when they earn no points.
                </p>
            ),
        },
        {
            icon: BadgeCheckIcon,
            question: 'Who is eligible to win?',
            answer: (
                <p>
                    The eligibility rules are in the Discord announcement: read them before you enter. The selection
                    runs on trust, and everyone is welcome to contribute and climb the board, whether or not they enter.
                </p>
            ),
        },
    ];
}

export default function LeaderboardPage() {
    const current = getCurrentGiveaway();
    const giveaway = current ?? getLastGiveaway();
    const dates = giveaway && formatWindow(giveaway);

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
                <h1 className="title">{current ? 'Make an impact. Earn your place.' : 'Thank you, contributors.'}</h1>
                {giveaway && dates && (
                    <p className="description">
                        {current
                            ? `Every pull request and issue opened across the Tabularis projects during the ${giveaway.title}, from ${dates.from} to ${dates.to}. The top ${giveaway.winners} contributors win a prize.`
                            : `Final standings of the ${giveaway.title}, ${formatShortDate(giveawayDates(giveaway).from)} to ${formatShortDate(giveawayDates(giveaway).to)}. Thanks to everyone who took part; the next giveaway will be announced on Discord.`}
                    </p>
                )}
            </header>

            {current && (
                <section className={styles.faq}>
                    <Accordion items={giveawayQuestions(current)} />
                </section>
            )}

            <section className={styles.section}>
                {current && (
                    <header className="section-header">
                        <span className="eyebrow">
                            <TrophyIcon />
                            Standings
                        </span>
                        <h2 className="title">Who is moving Tabularis forward.</h2>
                        <p className="description">
                            Click a contributor to see what they opened and what each item scored. Team members are
                            hidden by default.
                        </p>
                    </header>
                )}

                {giveaway ? (
                    <Leaderboard giveaway={giveaway} />
                ) : (
                    <EmptyState title="No giveaway yet">The first giveaway will be announced on Discord.</EmptyState>
                )}
            </section>

            {current && (
                <section className={styles.section}>
                    <header className="section-header">
                        <span className="eyebrow">
                            <CalculatorIcon />
                            Scoring
                        </span>
                        <h2 className="title">How points are counted.</h2>
                        <p className="description">
                            Only work that lands earns points. The score orders the board, but maintainers pick the
                            winners after reviewing every contribution.
                        </p>
                    </header>

                    <CardGrid variant="joined" minWidth={350} className={styles.rules}>
                        {SCORE_RULES.map((rule) => (
                            <Card key={rule.title}>
                                <Card.Header
                                    icon={
                                        <span className={styles.points}>
                                            {rule.points > 0 ? `+${rule.points}` : rule.points}
                                            <small>{rule.points === 1 ? 'pt' : 'pts'}</small>
                                        </span>
                                    }
                                />
                                <Card.Content>
                                    <Card.Title>{rule.title}</Card.Title>
                                    <Card.Description>{rule.description}</Card.Description>
                                </Card.Content>
                            </Card>
                        ))}
                    </CardGrid>
                </section>
            )}

            <CalloutBlock
                title={current ? 'Ready to climb the board?' : 'Keep moving Tabularis forward'}
                actions={
                    <>
                        <Button href="/contribute#issues" size="sm">
                            <CircleDotIcon />
                            Find an issue
                        </Button>
                        <Button href={SOCIAL_URLS.discord} variant="secondary" size="sm">
                            <DiscordIcon />
                            {current ? 'Enter on Discord' : 'Join Discord'}
                        </Button>
                    </>
                }
            >
                {current
                    ? 'Pick an issue, open a pull request, and reply to the announcement on Discord to enter the giveaway. Everyone can climb the board, whether or not they enter.'
                    : 'Every contribution counts, giveaway or not. Pick an issue to work on, and join Discord to hear about the next giveaway first.'}
            </CalloutBlock>
        </div>
    );
}
