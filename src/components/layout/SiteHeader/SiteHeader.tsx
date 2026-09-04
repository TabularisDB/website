'use client';

import clsx from 'clsx';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Brand} from '../Brand/Brand';
import {DesktopNav} from './components/DesktopNav/DesktopNav';
import {HeaderActions} from './components/HeaderActions/HeaderActions';
import styles from './SiteHeader.module.scss';
import {HeaderMenuContext} from './HeaderMenuContext';
import {MobileMenu} from './components/MobileMenu/MobileMenu';
import {getRepoStars} from '@/lib/github';

export function SiteHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(null);
    const pathname = usePathname();
    const wide = pathname.startsWith('/wiki');
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        getRepoStars().then(setStars);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <HeaderMenuContext.Provider value={{openGroupLabel, setOpenGroupLabel}}>
            <header
                className={clsx(
                    styles.siteHeader,
                    isMobileMenuOpen && styles.mobileOpen,
                    (openGroupLabel || isMobileMenuOpen) && styles.menuOpen,
                )}
            >
                <div className={clsx(styles.container, wide && styles.containerWide)}>
                    <Brand />
                    <DesktopNav />

                    <HeaderActions
                        stars={stars}
                        mobileMenuOpen={isMobileMenuOpen}
                        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                </div>
            </header>
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </HeaderMenuContext.Provider>
    );
}
