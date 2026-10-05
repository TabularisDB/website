'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from './Brand.module.scss';
import clsx from 'clsx';

interface BrandProps {
    className?: string;
}

export function Brand({className}: BrandProps) {
    const pathname = usePathname();

    function handleClick(e: React.MouseEvent) {
        if (pathname === '/') {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }

    return (
        <Link href="/" onClick={handleClick}>
            <Image
                src="/img/brand/tabularis-logo-color.svg"
                alt="Tabularis"
                width={128}
                height={26}
                loading="eager"
                className={clsx(styles.logo, className)}
            />
        </Link>
    );
}
