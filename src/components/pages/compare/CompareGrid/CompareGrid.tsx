import {getProduct} from '@/lib/compare/products';
import Link from 'next/link';
import {COMPARE_PREVIEW_MAP} from '../Compare.data';
import styles from './CompareGrid.module.scss';
import {CheckCircle2} from 'lucide-react';

export interface CompareGridItem {
    slug: string;
    href: string;
    title: string;
}

export interface CompareGridProps {
    items: CompareGridItem[];
    variant?: 'accent' | 'highlights';
}

function ProductLogo({id}: {id: string}) {
    const product = getProduct(id);
    if (!product) {
        return <span className={styles.logoFallback}>{id}</span>;
    }
    return <img src={product.logo} alt={product.name} className={styles.logo} />;
}

export function CompareGrid({items, variant = 'accent'}: CompareGridProps) {
    return (
        <div className={styles.grid}>
            {items.map((item) => {
                const preview = COMPARE_PREVIEW_MAP[item.slug];

                return (
                    <Link key={item.slug} href={item.href} className={styles.card} aria-label={item.title}>
                        <div className={styles.tools}>
                            {preview.tools.map((tool, index) => (
                                <>
                                    {index > 0 && <div key={`divider-${tool}`} className="divider" />}
                                    <ProductLogo key={tool} id={tool} />
                                </>
                            ))}
                        </div>

                        {variant === 'highlights' && preview.highlights && (
                            <ul className={styles.highlights}>
                                {preview.highlights.map((point) => (
                                    <li key={point}>
                                        <CheckCircle2 size={18} className={styles.highlightIcon} />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {variant === 'accent' && <span className={styles.accent}>{preview.accent}</span>}
                    </Link>
                );
            })}
        </div>
    );
}
