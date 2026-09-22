'use client';

import {Platform} from '@/lib/download/downloadConfig';
import {useEffect, useState} from 'react';
import {Button} from '../Button/Button';
import styles from './DownloadButton.module.scss';
import {ArrowRight} from 'lucide-react';
import clsx from 'clsx';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '../Icons/PlatformIcons';

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
    if (platform === 'linux') {
        return <LinuxIcon />;
    }

    return '';
}

interface DownloadButtonProps {
    className?: string;
}

export function DownloadButton({className}: DownloadButtonProps) {
    const [userPlatform, setUserPlatform] = useState<Platform>('windows');

    useEffect(() => {
        setUserPlatform(detectPlatform());
    }, []);

    return (
        <Button href="/download" className={clsx(styles.button, className)} size="lg">
            <span className={styles.icon}>
                <PlatformIcon platform={userPlatform} />
            </span>
            <span className={styles.fullLabel}>Download for {PLATFORM_LABELS[userPlatform]}</span>
            <span className={styles.shortLabel}>Download</span>
            <ArrowRight />
        </Button>
    );
}
