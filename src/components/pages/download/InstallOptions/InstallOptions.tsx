'use client';

import {useEffect, useState} from 'react';
import {ALL_PLATFORMS, getPlatformConfig, type Platform, type ReleaseChannel} from '@/lib/downloadConfig';
import {LinuxIcon, MacOsIcon, WindowsIcon} from '@/components/ui/Icons/PlatformIcons';
import styles from './InstallOptions.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {AlertCircleIcon} from 'lucide-react';
import {CopyButton} from './CopyButton/CopyButton';

const ICONS = {linux: <LinuxIcon />, windows: <WindowsIcon />, macos: <MacOsIcon />};

interface InstallOptionsProps {
    channel: ReleaseChannel;
}

function detectPlatform(): Platform | null {
    const ua = navigator.userAgent;
    if (/Mac/i.test(ua)) return 'macos';
    if (/Win/i.test(ua)) return 'windows';
    if (/Linux/i.test(ua)) return 'linux';
    return null;
}

export function InstallOptions({channel}: InstallOptionsProps) {
    const [detected, setDetected] = useState<Platform | null>(null);

    useEffect(() => {
        setDetected(detectPlatform());
    }, []);

    const platforms = detected
        ? [detected, ...ALL_PLATFORMS.filter((platform) => platform !== detected)]
        : ALL_PLATFORMS;

    return (
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
                        <div className={styles.optionList}>
                            {config.options.map((option) =>
                                option.kind === 'command' ? (
                                    <div key={option.label} className={styles.commandOption}>
                                        <div className={styles.optionInfo}>
                                            <span className={styles.optionLabel}>{option.label}</span>
                                        </div>
                                        {(Array.isArray(option.command) ? option.command : [option.command]).map(
                                            (cmd) => (
                                                <div key={cmd} className={styles.commandRow}>
                                                    <code className={styles.commandText}>{cmd}</code>
                                                    <CopyButton text={cmd} />
                                                </div>
                                            ),
                                        )}
                                        {option.warning && (
                                            <p className={styles.optionWarning}>
                                                {option.warning.text}{' '}
                                                <a href={option.warning.href}>{option.warning.linkText}</a>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div key={option.label} className={styles.fileOption}>
                                        <div className={styles.optionInfo}>
                                            <span className={styles.optionLabel}>{option.label}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            href={`/download/thank-you?url=${encodeURIComponent(option.url)}`}
                                        >
                                            {option.ext}
                                        </Button>
                                    </div>
                                ),
                            )}
                            {config.note && (
                                <div className={styles.platformNote}>
                                    <span>
                                        <AlertCircleIcon size={16} /> {config.note.text}
                                    </span>
                                    {config.note.command && <code>{config.note.command}</code>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
