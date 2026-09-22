'use client';

import {Children, isValidElement, type ReactNode, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import styles from './ShowMoreList.module.scss';

interface ShowMoreListProps {
    pageSize: number;
    className?: string;
    children: ReactNode;
}

export function ShowMoreList({pageSize, className, children}: ShowMoreListProps) {
    const items = Children.toArray(children).filter(isValidElement);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
    const [page, setPage] = useState(initialPage);

    const visibleCount = page * pageSize;
    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;

    function handleShowMore() {
        const nextPage = page + 1;
        setPage(nextPage);

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`${pathname}?${params.toString()}`, {scroll: false});
    }

    return (
        <div className={styles.wrapper}>
            <div className={className}>{visibleItems}</div>

            {hasMore && (
                <button type="button" className={styles.showMore} onClick={handleShowMore}>
                    Show more
                </button>
            )}
        </div>
    );
}
