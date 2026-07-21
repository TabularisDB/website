"use client";

import { useState } from "react";
import Link from "next/link";
import { DownloadInline } from "@/components/DownloadInline";
import { APP_VERSION } from "@/lib/version";
import { NIGHTLY_RELEASE } from "@/lib/nightly";
import type { ReleaseChannel } from "@/lib/downloadConfig";
import { formatDownloads } from "@/lib/github";

interface DownloadReleaseChooserProps {
  stableDate: string;
  stableIsoDate: string;
  nightlyDate: string;
  nightlyIsoDate: string;
  downloads: number | null;
}

export function DownloadReleaseChooser({
  stableDate,
  stableIsoDate,
  nightlyDate,
  nightlyIsoDate,
  downloads,
}: DownloadReleaseChooserProps) {
  const [channel, setChannel] = useState<ReleaseChannel>("stable");
  const nightly = channel === "nightly";
  const version = nightly ? (NIGHTLY_RELEASE.version ?? APP_VERSION) : APP_VERSION;
  const date = nightly ? nightlyDate : stableDate;
  const isoDate = nightly ? nightlyIsoDate : stableIsoDate;

  return (
    <>
      <div className="dl-page-hero" aria-live="polite">
        <img src="/img/logo.png" alt="Tabularis" className="dl-page-logo" />
        <div className="dl-page-meta">
          <div className="dl-page-version-row">
            <h1 className="dl-page-version">v{version}</h1>
            {nightly && <span className="dl-page-nightly-badge">Nightly</span>}
          </div>
          <div className="dl-page-submeta">
            {date && <time dateTime={isoDate}>{date}</time>}
            <span className="dl-page-sep">·</span>
            {nightly ? (
              <a
                href={NIGHTLY_RELEASE.url}
                className="dl-page-changelog-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                View nightly on GitHub →
              </a>
            ) : (
              <Link href="/changelog" className="dl-page-changelog-link">
                View changelog →
              </Link>
            )}
            {downloads !== null && downloads > 0 && (
              <>
                <span className="dl-page-sep">·</span>
                <span
                  className="download-count"
                  title={`${downloads.toLocaleString("en-US")} downloads from GitHub releases`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <strong>{formatDownloads(downloads)}</strong> downloads
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <DownloadInline channel={channel} onChannelChange={setChannel} />
    </>
  );
}
