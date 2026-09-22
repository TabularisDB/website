'use client';

import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon, GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import clsx from 'clsx';
import {DownloadIcon} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {navGroups} from '../../SiteHeader.data';
import {MobileNavGroup} from '../MobileNavGroup/MobileNavGroup';
import styles from './MobileMenu.module.scss';

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
