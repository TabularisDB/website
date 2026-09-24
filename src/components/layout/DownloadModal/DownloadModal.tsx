'use client';

import {VersionPicker} from '@/components/pages/download/VersionPicker/VersionPicker';
import {DownloadOptions} from '@/components/pages/download/DownloadOptions/DownloadOptions';
import type {Platform, ReleaseChannel} from '@/lib/downloadConfig';
import {getPlatformConfig} from '@/lib/downloadConfig';
import {NIGHTLY_RELEASE} from '@/lib/nightly';
import {SOCIAL_URLS} from '@/lib/social';
import {APP_VERSION} from '@/lib/version';
import clsx from 'clsx';
import {ArrowRight, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './DownloadModal.module.scss';

export type {Platform} from '@/lib/downloadConfig';

interface DownloadModalProps {
    platform: Platform | null;
    onClose: () => void;
}

export function DownloadModal({platform, onClose}: DownloadModalProps) {
    const open = platform !== null;
    const [channel, setChannel] = useState<ReleaseChannel>('stable');
    const [mounted, setMounted] = useState(false);
    const config = platform ? getPlatformConfig(platform, channel) : null;
    const isNightly = channel === 'nightly';
    const version = isNightly ? (NIGHTLY_RELEASE.version ?? APP_VERSION) : APP_VERSION;

    useEffect(() => setMounted(true), []);
    useEffect(() => setChannel('stable'), [platform]);

    useEffect(() => {
        if (!open || !platform) return;
        const _paq = (window as unknown as {_paq?: unknown[][]})._paq;
        _paq?.push(['trackEvent', 'Download', 'Lead', platform]);
    }, [open, platform]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) onClose();
    }

    const modal = (
        <div className={clsx(styles.overlay, open && styles.open)} onClick={handleOverlayClick} aria-hidden={!open}>
            {config && platform && (
                <div
                    className={styles.modal}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Download for ${config.label}`}
                >
                    <div className={styles.header}>
                        <span className={styles.title}>
                            <img className={styles.logo} src="/img/brand/tabularis-compact.svg" alt="" />
                            Download for {config.label}
                        </span>
                        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
                            <X size={15} />
                        </button>
                    </div>

                    <div className={styles.meta}>
                        <VersionPicker channel={channel} onChannelChange={setChannel} />
                        <span className={styles.versionTag}>v{version}</span>
                        <a
                            className={styles.releasesLink}
                            href={`${SOCIAL_URLS.github}/releases`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {isNightly ? 'View build on GitHub' : 'View changelog'}
                            <ArrowRight size={15} />
                        </a>
                    </div>

                    <div className={styles.body}>
                        {isNightly && (
                            <p className={styles.warning}>
                                Preview build from the latest successful CI run. It may be unstable and does not
                                auto-update through package managers.
                            </p>
                        )}

                        <DownloadOptions options={config.options} note={config.note} />
                    </div>
                </div>
            )}
        </div>
    );

    if (!mounted) return null;

    return createPortal(modal, document.body);
}
