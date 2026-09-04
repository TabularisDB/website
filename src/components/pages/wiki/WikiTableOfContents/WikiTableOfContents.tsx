'use client';

import {useEffect, useState} from 'react';
import clsx from 'clsx';
import styles from './WikiTableOfContents.module.scss';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

const SCROLL_OFFSET = 96; // px sous le haut de la fenêtre, doit matcher rootMargin

export function WikiTableOfContents() {
    const [items, setItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState('');

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

        function computeActive() {
            // Si on a atteint le bas de la page, le dernier titre est actif
            // par définition, même si sa position géométrique n'a jamais
            // dépassé SCROLL_OFFSET (sections courtes en fin de page).
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

            if (scrolledToBottom) {
                setActiveId(items[items.length - 1]?.id ?? '');
                return;
            }

            let current = items[0]?.id ?? '';
            for (const item of items) {
                const el = document.getElementById(item.id);
                if (!el) continue;

                if (el.getBoundingClientRect().top <= SCROLL_OFFSET) {
                    current = item.id;
                } else {
                    break;
                }
            }

            setActiveId(current);
        }

        computeActive();
        window.addEventListener('scroll', computeActive, {passive: true});
        window.addEventListener('resize', computeActive);

        return () => {
            window.removeEventListener('scroll', computeActive);
            window.removeEventListener('resize', computeActive);
        };
    }, [items]);

    if (items.length === 0) return null;

    return (
        <nav className={styles.tableOfContents} aria-label="On this page">
            <div className={styles.title}>On This Page</div>
            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.id} className={clsx(styles.item, item.level === 3 && styles.sub)}>
                        <a href={`#${item.id}`} className={clsx(styles.link, activeId === item.id && styles.active)}>
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
