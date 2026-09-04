import Link from 'next/link';
import clsx from 'clsx';
import {usePathname} from 'next/navigation';
import {isActive, type NavGroup as NavGroupType} from '../../SiteHeader.data';
import {MegaMenu} from '../MegaMenu/MegaMenu';
import styles from './NavGroup.module.scss';
import {useState} from 'react';
import {useHeaderMenu} from '../../HeaderMenuContext';
import {ChevronDown} from 'lucide-react';

export function NavGroup({group}: {group: NavGroupType}) {
    const pathname = usePathname();
    const active = isActive(pathname, group);
    const {openGroupLabel, setOpenGroupLabel} = useHeaderMenu();
    const isOpen = openGroupLabel === group.label;

    if (!group.columns) {
        return (
            <Link href={group.href!} className={clsx(styles.navLink, active && styles.active)}>
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
        <div className={clsx(styles.navGroup, active && styles.active, isOpen && styles.open)} onClick={openMenu}>
            <button type="button" className={clsx(styles.navLink)}>
                <span>{group.label}</span>
                <ChevronDown className={styles.chevron} />
            </button>
            <MegaMenu columns={group.columns} open={isOpen} />
        </div>
    );
}
