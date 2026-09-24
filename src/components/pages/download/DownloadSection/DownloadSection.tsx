'use client';

import {ReleaseInfo} from '@/components/pages/download/ReleaseInfos/ReleaseInfos';
import {VersionPicker, type Channel} from '@/components/pages/download/VersionPicker/VersionPicker';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '@/components/ui/Icons/PlatformIcons';
import {ALL_PLATFORMS, getPlatformConfig, Platform} from '@/lib/downloadConfig';
import {NIGHTLY_RELEASE} from '@/lib/nightly';
import {useEffect, useState} from 'react';
import styles from './DownloadSection.module.scss';
import {DownloadOptions} from '../DownloadOptions/DownloadOptions';

const ICONS = {linux: <LinuxIcon />, windows: <WindowsIcon />, macos: <MacOsIcon />};

interface DownloadSectionProps {
    stableVersion: string;
    stableDate: string;
}

function detectPlatform(): Platform | null {
    const ua = navigator.userAgent;
    if (/Mac/i.test(ua)) return 'macos';
    if (/Win/i.test(ua)) return 'windows';
    if (/Linux/i.test(ua)) return 'linux';
    return null;
}

function formatReleaseDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

export function DownloadSection({stableVersion, stableDate}: DownloadSectionProps) {
    const [channel, setChannel] = useState<Channel>('stable');
    const [detected, setDetected] = useState<Platform | null>(null);
    const isNightly = channel === 'nightly';
    const nightlyHash = NIGHTLY_RELEASE.tag.split('-').at(-1)!;

    useEffect(() => {
        setDetected(detectPlatform());
    }, []);

    const platforms = detected
        ? [detected, ...ALL_PLATFORMS.filter((platform) => platform !== detected)]
        : ALL_PLATFORMS;

    return (
        <div className={styles.section}>
            <VersionPicker channel={channel} onChannelChange={setChannel} />

            <div className={styles.content}>
                <div className={styles.releaseInfos}>
                    <ReleaseInfo
                        version={isNightly ? (NIGHTLY_RELEASE.version ?? stableVersion) : stableVersion}
                        date={isNightly ? formatReleaseDate(NIGHTLY_RELEASE.publishedAt) : stableDate}
                        hash={isNightly ? nightlyHash : undefined}
                        hrefLabel={isNightly ? 'View build on GitHub' : 'View changelog'}
                        hrefLink={isNightly ? NIGHTLY_RELEASE.url : '/changelog'}
                        external={isNightly}
                    />

                    {isNightly && (
                        <p className={styles.warning}>
                            Preview build from the latest successful CI run. It may be unstable and does not auto-update
                            through package managers.
                        </p>
                    )}
                </div>
                <div className={styles.platformList}>
                    {platforms.map((platform) => {
                        const config = getPlatformConfig(platform, channel);
                        return (
                            <div key={platform} className={styles.platformSection}>
                                <h3 className={styles.platformHeading}>
                                    {ICONS[platform]}
                                    {config.label}
                                    {platform === detected && <span className={styles.detectedBadge}>Your OS</span>}
                                </h3>
                                <DownloadOptions options={config.options} note={config.note} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
