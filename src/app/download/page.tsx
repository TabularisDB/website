import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { DownloadReleaseChooser } from "@/components/DownloadReleaseChooser";
import { NewsletterForm } from "@/components/NewsletterForm";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { APP_VERSION } from "@/lib/version";
import { NIGHTLY_RELEASE } from "@/lib/nightly";
import { getReleaseDate, formatDate } from "@/lib/posts";
import { getTotalDownloads } from "@/lib/github";
import { SOCIAL_URLS } from "@/lib/social";
import {
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Download | Tabularis",
  description:
    "Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.",
  alternates: { canonical: "/download" },
  openGraph: {
    type: "website",
    url: "https://tabularis.dev/download/",
    title: "Download | Tabularis",
    description:
      "Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Download | Tabularis",
    description:
      "Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.",
  },
};

export default async function DownloadPage() {
  const rawDate = getReleaseDate(APP_VERSION);
  const isoDate = rawDate?.slice(0, 10) ?? "";
  const releaseDate = rawDate ? formatDate(rawDate) : "";
  const nightlyIsoDate = NIGHTLY_RELEASE.publishedAt.slice(0, 10);
  const nightlyDate = formatDate(NIGHTLY_RELEASE.publishedAt);
  const downloads = await getTotalDownloads();

  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Download", path: "/download" },
          ]),
          buildSoftwareApplicationJsonLd(),
        ]}
      />
      <SiteHeader crumbs={[{ label: "download" }]} />

      <section className="dl-page">
        <DownloadReleaseChooser
          stableDate={releaseDate}
          stableIsoDate={isoDate}
          nightlyDate={nightlyDate}
          nightlyIsoDate={nightlyIsoDate}
          downloads={downloads}
        />

        <div className="cta-strip" style={{ justifyContent: "center", marginBottom: "2.5rem" }}>
          <a
            className="btn-cta"
            href={SOCIAL_URLS.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon size={16} />
            Star on GitHub
          </a>
          <a
            className="btn-cta discord"
            href={SOCIAL_URLS.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DiscordIcon size={16} />
            Join Discord
          </a>
        </div>

        <div className="dl-page-footer-links">
          <a
            href={`${SOCIAL_URLS.github}/releases/tag/v${APP_VERSION}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Release notes on GitHub →
          </a>
          <a
            href={`${SOCIAL_URLS.github}/releases`}
            target="_blank"
            rel="noopener noreferrer"
          >
            All releases →
          </a>
          <Link href="/solutions/postgresql-client">
            PostgreSQL client guide →
          </Link>
          <Link href="/solutions/sql-notebooks">
            SQL notebooks guide →
          </Link>
          <Link href="/solutions/mysql-client-for-developers">
            MySQL client guide →
          </Link>
          <Link href="/solutions/secure-database-client">
            Secure database client guide →
          </Link>
        </div>

        <div className="plugin-cta dl-mirror-box">
          <h3>Alternative Mirrors</h3>
          <p>
            Prefer a secondary download mirror? Tabularis is also available on
            SourceForge. The primary and most up-to-date release channel remains
            GitHub Releases.
          </p>
          <a
            href="https://sourceforge.net/projects/tabularis/files/latest/download"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-download"
            style={{ display: "inline-flex", width: "auto" }}
          >
            Download from SourceForge &rarr;
          </a>
        </div>

        <NewsletterForm compact />

        <div className="plugin-cta dl-mirror-box">
          <h3>Explore by Workflow</h3>
          <p>
            Not every download starts from the same use case. If you are here
            because of PostgreSQL, MySQL, secure access, notebooks, or plugin
            extensibility, start from the matching guide.
          </p>
          <div className="dl-page-footer-links">
            <Link href="/solutions/postgresql-client">
              PostgreSQL →
            </Link>
            <Link href="/solutions/mysql-client-for-developers">
              MySQL →
            </Link>
            <Link href="/solutions/secure-database-client">
              Security →
            </Link>
            <Link href="/solutions/plugin-based-database-client">
              Plugins →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
