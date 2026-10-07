import {BOUNTY_STATUS} from '@/lib/plugins/bounties';

export const PLUGIN_ICONS: Record<string, string | null> = {
    redis: 'redis',
    'redis-rust': 'redis',
    informix: 'informix',
    'tubularis-d1': 'cloudflare-d1',
    dynamodb: 'dynamodb',
    postgresql: 'postgresql',
    'mongodb-atlas': 'mongodb',
    mongodb: 'mongodb',
    elasticsearch: 'elasticsearch',
    csv: 'csv',
    sqlserver: 'sqlserver',
    'sql-server': 'sqlserver',
    libsql: 'libsql',
    hackernews: 'hackernews',
    harper: 'harper',
    'google-sheets': 'google-sheets',
    duckdb: 'duckdb',
    db2: 'db2',
    clickhouse: 'clickhouse',
    'cloudflare-d1': 'cloudflare-d1',
    dameng: 'dameng',
    firestore: 'firestore',
    'amazon-redshift': 'amazon-redshift',
    cockroachdb: 'cockroachdb',
    mariadb: 'mysql',
    tidb: 'tidb',
    oracle: 'oracle',
    cassandra: 'cassandra',
    scylladb: 'scylladb',
    firebird: 'firebird',
    'sql-anywhere': 'sql-anywhere',
    'trino-presto': 'trino-presto',
    surrealdb: 'surrealdb',
    snowflake: 'snowflake',
    bigquery: 'bigquery',
    meilisearch: 'meilisearch',
    etcd: 'etcd',
};

export function getPluginIcon(id: string): string | null {
    return PLUGIN_ICONS[id] ?? null;
}

export const STATUS_WEIGHT: Record<BOUNTY_STATUS, number> = {
    [BOUNTY_STATUS.MOST_WANTED]: 0,
    [BOUNTY_STATUS.CLAIMED]: 1,
    [BOUNTY_STATUS.SCOPED]: 2,
    [BOUNTY_STATUS.COMING_SOON]: 3,
    [BOUNTY_STATUS.OPEN]: 4,
    [BOUNTY_STATUS.SHIPPED]: 5,
};

export interface PluginsPageCopy {
    title: string;
    description: string;
}

// Header copy of /plugins (key "all") and of each kind page. A kind without an
// entry falls back to its registry label and description.
export const PLUGINS_PAGE_COPY: Record<string, PluginsPageCopy> = {
    all: {
        title: 'Drivers, themes and more, one install away.',
        description:
            'Plugins add new databases and new looks to Tabularis. Browse what the community has published on the Tabularium registry and install it from inside the app, or build your own.',
    },
    driver: {
        title: 'Every database, one plugin away.',
        description:
            "Drivers connect Tabularis to databases it doesn't ship with. Each one runs as a standalone process speaking JSON-RPC, so it can be written in any language.",
    },
    theme: {
        title: 'Make Tabularis your own.',
        description:
            'Theme packages restyle the whole app, usually with a light and a dark variant. They are declarative and never run code.',
    },
};

// Singular, human label for a kind key: "driver" -> "Driver", "sql-template" -> "Sql template".
export function getKindBadge(key: string): string {
    const words = key.replace(/[-_]+/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
}
