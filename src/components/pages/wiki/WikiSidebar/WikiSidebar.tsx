'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
import type {WikiCategory, WikiMeta} from '@/lib/wiki';
import styles from './WikiSidebar.module.scss';
import {Brand} from '@/components/layout/Brand/Brand';
import {XIcon} from 'lucide-react';

interface WikiSidebarProps {
    categories: Array<{name: WikiCategory; pages: WikiMeta[]}>;
    onClose?: () => void;
}

export function WikiSidebar({categories, onClose}: WikiSidebarProps) {
    const pathname = usePathname();

    useEffect(() => {
        const activeLink = document.querySelector(`.${styles.active}`);

        if (activeLink) {
            activeLink.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }, []);

    return (
        <div className={styles.sidebarWrapper}>
            <header className={styles.sidebarHeader}>
                <Brand />
                <div className={styles.sidebarClose} onClick={onClose}>
                    <XIcon />
                </div>
            </header>
            <nav className={styles.sidebar} aria-label="Wiki navigation">
                {categories.map(({name, pages}) => (
                    <div key={name} className={styles.group}>
                        <span className={styles.categoryTitle}>{name}</span>

                        <ul className={styles.links}>
                            {pages.map((p) => {
                                const href = `/wiki/${p.slug}/`;
                                return (
                                    <li key={p.slug}>
                                        <Link
                                            href={href}
                                            className={clsx(styles.link, pathname === href && styles.active)}
                                        >
                                            {p.title}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    );
}
