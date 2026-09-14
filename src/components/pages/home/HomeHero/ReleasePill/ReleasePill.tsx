import {formatBlogTitle, getAllPosts} from '@/lib/blog/posts';
import {ArrowRight} from 'lucide-react';
import styles from './ReleasePill.module.scss';
import Link from 'next/link';

export function ReleasePill() {
    const latestBlog = getAllPosts()[0];

    return (
        <Link href={latestBlog.slug} className={styles.pill}>
            <div className={styles.tag}>NEW</div>
            <span className={styles.title}>{formatBlogTitle(latestBlog)}</span>
            <ArrowRight />
        </Link>
    );
}
