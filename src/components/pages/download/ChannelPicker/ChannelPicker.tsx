'use client';

import type {ReleaseChannel} from '@/lib/download/downloadConfig';
import {NIGHTLY_RELEASE} from '@/lib/download/nightly';
import clsx from 'clsx';
import {BadgeCheckIcon, ChevronDownIcon, MoonIcon} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import styles from './ChannelPicker.module.scss';

const CHANNELS = {
    stable: {label: 'Stable', icon: BadgeCheckIcon},
    nightly: {label: 'Nightly', icon: MoonIcon},
} satisfies Record<ReleaseChannel, unknown>;

interface ChannelPickerProps {
    channel: ReleaseChannel;
    stableVersion: string;
    onChange?: (channel: ReleaseChannel) => void;
}

function channelClass(channel: ReleaseChannel) {
    return channel === 'stable' ? styles.stable : styles.nightly;
}

function ChannelLabel({channel, version}: {channel: ReleaseChannel; version: string}) {
    const {label, icon: Icon} = CHANNELS[channel];
    return (
        <>
            <Icon aria-hidden="true" />
            {label} (v{version})
        </>
    );
}

export function ChannelPicker({channel, stableVersion, onChange}: ChannelPickerProps) {
    const versions = {stable: stableVersion, nightly: NIGHTLY_RELEASE.version ?? stableVersion};
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const other: ReleaseChannel = channel === 'stable' ? 'nightly' : 'stable';

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (!onChange) {
        return (
            <span className={clsx(styles.tag, channelClass(channel))}>
                <ChannelLabel channel={channel} version={versions[channel]} />
            </span>
        );
    }

    return (
        <div ref={rootRef} className={styles.picker}>
            <button
                type="button"
                className={clsx(styles.tag, channelClass(channel))}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Release channel: ${CHANNELS[channel].label} v${versions[channel]}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <ChannelLabel channel={channel} version={versions[channel]} />
                <span className={styles.separator} aria-hidden="true" />
                <ChevronDownIcon aria-hidden="true" className={clsx(styles.chevron, open && styles.chevronOpen)} />
            </button>

            {open && (
                <div role="menu" className={styles.menu}>
                    <button
                        type="button"
                        role="menuitem"
                        className={clsx(styles.tag, channelClass(other))}
                        onClick={() => {
                            onChange(other);
                            setOpen(false);
                        }}
                    >
                        <ChannelLabel channel={other} version={versions[other]} />
                    </button>
                </div>
            )}
        </div>
    );
}
