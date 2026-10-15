import clsx from 'clsx';
import {XIcon} from 'lucide-react';
import styles from './CloseButton.module.scss';

interface CloseButtonProps {
    onClick: () => void;
    label?: string;
    size?: 'sm' | 'md';
    className?: string;
}

export function CloseButton({onClick, label = 'Close', size = 'md', className}: CloseButtonProps) {
    return (
        <button
            type="button"
            className={clsx(styles.close, size === 'sm' && styles.sm, className)}
            onClick={onClick}
            aria-label={label}
        >
            <XIcon aria-hidden="true" />
        </button>
    );
}
