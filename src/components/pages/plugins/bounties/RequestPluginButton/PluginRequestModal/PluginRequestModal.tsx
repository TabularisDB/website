'use client';

import {Button} from '@/components/ui/Button/Button';
import {Modal} from '@/components/ui/Modal/Modal';
import {TABULARIUM_REQUESTS_URL, TABULARIUM_URL} from '@/lib/tabularium';
import clsx from 'clsx';
import {ArrowRight, LightbulbIcon} from 'lucide-react';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import styles from './PluginRequestModal.module.scss';

const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;
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

interface PluginRequestModalProps {
    open: boolean;
    onClose: () => void;
    kinds: PluginRequestKind[];
    /** Draft restored after sign-in; it is sent as soon as the session is confirmed. */
    resume?: PluginRequestDraft | null;
}

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

function savePendingRequest(draft: PluginRequestDraft): boolean {
    try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(draft));
        return true;
    } catch {
        return false;
    }
}

type Session = {state: 'checking'} | {state: 'signed-out'} | {state: 'unreachable'} | {state: 'signed-in'; user: string};

interface CreatedRequest {
    name: string;
    slug: string;
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

/**
 * "Suggest a plugin" form backed by the Tabularium registry API: GET /auth/me for
 * the session, POST /api/requests to add the entry to the community wishlist.
 */
export function PluginRequestModal({open, onClose, kinds, resume}: PluginRequestModalProps) {
    const [session, setSession] = useState<Session>({state: 'checking'});
    const [name, setName] = useState('');
    const [kind, setKind] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<CreatedRequest | null>(null);
    const [autoSubmit, setAutoSubmit] = useState(false);

    const checkSession = useCallback(async () => {
        try {
            const res = await fetch(`${TABULARIUM_URL}/auth/me`, {credentials: 'include'});
            if (!res.ok) {
                setSession({state: 'signed-out'});
                return;
            }
            const me = (await res.json()) as {username: string; displayName?: string};
            setSession({state: 'signed-in', user: me.displayName || me.username});
        } catch {
            setSession({state: 'unreachable'});
        }
    }, []);

    useEffect(() => {
        if (!resume) return;
        setName(resume.name.slice(0, NAME_MAX));
        setKind(kinds.some((k) => k.key === resume.kind) ? resume.kind : '');
        setDescription(resume.description.slice(0, DESCRIPTION_MAX));
        setAutoSubmit(true);
    }, [resume, kinds]);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setCreated(null);
        void checkSession();
    }, [open, checkSession]);

    // Signed out: the registry login sends the visitor back to this page, where
    // the saved draft reopens the modal and is posted once the session is there.
    function signInAndReturn() {
        if (!savePendingRequest({name, kind, description})) {
            setError('Your browser blocked storage, so the form can’t survive sign-in. Sign in to Tabularium first.');
            return;
        }
        const back = window.location.href.split('#')[0];
        window.location.assign(`${TABULARIUM_URL}/login?return_to=${encodeURIComponent(back)}`);
    }

    async function send() {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${TABULARIUM_URL}/api/requests`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name: name.trim(), description: description.trim(), kind}),
            });
            if (res.status === 401) {
                setSession({state: 'signed-out'});
                setError('Your Tabularium session has expired. Sign in again to send the request.');
                return;
            }
            if (!res.ok) {
                setError(await errorMessage(res));
                return;
            }
            setCreated((await res.json()) as CreatedRequest);
            setName('');
            setKind('');
            setDescription('');
        } catch {
            setError('Could not reach the registry. Check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if (!autoSubmit || session.state === 'checking') return;
        setAutoSubmit(false);
        if (session.state === 'signed-in' && name.trim() && kind && description.trim()) void send();
        // `send` reads the current form state; it only has to run once per resumed draft.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSubmit, session.state]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!kind) {
            setError('Pick the kind of plugin.');
            return;
        }
        if (session.state === 'signed-out') signInAndReturn();
        else void send();
    }

    return (
        <Modal open={open} onClose={onClose} title="Suggest a plugin" icon={<LightbulbIcon size={18} />}>
            <div className={styles.body}>
                {created ? (
                    <div className={styles.done}>
                        <p className={styles.lead}>
                            <strong>{created.name}</strong> is on the Tabularium wishlist. The community can now upvote
                            it, and builders can claim it.
                        </p>
                        <div className={styles.actions}>
                            <Button href={TABULARIUM_REQUESTS_URL}>
                                View requests
                                <ArrowRight size={15} />
                            </Button>
                            <Button variant="secondary" onClick={() => setCreated(null)}>
                                Suggest another
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <p className={styles.lead}>
                            Describe what&apos;s missing. Requests go to the{' '}
                            <a href={TABULARIUM_REQUESTS_URL} target="_blank" rel="noopener noreferrer">
                                Tabularium wishlist
                            </a>
                            , where the community votes and builders claim them.
                        </p>

                        <label className={styles.field}>
                            <span className={styles.label}>Plugin name</span>
                            <input
                                className={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. BigQuery driver"
                                maxLength={NAME_MAX}
                                required
                            />
                        </label>

                        {kinds.length > 0 && (
                            <div className={styles.field}>
                                <span className={styles.label}>Kind</span>
                                <div className={styles.kinds} role="radiogroup" aria-label="Kind">
                                    {kinds.map((k) => (
                                        <button
                                            key={k.key}
                                            type="button"
                                            role="radio"
                                            aria-checked={kind === k.key}
                                            title={k.description ?? undefined}
                                            className={clsx(styles.kind, kind === k.key && styles.kindOn)}
                                            onClick={() => {
                                                setKind(k.key);
                                                setError(null);
                                            }}
                                        >
                                            {k.label}
                                        </button>
                                    ))}
                                </div>
                                <span className={styles.hint}>
                                    {kinds.find((k) => k.key === kind)?.description ?? 'Pick the kind of plugin you need.'}
                                </span>
                            </div>
                        )}

                        <label className={styles.field}>
                            <span className={styles.labelRow}>
                                <span className={styles.label}>What should it do?</span>
                                <span className={styles.counter}>
                                    {description.length}/{DESCRIPTION_MAX}
                                </span>
                            </span>
                            <textarea
                                className={styles.input}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="The database or integration, what you'd use it for, and anything a builder should know."
                                maxLength={DESCRIPTION_MAX}
                                rows={5}
                                required
                            />
                        </label>

                        {error && (
                            <p className={styles.error} role="alert">
                                {error}
                            </p>
                        )}

                        <div className={styles.status} aria-live="polite">
                            {session.state === 'checking' && <span>Checking your Tabularium session…</span>}
                            {session.state === 'signed-in' && (
                                <span>
                                    Posting as <strong>{session.user}</strong> on Tabularium.
                                </span>
                            )}
                            {session.state === 'signed-out' && (
                                <span>
                                    You&apos;ll sign in to Tabularium and come straight back here; the request is sent
                                    as soon as you&apos;re signed in.
                                </span>
                            )}
                            {session.state === 'unreachable' && (
                                <span>
                                    The registry can&apos;t be reached from here. You can post the request directly on{' '}
                                    <a href={TABULARIUM_REQUESTS_URL} target="_blank" rel="noopener noreferrer">
                                        Tabularium
                                    </a>
                                    .
                                </span>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <Button
                                type="submit"
                                disabled={submitting || session.state === 'checking' || session.state === 'unreachable'}
                            >
                                {submitting
                                    ? 'Sending…'
                                    : session.state === 'signed-out'
                                      ? 'Sign in & suggest'
                                      : 'Suggest plugin'}
                                {session.state === 'signed-out' && !submitting && <ArrowRight size={15} />}
                            </Button>
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
