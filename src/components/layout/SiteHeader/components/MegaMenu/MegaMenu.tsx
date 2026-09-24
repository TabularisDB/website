import Link from 'next/link';
import clsx from 'clsx';
import {usePathname} from 'next/navigation';
import {NavLinkLabel, type NavColumn} from '../../SiteHeader.data';
import styles from './MegaMenu.module.scss';
import {useHeaderMenu} from '../../HeaderMenuContext';
import {ArrowRight} from 'lucide-react';

interface MegaMenuProps {
    columns: NavColumn[];
    open: boolean;
}
export function MegaMenu({columns, open}: MegaMenuProps) {
    const pathname = usePathname();
    const {setOpenGroupLabel} = useHeaderMenu();

    return (
        <>
            <div className={clsx(styles.overlay, open && styles.open)} onClick={() => setOpenGroupLabel(null)} />
            <div className={clsx(styles.megaMenuWrapper, open && styles.open)}>
                <div className={clsx(styles.megaMenu)}>
                    {columns.map((column, i) => (
                        <div key={column.title ?? i} className={styles.megaMenuColumn}>
                            {column.title && <span className={styles.megaMenuTitle}>{column.title}</span>}
                            {column.links.map((link) => {
                                const external = link.href.startsWith('http');
                                const className = clsx(
                                    styles.megaMenuLink,
                                    pathname === link.href && styles.active,
                                    link.isLink && styles.link,
                                );
                                const content = (
                                    <>
                                        {link.icon && <span className={styles.megaMenuLinkIcon}>{link.icon}</span>}
                                        <span className={styles.megaMenuLinkText}>
                                            <NavLinkLabel label={link.label} badge={link.badge} />
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
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={className}
                                        onClick={() => setOpenGroupLabel(null)}
                                    >
                                        {content}
                                        {link.isLink && <ArrowRight size={16} />}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
