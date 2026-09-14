'use client';

import {Lock, PanelsTopLeft} from 'lucide-react';
import styles from './ProductDescription.module.scss';
import clsx from 'clsx';

export function ProductDescription() {
    return (
        <div className={styles.productDescription}>
            <div className={styles.description}>
                <div className={styles.titleRow}>
                    <div className={styles.iconWrap}>
                        <Lock size={20} />
                    </div>
                    <h3 className={styles.title}>Local-first, secure.</h3>
                </div>
                <p className={styles.text}>
                    SSH and Kubernetes tunneling, system keychain for secrets. Your data and credentials never leave
                    your machine.
                </p>
            </div>
            <div className={styles.description}>
                <div className={styles.titleRow}>
                    <div className={styles.iconWrap}>
                        <PanelsTopLeft size={20} />
                    </div>
                    <h3 className={styles.title}>Still a full workspace.</h3>
                </div>
                <p className={styles.text}>
                    Monaco editor, notebooks, visual query builder, visual EXPLAIN, ER diagrams, split view. You don't
                    trade the IDE for the agent.
                </p>
            </div>
        </div>
    );
}
