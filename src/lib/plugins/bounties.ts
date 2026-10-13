import bountyData from '@/data/pluginBounties.json';

export enum BOUNTY_STATUS {
    MOST_WANTED = 'most-wanted',
    OPEN = 'open',
    SCOPED = 'scoped',
    IN_PROGRESS = 'in-progress',
    COMING_SOON = 'coming-soon',
    SHIPPED = 'shipped',
}

/** Label an admin gives an approved request on Tabularium while nobody has claimed it. */
export type BOARD_STATUS =
    | BOUNTY_STATUS.MOST_WANTED
    | BOUNTY_STATUS.OPEN
    | BOUNTY_STATUS.SCOPED
    | BOUNTY_STATUS.COMING_SOON;

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

export interface BountyClaimer {
    username: string | null;
    displayName: string;
    avatarUrl: string | null;
    repoUrl: string | null;
}

/**
 * A plugin request from Tabularium, approved or shipped, as written by
 * scripts/fetch-app-data.mjs. `id` is the request slug, which is also the id
 * the plugin ships under.
 */
export interface PluginBounty {
    id: string;
    /** Tabularium request id, needed to vote or claim; null until the request exists there. */
    requestId: string | null;
    kind: string | null;
    name: string;
    target: string;
    status: BOUNTY_STATUS;
    boardStatus: BOARD_STATUS;
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
    sponsorUrl: string;
    upvotes: number;
    claimers: BountyClaimer[];
    /** Registry plugin that shipped the request. */
    pluginId: string | null;
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
    [BOUNTY_STATUS.IN_PROGRESS]: 'In Progress',
    [BOUNTY_STATUS.COMING_SOON]: 'Coming Soon',
    [BOUNTY_STATUS.SHIPPED]: 'Shipped',
};

/**
 * A request is shipped once its plugin is in the registry, in progress while
 * anyone has claimed it, and otherwise shows the label its reviewer picked.
 */
export function bountyStatus(boardStatus: BOARD_STATUS, shipped: boolean, claims: number): BOUNTY_STATUS {
    if (shipped) return BOUNTY_STATUS.SHIPPED;
    if (claims > 0) return BOUNTY_STATUS.IN_PROGRESS;
    return boardStatus;
}

export const PLUGIN_BOUNTIES = data.bounties;
export const PLUGIN_BOUNTY_CONSTELLATION_IDS = data.constellationIds;

export function getAllBounties() {
    return PLUGIN_BOUNTIES;
}

export function getActiveBounties() {
    return PLUGIN_BOUNTIES.filter((bounty) => bounty.status !== BOUNTY_STATUS.SHIPPED);
}

export function getShippedBounties() {
    return PLUGIN_BOUNTIES.filter((bounty) => bounty.status === BOUNTY_STATUS.SHIPPED);
}

export function getConstellationBounties(bounties = getActiveBounties()) {
    const ids = new Set(PLUGIN_BOUNTY_CONSTELLATION_IDS);
    return bounties.filter((bounty) => ids.has(bounty.id));
}

export function getFeaturedBounty() {
    return getActiveBounties().find((bounty) => bounty.status === BOUNTY_STATUS.MOST_WANTED);
}

export function getBountyStats() {
    const active = getActiveBounties();
    const shipped = getShippedBounties();
    return {
        activeCount: active.length,
        shippedCount: shipped.length,
        inProgressCount: active.filter((bounty) => bounty.status === BOUNTY_STATUS.IN_PROGRESS).length,
        scopedCount: active.filter((bounty) => bounty.status === BOUNTY_STATUS.SCOPED).length,
    };
}
