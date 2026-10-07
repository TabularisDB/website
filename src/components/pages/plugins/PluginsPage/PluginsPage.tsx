import {ArrowRight, PlugIcon} from 'lucide-react';
import {PluginBountyTeaser} from '@/components/pages/plugins/PluginBountyTeaser/PluginBountyTeaser';
import {PluginGrid} from '@/components/pages/plugins/PluginGrid/PluginGrid';
import {PLUGINS_PAGE_COPY, type PluginsPageCopy} from '@/components/pages/plugins/Plugin.data';
import {Button} from '@/components/ui/Button/Button';
import type {PluginKind} from '@/lib/plugins/kinds';
import styles from './PluginsPage.module.scss';

export function getPluginsPageCopy(kind?: PluginKind): PluginsPageCopy {
    if (!kind) return PLUGINS_PAGE_COPY.all;
    return PLUGINS_PAGE_COPY[kind.key] ?? {title: kind.label, description: kind.description ?? ''};
}

// Body of /plugins (every plugin) and /plugins/<kind> (one kind).
export function PluginsPage({kind}: {kind?: PluginKind}) {
    const copy = getPluginsPageCopy(kind);

    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <PlugIcon />
                    {kind ? `Plugins · ${kind.label}` : 'Plugins'}
                </span>
                <h1 className="title">{copy.title}</h1>
                <p className="description">{copy.description}</p>
            </header>
            <PluginGrid activeKind={kind?.key} />

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
                        <Button href="/wiki/plugin-development" variant="secondary">
                            Publish on the Registry
                            <ArrowRight size={14} />
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
