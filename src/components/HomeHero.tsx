import Link from "next/link";
import { CarouselGrid } from "@/components/CarouselGrid";
import { DownloadButtons } from "@/components/DownloadButtons";
import { GithubStarsButton } from "@/components/GithubStarsButton";
import { FeaturedOn } from "@/components/FeaturedOn";
import { HeroVideoPreview } from "@/components/HeroVideoPreview";
import { getRepoStars, getTotalDownloads } from "@/lib/github";
import { getAllPlugins } from "@/lib/plugins";
import type { PostMeta } from "@/lib/posts";
import { APP_VERSION } from "@/lib/version";

const SWIFT_COUNT = 44;

interface HomeHeroProps {
  latestPost?: PostMeta;
}

export async function HomeHero({ latestPost }: HomeHeroProps) {
  const [stars, downloads] = await Promise.all([
    getRepoStars(),
    getTotalDownloads(),
  ]);
  const pluginCount = getAllPlugins().length;
  return (
    <>
      {latestPost && (
        <Link href={`/blog/${latestPost.slug}`} className="home-latest-post">
          <span className="home-latest-post-eyebrow">Latest from the blog</span>
          <span className="home-latest-post-title">{latestPost.title} →</span>
        </Link>
      )}

      <header className="hero">
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-grid">
            <div className="hero-aurora hero-aurora--one" />
            <div className="hero-aurora hero-aurora--two" />
            <div className="hero-aurora hero-aurora--three" />
            {Array.from({ length: SWIFT_COUNT }).map((_, index) => (
              <span
                key={index}
                className={`hero-swift hero-swift--${index + 1}`}
              />
            ))}
            <div className="hero-scanline" />
          </div>
        </div>

        <div className="hero-main">
          <div className="hero-copy">
            <div className="hero-badges">
              <span className="badge version">v{APP_VERSION}</span>
              <span className="badge">MCP-native</span>
              <span className="badge">Open Source · Apache 2.0</span>
            </div>

            <h1>The database client your AI agent can actually use.</h1>

            <p className="hero-lede">
              Tabularis is an open-source desktop SQL workspace for{" "}
              <strong>
                <Link href="/solutions/postgresql-client" className="hero-lede-link">
                  PostgreSQL
                </Link>
              </strong>
              ,{" "}
              <strong>
                <Link
                  href="/solutions/mysql-client-for-developers"
                  className="hero-lede-link"
                >
                  MySQL/MariaDB
                </Link>
              </strong>
              ,{" "}
              <strong>
                <Link
                  href="/solutions/sqlite-client-for-developers"
                  className="hero-lede-link"
                >
                  SQLite
                </Link>
              </strong>{" "}
              and{" "}
              <strong>
                <a href="#driver-coverage" className="hero-lede-link">
                  {pluginCount}+ more databases
                </a>
              </strong>{" "}
              like DuckDB, ClickHouse, Redis and Firestore. Its built-in{" "}
              <strong>
                <Link
                  href="/solutions/mcp-database-client"
                  className="hero-lede-link"
                >
                  MCP
                </Link>
              </strong>{" "}
              server lets Claude, Cursor and Devin (formerly Windsurf) read your
              schema and run queries in the same app you already use.
            </p>

            <DownloadButtons
              showInstallLink
              downloads={downloads}
              trailing={<GithubStarsButton stars={stars} />}
            />
          </div>

          <HeroVideoPreview
            src="/videos/overview.mp4"
            poster="/videos/overview-hero.webp"
            posterSmall="/videos/overview-hero-800.webp"
          />

          <div className="hero-followup">
            <FeaturedOn />

            <div className="hero-secondary-actions">
              <Link href="/solutions/mcp-database-client">
                For AI agents (MCP) →
              </Link>
              <Link href="/videos">Watch product demos →</Link>
              <Link href="/compare/dbeaver-alternative">
                Compare with DBeaver →
              </Link>
            </div>
          </div>
        </div>

        <CarouselGrid className="hero-proof">
          <a
            href="https://github.com/TabularisDB/tabularis"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-proof-card"
          >
            <span className="hero-proof-kicker">GitHub</span>
            <strong>Open development</strong>
            <span>Source, issues, releases, and contribution history are public.</span>
          </a>
          <Link href="/download" className="hero-proof-card">
            <span className="hero-proof-kicker">Desktop</span>
            <strong>Windows, macOS, Linux</strong>
            <span>Install through GitHub releases, Homebrew, WinGet, Snap, or AUR.</span>
          </Link>
          <Link href="/sponsors" className="hero-proof-card">
            <span className="hero-proof-kicker">Community</span>
            <strong>Sponsor-backed</strong>
            <span>Supported by sponsors and a growing developer ecosystem.</span>
          </Link>
        </CarouselGrid>
      </header>
    </>
  );
}
