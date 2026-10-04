// components/CompareOverview/CompareOverview.tsx
import {Button} from '@/components/ui/Button/Button';
import {getSeoPagesBySection} from '@/lib/seo/seoPages';
import {ArrowLeftRight, ArrowRight} from 'lucide-react';
import {CompareGrid} from '@/components/pages/compare/CompareGrid/CompareGrid';
import styles from './CompareOverview.module.scss';
import {COMPARE_PREVIEW_MAP} from '@/components/pages/compare/Compare.data';

export function CompareOverview() {
    const comparePages = getSeoPagesBySection('compare')
        .filter((item) => COMPARE_PREVIEW_MAP[item.slug].tools.length === 2)
        .slice(0, 6);

    return (
        <section className="section">
            <header className="section-header">
                <span className="eyebrow">
                    <ArrowLeftRight />
                    Compare
                </span>
                <h1 className="title">Why teams are switching to Tabularis.</h1>
                <p className="description">
                    Notebooks, plugins, and AI-native workflows: see what the others are missing.
                </p>
            </header>

            <div className={styles.gridWrapper}>
                <CompareGrid
                    items={comparePages.map((page) => ({
                        slug: page.slug,
                        href: `/compare/${page.slug}`,
                        title: page.title,
                    }))}
                    variant="highlights"
                />
            </div>

            <Button href="/compare">
                See full comparison
                <ArrowRight size={16} />
            </Button>
        </section>
    );
}
