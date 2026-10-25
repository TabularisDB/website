import clsx from 'clsx';
import {AlertCircleIcon, InfoIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import styles from './Notice.module.scss';

interface NoticeProps {
    variant?: 'info' | 'warning';
    children: ReactNode;
    className?: string;
}

export function Notice({variant = 'info', children, className}: NoticeProps) {
    const Icon = variant === 'warning' ? AlertCircleIcon : InfoIcon;

    return (
        <div className={clsx(styles.notice, variant === 'warning' ? styles.warning : styles.info, className)}>
            <Icon size={16} aria-hidden="true" />
            <p>{children}</p>
        </div>
    );
}
