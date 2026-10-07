'use client';

import {Brand} from '@/components/layout/Brand/Brand';
import type {WikiCategory, WikiMeta} from '@/lib/wiki';
import clsx from 'clsx';
import {XIcon} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useLayoutEffect, useRef} from 'react';
import styles from './WikiSidebar.module.scss';

interface WikiSidebarProps {
    categories: Array<{name: WikiCategory; pages: WikiMeta[]}>;
    onClose?: () => void;
}

// The sidebar is rendered by each wiki page, so it remounts on every
// navigation. Its scroll offset lives at module scope to survive that.
let savedScrollTop: number | null = null;

export function WikiSidebar({categories, onClose}: WikiSidebarProps) {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    // Before paint, so the nav never visibly jumps. Only the nav scrolls —
    // never the window.
    useLayoutEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        if (savedScrollTop !== null) nav.scrollTop = savedScrollTop;

        // Centre the active link when it is out of view: on the first load, or
        // after arriving through a link outside the sidebar (e.g. prev/next).
        const active = nav.querySelector<HTMLElement>(`.${styles.active}`);
        if (active) {
            const offset = active.getBoundingClientRect().top - nav.getBoundingClientRect().top;
            const visible = offset >= 0 && offset + active.offsetHeight <= nav.clientHeight;
            if (savedScrollTop === null || !visible) {
                nav.scrollTop += offset - (nav.clientHeight - active.offsetHeight) / 2;
            }
        }

        const onScroll = () => {
            savedScrollTop = nav.scrollTop;
        };
        nav.addEventListener('scroll', onScroll, {passive: true});
        return () => nav.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className={styles.sidebarWrapper}>
            <header className={styles.sidebarHeader}>
                <Brand />
                <div className={styles.sidebarClose} onClick={onClose}>
                    <XIcon />
                </div>
            </header>
            <nav ref={navRef} className={styles.sidebar} aria-label="Wiki navigation">
                {categories.map(({name, pages}) => (
                    <div key={name}>
                        <span className={styles.categoryTitle}>{name}</span>

                        <ul className={styles.links}>
                            {pages.map((p) => {
                                const href = `/wiki/${p.slug}`;
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
