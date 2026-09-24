'use client';

import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {ArrowRight} from 'lucide-react';
import {Platform} from '@/lib/download/downloadConfig';
import {Button} from '../Button/Button';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '../Icons/PlatformIcons';
import styles from './DownloadButton.module.scss';
import {DownloadModal} from '@/components/layout/DownloadModal/DownloadModal';

function detectPlatform(): Platform {
    if (typeof navigator === 'undefined') return 'windows';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    return 'windows';
}

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
        setUserPlatform(detectPlatform());
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
