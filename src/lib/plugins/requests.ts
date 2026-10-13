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
