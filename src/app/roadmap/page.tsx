import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getAllInitiativeMetas,
  type InitiativeMeta,
  type InitiativeStatus,
} from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "Roadmap | Tabularis",
  description:
    "Tabularis roadmap. Active initiatives, open tasks, planned work.",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    type: "website",
    url: "https://tabularis.dev/roadmap/",
    title: "Roadmap | Tabularis",
    description:
      "Tabularis roadmap. Active initiatives, open tasks, planned work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap | Tabularis",
    description:
      "Tabularis roadmap. Active initiatives, open tasks, planned work.",
  },
};

const STATUS_LABEL: Record<InitiativeStatus, string> = {
  "in-progress": "In progress",
  planned: "Planned",
  done: "Shipped",
};

function InitiativeCard({ meta }: { meta: InitiativeMeta }) {
  const pct =
    meta.progressDone !== undefined && meta.progressTotal
      ? Math.round((meta.progressDone / meta.progressTotal) * 100)
      : undefined;

  return (
    <Link href={`/roadmap/${meta.slug}`} className="rm-card">
      <div className="rm-card-topline">
        <div className="rm-card-meta">
          <span className={`rm-badge rm-badge-${meta.status}`}>
            {STATUS_LABEL[meta.status]}
          </span>
          {meta.category && (
            <span className="rm-card-category">{meta.category}</span>
          )}
        </div>

        {pct !== undefined && (
          <div className="rm-card-progress-hero">
            <span className="rm-card-progress-kicker">Completion</span>
            <span className="rm-card-progress-value">{pct}%</span>
            <div
              className="rm-card-progress-track"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={meta.progressLabel ?? `${pct}% shipped`}
            >
              <div
                className="rm-card-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <h2 className="rm-card-title">{meta.title}</h2>
      {meta.lede && <p className="rm-card-lede">{meta.lede}</p>}

      <span className="rm-card-cta">Read details →</span>
    </Link>
  );
}

export default function RoadmapPage() {
  const metas = getAllInitiativeMetas();

  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Roadmap", path: "/roadmap" },
          ]),
        ]}
      />
      <SiteHeader crumbs={[{ label: "roadmap" }]} />

      <section>
        <div className="blog-intro">
          <img
            src="/img/logo.png"
            alt="Tabularis Logo"
            className="blog-intro-logo"
          />
          <div className="blog-intro-body">
            <h3>Roadmap</h3>
            <p>
              Active initiatives and the work queued behind them. Each
              entry links to a GitHub epic; sub-issues are where the
              actual work happens. Click a card for the technical
              write-up, the open tasks and how to claim one.
            </p>
          </div>
        </div>

        {metas.length > 0 && (
          <section className="rm-grid">
            {metas.map((meta) => (
              <InitiativeCard key={meta.slug} meta={meta} />
            ))}
          </section>
        )}

        <section className="rm-future">
          <h2 className="rm-future-title">Not yet on the board</h2>
          <p>
            Other drivers and major features land here as they move from
            idea to scoped work. Propose one via a{" "}
            <a
              href="https://github.com/TabularisDB/tabularis/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Discussion
            </a>
            .
          </p>
        </section>

        <div className="cta-strip">
          <a
            className="btn-cta"
            href="https://github.com/TabularisDB/tabularis"
          >
            <GitHubIcon size={16} />
            Star on GitHub
          </a>
          <a
            className="btn-cta discord"
            href="https://discord.gg/YrZPHAwMSG"
          >
            <DiscordIcon size={16} />
            Join Discord
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
