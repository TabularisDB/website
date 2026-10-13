import {JsonLd} from '@/components/layout/JsonLd';
import {DownloadSection} from '@/components/pages/download/DownloadSection/DownloadSection';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {formatDate, getReleaseDate} from '@/lib/blog/posts';
import {APP_VERSION} from '@/lib/download/version';
import {formatDownloads, TOTAL_DOWNLOADS} from '@/lib/github';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {DownloadIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './DownloadPage.module.scss';

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

                <CardGrid variant="joined" className={styles.secondaryGrid}>
                    <Card>
                        <Card.Content>
                            <Card.Title as="h2">Alternative Mirrors</Card.Title>
                            <Card.Description>
                                Prefer a secondary download mirror? Tabularis is also available on SourceForge. The
                                primary and most up-to-date release channel remains GitHub Releases.
                            </Card.Description>
                        </Card.Content>
                        <Card.Link href="https://sourceforge.net/projects/tabularis/files/latest/download">
                            Download from SourceForge
                        </Card.Link>
                    </Card>

                    <Card>
                        <Card.Content>
                            <Card.Title as="h2">Explore by Workflow</Card.Title>
                            <Card.Description>
                                Not every download starts from the same use case. If you are here because of PostgreSQL,
                                MySQL, secure access, notebooks, or plugin extensibility, see how Tabularis fits your
                                workflow.
                            </Card.Description>
                        </Card.Content>
                        <Card.Link href="/solutions">Explore solutions</Card.Link>
                    </Card>

                    <Card>
                        <Card.Content>
                            <Card.Title as="h2">Release notes</Card.Title>
                            <Card.Description>
                                See what changed in v{APP_VERSION}, or browse every previous release and its assets.
                            </Card.Description>
                        </Card.Content>
                        <div className={styles.links}>
                            <Card.Link
                                href={`https://github.com/TabularisDB/tabularis/releases/tag/v${APP_VERSION}`}
                                stretched={false}
                            >
                                Read the v{APP_VERSION} release notes
                            </Card.Link>
                            <Card.Link href="https://github.com/TabularisDB/tabularis/releases" stretched={false}>
                                All releases
                            </Card.Link>
                        </div>
                    </Card>
                </CardGrid>
                <NewsletterForm
                    title="Stay in the loop"
                    description="Get release notes, tips, and project updates. No spam, unsubscribe anytime."
                    buttonLabel="Subscribe"
                />
            </section>
        </div>
    );
}
