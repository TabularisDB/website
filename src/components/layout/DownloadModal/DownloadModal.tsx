'use client';

import {Modal} from '@/components/ui/Modal/Modal';
import Image from 'next/image';
import {DownloadOptions} from '@/components/pages/download/DownloadOptions/DownloadOptions';
import {VersionPicker} from '@/components/pages/download/VersionPicker/VersionPicker';
import type {Platform, ReleaseChannel} from '@/lib/download/downloadConfig';
import {getPlatformConfig} from '@/lib/download/downloadConfig';
import {NIGHTLY_RELEASE} from '@/lib/download/nightly';
import {APP_VERSION} from '@/lib/download/version';
import {SOCIAL_URLS} from '@/lib/social';
import {ArrowRight} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import styles from './DownloadModal.module.scss';

interface DownloadModalProps {
    platform: Platform | null;
    onClose: () => void;
}

export function DownloadModal({platform, onClose}: DownloadModalProps) {
    const [channel, setChannel] = useState<ReleaseChannel>('stable');
    const config = platform ? getPlatformConfig(platform, channel) : null;
    const isNightly = channel === 'nightly';
    const version = isNightly ? (NIGHTLY_RELEASE.version ?? APP_VERSION) : APP_VERSION;

    useEffect(() => setChannel('stable'), [platform]);

    useEffect(() => {
        if (!platform) return;
        const _paq = (window as unknown as {_paq?: unknown[][]})._paq;
        _paq?.push(['trackEvent', 'Download', 'Lead', platform]);
    }, [platform]);

    return (
        <Modal
            open={config !== null}
            onClose={onClose}
            title={config ? `Download for ${config.label}` : ''}
            icon={
                <Image
                    className={styles.logo}
                    src="/img/brand/tabularis-icon-color.svg"
                    alt=""
                    width={32}
                    height={32}
                    loading="eager"
                />
            }
        >
            {config && (
                <>
                    <div className={styles.meta}>
                        <VersionPicker channel={channel} onChannelChange={setChannel} />
                        <span className={styles.versionTag}>v{version}</span>
                        {isNightly ? (
                            <a
                                className={styles.releasesLink}
                                href={`${SOCIAL_URLS.github}/releases`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View build on GitHub
                                <ArrowRight size={15} />
                            </a>
                        ) : (
                            <Link href="/changelog" className={styles.releasesLink}>
                                View changelog <ArrowRight size={15} />
                            </Link>
                        )}
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
                </>
            )}
        </Modal>
    );
}
