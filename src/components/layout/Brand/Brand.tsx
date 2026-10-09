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
            {/* The colour logo has white lettering; the light theme swaps in the black one. */}
            <Image
                src="/img/brand/tabularis-logo-color.svg"
                alt="Tabularis"
                width={128}
                height={26}
                loading="eager"
                className={clsx(styles.logo, 'theme-dark-only', className)}
            />
            <Image
                src="/img/brand/tabularis-logo-black.svg"
                alt="Tabularis"
                width={128}
                height={26}
                loading="eager"
                className={clsx(styles.logo, 'theme-light-only', className)}
            />
        </Link>
    );
}
