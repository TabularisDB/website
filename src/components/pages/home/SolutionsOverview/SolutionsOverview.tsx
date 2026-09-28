import {Button} from '@/components/ui/Button/Button';
import {getSeoPagesBySection} from '@/lib/seo/seoPages';
import {ArrowRight, LayersIcon} from 'lucide-react';
import {getIconForSlug} from '../../solutions/Solutions.data';
import {SolutionsGrid} from '../../solutions/SolutionsGrid/SolutionsGrid';
import {FEATURED_SOLUTION_SLUGS} from './SolutionsOverview.data';
import styles from './SolutionsOverview.module.scss';

export function SolutionsOverview() {
    const solutionsPages = getSeoPagesBySection('solutions');

    const items = FEATURED_SOLUTION_SLUGS.map((slug) => {
        const page = solutionsPages.find((p) => p.slug === slug)!;
        return {
            slug: page.slug,
            href: `/solutions/${page.slug}`,
            title: page.title,
            excerpt: page.excerpt,
            icon: getIconForSlug(page.slug),
        };
    });

    return (
        <section className="section">
            <header className="section-header">
                <span className="eyebrow">
                    <LayersIcon />
                    Solutions
                </span>
                <h2 className="title">Start from what you actually need.</h2>
                <p className="description">Same client, different entry point — pick the one closest to your setup.</p>
            </header>

            <div className={styles.gridWrapper}>
                <SolutionsGrid items={items} />
            </div>

            <Button href="/solutions" className={styles.footerLink}>
                Browse all solutions <ArrowRight size={16} />
            </Button>
        </section>
    );
}
