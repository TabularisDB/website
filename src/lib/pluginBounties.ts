import bountyData from '@/data/pluginBounties.json';

export enum BOUNTY_STATUS {
    MOST_WANTED = 'most-wanted',
    OPEN = 'open',
    SCOPED = 'scoped',
    CLAIMED = 'claimed',
    COMING_SOON = 'coming-soon',
    SHIPPED = 'shipped',
}

export enum BOUNTY_DIFFICULTY {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    EXTREME = 'Extreme',
}

export enum CAPABILITY_STATE {
    READY = 'ready',
    NEEDED = 'needed',
    STRETCH = 'stretch',
}

export interface BountyCapability {
    label: string;
    state: CAPABILITY_STATE;
}

export interface PluginBounty {
    id: string;
    name: string;
    target: string;
    status: BOUNTY_STATUS;
    tagline: string;
    description: string;
    stage: string;
    nextStep: string;
    difficulty: BOUNTY_DIFFICULTY;
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

export const BOUNTY_STATUS_LABEL: Record<BOUNTY_STATUS, string> = {
    [BOUNTY_STATUS.MOST_WANTED]: 'Most Wanted',
    [BOUNTY_STATUS.OPEN]: 'Open',
    [BOUNTY_STATUS.SCOPED]: 'Scoped',
    [BOUNTY_STATUS.CLAIMED]: 'Claimed',
    [BOUNTY_STATUS.COMING_SOON]: 'Coming Soon',
    [BOUNTY_STATUS.SHIPPED]: 'Shipped',
};

export const PLUGIN_BOUNTIES = data.bounties;
export const PLUGIN_BOUNTY_CONSTELLATION_IDS = data.constellationIds;

export function getAllBounties() {
    return PLUGIN_BOUNTIES;
}

export function getActiveBounties() {
    return PLUGIN_BOUNTIES.filter((bounty) => bounty.status !== BOUNTY_STATUS.SHIPPED);
}

export function getShippedBounties() {
    console.log(PLUGIN_BOUNTIES.filter((bounty) => bounty.status === BOUNTY_STATUS.SHIPPED));

    return PLUGIN_BOUNTIES.filter((bounty) => bounty.status === BOUNTY_STATUS.SHIPPED);
}

export function getConstellationBounties(bounties = getActiveBounties()) {
    const ids = new Set(PLUGIN_BOUNTY_CONSTELLATION_IDS);
    return bounties.filter((bounty) => ids.has(bounty.id));
}

export function getFeaturedBounty() {
    return getActiveBounties().find((bounty) => bounty.status === 'most-wanted');
}

export function getBountyStats() {
    const active = getActiveBounties();
    const shipped = getShippedBounties();
    return {
        activeCount: active.length,
        shippedCount: shipped.length,
        claimedCount: active.filter((bounty) => bounty.status === 'claimed').length,
        scopedCount: active.filter((bounty) => bounty.status === 'scoped').length,
    };
}
