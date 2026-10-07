import {JsonLd} from '@/components/layout/JsonLd';
import {DownloadSection} from '@/components/pages/download/DownloadSection/DownloadSection';
import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {formatDate, getReleaseDate} from '@/lib/blog/posts';
import {formatDownloads, TOTAL_DOWNLOADS} from '@/lib/github';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {APP_VERSION} from '@/lib/download/version';
import type {Metadata} from 'next';
import styles from './DownloadPage.module.scss';
import Link from 'next/link';
import {ArrowRight, DownloadIcon} from 'lucide-react';
import {ogImages} from '@/lib/og/registry';

const path = '/download';
const title = 'Download | Tabularis';
const description =
    'Download Tabularis for Windows, macOS, and Linux. Available via WinGet, Homebrew, Snap, AUR and more.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Download Tabularis'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function DownloadPage() {
    const rawDate = getReleaseDate(APP_VERSION);

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
                <h1 className="title">Get Tabularis running in one click.</h1>
                <p className="description">
                    Trusted by {formatDownloads(TOTAL_DOWNLOADS)} downloads across macOS, Windows, and Linux.
                </p>
            </header>

            <section className={styles.layout}>
                <DownloadSection stableVersion={APP_VERSION} stableDate={rawDate ? formatDate(rawDate) : ''} />
                <div className={styles.secondaryGrid}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Alternative Mirrors</h2>
                        <p className={styles.sectionDesc}>
                            Prefer a secondary download mirror? Tabularis is also available on SourceForge. The primary
                            and most up-to-date release channel remains GitHub Releases.
                        </p>
                        <Link
                            href="https://sourceforge.net/projects/tabularis/files/latest/download"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sectionLink}
                        >
                            Download from SourceForge <ArrowRight size={14} />
                        </Link>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Explore by Workflow</h2>
                        <p className={styles.sectionDesc}>
                            Not every download starts from the same use case. If you are here because of PostgreSQL,
                            MySQL, secure access, notebooks, or plugin extensibility, see how Tabularis fits your
                            workflow.
                        </p>
                        <Link href="/solutions" className={styles.sectionLink}>
                            Explore solutions <ArrowRight size={14} />
                        </Link>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Release notes</h2>
                        <p className={styles.sectionDesc}>
                            See what changed in v{APP_VERSION}, or browse every previous release and its assets.
                        </p>
                        <div className={styles.sectionLinks}>
                            <Link
                                href={`https://github.com/TabularisDB/tabularis/releases/tag/v${APP_VERSION}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.sectionLink}
                            >
                                Read the v{APP_VERSION} release notes <ArrowRight size={14} />
                            </Link>
                            <Link
                                href="https://github.com/TabularisDB/tabularis/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.sectionLink}
                            >
                                All releases <ArrowRight size={14} />
                            </Link>
                        </div>
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
