'use client';

import {navGroups} from '@/components/layout/SiteHeader/SiteHeader.data';
import {MobileNavGroup} from '@/components/layout/SiteHeader/components/MobileNavGroup/MobileNavGroup';
import {ThemeToggle} from '@/components/layout/ThemeToggle/ThemeToggle';
import {Button} from '@/components/ui/Button/Button';
import clsx from 'clsx';
import {DownloadIcon} from 'lucide-react';
import styles from './MobileMenu.module.scss';
import {useEffect} from 'react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({isOpen, onClose}: MobileMenuProps) {
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const desktop = window.matchMedia('(min-width: 1024px)');
        const closeOnDesktop = () => desktop.matches && onClose();
        desktop.addEventListener('change', closeOnDesktop);

        return () => {
            document.body.style.overflow = previousOverflow;
            desktop.removeEventListener('change', closeOnDesktop);
        };
    }, [isOpen, onClose]);

    return (
        <>
            <div className={clsx(styles.backdrop, isOpen && styles.active)} onClick={onClose} />
            <div className={clsx(styles.mobileMenu, isOpen && styles.active)}>
                <nav className={styles.mobileNav} aria-label="Mobile primary">
                    {navGroups.map((group) => (
                        <MobileNavGroup key={group.label} group={group} onNavigate={onClose} />
                    ))}
                </nav>
                <footer className={styles.mobileMenuFooter}>
                    <Button href="/download" className={styles.download}>
                        <DownloadIcon />
                        <span>Download</span>
                    </Button>
                    <ThemeToggle />
                </footer>
            </div>
        </>
    );
}
