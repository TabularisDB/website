import {APP_VERSION} from '@/lib/download/version';
import {TABULARIUM_URL} from '@/lib/tabularium';

export const NAME_MAX = 120;
export const DESCRIPTION_MAX = 2000;

// Form kept across the Tabularium sign-in round-trip (same tab, so sessionStorage survives it).
const PENDING_KEY = 'tabularis:plugin-request';

export interface PluginRequestKind {
    key: string;
    label: string;
    description: string | null;
}

export interface PluginRequestDraft {
    name: string;
    kind: string;
    description: string;
}

export interface CreatedRequest {
    name: string;
    slug: string;
}

export type TabulariumSession =
    | {state: 'checking'}
    | {state: 'signed-out'}
    | {state: 'unreachable'}
    | {state: 'signed-in'; user: string};

export type SendResult = {ok: true; request: CreatedRequest} | {ok: false; error: string; signedOut?: boolean};

/** Reads and clears the draft left before the sign-in redirect, so only one caller resumes it. */
export function takePendingRequest(): PluginRequestDraft | null {
    try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        if (!raw) return null;
        sessionStorage.removeItem(PENDING_KEY);
        return JSON.parse(raw) as PluginRequestDraft;
    } catch {
        return null;
    }
}

export function savePendingRequest(draft: PluginRequestDraft): boolean {
    try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(draft));
        return true;
    } catch {
        return false;
    }
}

/** Sends the visitor to the Tabularium login, which returns them to the current page. */
export function redirectToSignIn() {
    const back = window.location.href.split('#')[0];
    window.location.assign(`${TABULARIUM_URL}/login?return_to=${encodeURIComponent(back)}`);
}

export async function fetchSession(): Promise<TabulariumSession> {
    try {
        const res = await fetch(`${TABULARIUM_URL}/auth/me`, {credentials: 'include'});
        if (!res.ok) return {state: 'signed-out'};
        const me = (await res.json()) as {username: string; displayName?: string};
        return {state: 'signed-in', user: me.displayName || me.username};
    } catch {
        return {state: 'unreachable'};
    }
}

async function errorMessage(res: Response): Promise<string> {
    try {
        const body = (await res.json()) as {error?: string};
        if (body.error) return body.error;
    } catch {
        // Non-JSON body: fall through to the generic message.
    }
    if (res.status === 429) return 'Too many requests. Try again later.';
    return `The registry rejected the request (${res.status}).`;
}

/** Adds the draft to the community wishlist (POST /api/requests). */
export async function sendPluginRequest(draft: PluginRequestDraft): Promise<SendResult> {
    try {
        const res = await fetch(`${TABULARIUM_URL}/api/requests`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: draft.name.trim(),
                description: draft.description.trim(),
                kind: draft.kind,
            }),
        });
        if (res.status === 401) {
            return {
                ok: false,
                signedOut: true,
                error: 'Your Tabularium session has expired. Sign in again to send the request.',
            };
        }
        if (!res.ok) return {ok: false, error: await errorMessage(res)};
        return {ok: true, request: (await res.json()) as CreatedRequest};
    } catch {
        return {ok: false, error: 'Could not reach the registry. Check your connection and try again.'};
    }
}

// ---------------------------------------------------------------------------
// Bounty board: live votes and claims, and repository scaffolding.

/** Live state of a request, refreshed in the browser over the baked-in build data. */
export interface LiveRequest {
    id: string;
    slug: string;
    status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
    upvotes: number;
    claims: number;
    claimers: Array<{
        username: string | null;
        displayName: string;
        avatarUrl: string | null;
        repoUrl: string | null;
    }>;
    claimedByMe: boolean;
    votedByMe: boolean;
}

export type BountyAction = 'upvote' | 'claim';

// An upvote or claim clicked while signed out, replayed once the visitor is back from sign-in.
const PENDING_ACTION_KEY = 'tabularis:bounty-action';

export function savePendingAction(action: BountyAction, slug: string): boolean {
    try {
        sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({action, slug}));
        return true;
    } catch {
        return false;
    }
}

export function takePendingAction(): {action: BountyAction; slug: string} | null {
    try {
        const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
        if (!raw) return null;
        sessionStorage.removeItem(PENDING_ACTION_KEY);
        return JSON.parse(raw) as {action: BountyAction; slug: string};
    } catch {
        return null;
    }
}

/** Every public request with the visitor's own votes and claims, or null when the registry is unreachable. */
export async function fetchLiveRequests(): Promise<Map<string, LiveRequest> | null> {
    try {
        const bySlug = new Map<string, LiveRequest>();
        for (let page = 1; page <= 10; page += 1) {
            const res = await fetch(
                `${TABULARIUM_URL}/api/requests?status=approved,fulfilled&limit=100&page=${page}`,
                {credentials: 'include'},
            );
            if (!res.ok) return null;
            const body = (await res.json()) as {total: number; requests: LiveRequest[]};
            // Entries without status or claimers (a registry that predates request review)
            // are skipped, so their bounties keep the build data.
            const valid = body.requests.filter((request) => request.status && Array.isArray(request.claimers));
            if (valid.length < body.requests.length) {
                console.warn(`ignored ${body.requests.length - valid.length} live requests without review data`);
            }
            for (const request of valid) bySlug.set(request.slug, request);
            if (bySlug.size >= body.total || body.requests.length === 0) break;
        }
        return bySlug;
    } catch {
        return null;
    }
}

type ActionResult<T> = {ok: true; data: T} | {ok: false; error: string; signedOut?: boolean; reauthUrl?: string};

async function postAction<T>(path: string, body: unknown = {}): Promise<ActionResult<T>> {
    try {
        const res = await fetch(`${TABULARIUM_URL}${path}`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });
        if (res.status === 401) {
            let reauthUrl: string | undefined;
            try {
                reauthUrl = ((await res.clone().json()) as {reauthUrl?: string}).reauthUrl;
            } catch {
                // No JSON body: a plain signed-out response.
            }
            return {ok: false, signedOut: !reauthUrl, reauthUrl, error: 'Sign in to Tabularium to continue.'};
        }
        if (!res.ok) {
            let reauthUrl: string | undefined;
            let hint: string | undefined;
            try {
                const json = (await res.clone().json()) as {reauthUrl?: string; hint?: string};
                reauthUrl = json.reauthUrl;
                hint = json.hint;
            } catch {
                // Non-JSON body: errorMessage falls back to the status.
            }
            const error = await errorMessage(res);
            return {ok: false, error: hint ? `${error} ${hint}` : error, reauthUrl};
        }
        return {ok: true, data: (await res.json()) as T};
    } catch {
        return {ok: false, error: 'Could not reach the registry. Check your connection and try again.'};
    }
}

export function toggleUpvote(requestId: string) {
    return postAction<{upvotes: number; voted: boolean}>(`/api/requests/${encodeURIComponent(requestId)}/upvote`);
}

export function toggleClaim(requestId: string) {
    return postAction<{claimed: boolean; claims: number; claimers: LiveRequest['claimers']}>(
        `/api/requests/${encodeURIComponent(requestId)}/claim`,
    );
}

export interface ScaffoldOptions {
    repoName: string;
    owner?: string;
    private?: boolean;
    driver?: {dbType: 'network' | 'file' | 'folder' | 'api'; withUi: boolean};
    theme?: {minRuntimeVersion: string};
}

export interface ScaffoldedRepo {
    repoUrl: string;
    fullName: string;
    submitUrl: string;
    claimers: LiveRequest['claimers'];
}

/** Creates the claimer's repository, scaffolded by @tabularis/create-plugin. */
export function scaffoldRepository(requestId: string, options: ScaffoldOptions) {
    return postAction<ScaffoldedRepo>(`/api/requests/${encodeURIComponent(requestId)}/scaffold`, {
        ...options,
        returnTo: window.location.href.split('#')[0],
    });
}

export interface LinkedRepo {
    repoUrl: string;
    fullName: string;
    submitUrl: string;
    claimers: LiveRequest['claimers'];
}

/** Records a repository the claimer already maintains as the work for their claim. */
export function linkRepository(requestId: string, repoUrl: string) {
    return postAction<LinkedRepo>(`/api/requests/${encodeURIComponent(requestId)}/repo`, {
        repoUrl,
        returnTo: window.location.href.split('#')[0],
    });
}

export interface RepoOwner {
    login: string;
    type: 'user' | 'org';
}

/** The visitor's GitHub account first, then their organizations, or null when unavailable. */
export async function fetchRepoOwners(): Promise<RepoOwner[] | null> {
    try {
        const res = await fetch(`${TABULARIUM_URL}/api/submit/owners`, {credentials: 'include'});
        if (!res.ok) return null;
        return ((await res.json()) as {owners: RepoOwner[]}).owners;
    } catch {
        return null;
    }
}

export interface MaintainedRepo {
    fullName: string;
    url: string;
}

/** Repositories the visitor can maintain on their linked accounts (first page of each), as link suggestions. */
export async function fetchMaintainedRepos(): Promise<MaintainedRepo[]> {
    try {
        const res = await fetch(`${TABULARIUM_URL}/api/submit/repos?page=1`, {credentials: 'include'});
        if (!res.ok) return [];
        const body = (await res.json()) as {groups: Array<{repos: MaintainedRepo[]}>};
        return body.groups.flatMap((group) => group.repos.map(({fullName, url}) => ({fullName, url})));
    } catch {
        return [];
    }
}

/** Local alternative to the hosted scaffold, for any forge. */
export function localScaffoldCommand(slug: string, kind: string | null): string {
    return kind === 'theme'
        ? `npx --package @tabularis/create-plugin tabularis-theme scaffold ${slug} --dir ${slug} --min-runtime-version ${APP_VERSION}`
        : `npm create @tabularis/plugin@latest ${slug}`;
}
