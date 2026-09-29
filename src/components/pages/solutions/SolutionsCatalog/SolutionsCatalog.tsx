import {getSeoPagesBySection} from '@/lib/seo/seoPages';
import {CATEGORY_ORDER, getCategoryForSlug, getIconForSlug} from '../Solutions.data';
import {SolutionsGrid} from '../SolutionsGrid/SolutionsGrid';
import styles from './SolutionsCatalog.module.scss';

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

                    <SolutionsGrid
                        items={category.items.map((item) => ({
                            slug: item.slug,
                            href: `/solutions/${item.slug}`,
                            title: item.title,
                            excerpt: item.excerpt,
                            icon: getIconForSlug(item.slug),
                        }))}
                    />
                </div>
            ))}
        </div>
    );
}
