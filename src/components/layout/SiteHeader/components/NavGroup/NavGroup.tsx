import clsx from 'clsx';
import {ChevronDown} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect} from 'react';
import {useHeaderMenu} from '@/components/layout/SiteHeader/HeaderMenuContext';
import {type NavGroup as NavGroupType} from '@/components/layout/SiteHeader/SiteHeader.data';
import {MegaMenu} from '@/components/layout/SiteHeader/components/MegaMenu/MegaMenu';
import styles from './NavGroup.module.scss';

export function NavGroup({group}: {group: NavGroupType}) {
    const pathname = usePathname();
    const {openGroupLabel, setOpenGroupLabel} = useHeaderMenu();
    const isOpen = openGroupLabel === group.label;

    useEffect(() => {
        setOpenGroupLabel(null);
    }, [pathname]);

    if (!group.columns) {
        return (
            <Link href={group.href!} className={styles.navLink}>
                {group.label}
            </Link>
        );
    }

    const openMenu = (): void => {
        if (isOpen) {
            setOpenGroupLabel(null);
        } else {
            setOpenGroupLabel(group.label);
        }
    };

    return (
        <div className={clsx(styles.navGroup, isOpen && styles.open)} onClick={openMenu}>
            <button type="button" className={clsx(styles.navLink)} aria-expanded={isOpen} aria-haspopup="true">
                <span>{group.label}</span>
                <ChevronDown className={styles.chevron} />
            </button>
            <MegaMenu columns={group.columns} open={isOpen} />
        </div>
    );
}
