'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from './Brand.module.scss';

export function Brand() {
    const pathname = usePathname();

    function handleClick(e: React.MouseEvent) {
        if (pathname === '/') {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }

    return (
        <Link href="/" onClick={handleClick} className={styles.brand}>
            <img src="/img/logo.png" alt="Tabularis" className={styles.logo} />
        </Link>
    );
}
