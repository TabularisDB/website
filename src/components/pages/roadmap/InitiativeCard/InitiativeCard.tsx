import type {InitiativeMeta} from '@/lib/roadmap';
import {ArrowRight} from 'lucide-react';
import Link from 'next/link';
import styles from './InitiativeCard.module.scss';

export function InitiativeCard({meta}: {meta: InitiativeMeta}) {
    return (
        <Link href={`/roadmap/${meta.slug}`} className={styles.card} data-status={meta.status}>
            <div className={styles.cardDetails}>
                {meta.category && <span className={styles.cardScope}>{meta.category}</span>}
                <h3 className={styles.cardTitle}>{meta.title}</h3>
                {meta.lede && <p className={styles.cardExcerpt}>{meta.lede}</p>}
            </div>

            <span className={styles.cardLink}>
                Read details <ArrowRight size={16} />
            </span>
        </Link>
    );
}
