'use client';

import styles from './Footer.module.scss';

import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {Brand} from '../Brand/Brand';
import {ClosingCta} from '@/components/ui/ClosingCta/ClosingCta';
import {SocialLinks} from '@/components/ui/SocialLinks/SocialLinks';
import {getClosingCtaContent, FOOTER_COLUMNS} from './Footer.data';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();
    const closingCtaContent = getClosingCtaContent(pathname ?? '/');

    return (
        <footer className={styles.footerWrapper}>
            {closingCtaContent && (
                <ClosingCta title={closingCtaContent.title} description={closingCtaContent.description} />
            )}

            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <Brand className={styles.brand} />
                    <span className={styles.footerBrandTagline}>The open-source desktop database client.</span>
                    <nav className={styles.footerSocial} aria-label="Social links">
                        <SocialLinks linkClassName={styles.socialLink} />
                    </nav>
                </div>

                <div className={styles.footerColumns}>
                    {FOOTER_COLUMNS.map((col) => (
                        <div key={col.title} className={styles.footerColumn}>
                            <span className={styles.columnTitle}>{col.title}</span>
                            {col.links.map((link) => (
                                <Link key={link.label} href={link.href} className={styles.footerLink}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p className={styles.footerCopy}>
                    &copy; {currentYear} Tabularis | Designed by{' '}
                    <a href="https://github.com/wajrock" target="_blank" rel="noopener noreferrer">
                        Thibaud Wajrock
                    </a>
                    .
                </p>
                <p className={styles.footerLinksBottom}>
                    <Link href="/subscribe">Subscribe</Link>
                    <Link href="/cookie-policy">Cookie Policy</Link>
                    <span
                        className={styles.manageCookiesButton}
                        onClick={() => window.dispatchEvent(new Event('tabularis:manage-cookies'))}
                    >
                        Cookies Preferences
                    </span>
                </p>
            </div>
        </footer>
    );
}
