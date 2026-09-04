import {getLatestReleaseTitle} from '@/lib/blog/posts';
import {ArrowRight} from 'lucide-react';
import styles from './ReleasePill.module.scss';

export function ReleasePill() {
    return (
        <div className={styles.pill}>
            <div className={styles.tag}>NEW</div>
            <span className={styles.title}>{getLatestReleaseTitle()}</span>
            <ArrowRight />
        </div>
    );
}
