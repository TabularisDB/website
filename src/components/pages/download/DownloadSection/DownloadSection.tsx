'use client';

import {useState} from 'react';
import {NIGHTLY_RELEASE} from '@/lib/nightly';
import {VersionPicker, type Channel} from '@/components/pages/download/VersionPicker/VersionPicker';
import {ReleaseInfo} from '@/components/pages/download/ReleaseInfos/ReleaseInfos';
import styles from './DownloadSection.module.scss';
import {AlertCircleIcon} from 'lucide-react';
import {InstallOptions} from '../InstallOptions/InstallOptions';

interface DownloadSectionProps {
    stableVersion: string;
    stableDate: string;
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
    const isNightly = channel === 'nightly';
    const nightlyHash = NIGHTLY_RELEASE.tag.split('-').at(-1)!;

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
                <div>
                    <InstallOptions channel={channel} />
                </div>
            </div>
        </div>
    );
}
