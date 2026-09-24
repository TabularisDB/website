import {JsonLd} from '@/components/layout/JsonLd';
import {DownloadSection} from '@/components/pages/download/DownloadSection/DownloadSection';
import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {formatDate, getReleaseDate} from '@/lib/blog/posts';
import {formatDownloads, getTotalDownloads} from '@/lib/github';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {APP_VERSION} from '@/lib/version';
import type {Metadata} from 'next';
import styles from './page.module.scss';
import Link from 'next/link';
import {DownloadIcon} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Download | Tabularis',
    description:
        'Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.',
    alternates: {canonical: '/download'},
    openGraph: {
        type: 'website',
        url: 'https://tabularis.dev/download/',
        title: 'Download | Tabularis',
        description:
            'Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Download | Tabularis',
        description:
            'Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.',
    },
};

export default async function DownloadPage() {
    const rawDate = getReleaseDate(APP_VERSION);
    const downloads = await getTotalDownloads();

    return (
        <div className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Download', path: '/download'},
                    ]),
                    buildSoftwareApplicationJsonLd(),
                ]}
            />
            <header className="page-header">
                <span className="eyebrow">
                    <DownloadIcon />
                    Download
                </span>
                <h2 className="title">Get Tabularis running in one click.</h2>
                {downloads !== null && (
                    <p className="description">
                        Trusted by {formatDownloads(downloads)} downloads across macOS, Windows, and Linux.
                    </p>
                )}
            </header>

            <section className={styles.layout}>
                <DownloadSection stableVersion={APP_VERSION} stableDate={rawDate ? formatDate(rawDate) : ''} />
                <div className={styles.secondaryGrid}>
                    <section className={styles.mirrors}>
                        <h2 className={styles.mirrorsTitle}>Alternative Mirrors</h2>
                        <p className={styles.mirrorsDesc}>
                            Prefer a secondary download mirror? Tabularis is also available on SourceForge. The primary
                            and most up-to-date release channel remains GitHub Releases.
                        </p>
                        <a
                            href="https://sourceforge.net/projects/tabularis/files/latest/download"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mirrorsLink}
                        >
                            Download from SourceForge
                        </a>
                    </section>

                    <section className={styles.workflow}>
                        <h2 className={styles.workflowTitle}>Explore by Workflow</h2>
                        <p className={styles.workflowDesc}>
                            Not every download starts from the same use case. If you are here because of PostgreSQL,
                            MySQL, secure access, notebooks, or plugin extensibility, see how Tabularis fits your
                            workflow.
                        </p>
                        <Link href="/solutions" className={styles.workflowLink}>
                            Explore solutions
                        </Link>
                    </section>
                </div>
                <NewsletterForm
                    title="Stay in the loop"
                    description="Get release notes, tips, and project updates. No spam, unsubscribe anytime."
                    buttonLabel="Subscribe"
                />
            </section>
        </div>
    );
}
