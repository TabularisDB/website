import clsx from 'clsx';
import type {CSSProperties, ReactNode} from 'react';
import styles from './CardGrid.module.scss';

interface CardGridProps {
    children: ReactNode;
    variant?: 'joined' | 'spaced';
    minWidth?: number;
    className?: string;
}

export function CardGrid({children, variant = 'spaced', minWidth, className}: CardGridProps) {
    const style = minWidth ? ({'--min-width': `${minWidth}px`} as CSSProperties) : undefined;

    return (
        <div className={clsx(styles.grid, variant === 'joined' && styles.joined, className)} style={style}>
            {children}
        </div>
    );
}
