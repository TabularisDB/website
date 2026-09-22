'use client';

import clsx from 'clsx';
import styles from './VersionPicker.module.scss';

export type Channel = 'stable' | 'nightly';

interface VersionPickerProps {
    channel: Channel;
    onChannelChange: (channel: Channel) => void;
}

export function VersionPicker({channel, onChannelChange}: VersionPickerProps) {
    return (
        <div className={styles.toggle} role="tablist" aria-label="Release channel">
            <button
                type="button"
                role="tab"
                aria-selected={channel === 'stable'}
                className={clsx(styles.segment, channel === 'stable' && styles.active)}
                onClick={() => onChannelChange('stable')}
            >
                <span className={styles.label}>Stable</span>
            </button>

            <button
                type="button"
                role="tab"
                aria-selected={channel === 'nightly'}
                className={clsx(styles.segment, channel === 'nightly' && styles.active)}
                onClick={() => onChannelChange('nightly')}
            >
                <span className={styles.label}>Nightly</span>
            </button>
        </div>
    );
}
