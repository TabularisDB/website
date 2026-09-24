'use client';

import clsx from 'clsx';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Brand} from '../Brand/Brand';
import {DesktopNav} from './components/DesktopNav/DesktopNav';
import {HeaderActions} from './components/HeaderActions/HeaderActions';
import styles from './SiteHeader.module.scss';
import {HeaderMenuContext, useHeaderMenu} from './HeaderMenuContext';
import {MobileMenu} from './components/MobileMenu/MobileMenu';
import {getRepoStars} from '@/lib/github';

export function SiteHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(null);
    const pathname = usePathname();
    const wide = pathname.startsWith('/wiki');
    const [stars, setStars] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 50);
            console.log(window.scrollY);
        }
        onScroll();
        window.addEventListener('scroll', onScroll, {passive: true});
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
                    scrolled && styles.scrolled,
                    isMobileMenuOpen && styles.mobileOpen,
                    (openGroupLabel || isMobileMenuOpen) && styles.menuOpen,
                )}
            >
                <div className={clsx(styles.container, wide && styles.containerWide)}>
                    <div onClick={() => setOpenGroupLabel(null)}>
                        <Brand />
                    </div>

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
