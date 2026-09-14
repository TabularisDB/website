'use client';

import {useState, useEffect} from 'react';
import {getShippedBounties} from '@/lib/pluginBounties';
import styles from './PluginArc.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {ArrowRight} from 'lucide-react';

const FEATURED_IDS = [
    'hackernews',
    'csv',
    'google-sheets',
    'firestore',
    'dynamodb',
    'duckdb',
    'redis',
    'clickhouse',
    'mongodb',
    'elasticsearch',
    'db2',
    'cloudflare-d1',
    'libsql',
];

const BREAKPOINT = 768;
const ARC_SPAN = 150;

const BASE_SIZE_X = 1200;
const BASE_RATIO = 1.6667;
const BASE_DURATION = 150;

function getArcMetrics() {
    const sizeX = Math.min(BASE_SIZE_X, window.innerWidth * 0.9);
    const ratio = window.innerWidth <= 900 ? 1.4 : BASE_RATIO;
    return {sizeX, ratio};
}

function averageRadius(sizeX: number, ratio: number) {
    return (sizeX / 2 + sizeX / ratio / 2) / 2;
}

const BASE_RADIUS = averageRadius(BASE_SIZE_X, BASE_RATIO);

export function PluginArc() {
    const [isCompact, setIsCompact] = useState(false);
    const [duration, setDuration] = useState(BASE_DURATION);

    useEffect(() => {
        const check = () => {
            setIsCompact(window.innerWidth < BREAKPOINT);

            const {sizeX, ratio} = getArcMetrics();
            const radius = averageRadius(sizeX, ratio);
            const scaled = BASE_DURATION * (radius / BASE_RADIUS);
            setDuration(Math.min(150, Math.max(40, scaled)));
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const plugins = getShippedBounties()
        .filter((plugin) => !plugin.tags.includes('built-in'))
        .filter((plugin) => FEATURED_IDS.includes(plugin.id))
        .sort((a, b) => FEATURED_IDS.indexOf(a.id) - FEATURED_IDS.indexOf(b.id));

    const total = plugins.length;

    const originalStep = ARC_SPAN / (total - 1);
    const slots = Math.round(360 / originalStep);
    const step = 360 / slots;

    const ring = Array.from({length: slots}, (_, i) => ({
        plugin: plugins[i % total],
        angle: i * step,
        key: `${plugins[i % total].id}-${i}`,
    }));

    return (
        <div className={styles.arcWrapper}>
            {isCompact ? (
                <div className={styles.compactGrid}>
                    {plugins.map((plugin) => (
                        <div key={plugin.name} className={styles.gridTile} title={plugin.name}>
                            <img
                                className={styles.gridIcon}
                                src={`/img/logos/plugins/${plugin.id}.svg`}
                                alt={plugin.name}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.maskLayer}>
                    <div className={styles.circle} style={{'--duration': `${duration}s`} as React.CSSProperties}>
                        {ring.map(({plugin, angle, key}) => (
                            <div
                                key={key}
                                className={styles.arcIcon}
                                style={
                                    {
                                        '--angle': `${angle}deg`,
                                    } as React.CSSProperties
                                }
                                title={plugin.name}
                            >
                                <img
                                    className={styles.icon}
                                    src={`/img/logos/plugins/${plugin.id}.svg`}
                                    alt={plugin.name}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.actions}>
                <Button href="/plugins" size="md">
                    Browse all plugins
                    <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );
}
