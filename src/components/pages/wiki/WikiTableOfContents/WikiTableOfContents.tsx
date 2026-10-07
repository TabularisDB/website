'use client';

import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import styles from './WikiTableOfContents.module.scss';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

const SCROLL_OFFSET = 96; // fallback when the headings declare no scroll-margin-top

export function WikiTableOfContents() {
    const [items, setItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState('');
    // Heading picked from this TOC. It stays active through the smooth scroll
    // and at the bottom of the page, where late headings never reach the top,
    // until the user scrolls by hand (wheel, touch, keyboard, scrollbar).
    const clickedId = useRef<string | null>(null);

    useEffect(() => {
        const article = document.querySelector('#post-content');
        if (!article) return;

        const headings = article.querySelectorAll<HTMLElement>('h2, h3');
        setItems(
            Array.from(headings)
                .filter((h) => h.id)
                .map((h) => ({id: h.id, text: h.textContent ?? '', level: parseInt(h.tagName[1], 10)})),
        );
    }, []);

    useEffect(() => {
        if (items.length === 0) return;

        // A heading reached through its anchor stops at its scroll-margin-top
        // (header height + spacing), so it counts as active from there.
        const first = document.getElementById(items[0].id);
        const scrollMargin = first ? parseFloat(getComputedStyle(first).scrollMarginTop) : NaN;
        const threshold = (Number.isNaN(scrollMargin) || scrollMargin === 0 ? SCROLL_OFFSET : scrollMargin) + 2;

        function computeActive() {
            if (clickedId.current) {
                setActiveId(clickedId.current);
                return;
            }

            // Si on a atteint le bas de la page, le dernier titre est actif
            // par définition, même si sa position géométrique n'a jamais
            // dépassé le seuil (sections courtes en fin de page).
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

            if (scrolledToBottom) {
                setActiveId(items[items.length - 1]?.id ?? '');
                return;
            }

            let current = items[0]?.id ?? '';
            for (const item of items) {
                const el = document.getElementById(item.id);
                if (!el) continue;

                if (el.getBoundingClientRect().top <= threshold) {
                    current = item.id;
                } else {
                    break;
                }
            }

            setActiveId(current);
        }

        const forgetClick = () => {
            clickedId.current = null;
        };

        computeActive();
        window.addEventListener('scroll', computeActive, {passive: true});
        window.addEventListener('resize', computeActive);
        window.addEventListener('wheel', forgetClick, {passive: true});
        window.addEventListener('touchstart', forgetClick, {passive: true});
        window.addEventListener('keydown', forgetClick);
        window.addEventListener('mousedown', forgetClick);

        return () => {
            window.removeEventListener('scroll', computeActive);
            window.removeEventListener('resize', computeActive);
            window.removeEventListener('wheel', forgetClick);
            window.removeEventListener('touchstart', forgetClick);
            window.removeEventListener('keydown', forgetClick);
            window.removeEventListener('mousedown', forgetClick);
        };
    }, [items]);

    if (items.length === 0) return null;

    return (
        <nav className={styles.tableOfContents} aria-label="On this page">
            <div className={styles.title}>On This Page</div>
            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.id} className={clsx(styles.item, item.level === 3 && styles.sub)}>
                        <a
                            href={`#${item.id}`}
                            className={clsx(styles.link, activeId === item.id && styles.active)}
                            onClick={() => {
                                clickedId.current = item.id;
                                setActiveId(item.id);
                            }}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
