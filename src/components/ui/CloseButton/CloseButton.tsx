import clsx from 'clsx';
import {XIcon} from 'lucide-react';
import styles from './CloseButton.module.scss';

interface CloseButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

export function CloseButton({onClick, label = 'Close', className}: CloseButtonProps) {
    return (
        <button type="button" className={clsx(styles.close, className)} onClick={onClick} aria-label={label}>
            <XIcon aria-hidden="true" />
        </button>
    );
}
