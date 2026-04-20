import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon } from "@/components/Icons";
import { getChangelog, type ChangelogVersion, type SectionType } from "@/lib/changelog";
import { OG_IMAGE_URL } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Changelog | Tabularis",
  description: "Full release history and changelog for Tabularis.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    type: "website",
    url: "https://tabularis.dev/changelog/",
    title: "Changelog | Tabularis",
    description: "Full release history and changelog for Tabularis.",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog | Tabularis",
    description: "Full release history and changelog for Tabularis.",
    images: [OG_IMAGE_URL],
  },
};

const SECTION_LABELS: Record<SectionType, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  breaking: "Breaking Changes",
  perf: "Performance",
  other: "Other",
};

const SECTION_COLORS: Record<SectionType, string> = {
  feat: "cl-badge-feat",
  fix: "cl-badge-fix",
  breaking: "cl-badge-breaking",
  perf: "cl-badge-perf",
  other: "cl-badge-other",
};

function VersionCard({ v }: { v: ChangelogVersion }) {
  const totalEntries = v.sections.reduce((s, sec) => s + sec.entries.length, 0);
  if (totalEntries === 0) return null;

  return (
    <div className={`cl-version-card${v.isMajor ? " cl-version-major" : ""}`}>
      <div className="cl-version-header">
        <div className="cl-version-title-row">
          {v.isMajor && <span className="cl-major-badge">Major</span>}
          <h2 className="cl-version-title">v{v.version}</h2>
          <time className="cl-version-date" dateTime={v.date}>
            {new Date(v.date + "T12:00:00Z").toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </time>
        </div>
        {v.compareUrl && (
          <a
            href={v.compareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cl-compare-link"
          >
            <GitHubIcon size={13} />
            View diff
          </a>
        )}
      </div>

      <div className="cl-sections">
        {v.sections.map((section) => (
          <div key={section.title} className="cl-section">
            <span className={`cl-section-badge ${SECTION_COLORS[section.type]}`}>
              {SECTION_LABELS[section.type]}
            </span>
            <ul className="cl-entry-list">
              {section.entries.map((entry, i) => (
                <li key={i} className="cl-entry">
                  {entry.scope && (
                    <span className="cl-scope">{entry.scope}</span>
                  )}
                  <span className="cl-entry-desc" dangerouslySetInnerHTML={{ __html: entry.description }} />
                  {entry.commitHash && entry.commitUrl && (
                    <a
                      href={entry.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cl-commit-hash"
                    >
                      {entry.commitHash.slice(0, 7)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  const versions = getChangelog();

  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "changelog" }]} />

      <section className="cl-page">
        <div className="cl-page-header">
          <p className="cl-page-subtitle">
            Every release, documented. Source of truth is{" "}
            <a
              href="https://github.com/TabularisDB/tabularis/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              CHANGELOG.md on GitHub
            </a>
            .
          </p>
        </div>

        <div className="cl-timeline">
          {versions.map((v) => (
            <VersionCard key={v.version} v={v} />
          ))}
        </div>

        <div className="cta-strip">
          <a className="btn-cta" href="https://github.com/TabularisDB/tabularis">
            <GitHubIcon size={16} />
            Star on GitHub
          </a>
          <Link className="btn-cta" href="/blog">
            Read the Blog
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
