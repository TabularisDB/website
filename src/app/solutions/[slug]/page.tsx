import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { WikiContent } from "@/components/WikiContent";
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
  return getSeoPagesBySection("solutions").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPageBySlug("solutions", slug);
  if (!page) return {};

  return {
    title: page.meta.metaTitle || `${page.meta.title} | Tabularis`,
    description: page.meta.description || page.meta.excerpt,
    alternates: {
      canonical: getSeoPagePath("solutions", slug),
    },
    openGraph: {
      type: "article",
      url: getSeoPagePath("solutions", slug),
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

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoPageBySlug("solutions", slug);
  if (!page) notFound();

  const { prev, next } = getAdjacentSeoPages("solutions", slug);

  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/solutions" },
            { name: page.meta.title, path: getSeoPagePath("solutions", slug) },
          ]),
          buildArticleJsonLd({
            title: page.meta.title,
            description: page.meta.description || page.meta.excerpt,
            path: getSeoPagePath("solutions", slug),
            image: page.meta.image,
          }),
        ]}
      />
      <SiteHeader
        crumbs={[
          { label: "solutions", href: "/solutions" },
          { label: page.meta.title },
        ]}
      />

      <section>
        <div className="blog-intro">
          <img
            src={page.meta.image || "/img/logo.png"}
            alt={page.meta.title}
            className="blog-intro-logo"
          />
          <div className="blog-intro-body">
            <h3>{page.meta.title}</h3>
            <p>{page.meta.excerpt}</p>
          </div>
        </div>

        <WikiContent html={page.html} />

        <div className="post-footer-cta">
          <p>Try the workflow locally or dig into the product docs.</p>
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
              <Link href={getSeoPagePath("solutions", prev.slug)}>
                <span className="post-nav-label">&larr; Previous</span>
                <span className="post-nav-title">{prev.title}</span>
              </Link>
            ) : (
              <span className="post-nav-empty" />
            )}
          </div>
          <div className="post-nav-item post-nav-next">
            {next ? (
              <Link href={getSeoPagePath("solutions", next.slug)}>
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
