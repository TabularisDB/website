import type { CSSProperties } from "react";
import Link from "next/link";
import * as si from "simple-icons";
import {
  BOUNTY_STATUS_LABEL,
  getAllBounties,
  type BountyStatus,
} from "@/lib/pluginBounties";

type AccentStyle = CSSProperties & {
  "--bounty-accent": string;
};

interface DriverEntry {
  id: string;
  name: string;
  status: BountyStatus;
  accent: string;
}

// Drivers with their own dedicated landing page (existing solution pages).
const DEDICATED_HREF: Record<string, string> = {
  postgres: "/solutions/postgresql-client",
  sqlite: "/solutions/sqlite-client-for-developers",
  mariadb: "/solutions/mysql-client-for-developers",
};

function hrefFor(entry: DriverEntry): string {
  if (DEDICATED_HREF[entry.id]) return DEDICATED_HREF[entry.id];
  // Already-shipped plugins live in the registry listing.
  if (entry.status === "shipped") return "/plugins";
  // Everything else is a bounty on the board.
  return `/plugins/bounties#${entry.id}`;
}

const STATUS_ORDER: Record<BountyStatus, number> = {
  shipped: 0,
  claimed: 1,
  scoped: 2,
  "coming-soon": 3,
  "most-wanted": 4,
  open: 5,
};

// File/API sources rather than real databases — sorted after real engines
// within their status group.
const NON_DATABASE_SOURCES = new Set(["csv", "hackernews", "google-sheets"]);

// Built-in core drivers — kept off the bounty board, surfaced here for coverage.
const CORE_DRIVERS: DriverEntry[] = [
  {
    id: "postgres",
    name: "PostgreSQL",
    status: "shipped",
    accent: "#336791",
  },
  {
    id: "sqlite",
    name: "SQLite",
    status: "shipped",
    accent: "#003b57",
  },
];

// Maps a driver id to a simple-icons export name. Ids absent here fall back to
// a generic database glyph (several brands are not available in simple-icons).
const ICON_NAME: Record<string, string> = {
  postgres: "siPostgresql",
  sqlite: "siSqlite",
  mariadb: "siMysql",
  redis: "siRedis",
  mongodb: "siMongodb",
  clickhouse: "siClickhouse",
  duckdb: "siDuckdb",
  snowflake: "siSnowflake",
  bigquery: "siGooglebigquery",
  cassandra: "siApachecassandra",
  meilisearch: "siMeilisearch",
  scylladb: "siScylladb",
  cockroachdb: "siCockroachlabs",
  elasticsearch: "siElasticsearch",
  libsql: "siTurso",
  etcd: "siEtcd",
  "cloudflare-d1": "siCloudflare",
  firestore: "siFirebase",
  csv: "siFiles",
  hackernews: "siYcombinator",
  "google-sheets": "siGooglesheets",
  tidb: "siTidb",
  "sql-anywhere": "siSap",
  "trino-presto": "siTrino",
  surrealdb: "siSurrealdb",
};

const icons = si as unknown as Record<string, { path: string } | undefined>;

function DriverLogo({ id }: { id: string }) {
  const icon = icons[ICON_NAME[id]];

  if (icon?.path) {
    return (
      <svg
        className="driver-status-logo"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d={icon.path} fill="currentColor" />
      </svg>
    );
  }

  // Generic database cylinder for brands not covered by simple-icons.
  return (
    <svg
      className="driver-status-logo"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}

export function HomeDriverStatus() {
  const fromBounties: DriverEntry[] = getAllBounties().map((bounty) => ({
    id: bounty.id,
    name: bounty.name,
    status: bounty.status,
    accent: bounty.accent,
  }));

  const drivers = [...CORE_DRIVERS, ...fromBounties].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      Number(NON_DATABASE_SOURCES.has(a.id)) -
        Number(NON_DATABASE_SOURCES.has(b.id)) ||
      a.name.localeCompare(b.name),
  );

  return (
    <section className="section" id="driver-coverage">
      <h2>Driver &amp; Plugin Coverage</h2>
      <p>
        Every database Tabularis supports today and the ones the community is
        building next — each tagged with where it stands, from shipped drivers
        to open bounties.
      </p>

      <div className="driver-status-grid">
        {drivers.map((driver) => (
          <Link
            key={driver.id}
            href={hrefFor(driver)}
            className="driver-status-card"
            style={{ "--bounty-accent": driver.accent } as AccentStyle}
          >
            <span className="driver-status-head">
              <DriverLogo id={driver.id} />
              <span className="driver-status-name">{driver.name}</span>
            </span>
            <span className={`bounty-status bounty-status-${driver.status}`}>
              {BOUNTY_STATUS_LABEL[driver.status]}
            </span>
          </Link>
        ))}

        <a
          href="https://github.com/TabularisDB/tabularis/discussions"
          target="_blank"
          rel="noopener noreferrer"
          className="driver-status-card driver-status-request"
        >
          <span className="driver-status-name">+ Request a database</span>
        </a>
      </div>

      <p className="blog-all-link" style={{ marginTop: "1.5rem" }}>
        <Link href="/plugins/bounties" style={{ fontWeight: 600 }}>
          Explore the Bounty Board →
        </Link>
      </p>
      <p className="blog-all-link" style={{ marginTop: "0.75rem" }}>
        <Link href="/plugins" style={{ fontWeight: 600 }}>
          Explore Plugins →
        </Link>
      </p>
    </section>
  );
}
