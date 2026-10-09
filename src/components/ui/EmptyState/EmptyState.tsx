import type {ReactNode} from 'react';
import styles from './EmptyState.module.scss';

/** Dashed box shown when a list has nothing to display. */
export function EmptyState({title, children}: {title: string; children: ReactNode}) {
    return (
        <div className={styles.empty}>
            <span className={styles.title}>{title}</span>
            <p className={styles.text}>{children}</p>
        </div>
    );
}
