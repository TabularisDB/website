import {JsonLd} from '@/components/layout/JsonLd';
import {DownloadSection} from '@/components/pages/download/DownloadSection/DownloadSection';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {getReleaseDate} from '@/lib/blog/posts';
import {NIGHTLY_RELEASE} from '@/lib/download/nightly';
import {APP_VERSION} from '@/lib/download/version';
import {formatDownloads, TOTAL_DOWNLOADS} from '@/lib/github';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd} from '@/lib/seo';
import {CompassIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './DownloadPage.module.scss';

const path = '/download';
const title = 'Download | Tabularis';
const description =
    'Download Tabularis for Windows, macOS, and Linux, or self-host it with Docker or Helm. Available via WinGet, Homebrew, Snap, AUR and more.';

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
                    <img src="/img/tabularis-app-icon.svg" alt="" className={styles.appIcon} />
                    Download
                </span>
                <h1 className="title">Get Tabularis running in one click.</h1>
                <p className="description">
                    Trusted by {formatDownloads(TOTAL_DOWNLOADS)} downloads. Get it for macOS, Windows and Linux, or
                    self-host it for your browser.
                </p>
            </header>

            <DownloadSection stableVersion={APP_VERSION} stableDate={getReleaseDate(APP_VERSION)} />

            <div className={styles.more}>
                <section className={styles.explore}>
                    <h2 className="category-title">
                        <CompassIcon aria-hidden="true" />
                        Keep exploring
                    </h2>
                    <CardGrid variant="joined">
                        <Card>
                            <Card.Content>
                                <Card.Title>Release notes</Card.Title>
                                <Card.Description>
                                    See what changed in the stable v{APP_VERSION} or the latest nightly build, or browse
                                    every previous release and its assets.
                                </Card.Description>
                            </Card.Content>
                            <div className={styles.links}>
                                <Card.Link
                                    href={`https://github.com/TabularisDB/tabularis/releases/tag/v${APP_VERSION}`}
                                    stretched={false}
                                >
                                    Stable version
                                </Card.Link>
                                <Card.Link href={NIGHTLY_RELEASE.url} stretched={false}>
                                    Nightly version
                                </Card.Link>
                            </div>
                        </Card>

                        <Card>
                            <Card.Content>
                                <Card.Title>Explore by Workflow</Card.Title>
                                <Card.Description>
                                    Not every download starts from the same use case. If you are here because of
                                    PostgreSQL, MySQL, secure access, notebooks, or plugin extensibility, see how
                                    Tabularis fits your workflow.
                                </Card.Description>
                            </Card.Content>
                            <Card.Link href="/solutions">Explore solutions</Card.Link>
                        </Card>
                    </CardGrid>
                </section>
                <NewsletterForm
                    title="Stay in the loop"
                    description="Get release notes, tips, and project updates. No spam, unsubscribe anytime."
                    buttonLabel="Subscribe"
                />
            </div>
        </div>
    );
}
