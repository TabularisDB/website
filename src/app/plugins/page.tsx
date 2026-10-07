import {PluginBountyTeaser} from '@/components/pages/plugins/PluginBountyTeaser/PluginBountyTeaser';
import {PluginGrid} from '@/components/pages/plugins/PluginGrid/PluginGrid';
import {Button} from '@/components/ui/Button/Button';
import {ArrowRight, PlugIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './PluginsPage.module.scss';
import {ogImages} from '@/lib/og/registry';

const path = '/plugins';
const title = 'Plugins | Tabularis';
const description = 'Extend Tabularis with custom database drivers from the community.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Plugins'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function PluginsPage() {
    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <PlugIcon />
                    Plugins
                </span>
                <h1 className="title">Every database, one plugin away.</h1>
                <p className="description">
                    Tabularis ships with a language-agnostic driver system. Browse what the community has already built,
                    or write your own.
                </p>
            </header>
            <PluginGrid />

            <div className={styles.pluginPromo}>
                <PluginBountyTeaser />

                <section className={styles.buildOwn}>
                    <h2 className={styles.buildOwnTitle}>Build your own plugin</h2>
                    <p className={styles.buildOwnDesc}>
                        Got a database you&apos;d like to support? The wiki covers the JSON-RPC protocol, the manifest
                        and UI extensions, everything you need to get a driver running in minutes. When it&apos;s ready,
                        publish it on the Tabularium registry.
                    </p>
                    <div className={styles.buildOwnActions}>
                        <Button href="/wiki/building-plugins">
                            Plugin Docs <ArrowRight size={14} />
                        </Button>
                        <Button href="https://registry.tabularis.dev/docs/plugin-development" variant="secondary">
                            Publish on the Registry
                            <ArrowRight size={14} />
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
