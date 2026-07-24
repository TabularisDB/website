import Link from "next/link";
import { DownloadButtons } from "@/components/DownloadButtons";
import { GithubStarsButton } from "@/components/GithubStarsButton";
import { HeroVideoPreview } from "@/components/HeroVideoPreview";
import { PostShareBlock } from "@/components/PostShareBlock";
import { getRepoStars, getTotalDownloads, formatDownloads } from "@/lib/github";
import { getPostByRelease } from "@/lib/posts";
import { APP_VERSION } from "@/lib/version";

interface PostSideRailProps {
  title: string;
  url: string;
}

/* Compact pitch card that rides along the article on desktop — a stripped-down
   version of the home hero: version badge, claim, video preview, download +
   star CTAs. */
export async function PostSideRail({ title, url }: PostSideRailProps) {
  const [stars, downloads] = await Promise.all([
    getRepoStars(),
    getTotalDownloads(),
  ]);
  const releasePost = getPostByRelease(APP_VERSION);
  return (
    <aside className="post-rail" aria-label="About Tabularis">
      <div className="post-rail-card">
        <div className="post-rail-badges">
          {releasePost ? (
            <Link
              href={`/blog/${releasePost.slug}`}
              className="badge version"
              title={`Read the v${APP_VERSION} release notes`}
            >
              v{APP_VERSION}
            </Link>
          ) : (
            <span className="badge version">v{APP_VERSION}</span>
          )}
          <span className="badge">Open Source</span>
        </div>
        <p className="post-rail-claim">
          The database client your AI agent can actually use.
        </p>
        <p className="post-rail-lede">
          Free desktop SQL workspace for PostgreSQL, MySQL, SQLite and 15+ more
          databases — with a built-in MCP server.
        </p>
        <div className="post-rail-video">
          <HeroVideoPreview
            src="/videos/overview.mp4"
            poster="/videos/overview-hero.webp"
            posterSmall="/videos/overview-hero-800.webp"
            analyticsCategory="post-rail-video"
            sizes="280px"
            eager={false}
          />
        </div>
        <div className="post-rail-actions">
          <DownloadButtons showReleasesLink={false} />
          <GithubStarsButton stars={stars} />
        </div>
        {downloads !== null && downloads > 0 && (
          <p className="post-rail-meta">
            {formatDownloads(downloads)} downloads · Apache 2.0
          </p>
        )}
      </div>
      <PostShareBlock title={title} url={url} compact />
    </aside>
  );
}
