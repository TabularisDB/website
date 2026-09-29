import clsx from 'clsx';
import {ChevronDown} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect} from 'react';
import {useHeaderMenu} from '../../HeaderMenuContext';
import {type NavGroup as NavGroupType} from '../../SiteHeader.data';
import {MegaMenu} from '../MegaMenu/MegaMenu';
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
            <button type="button" className={clsx(styles.navLink)}>
                <span>{group.label}</span>
                <ChevronDown className={styles.chevron} />
            </button>
            <MegaMenu columns={group.columns} open={isOpen} />
        </div>
    );
}
