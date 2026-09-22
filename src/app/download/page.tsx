import {JsonLd} from '@/components/layout/JsonLd';
import {ReleaseInfo} from '@/components/pages/download/ReleaseInfos/ReleaseInfos';
import {VersionPicker} from '@/components/pages/download/VersionPicker/VersionPicker';
import {formatDate, getReleaseDate} from '@/lib/blog/posts';
import {formatDownloads, getTotalDownloads} from '@/lib/github';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {APP_VERSION} from '@/lib/version';
import type {Metadata} from 'next';
import styles from './page.module.scss';
import {DownloadSection} from '@/components/pages/download/DownloadSection/DownloadSection';

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
                <span className="eyebrow">Download</span>
                <h2 className="title">Get Tabularis running in one click.</h2>
                {downloads !== null && (
                    <p className="description">
                        Trusted by {formatDownloads(downloads)} downloads across macOS, Windows, and Linux.
                    </p>
                )}
            </header>

            <section className={styles.layout}>
                <DownloadSection stableVersion={APP_VERSION} stableDate={rawDate ? formatDate(rawDate) : ''} />
            </section>
        </div>
    );
}
