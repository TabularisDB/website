import {DownloadButton} from '@/components/ui/DownloadButton/DownloadButton';
import {GitHubButton} from '@/components/ui/GithubButton/GithubButton';
import {HeroTrust} from './HeroTrust/HeroTrust';
import {HeroVideo} from './HeroVideo/HeroVideo';
import styles from './HomeHero.module.scss';
import {ReleasePill} from './ReleasePill/ReleasePill';

export function HomeHero() {
    return (
        <section className={styles.hero}>
            <ReleasePill />
            <h1 className={styles.tagline}>The database client your AI agent can actually use.</h1>
            <p className={styles.description}>
                Tabularis is an open-source SQL workspace for PostgreSQL, MySQL, SQLite and 18+ other databases. Its
                built-in MCP server lets Claude, Cursor and Devin read your schema and run queries.
            </p>
            <div className={styles.actions}>
                <DownloadButton className={styles.downloadButton} />
                <GitHubButton />
            </div>
            <HeroTrust />
            <HeroVideo
                src="/videos/overview.mp4"
                poster="/videos/overview-hero.webp"
                posterSmall="/videos/overview-hero-800.webp"
            />
        </section>
    );
}
