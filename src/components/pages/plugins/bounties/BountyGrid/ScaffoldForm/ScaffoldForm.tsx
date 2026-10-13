'use client';

import {useState, type FormEvent} from 'react';
import {ArrowUpRightIcon, CopyIcon, GitBranchIcon, KeyRoundIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import {CopyButton} from '@/components/ui/CopyButton/CopyButton';
import {trackEvent} from '@/lib/analytics';
import {APP_VERSION} from '@/lib/download/version';
import {
    localScaffoldCommand,
    scaffoldRepository,
    type LiveRequest,
    type ScaffoldedRepo,
} from '@/lib/plugins/requests';
import type {BoardBounty} from '../useLiveBounties';
import styles from './ScaffoldForm.module.scss';

// Kinds @tabularis/create-plugin can scaffold a repository for.
const SCAFFOLD_KINDS = new Set(['driver', 'theme']);

interface ScaffoldFormProps {
    bounty: BoardBounty;
    onScaffolded: (claimers: LiveRequest['claimers']) => void;
}

export function ScaffoldForm({bounty, onScaffolded}: ScaffoldFormProps) {
    const isTheme = bounty.kind === 'theme';
    const canScaffold = !!bounty.kind && SCAFFOLD_KINDS.has(bounty.kind) && !!bounty.requestId;
    const [repoName, setRepoName] = useState(bounty.id);
    const [owner, setOwner] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [dbType, setDbType] = useState<'network' | 'file' | 'folder' | 'api'>('network');
    const [withUi, setWithUi] = useState(false);
    const [minRuntimeVersion, setMinRuntimeVersion] = useState(APP_VERSION);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<{message: string; reauthUrl?: string} | null>(null);
    const [created, setCreated] = useState<ScaffoldedRepo | null>(null);
    const command = localScaffoldCommand(bounty.id, bounty.kind);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!bounty.requestId) return;
        setSubmitting(true);
        setError(null);
        const result = await scaffoldRepository(bounty.requestId, {
            repoName: repoName.trim() || bounty.id,
            owner: owner.trim() || undefined,
            private: isPrivate,
            ...(isTheme ? {theme: {minRuntimeVersion: minRuntimeVersion.trim()}} : {driver: {dbType, withUi}}),
        });
        setSubmitting(false);
        if (!result.ok) {
            setError({message: result.error, reauthUrl: result.reauthUrl});
            return;
        }
        trackEvent('Bounty', 'Scaffold', bounty.id);
        setCreated(result.data);
        onScaffolded(result.data.claimers);
    }

    if (created) {
        return (
            <div className={styles.done}>
                <p>
                    <strong>{created.fullName}</strong> is ready. Build the plugin, publish a release, then submit the
                    repository to the registry: the bounty ships as soon as <code>{bounty.id}</code> is listed.
                </p>
                <div className={styles.row}>
                    <Button href={created.repoUrl} external variant="secondary" size="sm">
                        <GitBranchIcon />
                        Open repository
                    </Button>
                    <Button href={created.submitUrl} external size="sm">
                        Submit to the registry
                        <ArrowUpRightIcon />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {canScaffold && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.grid}>
                        <label className={styles.field}>
                            <span className={styles.label}>Repository name</span>
                            <input
                                className={styles.input}
                                value={repoName}
                                onChange={(e) => setRepoName(e.target.value)}
                                pattern="[A-Za-z0-9._\-]{1,100}"
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            <span className={styles.label}>Organization</span>
                            <input
                                className={styles.input}
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                placeholder="Your account"
                                pattern="[A-Za-z0-9\-]{1,39}"
                            />
                        </label>
                        {isTheme ? (
                            <label className={styles.field}>
                                <span className={styles.label}>Minimum Tabularis version</span>
                                <input
                                    className={styles.input}
                                    value={minRuntimeVersion}
                                    onChange={(e) => setMinRuntimeVersion(e.target.value)}
                                    required
                                />
                            </label>
                        ) : (
                            <label className={styles.field}>
                                <span className={styles.label}>Connection type</span>
                                <select
                                    className={styles.input}
                                    value={dbType}
                                    onChange={(e) => setDbType(e.target.value as typeof dbType)}
                                >
                                    <option value="network">Network (host, port, user)</option>
                                    <option value="file">File</option>
                                    <option value="folder">Folder</option>
                                    <option value="api">API (no connection form)</option>
                                </select>
                            </label>
                        )}
                    </div>
                    <div className={styles.row}>
                        {!isTheme && (
                            <label className={styles.check}>
                                <input type="checkbox" checked={withUi} onChange={(e) => setWithUi(e.target.checked)} />
                                Include a UI extension
                            </label>
                        )}
                        <label className={styles.check}>
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                            Private repository
                        </label>
                    </div>
                    {error && (
                        <div className={styles.error} role="alert">
                            <p>{error.message}</p>
                            {error.reauthUrl && (
                                <Button href={error.reauthUrl} size="sm">
                                    <KeyRoundIcon />
                                    Grant access on GitHub
                                </Button>
                            )}
                        </div>
                    )}
                    <Button type="submit" size="sm" disabled={submitting} className={styles.submit}>
                        <GitBranchIcon />
                        {submitting ? 'Creating the repository…' : 'Create the repository'}
                    </Button>
                </form>
            )}
            <div className={styles.local}>
                <span className={styles.hint}>{canScaffold ? 'Or start locally:' : 'Start locally:'}</span>
                <div className={styles.command}>
                    <code>{command}</code>
                    <CopyButton text={command} icon={<CopyIcon />} />
                </div>
            </div>
        </div>
    );
}
