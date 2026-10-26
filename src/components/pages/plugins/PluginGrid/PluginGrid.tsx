import {getPluginIcon} from '@/components/pages/plugins/Plugin.data';
import {PluginKindLabel} from '@/components/pages/plugins/PluginKindLabel/PluginKindLabel';
import {getAllPlugins, getLatestRelease} from '@/lib/plugins';
import {getKindSlug, getPublishedKinds} from '@/lib/plugins/kinds';
import clsx from 'clsx';
import {PaletteIcon, PlugIcon, TagIcon, UserIcon} from 'lucide-react';
import Link from 'next/link';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
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

            <CardGrid>
                {plugins.map((plugin) => (
                    <PluginCard key={plugin.id} plugin={plugin} />
                ))}
            </CardGrid>
        </div>
    );
}

function PluginCard({plugin}: {plugin: Plugin}) {
    const kind = kindOf(plugin);
    const iconSlug = getPluginIcon(plugin.id);
    const minVersion = getLatestRelease(plugin)?.min_tabularis_version;
    const fallbackIcon = kind === 'theme' ? <PaletteIcon /> : <PlugIcon />;

    return (
        <Card>
            <Card.Header
                icon={
                    iconSlug ? (
                        <img src={`/img/logos/plugins/${iconSlug}.svg`} alt="" className={styles.logo} />
                    ) : (
                        fallbackIcon
                    )
                }
                aside={<PluginKindLabel kind={kind} />}
            />
            <Card.Content>
                <Card.Title>{plugin.name}</Card.Title>
                <Card.Description>{plugin.description}</Card.Description>
            </Card.Content>
            <Card.Meta>
                <Card.MetaItem icon={<UserIcon aria-hidden="true" />}>{authorNameOf(plugin)}</Card.MetaItem>
                <Card.MetaItem icon={<TagIcon aria-hidden="true" />}>
                    <span className={styles.mono}>v{plugin.latest_version}</span>
                </Card.MetaItem>
                {minVersion && (
                    <Card.MetaItem
                        title="Minimum Tabularis version"
                        icon={<img src="/img/brand/tabularis-icon-color.svg" alt="Requires Tabularis" />}
                    >
                        <span className={styles.mono}>{minVersion}+</span>
                    </Card.MetaItem>
                )}
            </Card.Meta>
            <Card.Link href={plugin.registry_url ?? plugin.homepage} ariaLabel={`View ${plugin.name}`}>
                View plugin
            </Card.Link>
        </Card>
    );
}
