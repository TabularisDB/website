import styles from './CategoryLabel.module.scss';

export function CategoryLabel({category}: {category: string}) {
    return <span className={styles.label}>{category}</span>;
}
