import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import type {RelatedLink} from '@/lib/seo/seoRelated';
import styles from './RelatedLinks.module.scss';

interface RelatedLinksProps {
    links: RelatedLink[];
}

export function RelatedLinks({links}: RelatedLinksProps) {
    if (!links || links.length === 0) return null;

    return (
        <section className={styles.section} aria-label={'Explore further'}>
            <h2 className={styles.heading}>Explore further</h2>

            <div className={styles.list}>
                {links.map((link) => (
                    <Link key={link.href} href={link.href} className={styles.item}>
                        <div className={styles.info}>
                            <span className={styles.itemTitle}>{link.label}</span>
                        </div>
                        <ArrowRight size={16} className={styles.icon} />
                    </Link>
                ))}
            </div>
        </section>
    );
}
