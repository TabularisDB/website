import clsx from 'clsx';
import styles from './GradientBackground.module.scss';

export function GradientBackground() {
    return (
        <div className={styles.backgroundWrapper}>
            <div className={clsx(styles.aurora, styles.auroraOne)}></div>
            <div className={clsx(styles.aurora, styles.auroraTwo)}></div>
        </div>
    );
}
