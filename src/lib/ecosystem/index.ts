export interface DocsListing {
    id: string;
    name: string;
    /** Page or anchor of the vendor's documentation that lists Tabularis. */
    href: string;
    logoImg: string;
}

export const DOCS_LISTINGS: DocsListing[] = [
    {
        id: 'mariadb',
        name: 'MariaDB',
        href: 'https://mariadb.com/docs/server/clients-and-utilities/graphical-and-enhanced-clients/tabularis',
        logoImg: '/img/logos/plugins/mariadb.svg',
    },
    {
        id: 'redis',
        name: 'Redis',
        href: 'https://redis.io/docs/latest/develop/tools/#tabularis',
        logoImg: '/img/logos/plugins/redis.svg',
    },
    {
        id: 'clickhouse',
        name: 'ClickHouse',
        href: 'https://clickhouse.com/docs/integrations/connectors/tools/gui#tabularis',
        logoImg: '/img/logos/plugins/clickhouse.svg',
    },
    {
        id: 'trino',
        name: 'Trino',
        href: 'https://trino.io/ecosystem/client-application#tabularis',
        logoImg: '/img/logos/plugins/trino-presto.svg',
    },
    {
        id: 'cloudberry',
        name: 'Apache Cloudberry',
        href: 'https://cloudberry.apache.org/docs/ecosystem/sql-clients/tabularis',
        logoImg: '/img/logos/plugins/apache-cloudberry.svg',
    },
];
