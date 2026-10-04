import {CATEGORY_ICONS} from '@/app/wiki/page';
import styles from './CategoryLabel.module.scss';
import {WikiCategory} from '@/lib/wiki';

export function CategoryLabel({category}: {category: WikiCategory}) {
    const icon = CATEGORY_ICONS[category];

    return (
        <span className={styles.label}>
            {icon}
            {category}
        </span>
    );
}
