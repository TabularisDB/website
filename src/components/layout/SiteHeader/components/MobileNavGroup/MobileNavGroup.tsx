'use client';

import Link from 'next/link';
import clsx from 'clsx';
import {usePathname} from 'next/navigation';
import {NavLinkLabel, isActive, type NavGroup} from '../../SiteHeader.data';
import styles from './MobileNavGroup.module.scss';
import {ArrowRight, ChevronDown} from 'lucide-react';
interface MobileNavGroupProps {
    group: NavGroup;
    onNavigate: () => void;
}

export function MobileNavGroup({group, onNavigate}: MobileNavGroupProps) {
    const pathname = usePathname();
    const active = isActive(pathname, group);

    if (!group.columns) {
        return (
            <Link href={group.href!} className={clsx(styles.link, active && styles.active)} onClick={onNavigate}>
                {group.label}
            </Link>
        );
    }

    return (
        <details className={clsx(styles.group, active && styles.active)}>
            <summary className={styles.summary}>
                <span>{group.label}</span>
                <ChevronDown className={styles.chevron} />
            </summary>
            <div className={styles.body}>
                {group.columns.map((row, i) => (
                    <div key={row.title ?? i} className={styles.row}>
                        {row.title && <span className={styles.rowTitle}>{row.title}</span>}
                        {row.links.map((link) => {
                            const external = link.href.startsWith('http');
                            const className = clsx(
                                styles.subLink,
                                !external && pathname.startsWith(link.href) && styles.active,
                                link.isLink && styles.link,
                            );
                            const label = <NavLinkLabel label={link.label} badge={link.badge} />;
                            const content = (
                                <>
                                    {link.icon && <span className={styles.subLinkIcon}>{link.icon}</span>}
                                    <span className={styles.subLinkText}>
                                        {label}
                                        {link.description && <span>{link.description}</span>}
                                    </span>
                                </>
                            );

                            return external ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={className}
                                    onClick={onNavigate}
                                >
                                    {content}
                                </a>
                            ) : (
                                <Link key={link.href} href={link.href} className={className} onClick={onNavigate}>
                                    {content}
                                    {link.isLink && <ArrowRight size={16} />}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </details>
    );
}
