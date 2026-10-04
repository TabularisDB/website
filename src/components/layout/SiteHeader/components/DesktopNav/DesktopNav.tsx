import {navGroups} from '@/components/layout/SiteHeader/SiteHeader.data';
import {NavGroup} from '@/components/layout/SiteHeader/components/NavGroup/NavGroup';
import styles from './DesktopNav.module.scss';

export function DesktopNav() {
    return (
        <nav className={styles.desktopNav} aria-label="Primary">
            {navGroups.map((group) => (
                <NavGroup key={group.label} group={group} />
            ))}
        </nav>
    );
}
