import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { getSeoPagesBySection, getSeoPagePath } from "@/lib/seoPages";
import { SeoPageThumb } from "@/components/SeoPagePreview";
import { ComparisonBuilder } from "@/components/ComparisonBuilder";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Compare | Tabularis",
  description:
    "Comparison pages for teams evaluating Tabularis against other database clients and SQL tools.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  const pages = getSeoPagesBySection("compare");

  return (
    <div className="container">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ])}
      />
      <SiteHeader crumbs={[{ label: "compare" }]} />

      <section>
        <div className="blog-intro">
          <img
            src="/img/logo.png"
            alt="Tabularis Logo"
            className="blog-intro-logo"
          />
          <div className="blog-intro-body">
            <h3>Compare</h3>
            <p>
            Comparison pages for developer teams evaluating Tabularis against
            other database tools and SQL workflows.
            </p>
          </div>
        </div>

        <ComparisonBuilder />

        <div className="plugin-list">
          {pages.map((page) => (
            <div key={page.slug} className="plugin-entry seo-entry">
              <SeoPageThumb meta={page} className="seo-entry-thumb" />
              <div className="plugin-entry-info">
                <div className="plugin-entry-header">
                  <Link
                    href={getSeoPagePath("compare", page.slug)}
                    className="plugin-name"
                  >
                    {page.title}
                  </Link>
                  <span className="plugin-badge">{page.format || "Guide"}</span>
                </div>
                <p className="plugin-desc">{page.excerpt}</p>
                <div className="plugin-meta">
                  {page.audience && <span>{page.audience}</span>}
                  {page.audience && page.useCase && <span>&nbsp;&middot;&nbsp;</span>}
                  {page.useCase && <span>{page.useCase}</span>}
                </div>
              </div>
              <Link
                href={getSeoPagePath("compare", page.slug)}
                className="btn-plugin"
              >
                Open &rarr;
              </Link>
            </div>
          ))}
        </div>

        <div className="plugin-cta">
          <h3>Prefer to explore by use case?</h3>
          <p>
            If you are earlier in the decision process, start from the workflow
            itself instead of the tool comparison.
          </p>
          <Link
            href="/solutions"
            className="btn-download"
            style={{ display: "inline-flex", width: "auto" }}
          >
            Browse solutions &rarr;
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
