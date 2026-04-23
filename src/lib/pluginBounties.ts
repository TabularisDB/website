import bountyData from "@/data/pluginBounties.json";

export type BountyStatus =
  | "most-wanted"
  | "open"
  | "scoped"
  | "claimed"
  | "coming-soon"
  | "shipped";

export type BountyDifficulty = "Low" | "Medium" | "High" | "Extreme";

export type CapabilityState = "ready" | "needed" | "stretch";

export interface BountyCapability {
  label: string;
  state: CapabilityState;
}

export interface PluginBounty {
  id: string;
  name: string;
  target: string;
  status: BountyStatus;
  tagline: string;
  description: string;
  stage: string;
  nextStep: string;
  difficulty: BountyDifficulty;
  accent: string;
  radar: {
    x: number;
    y: number;
    scale: number;
  };
  tags: string[];
  capabilities: BountyCapability[];
  signal: string;
  claimUrl: string;
  sponsorUrl: string;
}

interface PluginBountyData {
  constellationIds: string[];
  bounties: PluginBounty[];
}

const data = bountyData as PluginBountyData;

export const BOUNTY_STATUS_LABEL: Record<BountyStatus, string> = {
  "most-wanted": "Most Wanted",
  open: "Open",
  scoped: "Scoped",
  claimed: "Claimed",
  "coming-soon": "Coming Soon",
  shipped: "Shipped",
};

export const PLUGIN_BOUNTIES = data.bounties;
export const PLUGIN_BOUNTY_CONSTELLATION_IDS = data.constellationIds;

export function getAllBounties() {
  return PLUGIN_BOUNTIES;
}

export function getActiveBounties() {
  return PLUGIN_BOUNTIES.filter((bounty) => bounty.status !== "shipped");
}

export function getShippedBounties() {
  return PLUGIN_BOUNTIES.filter((bounty) => bounty.status === "shipped");
}

export function getConstellationBounties(bounties = getActiveBounties()) {
  const ids = new Set(PLUGIN_BOUNTY_CONSTELLATION_IDS);
  return bounties.filter((bounty) => ids.has(bounty.id));
}

export function getFeaturedBounty() {
  return (
    getActiveBounties().find((bounty) => bounty.status === "most-wanted") ??
    getActiveBounties()[0]
  );
}

export function getBountyStats() {
  const active = getActiveBounties();
  const shipped = getShippedBounties();
  return {
    activeCount: active.length,
    shippedCount: shipped.length,
    claimedCount: active.filter((bounty) => bounty.status === "claimed").length,
    scopedCount: active.filter((bounty) => bounty.status === "scoped").length,
  };
}
