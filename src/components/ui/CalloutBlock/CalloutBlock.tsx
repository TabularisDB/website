import type {ReactNode} from 'react';
import styles from './CalloutBlock.module.scss';

interface CalloutBlockProps {
    title: string;
    children: ReactNode;
    actions?: ReactNode;
}

export function CalloutBlock({title, children, actions}: CalloutBlockProps) {
    return (
        <section className={styles.callout}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{children}</p>
            {actions && <div className={styles.actions}>{actions}</div>}
        </section>
    );
}
