'use client';

import {DownloadModal} from '@/components/layout/DownloadModal/DownloadModal';
import {detectPlatform} from '@/lib/download/detectPlatform';
import type {Platform} from '@/lib/download/downloadConfig';
import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/Button/Button';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '@/components/ui/Icons/PlatformIcons';
import styles from './DownloadButton.module.scss';

const PLATFORM_LABELS: Record<Platform, string> = {
    windows: 'Windows',
    macos: 'Mac',
    linux: 'Linux',
};

function PlatformIcon({platform}: {platform: Platform}) {
    if (platform === 'windows') return <WindowsIcon />;
    if (platform === 'macos') return <MacOsIcon />;
    return <LinuxIcon />;
}

interface DownloadButtonProps {
    className?: string;
}

export function DownloadButton({className}: DownloadButtonProps) {
    const [userPlatform, setUserPlatform] = useState<Platform>('windows');
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        setUserPlatform(detectPlatform() ?? 'windows');
    }, []);

    return (
        <>
            <Button
                type="button"
                onClick={() => setModalOpen(true)}
                className={clsx(styles.button, className)}
                size="lg"
            >
                <span className={styles.icon}>
                    <PlatformIcon platform={userPlatform} />
                </span>
                <span className={styles.fullLabel}>Download for {PLATFORM_LABELS[userPlatform]}</span>
                <span className={styles.shortLabel}>Download</span>
            </Button>

            <DownloadModal platform={modalOpen ? userPlatform : null} onClose={() => setModalOpen(false)} />
        </>
    );
}
