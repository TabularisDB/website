'use client';

import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {WikiSidebar} from '../WikiSidebar/WikiSidebar';
import type {WikiCategory, WikiMeta} from '@/lib/wiki';
import styles from './WikiLayout.module.scss';
import {MenuIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';

interface WikiLayoutProps {
    categories: Array<{name: WikiCategory; pages: WikiMeta[]}>;
    children: React.ReactNode;
    rightSidebar?: React.ReactNode;
}

export function WikiLayout({categories, children, rightSidebar}: WikiLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className={styles.mobileToggle}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation"
                aria-expanded={sidebarOpen}
            >
                <MenuIcon size={18} />
                Menu
            </Button>

            {sidebarOpen && <div className={styles.mobileBackdrop} onClick={() => setSidebarOpen(false)} />}

            <div className={styles.layout}>
                <aside className={clsx(styles.left, sidebarOpen && styles.open)}>
                    <WikiSidebar categories={categories} onClose={() => setSidebarOpen(false)} />
                </aside>

                <main className={styles.main}>{children}</main>

                {rightSidebar && <aside className={styles.right}>{rightSidebar}</aside>}
            </div>
        </>
    );
}
