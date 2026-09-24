import Link from 'next/link';
import styles from './Breadcrumbs.module.scss';

interface Crumb {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    crumbs: Crumb[];
}

export function Breadcrumbs({crumbs}: BreadcrumbsProps) {
    if (crumbs.length === 0) return null;

    return (
        <nav className={styles.crumbs} aria-label="Breadcrumb">
            {crumbs.map((crumb, i) => (
                <span key={i} className={styles.item}>
                    <span className={styles.separator}>/</span>
                    {crumb.href ? (
                        <Link href={crumb.href} className={styles.link}>
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className={styles.text}>{crumb.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
