import clsx from 'clsx';
import {AlertCircleIcon, InfoIcon, SparklesIcon} from 'lucide-react';
import type {ElementType, ReactNode} from 'react';
import styles from './Notice.module.scss';

type Variant = 'info' | 'warning' | 'accent';

const VARIANTS: Record<Variant, {className: string; icon: ElementType}> = {
    info: {className: styles.info, icon: InfoIcon},
    warning: {className: styles.warning, icon: AlertCircleIcon},
    accent: {className: styles.accent, icon: SparklesIcon},
};

interface NoticeProps {
    variant?: Variant;
    title?: string;
    icon?: ElementType;
    children: ReactNode;
    className?: string;
}

export function Notice({variant = 'info', title, icon, children, className}: NoticeProps) {
    const Icon = icon ?? VARIANTS[variant].icon;

    return (
        <div className={clsx(styles.notice, VARIANTS[variant].className, className)}>
            <Icon size={16} aria-hidden="true" />
            <div className={styles.content}>
                {title && <p className={styles.title}>{title}</p>}
                <p>{children}</p>
            </div>
        </div>
    );
}
