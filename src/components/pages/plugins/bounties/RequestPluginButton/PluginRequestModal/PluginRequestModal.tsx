'use client';

import {Button} from '@/components/ui/Button/Button';
import {Modal} from '@/components/ui/Modal/Modal';
import {Notice} from '@/components/ui/Notice/Notice';
import {SegmentedControl} from '@/components/ui/SegmentedControl/SegmentedControl';
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
import {ArrowRight, ArrowUpRight, CircleCheckIcon, DatabaseIcon, PaletteIcon} from 'lucide-react';
import {useEffect, useState, type ElementType, type FormEvent} from 'react';
import styles from './PluginRequestModal.module.scss';

const FORM_ID = 'plugin-request-form';

const KIND_ICONS: Record<string, ElementType> = {driver: DatabaseIcon, theme: PaletteIcon};

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
    const defaultKind = kinds.find((k) => k.key === 'driver')?.key ?? kinds[0]?.key ?? '';
    const [name, setName] = useState('');
    const [kind, setKind] = useState(defaultKind);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<CreatedRequest | null>(null);
    const [autoSubmit, setAutoSubmit] = useState(false);

    useEffect(() => {
        if (!resume) return;
        setName(resume.name.slice(0, NAME_MAX));
        setKind(kinds.some((k) => k.key === resume.kind) ? resume.kind : defaultKind);
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
        setKind(defaultKind);
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

    const submitLabel = submitting
        ? 'Sending…'
        : session.state === 'signed-out'
          ? 'Sign in & suggest'
          : 'Suggest plugin';

    return (
        <Modal open={open} onClose={onClose} title="Suggest a plugin">
            <Modal.Body>
                {created ? (
                    <Notice variant="accent" icon={CircleCheckIcon} title={`${created.name} is on the wishlist`}>
                        It&apos;s waiting for review. Once a maintainer approves it, it shows up on this board, where
                        the community can upvote and claim it.
                    </Notice>
                ) : (
                    <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit}>
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
                            <div className={styles.fieldRow}>
                                <span className={styles.label}>Type</span>
                                <SegmentedControl
                                    options={kinds.map((k) => ({
                                        value: k.key,
                                        label: k.label,
                                        icon: KIND_ICONS[k.key],
                                    }))}
                                    value={kind}
                                    onChange={(value) => {
                                        setKind(value);
                                        setError(null);
                                    }}
                                    ariaLabel="Plugin type"
                                />
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
                            <div role="alert">
                                <Notice variant="warning">{error}</Notice>
                            </div>
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
        <div aria-live="polite">
            {session.state === 'checking' && <p className={styles.status}>Checking your Tabularium session…</p>}
            {session.state === 'signed-in' && (
                <p className={styles.status}>
                    Posting as <strong>{session.user}</strong> on Tabularium.
                </p>
            )}
            {session.state === 'signed-out' && (
                <Notice>
                    You&apos;ll sign in to Tabularium and come straight back here; the request is sent as soon as
                    you&apos;re signed in.
                </Notice>
            )}
            {session.state === 'unreachable' && (
                <Notice variant="warning">
                    The registry can&apos;t be reached from here. You can post the request directly on{' '}
                    <a href={TABULARIUM_REQUESTS_URL} target="_blank" rel="noopener noreferrer">
                        Tabularium
                    </a>
                    .
                </Notice>
            )}
        </div>
    );
}
