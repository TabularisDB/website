import clsx from 'clsx';
import {XIcon} from 'lucide-react';
import styles from './CloseButton.module.scss';

interface CloseButtonProps {
    onClick: () => void;
    label?: string;
    size?: 'sm' | 'md';
    tone?: 'default' | 'onDark';
    className?: string;
}

export function CloseButton({onClick, label = 'Close', size = 'md', tone = 'default', className}: CloseButtonProps) {
    return (
        <button
            type="button"
            className={clsx(styles.close, size === 'sm' && styles.sm, tone === 'onDark' && styles.onDark, className)}
            onClick={onClick}
            aria-label={label}
        >
            <XIcon aria-hidden="true" />
        </button>
    );
}
