import {getSeoPagesBySection} from '@/lib/seo/seoPages';
import {CATEGORY_ORDER, getCategoryForSlug, getIconForSlug} from './SolutionsCatalog.config';
import styles from './SolutionsCatalog.module.scss';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';

export function SolutionsCatalog() {
    const pages = getSeoPagesBySection('solutions');

    const grouped = CATEGORY_ORDER.map((categoryTitle) => ({
        title: categoryTitle,
        items: pages
            .filter((page) => getCategoryForSlug(page.slug) === categoryTitle)
            .sort((a, b) => a.order - b.order),
    })).filter((group) => group.items.length > 0);

    return (
        <div className={styles.categoriesWrapper}>
            {grouped.map((category) => (
                <div key={category.title} className={styles.category}>
                    <h3 className={styles.categoryTitle}>{category.title}</h3>

                    <div className={styles.grid}>
                        {category.items.map((item) => {
                            const Icon = getIconForSlug(item.slug);
                            return (
                                <Link key={item.slug} href={`/solutions/${item.slug}`} className={styles.card}>
                                    <div className={styles.cardCover}>
                                        <Icon className={styles.cardIcon} />
                                    </div>

                                    <div className={styles.cardDetails}>
                                        <h4 className={styles.cardTitle}>{item.title}</h4>
                                        <p className={styles.cardExcerpt}>{item.excerpt}</p>

                                        {(item.audience || item.useCase) && (
                                            <div className={styles.cardTags}>
                                                {item.audience && <span className={styles.tag}>{item.audience}</span>}
                                                {item.useCase && <span className={styles.tag}>{item.useCase}</span>}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className={styles.transitionBlock}>
                <h3 className={styles.transitionTitle}>Need a different workflow?</h3>
                <p className={styles.transitionText}>
                    These pages are organized by real use case. If you're evaluating tools instead of workflows, go to
                    the comparison pages next.
                </p>
                <Button href="/compare">
                    Browse comparisons <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );
}
