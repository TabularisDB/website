import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { WikiContent } from "@/components/WikiContent";
import { ComparisonTable } from "@/components/ComparisonTable";
import { SeoPageHeroVisual } from "@/components/SeoPagePreview";
import {
  getAdjacentSeoPages,
  getSeoPageBySlug,
  getSeoPagesBySection,
  getSeoPagePath,
} from "@/lib/seoPages";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getSeoPagesBySection("compare").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPageBySlug("compare", slug);
  if (!page) return {};

  return {
    title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
    description: page.meta.description || page.meta.excerpt,
    alternates: {
      canonical: getSeoPagePath("compare", slug),
    },
    openGraph: {
      type: "article",
      url: getSeoPagePath("compare", slug),
      title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
      description: page.meta.description || page.meta.excerpt,
      images: page.meta.image ? [page.meta.image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
      description: page.meta.description || page.meta.excerpt,
      images: page.meta.image ? [page.meta.image] : undefined,
    },
  };
}

export default async function CompareDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoPageBySlug("compare", slug);
  if (!page) notFound();

  const { prev, next } = getAdjacentSeoPages("compare", slug);

  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: page.meta.title, path: getSeoPagePath("compare", slug) },
          ]),
          buildArticleJsonLd({
            title: page.meta.title,
            description: page.meta.description || page.meta.excerpt,
            path: getSeoPagePath("compare", slug),
            image: page.meta.image,
          }),
        ]}
      />
      <SiteHeader
        crumbs={[
          { label: "compare", href: "/compare" },
          { label: page.meta.title },
        ]}
      />

      <section>
        <div className="blog-intro">
          <SeoPageHeroVisual meta={page.meta} />
          <div className="blog-intro-body">
            <h3>{page.meta.title}</h3>
            <p>{page.meta.excerpt}</p>
          </div>
        </div>

        <ComparisonTable slug={slug} />

        <WikiContent html={page.html} />

        <div className="post-footer-cta">
          <p>Compare on your own workflow with the desktop app and docs.</p>
          <div className="cta-links">
            <Link className="btn-cta" href="/download">
              Download Tabularis
            </Link>
            <Link className="btn-cta discord" href="/wiki">
              Read the docs
            </Link>
          </div>
        </div>

        <nav className="post-nav">
          <div className="post-nav-item post-nav-prev">
            {prev ? (
              <Link href={getSeoPagePath("compare", prev.slug)}>
                <span className="post-nav-label">&larr; Previous</span>
                <span className="post-nav-title">{prev.title}</span>
              </Link>
            ) : (
              <span className="post-nav-empty" />
            )}
          </div>
          <div className="post-nav-item post-nav-next">
            {next ? (
              <Link href={getSeoPagePath("compare", next.slug)}>
                <span className="post-nav-label">Next &rarr;</span>
                <span className="post-nav-title">{next.title}</span>
              </Link>
            ) : (
              <span className="post-nav-empty" />
            )}
          </div>
        </nav>
      </section>

      <Footer />
    </div>
  );
}
