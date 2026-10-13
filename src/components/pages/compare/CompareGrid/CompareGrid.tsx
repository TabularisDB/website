import clsx from 'clsx';
import Image from 'next/image';
import {Fragment} from 'react';
import {CheckCircle2} from 'lucide-react';
import {getProduct} from '@/lib/compare/products';
import {COMPARE_PREVIEW_MAP} from '@/components/pages/compare/Compare.data';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import styles from './CompareGrid.module.scss';

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
    return <Image src={product.logo} alt={product.name} width={44} height={44} className={styles.logo} />;
}

function Tools({tools}: {tools: string[]}) {
    return (
        <span className={styles.tools}>
            {tools.map((tool, index) => (
                <Fragment key={tool}>
                    {index > 0 && <span className="divider" />}
                    <ProductLogo id={tool} />
                </Fragment>
            ))}
        </span>
    );
}

export function CompareGrid({items, variant = 'accent'}: CompareGridProps) {
    return (
        <CardGrid variant="joined">
            {items.map((item) => {
                const preview = COMPARE_PREVIEW_MAP[item.slug];
                const ariaLabel = `See comparison: ${item.title}`;

                if (variant === 'highlights') {
                    return (
                        <Card key={item.slug} className={styles.centered}>
                            <Card.Header icon={<Tools tools={preview.tools} />} />
                            {preview.highlights && (
                                <ul className={styles.highlights}>
                                    {preview.highlights.map((point) => (
                                        <li key={point}>
                                            <CheckCircle2 aria-hidden="true" className={styles.highlightIcon} />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <Card.Link href={item.href} ariaLabel={ariaLabel} />
                        </Card>
                    );
                }

                return (
                    <Card key={item.slug} className={clsx(styles.centered, styles.accentCard)}>
                        <Card.Header icon={<Tools tools={preview.tools} />} />
                        <Card.Description>{preview.accent}</Card.Description>
                        <Card.Link href={item.href} ariaLabel={ariaLabel}>
                            See comparison
                        </Card.Link>
                    </Card>
                );
            })}
        </CardGrid>
    );
}
