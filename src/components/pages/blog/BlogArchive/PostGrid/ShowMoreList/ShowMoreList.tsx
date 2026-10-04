'use client';

import {Children, isValidElement, type ReactNode, useEffect, useState} from 'react';
import styles from './ShowMoreList.module.scss';

interface ShowMoreListProps {
    pageSize: number;
    className?: string;
    children: ReactNode;
}

export function ShowMoreList({pageSize, className, children}: ShowMoreListProps) {
    const items = Children.toArray(children).filter(isValidElement);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fromUrl = Number(new URLSearchParams(window.location.search).get('page'));
        if (fromUrl > 1) setPage(fromUrl);
    }, []);

    const visibleCount = page * pageSize;
    const hasMore = visibleCount < items.length;

    function handleShowMore() {
        const nextPage = page + 1;
        setPage(nextPage);

        const url = new URL(window.location.href);
        url.searchParams.set('page', String(nextPage));
        window.history.replaceState(null, '', url);
    }

    return (
        <div className={styles.wrapper}>
            <div className={className}>{items.slice(0, visibleCount)}</div>

            {hasMore && (
                <button type="button" className={styles.showMore} onClick={handleShowMore}>
                    Show more
                </button>
            )}
        </div>
    );
}
