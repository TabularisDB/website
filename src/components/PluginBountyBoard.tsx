"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlueskyIcon, DiscordIcon, LinkedInIcon, RedditIcon, ShareIcon, XBrandIcon } from "@/components/Icons";
import {
  BOUNTY_STATUS_LABEL,
  type BountyDifficulty,
  type BountyStatus,
  getActiveBounties,
  getBountyStats,
  getConstellationBounties,
  getFeaturedBounty,
  getShippedBounties,
  type PluginBounty,
} from "@/lib/pluginBounties";

function trackMatomoEvent(category: string, action: string, name?: string) {
  const _paq = (window as unknown as { _paq?: unknown[][] })._paq;
  if (_paq) _paq.push(["trackEvent", category, action, name]);
}

type BountyAccentStyle = CSSProperties & {
  "--bounty-accent": string;
  "--bounty-index"?: string;
  "--pulse-delay"?: string;
};

type StatusFilter = "all" | "priority" | "motion" | "coming-soon" | "open";
type FocusFilter = "all" | "compatibility" | "warehouse" | "nosql" | "sql" | "docs";
type DifficultyFilter = "all" | BountyDifficulty;

const ACTION_TARGET = {
  request: "https://github.com/TabularisDB/tabularis/discussions",
  discord: "https://discord.com/invite/K2hmhfHRSt",
  sponsor: "/sponsors",
};

const STATUS_WEIGHT: Record<BountyStatus, number> = {
  "most-wanted": 0,
  claimed: 1,
  scoped: 2,
  "coming-soon": 3,
  open: 4,
  shipped: 5,
};

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "priority", label: "Most wanted" },
  { id: "motion", label: "In motion" },
  { id: "coming-soon", label: "Coming soon" },
  { id: "open", label: "Open brief" },
];

const FOCUS_FILTERS: Array<{ id: FocusFilter; label: string; tags: string[] }> = [
  { id: "all", label: "All focus", tags: [] },
  {
    id: "compatibility",
    label: "Compatibility",
    tags: ["postgres-compatible", "mysql-compatible", "drop-in", "compatibility"],
  },
  { id: "warehouse", label: "Warehouse", tags: ["warehouse", "analytics", "federated"] },
  { id: "nosql", label: "NoSQL", tags: ["nosql", "document", "key-value", "wide-column"] },
  { id: "sql", label: "SQL", tags: ["enterprise", "distributed-sql", "embedded", "sql"] },
  { id: "docs", label: "Docs", tags: ["docs"] },
];

const DIFFICULTY_FILTERS: Array<{ id: DifficultyFilter; label: string }> = [
  { id: "all", label: "Any difficulty" },
  { id: "Medium", label: "Medium" },
  { id: "High", label: "High" },
  { id: "Extreme", label: "Extreme" },
];

function actionAttrs(href: string) {
  const external = href.startsWith("http");
  return {
    target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined,
  };
}

function matchesStatusFilter(bounty: PluginBounty, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "priority") return bounty.status === "most-wanted";
  if (filter === "motion") return bounty.status === "claimed" || bounty.status === "scoped";
  if (filter === "coming-soon") return bounty.status === "coming-soon";
  return bounty.status === "open";
}

function matchesFocusFilter(bounty: PluginBounty, filter: FocusFilter) {
  if (filter === "all") return true;
  const filterTags = FOCUS_FILTERS.find((item) => item.id === filter)?.tags ?? [];
  const bountyTags = bounty.tags.map((tag) => tag.toLowerCase());
  const target = bounty.target.toLowerCase();
  const name = bounty.name.toLowerCase();

  return filterTags.some(
    (tag) => bountyTags.includes(tag) || target.includes(tag) || name.includes(tag),
  );
}

function BountyStatusBadge({ bounty }: { bounty: PluginBounty }) {
  return (
    <span className={`bounty-status bounty-status-${bounty.status}`}>
      {BOUNTY_STATUS_LABEL[bounty.status]}
    </span>
  );
}

function BountyCapabilities({ bounty }: { bounty: PluginBounty }) {
  return (
    <div className="bounty-capabilities" aria-label={`${bounty.name} capability map`}>
      {bounty.capabilities.map((capability) => (
        <span
          key={`${bounty.id}-${capability.label}`}
          className={`bounty-capability bounty-capability-${capability.state}`}
        >
          {capability.label}
        </span>
      ))}
    </div>
  );
}

function SponsorIcon() {
  return (
    <svg className="bounty-action-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4 4.2 13.4l.7-4.3-3.1-3 4.3-.6L8 1.6z" />
    </svg>
  );
}

const BOUNTY_BASE_URL = "https://tabularis.dev/plugins/bounties";

function SharePanel({ bounty }: { bounty: PluginBounty }) {
  const url = `${BOUNTY_BASE_URL}#${bounty.id}`;
  const xText = `Looking for ${bounty.difficulty.toLowerCase()} contributors to implement ${bounty.name} for Tabularis!\n${bounty.tagline}`;
  const bskyText = `Looking for contributors to implement ${bounty.name} for Tabularis!\n\n${bounty.tagline}\n\nDifficulty: ${bounty.difficulty} · ${bounty.target}\n${url}`;
  const redditTitle = `Anyone working on a ${bounty.name} plugin for Tabularis? There's an open bounty (${bounty.difficulty} difficulty)`;

  const platforms = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(url)}`,
      icon: <XBrandIcon size={13} />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: <LinkedInIcon size={13} />,
    },
    {
      label: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(bskyText)}`,
      icon: <BlueskyIcon size={13} />,
    },
    {
      label: "Reddit",
      href: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(redditTitle)}`,
      icon: <RedditIcon size={13} />,
    },
  ];

  return (
    <div className="bounty-share-panel">
      <p className="bounty-share-preview">
        Looking for <strong>{bounty.difficulty.toLowerCase()}</strong> contributors to implement{" "}
        <strong>{bounty.name}</strong> — {bounty.tagline}
      </p>
      <div className="bounty-share-actions">
        {platforms.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            className="bounty-share-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            {icon}
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function BountyCard({ bounty, featured = false }: { bounty: PluginBounty; featured?: boolean }) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <article
      id={bounty.id}
      className={`bounty-card${featured ? " bounty-card-featured" : ""}`}
      style={{ "--bounty-accent": bounty.accent } as BountyAccentStyle}
    >
      <div className="bounty-card-glow" aria-hidden="true" />
      <div className="bounty-card-scan" aria-hidden="true" />
      <div className="bounty-card-top">
        <BountyStatusBadge bounty={bounty} />
        <span className="bounty-target">{bounty.target}</span>
      </div>

      <div className="bounty-card-main">
        <div>
          <h3>{bounty.name}</h3>
          <p className="bounty-card-tagline">{bounty.tagline}</p>
        </div>
      </div>

      <p className="bounty-card-desc">{bounty.description}</p>

      <div className="bounty-tags" aria-label={`${bounty.name} tags`}>
        <span>Difficulty: {bounty.difficulty}</span>
        {bounty.tags.map((tag) => (
          <span key={`${bounty.id}-${tag}`}>{tag}</span>
        ))}
      </div>

      <BountyCapabilities bounty={bounty} />

      <div className="bounty-signal">
        <span>Signal</span>
        <p>{bounty.signal}</p>
      </div>

      <div className="bounty-next-step">
        <span>Next step</span>
        <p>{bounty.nextStep}</p>
      </div>

      <div className="bounty-card-footer">
        <a href={bounty.claimUrl} className="bounty-action-primary" {...actionAttrs(bounty.claimUrl)} onClick={() => trackMatomoEvent("Bounty", "Claim Work", bounty.id)}>
          <span>{bounty.status === "shipped" ? "View plugin" : "Claim work"}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3l5 5-5 5M11 8H2" />
          </svg>
        </a>
        <a
          href={ACTION_TARGET.discord}
          className="bounty-action-secondary bounty-action-discord"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discuss on Discord"
          onClick={() => trackMatomoEvent("Bounty", "Discuss", bounty.id)}
        >
          <DiscordIcon size={15} className="bounty-action-icon" />
          <span className="bounty-action-label">Discuss</span>
        </a>
        <a
          href={bounty.sponsorUrl}
          className="bounty-action-secondary bounty-action-sponsor"
          {...actionAttrs(bounty.sponsorUrl)}
          aria-label={bounty.status === "shipped" ? "View in Registry" : "Sponsor this bounty"}
          onClick={() => trackMatomoEvent("Bounty", "Sponsor", bounty.id)}
        >
          <SponsorIcon />
          <span className="bounty-action-label">{bounty.status === "shipped" ? "Registry" : "Sponsor"}</span>
        </a>
        <button
          type="button"
          className={`bounty-action-secondary bounty-action-share${shareOpen ? " is-active" : ""}`}
          onClick={() => setShareOpen((v) => !v)}
          aria-expanded={shareOpen}
          aria-label="Share this bounty"
        >
          <ShareIcon size={14} className="bounty-action-icon" />
          <span className="bounty-action-label">Share</span>
        </button>
      </div>
      {shareOpen && <SharePanel bounty={bounty} />}
    </article>
  );
}

function pulseDelay(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `${(hash % 24) / 10}s`;
}

function computeRadarAngle(x: number, y: number): number {
  return (Math.atan2(x - 50, -(y - 56)) * (180 / Math.PI) + 360) % 360;
}

const SWEEP_MS = 7000;
const SWEEP_WINDOW_DEG = 22;

function DesktopRadar({
  activeBounties,
  constellationBounties,
}: {
  activeBounties: PluginBounty[];
  constellationBounties: PluginBounty[];
}) {
  const constellationIds = new Set(constellationBounties.map((b) => b.id));

  const [litDotIds, setLitDotIds] = useState<Set<string>>(new Set());
  const [activeDotId, setActiveDotId] = useState<string | null>(null);

  const radarRef = useRef<HTMLDivElement>(null);
  const mouseBeamRef = useRef<HTMLDivElement>(null);
  const mouseAngleRef = useRef<number | null>(null);

  const dotAngles = useMemo(
    () => new Map(activeBounties.map((b) => [b.id, computeRadarAngle(b.radar.x, b.radar.y)])),
    [activeBounties],
  );

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const activeAngle =
        mouseAngleRef.current !== null
          ? mouseAngleRef.current
          : (((Date.now() - start) % SWEEP_MS) / SWEEP_MS) * 360;
      const newLit = new Set<string>();
      for (const [id, angle] of dotAngles) {
        if (Math.abs(((activeAngle - angle + 540) % 360) - 180) < SWEEP_WINDOW_DEG) {
          newLit.add(id);
        }
      }
      setLitDotIds((prev) => {
        if (prev.size === newLit.size && [...newLit].every((id) => prev.has(id))) return prev;
        return newLit;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [dotAngles]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const radar = radarRef.current;
    if (!radar) return;
    const rect = radar.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width * 0.5;
    const dy = e.clientY - rect.top - rect.height * 0.56;
    const angle = (Math.atan2(dx, -dy) * (180 / Math.PI) + 360) % 360;
    mouseAngleRef.current = angle;
    mouseBeamRef.current?.style.setProperty("--mouse-angle", `${angle}deg`);
    radar.classList.add("is-mouse-active");
  }

  function handleMouseLeave() {
    mouseAngleRef.current = null;
    radarRef.current?.classList.remove("is-mouse-active");
  }

  function handleDotClick(e: React.MouseEvent, id: string) {
    if (activeDotId !== id) {
      e.preventDefault();
      setActiveDotId(id);
    }
  }

  function handleRadarClick(e: React.MouseEvent) {
    if (!(e.target as Element).closest(".bounty-radar-dot")) {
      setActiveDotId(null);
    }
  }

  return (
    <div
      className="bounty-radar"
      ref={radarRef}
      onClick={handleRadarClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bounty-radar-panel-head">
        <span>Driver map</span>
        <strong>{activeBounties.length} targets</strong>
      </div>
      <div className="bounty-radar-ring ring-1" aria-hidden="true" />
      <div className="bounty-radar-ring ring-2" aria-hidden="true" />
      <div className="bounty-radar-ring ring-3" aria-hidden="true" />
      <div className="bounty-radar-crosshair" aria-hidden="true" />
      <div className="bounty-radar-sweep" aria-hidden="true" />
      <div className="bounty-radar-mouse-beam" ref={mouseBeamRef} aria-hidden="true" />
      <svg
        className="bounty-radar-links"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {constellationBounties.map((bounty) => (
          <line
            key={`${bounty.id}-link`}
            className={`bounty-radar-link bounty-radar-link-${bounty.status}`}
            x1="50"
            y1="56"
            x2={bounty.radar.x}
            y2={bounty.radar.y}
            stroke={bounty.accent}
          />
        ))}
      </svg>
      <span className="bounty-radar-zone bounty-radar-zone-sql">SQL compatibility</span>
      <span className="bounty-radar-zone bounty-radar-zone-cloud">Cloud warehouse</span>
      <span className="bounty-radar-zone bounty-radar-zone-nosql">NoSQL / document</span>
      <span className="bounty-radar-zone bounty-radar-zone-federated">
        Federated analytics
      </span>
      <div className="bounty-radar-core" aria-hidden="true">
        <Image src="/img/logo.png" alt="Tabularis logo" width={40} height={40} />
      </div>
      {activeBounties.map((bounty) => {
        const isLit = litDotIds.has(bounty.id) || activeDotId === bounty.id;
        const isPriority = constellationIds.has(bounty.id);
        return (
          <a
            key={bounty.id}
            href={`#${bounty.id}`}
            className={`bounty-radar-dot bounty-radar-node-${bounty.status}${isLit ? " is-lit" : ""}${isPriority ? " is-priority" : ""}`}
            aria-label={`${bounty.name}: ${BOUNTY_STATUS_LABEL[bounty.status]}`}
            data-tip-pos={bounty.radar.y < 35 ? "below" : undefined}
            data-tip-align={
              bounty.radar.x < 22 ? "left" : bounty.radar.x > 76 ? "right" : undefined
            }
            style={
              {
                "--bounty-accent": bounty.accent,
                "--pulse-delay": pulseDelay(bounty.id),
                left: `${bounty.radar.x}%`,
                top: `${bounty.radar.y}%`,
              } as BountyAccentStyle
            }
            onClick={(e) => handleDotClick(e, bounty.id)}
          >
            <span className="bounty-radar-pulse" />
            <span className="bounty-radar-node-dot" />
            <strong>
              {bounty.name}
              <small>{BOUNTY_STATUS_LABEL[bounty.status]}</small>
            </strong>
          </a>
        );
      })}
    </div>
  );
}

function MobileConstellation({ bounties }: { bounties: PluginBounty[] }) {
  return (
    <div className="bounty-mobile-constellation" aria-label="Prioritized bounty signal stream">
      <div className="bounty-mobile-constellation-head">
        <span>Signal stream</span>
        <strong>{bounties.length} priority targets</strong>
      </div>
      <div className="bounty-mobile-signal-list">
        {bounties.map((bounty, index) => (
          <a
            key={bounty.id}
            href={`#${bounty.id}`}
            className={`bounty-mobile-signal bounty-mobile-signal-${bounty.status}`}
            style={
              {
                "--bounty-accent": bounty.accent,
                "--bounty-index": String(index),
              } as BountyAccentStyle
            }
          >
            <span className="bounty-mobile-signal-pin" aria-hidden="true" />
            <span className="bounty-mobile-signal-main">
              <strong>{bounty.name}</strong>
              <small>{bounty.target}</small>
            </span>
            <span className="bounty-mobile-signal-meta">
              {BOUNTY_STATUS_LABEL[bounty.status]}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function PluginBountyBoard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [focusFilter, setFocusFilter] = useState<FocusFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  const activeBounties = getActiveBounties().sort(
    (a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status],
  );
  const shippedBounties = getShippedBounties();
  const constellationBounties = getConstellationBounties(activeBounties);
  const featured = getFeaturedBounty();
  const stats = getBountyStats();
  const filteredBounties = activeBounties.filter(
    (bounty) =>
      matchesStatusFilter(bounty, statusFilter) &&
      matchesFocusFilter(bounty, focusFilter) &&
      (difficultyFilter === "all" || bounty.difficulty === difficultyFilter),
  );
  const hasActiveFilters =
    statusFilter !== "all" || focusFilter !== "all" || difficultyFilter !== "all";

  return (
    <main className="bounty-page">
      <section className="bounty-hero">
        <div className="bounty-hero-orbit" aria-hidden="true" />
        <div className="bounty-hero-copy">
          <span className="bounty-kicker">Plugin Bounty Board</span>
          <h1>Fund the next database driver.</h1>
          <p>
            A public market for the integrations Tabularis should support next.
            Request, sponsor, or claim a plugin and turn scattered requests into
            shipped drivers. Discord is for fast discussion; GitHub is for durable
            proposals.
          </p>

          <div className="bounty-hero-actions">
            <a
              href={ACTION_TARGET.request}
              className="bounty-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Request a plugin
            </a>
            <a
              href={ACTION_TARGET.discord}
              className="bounty-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pitch on Discord
            </a>
            <Link href="#market" className="bounty-secondary">
              Enter market
            </Link>
          </div>
        </div>

        <div className="bounty-radar-panel" aria-label="Bounty status map">
          <DesktopRadar
            activeBounties={activeBounties}
            constellationBounties={constellationBounties}
          />
          <MobileConstellation bounties={activeBounties} />
          <div className="bounty-radar-caption">
            <span>Curated driver map</span>
            <strong>Status, scope, next action</strong>
          </div>
          <div className="bounty-radar-legend" aria-hidden="true">
            <span><i className="legend-most-wanted" /> Most Wanted</span>
            <span><i className="legend-scoped" /> Scoped / Claimed</span>
            <span><i className="legend-coming-soon" /> Coming Soon</span>
            <span><i className="legend-open" /> Open Brief</span>
          </div>
        </div>
      </section>

      <section className="bounty-console-grid">
        <div className="bounty-stat-card">
          <span>Open targets</span>
          <strong>{stats.activeCount}</strong>
          <p>Drivers and integrations waiting for scope, funding, or a maintainer.</p>
        </div>
        <div className="bounty-stat-card">
          <span>In motion</span>
          <strong>{stats.claimedCount + stats.scopedCount}</strong>
          <p>Targets that already have a claim, branch, or initial scope.</p>
        </div>
        <div className="bounty-stat-card">
          <span>Shipped proofs</span>
          <strong>{stats.shippedCount}</strong>
          <p>Existing plugin wins that prove external drivers can land.</p>
        </div>
        <div className="bounty-terminal">
          <div className="bounty-terminal-head">
            <span>mission-feed</span>
            <span>curated queue</span>
          </div>
          <ol>
            {activeBounties.slice(0, 5).map((bounty, index) => (
              <li key={bounty.id}>
                <span>0{index + 1}</span>
                <a href={`#${bounty.id}`}>{bounty.name}</a>
                <strong>{BOUNTY_STATUS_LABEL[bounty.status]}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featured && (
        <section className="bounty-featured-section">
          <div className="bounty-section-heading">
            <span>Prime target</span>
            <h2>Highest-value work on the board</h2>
            <p>
              The featured slot should feel like a mission brief, not a normal
              backlog item. It points contributors and sponsors at the work with
              the clearest ecosystem impact, without pretending to have live
              market data.
            </p>
          </div>
          <BountyCard bounty={featured} featured />
        </section>
      )}

      <section className="bounty-market" id="market">
        <div className="bounty-section-heading">
          <span>Open market</span>
          <h2>Pick a target. Move the ecosystem.</h2>
          <p>
            Every card is designed to become a real issue, discussion, sponsor
            target, or plugin owner handoff as the board matures.
          </p>
        </div>

        <div className="bounty-filter-panel" aria-label="Bounty board filters">
          <div className="bounty-filter-head">
            <div>
              <span>Filter console</span>
              <strong>
                Showing {filteredBounties.length} of {activeBounties.length} targets
              </strong>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className="bounty-filter-reset"
                onClick={() => {
                  setStatusFilter("all");
                  setFocusFilter("all");
                  setDifficultyFilter("all");
                }}
              >
                Reset
              </button>
            )}
          </div>

          <div className="bounty-filter-row">
            <span>Status</span>
            <div className="bounty-filter-options">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`bounty-filter-btn${statusFilter === filter.id ? " active" : ""}`}
                  aria-pressed={statusFilter === filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bounty-filter-row">
            <span>Focus</span>
            <div className="bounty-filter-options">
              {FOCUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`bounty-filter-btn${focusFilter === filter.id ? " active" : ""}`}
                  aria-pressed={focusFilter === filter.id}
                  onClick={() => setFocusFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bounty-filter-row">
            <span>Difficulty</span>
            <div className="bounty-filter-options">
              {DIFFICULTY_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`bounty-filter-btn${
                    difficultyFilter === filter.id ? " active" : ""
                  }`}
                  aria-pressed={difficultyFilter === filter.id}
                  onClick={() => setDifficultyFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredBounties.length > 0 ? (
          <div className="bounty-grid">
            {filteredBounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        ) : (
          <div className="bounty-empty-state">
            <span>No matching target</span>
            <p>Try clearing one filter or start a new request in GitHub Discussions.</p>
          </div>
        )}
      </section>

      <section className="bounty-trophies">
        <div className="bounty-section-heading">
          <span>Shipped bounties</span>
          <h2>Proof that the market can close.</h2>
        </div>
        <div className="bounty-trophy-grid">
          {shippedBounties.map((bounty) => (
            <Link
              href="/plugins"
              key={bounty.id}
              className="bounty-trophy"
              style={{ "--bounty-accent": bounty.accent } as BountyAccentStyle}
            >
              <span className="bounty-trophy-medal">SHIPPED</span>
              <strong>{bounty.name}</strong>
              <p>{bounty.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bounty-final-cta">
        <div>
          <span>Have a database nobody supports well?</span>
          <h2>Put it on the board.</h2>
          <p>
            Start with a GitHub Discussion. If the need is real, the item can
            graduate into a scoped bounty with an owner, target and delivery path.
          </p>
        </div>
        <a
          href={ACTION_TARGET.request}
          className="bounty-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Request next target
        </a>
        <a
          href={ACTION_TARGET.discord}
          className="bounty-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discuss on Discord
        </a>
      </section>
    </main>
  );
}
