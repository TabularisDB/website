'use client';

import {Button} from '@/components/ui/Button/Button';
import {Modal} from '@/components/ui/Modal/Modal';
import {
    DESCRIPTION_MAX,
    fetchSession,
    NAME_MAX,
    redirectToSignIn,
    savePendingRequest,
    sendPluginRequest,
    type CreatedRequest,
    type PluginRequestDraft,
    type PluginRequestKind,
    type TabulariumSession,
} from '@/lib/plugins/requests';
import {TABULARIUM_REQUESTS_URL} from '@/lib/tabularium';
import clsx from 'clsx';
import {ArrowRight, ArrowUpRight, LightbulbIcon} from 'lucide-react';
import {useEffect, useState, type FormEvent} from 'react';
import styles from './PluginRequestModal.module.scss';

const FORM_ID = 'plugin-request-form';

interface PluginRequestModalProps {
    open: boolean;
    onClose: () => void;
    kinds: PluginRequestKind[];
    /** Draft restored after sign-in; it is sent as soon as the session is confirmed. */
    resume?: PluginRequestDraft | null;
}

/** "Suggest a plugin" form that posts to the Tabularium community wishlist. */
export function PluginRequestModal({open, onClose, kinds, resume}: PluginRequestModalProps) {
    const [session, setSession] = useState<TabulariumSession>({state: 'checking'});
    const [name, setName] = useState('');
    const [kind, setKind] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<CreatedRequest | null>(null);
    const [autoSubmit, setAutoSubmit] = useState(false);

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
        void fetchSession().then(setSession);
    }, [open]);

    async function send() {
        setSubmitting(true);
        setError(null);
        const result = await sendPluginRequest({name, kind, description});
        setSubmitting(false);

        if (!result.ok) {
            if (result.signedOut) setSession({state: 'signed-out'});
            setError(result.error);
            return;
        }

        setCreated(result.request);
        setName('');
        setKind('');
        setDescription('');
    }

    // A draft restored after sign-in is sent once, as soon as the session is known.
    useEffect(() => {
        if (!autoSubmit || session.state === 'checking') return;
        setAutoSubmit(false);
        if (session.state === 'signed-in' && name.trim() && kind && description.trim()) void send();
    }, [autoSubmit, session.state]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!kind) {
            setError('Pick the kind of plugin.');
            return;
        }
        if (session.state !== 'signed-out') {
            void send();
            return;
        }
        // Signed out: the draft survives the sign-in round-trip and is sent on return.
        if (!savePendingRequest({name, kind, description})) {
            setError('Your browser blocked storage, so the form can’t survive sign-in. Sign in to Tabularium first.');
            return;
        }
        redirectToSignIn();
    }

    const selectedKind = kinds.find((k) => k.key === kind);
    const submitLabel = submitting
        ? 'Sending…'
        : session.state === 'signed-out'
          ? 'Sign in & suggest'
          : 'Suggest plugin';

    return (
        <Modal open={open} onClose={onClose} title="Suggest a plugin" icon={<LightbulbIcon size={18} />}>
            <Modal.Body>
                {created ? (
                    <Modal.Text className={styles.lead}>
                        <strong>{created.name}</strong> is on the Tabularium wishlist, waiting for review. Once a
                        maintainer approves it, it shows up on this board, where the community can upvote and claim it.
                    </Modal.Text>
                ) : (
                    <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit}>
                        <Modal.Text className={styles.lead}>
                            Describe what&apos;s missing. Requests go to the{' '}
                            <a href={TABULARIUM_REQUESTS_URL} target="_blank" rel="noopener noreferrer">
                                Tabularium wishlist
                            </a>
                            . A maintainer reviews each one before it becomes a bounty the community can vote on and
                            claim.
                        </Modal.Text>

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
                                    {selectedKind?.description ?? 'Pick the kind of plugin you need.'}
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

                        <SessionStatus session={session} />
                    </form>
                )}
            </Modal.Body>

            <Modal.Actions>
                {created ? (
                    <>
                        <Button variant="secondary" size="sm" onClick={() => setCreated(null)}>
                            Suggest another
                        </Button>
                        <Button href={TABULARIUM_REQUESTS_URL} size="sm">
                            View requests
                            <ArrowUpRight />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form={FORM_ID}
                            size="sm"
                            disabled={submitting || session.state === 'checking' || session.state === 'unreachable'}
                        >
                            {submitLabel}
                            {session.state === 'signed-out' && !submitting && <ArrowRight />}
                        </Button>
                    </>
                )}
            </Modal.Actions>
        </Modal>
    );
}

function SessionStatus({session}: {session: TabulariumSession}) {
    return (
        <div className={styles.status} aria-live="polite">
            {session.state === 'checking' && <span>Checking your Tabularium session…</span>}
            {session.state === 'signed-in' && (
                <span>
                    Posting as <strong>{session.user}</strong> on Tabularium.
                </span>
            )}
            {session.state === 'signed-out' && (
                <span>
                    You&apos;ll sign in to Tabularium and come straight back here; the request is sent as soon as
                    you&apos;re signed in.
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
    );
}
