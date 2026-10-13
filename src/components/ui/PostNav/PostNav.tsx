import Link from 'next/link';
import styles from './PostNav.module.scss';
import {ArrowLeft, ArrowRight} from 'lucide-react';

interface NavEntry {
    slug: string;
    title: string;
}

interface PostNavProps {
    prev: NavEntry | null;
    next: NavEntry | null;
    basePath: string;
}

export function PostNav({prev, next, basePath}: PostNavProps) {
    return (
        <nav className={styles.nav} aria-label="Previous and next pages">
            <div className={styles.item}>
                {prev && (
                    <Link href={`${basePath}/${prev.slug}`}>
                        <span className={styles.label}>
                            <ArrowLeft aria-hidden="true" />
                            Previous
                        </span>
                        <span className={styles.title}>{prev.title}</span>
                    </Link>
                )}
            </div>
            <div className={styles.item}>
                {next && (
                    <Link href={`${basePath}/${next.slug}`} className={styles.next}>
                        <span className={styles.label}>
                            Next <ArrowRight aria-hidden="true" />
                        </span>
                        <span className={styles.title}>{next.title}</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
