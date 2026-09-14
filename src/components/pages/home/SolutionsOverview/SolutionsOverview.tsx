import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {SEO_ENTRY_POINTS} from './SolutionsOverview.data';
import styles from './SolutionsOverview.module.scss';
import {Button} from '@/components/ui/Button/Button';
import clsx from 'clsx';

export function SolutionsOverview() {
    return (
        <section className={clsx(styles.section, ' section')}>
            <header className="section-header">
                <span className="eyebrow">Explore by workflow</span>
                <h2 className="title">Start from what you actually need.</h2>
                <p className="description">Same client, different entry point — pick the one closest to your setup.</p>
            </header>

            <div className={styles.grid}>
                {SEO_ENTRY_POINTS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href} className={styles.card}>
                            <div className={styles.cardCover}>
                                <Icon className={styles.cardIcon} />
                            </div>
                            <div className={styles.cardDetails}>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardExcerpt}>{item.excerpt}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <Button href="/solutions" className={styles.footerLink}>
                Browse all solutions <ArrowRight size={16} />
            </Button>
        </section>
    );
}
