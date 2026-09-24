import {PlugIcon} from 'lucide-react';
import {getAllPlugins, getLatestRelease} from '@/lib/plugins';
import styles from './PluginGrid.module.scss';
import {getPluginIcon} from '../Plugin.data';

export function PluginGrid() {
    const plugins = getAllPlugins();

    return (
        <div className={styles.grid}>
            {plugins.map((plugin) => {
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
                                <img
                                    className={styles.cardIcon}
                                    src={`/img/logos/plugins/${iconSlug}.svg`}
                                    alt={plugin.name}
                                />
                            ) : (
                                <span className={styles.cardIcon}>
                                    <PlugIcon />
                                </span>
                            )}

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
    );
}
