import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import {PaletteIcon, PlugIcon} from 'lucide-react';
import {getAllPlugins, getLatestRelease} from '@/lib/plugins';
import {getKindSlug, getPublishedKinds} from '@/lib/plugins/kinds';
import {getKindBadge, getPluginIcon} from '@/components/pages/plugins/Plugin.data';
import styles from './PluginGrid.module.scss';

// activeKind: a kind key to show only that kind, or undefined for every plugin.
export function PluginGrid({activeKind}: {activeKind?: string}) {
    const all = getAllPlugins();
    const kindOf = (p: (typeof all)[number]) => p.kind ?? 'driver';
    const plugins = activeKind ? all.filter((p) => kindOf(p) === activeKind) : all;
    const kinds = getPublishedKinds();

    const filters = [
        {key: undefined, label: 'All', href: '/plugins', count: all.length},
        ...kinds.map((kind) => ({
            key: kind.key,
            label: kind.label,
            href: `/plugins/${getKindSlug(kind.key)}`,
            count: all.filter((p) => kindOf(p) === kind.key).length,
        })),
    ];

    return (
        <div className={styles.catalogue}>
            {kinds.length > 1 && (
                <nav className={styles.filters} aria-label="Plugin types">
                    {filters.map((filter) => {
                        const isActive = filter.key === activeKind;
                        return (
                            <Link
                                key={filter.href}
                                href={filter.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={clsx(styles.filter, isActive && styles.filterActive)}
                            >
                                {filter.label}
                                <span className={styles.filterCount}>{filter.count}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}

            <div className={styles.grid}>
                {plugins.map((plugin) => {
                    const kind = kindOf(plugin);
                    const latestRelease = getLatestRelease(plugin);
                    const authorName = plugin.author.includes('<') ? plugin.author.split('<')[0].trim() : plugin.author;
                    const iconSlug = getPluginIcon(plugin.id);

                    return (
                        <a
                            key={plugin.id}
                            href={plugin.registry_url ?? plugin.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.card}
                        >
                            <div className={styles.cardCover}>
                                {iconSlug ? (
                                    <Image
                                        className={styles.cardIcon}
                                        src={`/img/logos/plugins/${iconSlug}.svg`}
                                        alt={plugin.name}
                                        width={48}
                                        height={48}
                                    />
                                ) : (
                                    <span className={styles.cardIcon}>
                                        {kind === 'theme' ? <PaletteIcon /> : <PlugIcon />}
                                    </span>
                                )}

                                <span className={styles.kind}>{getKindBadge(kind)}</span>
                                <span className={styles.version}>v{plugin.latest_version}</span>
                            </div>
                            <div className={styles.cardDetails}>
                                <h3 className={styles.cardTitle}>{plugin.name}</h3>
                                <p className={styles.cardExcerpt}>{plugin.description}</p>
                                <div className={styles.meta}>
                                    by {authorName}
                                    {latestRelease?.min_tabularis_version && (
                                        <> &middot; Requires v{latestRelease.min_tabularis_version}+</>
                                    )}
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
