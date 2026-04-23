import type { CSSProperties } from "react";
import Link from "next/link";
import {
  BOUNTY_STATUS_LABEL,
  getActiveBounties,
  getBountyStats,
  type BountyStatus,
} from "@/lib/pluginBounties";

type BountyAccentStyle = CSSProperties & {
  "--bounty-accent": string;
};

const STATUS_WEIGHT: Record<BountyStatus, number> = {
  "most-wanted": 0,
  claimed: 1,
  scoped: 2,
  "coming-soon": 3,
  open: 4,
  shipped: 5,
};

export function PluginBountyTeaser() {
  const bounties = getActiveBounties()
    .sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status])
    .slice(0, 3);
  const stats = getBountyStats();

  return (
    <section className="plugin-bounty-teaser" aria-labelledby="plugin-bounty-teaser-title">
      <div className="plugin-bounty-teaser-bg" aria-hidden="true" />
      <div className="plugin-bounty-teaser-copy">
        <span className="plugin-bounty-kicker">Bounty Market</span>
        <h3 id="plugin-bounty-teaser-title">Fund the next database driver.</h3>
        <p>
          Request, sponsor, discuss, or claim the integrations the community
          wants next. Turn scattered requests into visible work.
        </p>
        <div className="plugin-bounty-teaser-stats" aria-label="Bounty board stats">
          <span>{stats.activeCount} open targets</span>
          <span>{stats.claimedCount + stats.scopedCount} in motion</span>
          <span>{stats.shippedCount} shipped proofs</span>
        </div>
        <Link href="/plugins/bounties" className="plugin-bounty-teaser-cta">
          Enter the Bounty Board
        </Link>
      </div>

      <div className="plugin-bounty-teaser-stack" aria-label="Top requested bounties">
        {bounties.map((bounty, index) => (
          <Link
            href={`/plugins/bounties#${bounty.id}`}
            className="plugin-bounty-mini-card"
            style={{ "--bounty-accent": bounty.accent } as BountyAccentStyle}
            key={bounty.id}
          >
            <span className="plugin-bounty-mini-rank">0{index + 1}</span>
            <span className="plugin-bounty-mini-main">
              <strong>{bounty.name}</strong>
              <span>{BOUNTY_STATUS_LABEL[bounty.status]}</span>
            </span>
            <span className="plugin-bounty-mini-stage">{bounty.stage}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
