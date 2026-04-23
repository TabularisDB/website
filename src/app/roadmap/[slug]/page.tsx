import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { OG_IMAGE_URL } from "@/lib/siteConfig";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getAllInitiativeSlugs,
  getInitiativeBySlug,
  type InitiativeStatus,
} from "@/lib/roadmap";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllInitiativeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const initiative = getInitiativeBySlug(slug);
  if (!initiative) return {};

  const { title, lede } = initiative.meta;
  const pageTitle = `${title} — Roadmap | Tabularis`;
  const pageDesc = lede || "Tabularis roadmap initiative details.";

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: { canonical: `/roadmap/${slug}` },
    openGraph: {
      type: "article",
      url: `https://tabularis.dev/roadmap/${slug}/`,
      title: pageTitle,
      description: pageDesc,
      images: [OG_IMAGE_URL],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [OG_IMAGE_URL],
    },
  };
}

const STATUS_LABEL: Record<InitiativeStatus, string> = {
  "in-progress": "In progress",
  planned: "Planned",
  done: "Shipped",
};

export default async function InitiativePage({ params }: PageProps) {
  const { slug } = await params;
  const initiative = getInitiativeBySlug(slug);
  if (!initiative) notFound();

  const { meta, html } = initiative;
  const pct =
    meta.progressDone !== undefined && meta.progressTotal
      ? Math.round((meta.progressDone / meta.progressTotal) * 100)
      : undefined;

  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Roadmap", path: "/roadmap" },
            { name: meta.title, path: `/roadmap/${slug}` },
          ]),
        ]}
      />
      <SiteHeader
        crumbs={[
          { label: "roadmap", href: "/roadmap" },
          { label: meta.slug },
        ]}
      />

      <main className="rm-page">
        <Link href="/roadmap" className="rm-back-link">
          ← All initiatives
        </Link>

        <section className="rm-initiative">
          <header className="rm-initiative-header">
            <div className="rm-initiative-meta">
              <span className={`rm-badge rm-badge-${meta.status}`}>
                {STATUS_LABEL[meta.status]}
              </span>
              {meta.category && (
                <span className="rm-initiative-category">
                  {meta.category}
                </span>
              )}
            </div>
            <h1 className="rm-initiative-title">{meta.title}</h1>
            {meta.lede && (
              <p className="rm-initiative-lede">{meta.lede}</p>
            )}

            {pct !== undefined && (
              <div className="rm-progress-row">
                <div
                  className="rm-progress-bar"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={meta.progressLabel ?? `${pct}% shipped`}
                >
                  <div
                    className="rm-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {meta.progressLabel && (
                  <span className="rm-progress-label">
                    {meta.progressLabel}
                  </span>
                )}
              </div>
            )}

            {meta.links && meta.links.length > 0 && (
              <div className="rm-initiative-links">
                {meta.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            )}
          </header>

          <div
            className="rm-md-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
