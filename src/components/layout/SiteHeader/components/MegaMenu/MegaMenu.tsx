import Link from 'next/link';
import clsx from 'clsx';
import {usePathname} from 'next/navigation';
import {NavLinkLabel, type NavColumn} from '../../SiteHeader.data';
import styles from './MegaMenu.module.scss';
import {useHeaderMenu} from '../../HeaderMenuContext';

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
                                    pathname.startsWith(link.href) && styles.active,
                                    link.isLink && styles.link,
                                );
                                const label = <NavLinkLabel label={link.label} badge={link.badge} />;

                                return external ? (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={className}
                                    >
                                        {label}
                                        {link.description && <span>{link.description}</span>}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={className}
                                        onClick={() => setOpenGroupLabel(null)}
                                    >
                                        {label}
                                        {link.description && <span>{link.description}</span>}
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
