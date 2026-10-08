import {JsonLd} from '@/components/layout/JsonLd';
import {Leaderboard} from '@/components/pages/community/Leaderboard/Leaderboard';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {formatLeaderboardDate, GIVEAWAY, parseRangeBound, SCORE_RULES} from '@/lib/community/leaderboard';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {SOCIAL_URLS} from '@/lib/social';
import {CalendarIcon, CircleDotIcon, GiftIcon, MessageSquareIcon, TrophyIcon} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './LeaderboardPage.module.scss';

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

            <div className={styles.facts}>
                <div className={styles.fact}>
                    <GiftIcon />
                    <h2>The prize</h2>
                    <p>
                        The top {GIVEAWAY.winners} eligible contributors win a prize. All the details are in the
                        announcement on <a href={SOCIAL_URLS.discord}>Discord</a>.
                    </p>
                </div>
                <div className={styles.fact}>
                    <CalendarIcon />
                    <h2>When</h2>
                    <p>
                        {giveawayFrom} to {giveawayTo} (CEST, Europe/Rome). Contributions opened in this window count, and so do PRs opened up to a day earlier and merged inside it.
                    </p>
                </div>
                <div className={styles.fact}>
                    <MessageSquareIcon />
                    <h2>How to join</h2>
                    <p>
                        Reply to the announcement on <a href={SOCIAL_URLS.discord}>Discord</a> with your GitHub username
                        and what you will work on: we mark you as entered here. Need ideas? Browse the{' '}
                        <Link href="/contribute?label=good+first+issue#issues">good first issues</Link>.
                    </p>
                </div>
            </div>

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
                        <CircleDotIcon />
                        Scoring
                    </span>
                    <h2 className="title">The score is a hint, not the verdict.</h2>
                    <p className="description">
                        Only work that lands scores: pending PRs and untriaged issues count once a maintainer merges or
                        triages them, closing your own issues scores nothing, and merging your own PR scores less unless
                        someone else approved it first. The score only orders the board. After the deadline, maintainers
                        review every contribution for usefulness, quality and impact: a high PR count alone won&apos;t
                        decide the ranking, and translations, docs, themes, testing and help on Discord count too.
                    </p>
                </header>

                <ul className={styles.rules}>
                    {SCORE_RULES.map((rule) => (
                        <li key={rule.label}>
                            <span>
                                {rule.label}
                                {rule.note && <small>{rule.note}</small>}
                            </span>
                            <strong>{rule.points}</strong>
                        </li>
                    ))}
                </ul>
            </section>

            <CalloutBlock
                title="A request for fairness"
                actions={
                    <>
                        <Button href={SOCIAL_URLS.discord} size="sm">
                            <DiscordIcon />
                            Join on Discord
                        </Button>
                        <Button href="/contribute" variant="secondary" size="sm">
                            Find something to work on
                        </Button>
                    </>
                }
            >
                Check the eligibility notes in the Discord announcement before entering the prize selection. It runs on
                trust, and everyone is still welcome to contribute and climb the board.
            </CalloutBlock>
        </div>
    );
}
