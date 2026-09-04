import {navGroups} from '../../SiteHeader.data';
import {NavGroup} from '../NavGroup/NavGroup';
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
