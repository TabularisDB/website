'use client';

import {ChannelPicker} from '@/components/pages/download/ChannelPicker/ChannelPicker';
import {DownloadNotices} from '@/components/pages/download/DownloadNotices/DownloadNotices';
import {DownloadOptions} from '@/components/pages/download/DownloadOptions/DownloadOptions';
import {WebOptions} from '@/components/pages/download/WebOptions/WebOptions';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '@/components/ui/Icons/PlatformIcons';
import {SegmentedControl, type SegmentedOption} from '@/components/ui/SegmentedControl/SegmentedControl';
import {detectPlatform} from '@/lib/download/detectPlatform';
import {ALL_PLATFORMS, getPlatformConfig, type Platform, type ReleaseChannel} from '@/lib/download/downloadConfig';
import {NIGHTLY_RELEASE} from '@/lib/download/nightly';
import {ArrowUpRightIcon, GlobeIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import styles from './DownloadSection.module.scss';

type Target = Platform | 'web';

const SOURCEFORGE_URL = 'https://sourceforge.net/projects/tabularis/files/latest/download';

const TARGETS: SegmentedOption<Target>[] = [
    {value: 'windows', label: 'Windows', icon: WindowsIcon},
    {value: 'macos', label: 'macOS', icon: MacOsIcon},
    {value: 'linux', label: 'Linux', icon: LinuxIcon},
    {value: 'web', label: 'Web', icon: GlobeIcon},
];

function formatReleaseDate(iso: string): string {
    return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

interface DownloadSectionProps {
    stableVersion: string;
    stableDate: string | null;
}

export function DownloadSection({stableVersion, stableDate}: DownloadSectionProps) {
    const [target, setTarget] = useState<Target>('windows');
    const [channel, setChannel] = useState<ReleaseChannel>('stable');
    const isWeb = target === 'web';
    const isNightly = channel === 'nightly' && !isWeb;
    const releaseDate = isNightly ? NIGHTLY_RELEASE.publishedAt : stableDate;

    useEffect(() => {
        const requested = new URLSearchParams(window.location.search).get('platform');
        const fromUrl = TARGETS.find((option) => option.value === requested)?.value;
        const initial = fromUrl ?? detectPlatform();
        if (initial) setTarget(initial);
    }, []);

    return (
        <section className={styles.section} aria-label="Download options">
            <div className={styles.panel}>
                <div className={styles.header}>
                    <SegmentedControl options={TARGETS} value={target} onChange={setTarget} ariaLabel="Platform" />
                    <div className={styles.release}>
                        <ChannelPicker
                            channel={isNightly ? 'nightly' : 'stable'}
                            stableVersion={stableVersion}
                            onChange={isWeb ? undefined : setChannel}
                        />
                        {releaseDate && <span className={styles.date}>{formatReleaseDate(releaseDate)}</span>}
                    </div>
                </div>

                {ALL_PLATFORMS.map((platform) => {
                    const config = getPlatformConfig(platform, isNightly ? 'nightly' : 'stable');
                    return (
                        <div key={platform} hidden={target !== platform} className={styles.options}>
                            <DownloadNotices nightly={isNightly} note={config.note} />
                            <DownloadOptions options={config.options} />
                        </div>
                    );
                })}

                <div hidden={!isWeb} className={styles.options}>
                    <WebOptions />
                </div>
            </div>

            {!isWeb && !isNightly && (
                <p className={styles.mirror}>
                    Prefer a mirror?{' '}
                    <a href={SOURCEFORGE_URL} target="_blank" rel="noopener noreferrer">
                        Download from SourceForge <ArrowUpRightIcon size={14} aria-hidden="true" />
                    </a>
                </p>
            )}
        </section>
    );
}
