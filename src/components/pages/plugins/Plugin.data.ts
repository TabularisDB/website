import {BOUNTY_STATUS} from '@/lib/pluginBounties';

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
    libsql: 'libsql',
    hackernews: 'hackernews',
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
