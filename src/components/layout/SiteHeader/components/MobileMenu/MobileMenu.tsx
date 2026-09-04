'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import clsx from 'clsx';
import {navGroups} from '../../SiteHeader.data';
import {MobileNavGroup} from '../MobileNavGroup/MobileNavGroup';
import {GitHubIcon, DiscordIcon} from '@/components/ui/Icons/Icons';
import {formatStars} from '@/lib/github';
import {SOCIAL_URLS} from '@/lib/social';
import styles from './MobileMenu.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {DownloadIcon} from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({isOpen, onClose}: MobileMenuProps) {
    const pathname = usePathname();

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
                    <div className={styles.mobileSocials}>
                        <a
                            href="https://github.com/TabularisDB/tabularis"
                            className={clsx(styles.githubStars)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <GitHubIcon />
                            Leave a star
                        </a>
                        <div className={styles.divider}></div>

                        <a
                            href={SOCIAL_URLS.discord}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.discord}
                        >
                            <DiscordIcon />
                            Join us on Discord
                        </a>
                    </div>
                    <Button href="/download" className={styles.download}>
                        <DownloadIcon />
                        <span>Download</span>
                    </Button>
                </footer>
            </div>
        </>
    );
}
