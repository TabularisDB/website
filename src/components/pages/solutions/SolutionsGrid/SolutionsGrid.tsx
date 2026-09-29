import Link from 'next/link';
import type {ReactNode} from 'react';
import styles from './SolutionsGrid.module.scss';

export interface SolutionGridItem {
    slug: string;
    href: string;
    title: string;
    excerpt: string;
    icon: ReactNode;
}

export function SolutionsGrid({items}: {items: SolutionGridItem[]}) {
    return (
        <div className={styles.grid}>
            {items.map((item) => (
                <Link key={item.slug} href={item.href} className={styles.card}>
                    <span className={styles.cardIcon}>{item.icon}</span>

                    <div className={styles.cardDetails}>
                        <span className={styles.cardTitle}>{item.title}</span>
                        <p className={styles.cardExcerpt}>{item.excerpt}</p>
                    </div>

                    <span className={styles.cardLink}>Learn more</span>
                </Link>
            ))}
        </div>
    );
}
