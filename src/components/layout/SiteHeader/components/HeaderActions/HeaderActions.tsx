'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import clsx from 'clsx';
import {Button} from '@/components/ui/Button/Button';
import {getRepoStars, formatStars} from '@/lib/github';
import styles from './HeaderActions.module.scss';
import {SearchIcon, XIcon, MenuIcon, DownloadIcon} from 'lucide-react';
import {GitHubIcon} from '@/components/ui/Icons/GithubIcon';

interface HeaderActionsProps {
    stars: number | null;
    mobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
}

export function HeaderActions({stars, mobileMenuOpen, onToggleMobileMenu}: HeaderActionsProps) {
    const pathname = usePathname();
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().includes('MAC'));
    }, []);

    function openSearch() {
        document.dispatchEvent(new CustomEvent('openSearch'));
    }

    return (
        <div className={styles.headerActions}>
            {stars !== null && (
                <a
                    href="https://github.com/TabularisDB/tabularis"
                    className={clsx(styles.githubStars)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <GitHubIcon />
                    <div>{formatStars(stars)}</div>
                </a>
            )}

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
