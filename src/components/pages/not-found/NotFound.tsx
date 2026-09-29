'use client';

import {Button} from '@/components/ui/Button/Button';
import styles from './NotFound.module.scss';
import clsx from 'clsx';
import {ArrowLeft} from 'lucide-react';
import {usePathname} from 'next/navigation';

export default function NotFound() {
    const pathname = usePathname();

    return (
        <section className={clsx(styles.section, 'container')}>
            <div className={styles.grid}>
                <div className={styles.copy}>
                    <span className={styles.badgeError}>Error 404</span>

                    <h1 className={styles.title}>Page not found.</h1>

                    <p className={styles.description}>
                        The page you are looking for does not exist or has been moved. The database client, however, is
                        very much alive.
                    </p>

                    <nav className={styles.actions}>
                        <Button className={styles.mainButton} href="/" size="md" variant="primary">
                            <ArrowLeft size={16} /> Go home
                        </Button>
                        <Button href="/wiki" variant="outline">
                            Wiki
                        </Button>
                        <Button href="/blog" variant="outline">
                            Blog
                        </Button>
                        <Button href="/plugins" variant="outline">
                            Plugins
                        </Button>
                    </nav>
                </div>

                <div className={styles.visual}>
                    <div className={styles.window} role="img" aria-label="SQL query returning no rows">
                        <div className={styles.windowBar}>
                            <span className={styles.dotRed} />
                            <span className={styles.dotYellow} />
                            <span className={styles.dotGreen} />
                            <span className={styles.windowTitle}>tabularis — query.sql</span>
                        </div>

                        <div className={styles.windowBody}>
                            <div className={styles.sql}>
                                <div className={styles.line}>
                                    <span className={styles.lineNo}>1</span>
                                    <span className={styles.lineCode}>
                                        <span className={styles.keyword}>SELECT</span> *{' '}
                                        <span className={styles.keyword}>FROM</span> pages
                                    </span>
                                </div>
                                <div className={styles.line}>
                                    <span className={styles.lineNo}>2</span>
                                    <span className={styles.lineCode}>
                                        <span className={styles.keyword}>WHERE</span> path ={' '}
                                        <span className={styles.string}>&quot;{pathname}&quot;</span>;
                                        <span className={styles.caret} aria-hidden="true" />
                                    </span>
                                </div>
                            </div>

                            <div className={styles.result}>
                                <span className={styles.resultBadge}>404</span>
                                <span className={styles.resultText}>0 rows returned</span>
                                <span className={styles.resultTime}>(0.404 ms)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
