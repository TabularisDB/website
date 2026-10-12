import {getKindBadge, getPluginIcon} from '@/components/pages/plugins/Plugin.data';
import {getAllPlugins, getLatestRelease} from '@/lib/plugins';
import {getKindSlug, getPublishedKinds} from '@/lib/plugins/kinds';
import clsx from 'clsx';
import {ArrowUpRightIcon, PaletteIcon, PlugIcon, TagIcon, UserIcon} from 'lucide-react';
import Link from 'next/link';
import styles from './PluginGrid.module.scss';

type Plugin = ReturnType<typeof getAllPlugins>[number];

const kindOf = (plugin: Plugin) => plugin.kind ?? 'driver';

const authorNameOf = (plugin: Plugin) => plugin.author.split('<')[0].trim();

export function PluginGrid({activeKind}: {activeKind?: string}) {
    const all = getAllPlugins();
    const plugins = activeKind ? all.filter((plugin) => kindOf(plugin) === activeKind) : all;
    const kinds = getPublishedKinds();

    const filters = [
        {key: undefined, label: 'All', href: '/plugins', count: all.length},
        ...kinds.map((kind) => ({
            key: kind.key,
            label: kind.label,
            href: `/plugins/${getKindSlug(kind.key)}`,
            count: all.filter((plugin) => kindOf(plugin) === kind.key).length,
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
                {plugins.map((plugin) => (
                    <PluginCard key={plugin.id} plugin={plugin} />
                ))}
            </div>
        </div>
    );
}

function PluginCard({plugin}: {plugin: Plugin}) {
    const kind = kindOf(plugin);
    const iconSlug = getPluginIcon(plugin.id);
    const minVersion = getLatestRelease(plugin)?.min_tabularis_version;

    return (
        <a
            href={plugin.registry_url ?? plugin.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
        >
            <div className={styles.cardHeader}>
                {iconSlug ? (
                    <img className={styles.cardIcon} src={`/img/logos/plugins/${iconSlug}.svg`} alt={plugin.name} />
                ) : (
                    <span className={styles.cardIcon}>{kind === 'theme' ? <PaletteIcon /> : <PlugIcon />}</span>
                )}
                <span className={styles.kind}>{getKindBadge(kind)}</span>
            </div>

            <div className={styles.cardDetails}>
                <h3 className={styles.cardTitle}>{plugin.name}</h3>
                <p className={styles.cardExcerpt}>{plugin.description}</p>
            </div>

            <div className={styles.meta}>
                <span className={styles.metaItem}>
                    <UserIcon aria-hidden="true" />
                    {authorNameOf(plugin)}
                </span>
                <span className={styles.metaItem}>
                    <TagIcon aria-hidden="true" />
                    <span className={styles.mono}>v{plugin.latest_version}</span>
                </span>
                {minVersion && (
                    <span className={styles.metaItem} title="Minimum Tabularis version">
                        <img
                            src="/img/brand/tabularis-icon-color.svg"
                            alt="Requires Tabularis"
                            className={styles.metaLogo}
                        />
                        <span className={styles.mono}>{minVersion}+</span>
                    </span>
                )}
            </div>

            <span className={styles.cardLink}>
                View plugin <ArrowUpRightIcon aria-hidden="true" />
            </span>
        </a>
    );
}
