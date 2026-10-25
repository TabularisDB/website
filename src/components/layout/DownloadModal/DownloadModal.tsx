'use client';

import {ChannelPicker} from '@/components/pages/download/ChannelPicker/ChannelPicker';
import {DownloadNotices} from '@/components/pages/download/DownloadNotices/DownloadNotices';
import {DownloadOptions} from '@/components/pages/download/DownloadOptions/DownloadOptions';
import {Modal} from '@/components/ui/Modal/Modal';
import type {Platform, ReleaseChannel} from '@/lib/download/downloadConfig';
import {getPlatformConfig} from '@/lib/download/downloadConfig';
import {APP_VERSION} from '@/lib/download/version';
import {ArrowRightIcon} from 'lucide-react';
import Image from 'next/image';
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

    useEffect(() => {
        if (!platform) return;
        setChannel('stable');
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
                    src="/img/tabularis-app-icon.svg"
                    alt=""
                    width={32}
                    height={32}
                    loading="eager"
                />
            }
        >
            {config && (
                <>
                    <Modal.Body className={styles.body}>
                        <ChannelPicker channel={channel} stableVersion={APP_VERSION} onChange={setChannel} />
                        <DownloadNotices nightly={channel === 'nightly'} note={config.note} />
                        <DownloadOptions options={config.options} />
                    </Modal.Body>

                    <Modal.Actions>
                        <Link href="/download?platform=web" className={styles.more} onClick={onClose}>
                            Use Tabularis in your browser <ArrowRightIcon size={14} aria-hidden="true" />
                        </Link>
                    </Modal.Actions>
                </>
            )}
        </Modal>
    );
}
