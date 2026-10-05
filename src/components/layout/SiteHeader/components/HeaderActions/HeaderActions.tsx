'use client';

import {Button} from '@/components/ui/Button/Button';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {formatStars} from '@/lib/github';
import clsx from 'clsx';
import {DownloadIcon, MenuIcon, SearchIcon, XIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import styles from './HeaderActions.module.scss';

interface HeaderActionsProps {
    stars: number;
    mobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
}

export function HeaderActions({stars, mobileMenuOpen, onToggleMobileMenu}: HeaderActionsProps) {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().includes('MAC'));
    }, []);

    function openSearch() {
        document.dispatchEvent(new CustomEvent('openSearch'));
    }

    return (
        <div className={styles.headerActions}>
            <a
                href="https://github.com/TabularisDB/tabularis"
                className={clsx(styles.githubStars)}
                target="_blank"
                rel="noopener noreferrer"
            >
                <GitHubIcon />
                <div className={styles.starCount}>
                    {formatStars(stars)}
                </div>
            </a>

            <Button className={styles.searchTrigger} variant="outline" onClick={openSearch} aria-label="Search">
                <SearchIcon />
                <div className={clsx(styles.divider)} />
                <kbd className={styles.searchKdb}>{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
            </Button>

            <Button href="/download" className={styles.download}>
                <DownloadIcon />
                <span>Download</span>
            </Button>

            <Button
                variant="outline"
                className={styles.mobileToggle}
                onClick={onToggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </Button>
        </div>
    );
}
