import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { getAllVideoDemos } from "@/lib/videos";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Product Demos | Tabularis",
  description:
    "Watch short Tabularis demos for database connections, SQL editing, notebooks, Visual EXPLAIN, plugins, and AI workflows.",
  alternates: { canonical: "/videos" },
  openGraph: {
    type: "website",
    url: "/videos",
    title: "Product Demos | Tabularis",
    description:
      "Short Tabularis product demos for developers evaluating the database client workflow.",
  },
};

export default function VideosPage() {
  const videos = getAllVideoDemos();

  return (
    <div className="container">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Product Demos", path: "/videos" },
        ])}
      />
      <SiteHeader crumbs={[{ label: "videos" }]} />

      <section>
        <div className="blog-intro">
          <img
            src="/img/logo.png"
            alt="Tabularis Logo"
            className="blog-intro-logo"
          />
          <div className="blog-intro-body">
            <h3>Product Demos</h3>
            <p>
              Short, indexable walkthroughs for the Tabularis workflows people
              evaluate most: SQL editing, notebooks, Visual EXPLAIN, plugins,
              and AI-assisted database work.
            </p>
          </div>
        </div>

        <div className="video-demo-grid">
          {videos.map((video) => (
            <Link
              key={video.slug}
              href={`/videos/${video.slug}`}
              className="video-demo-card"
            >
              <img src={video.poster} alt="" className="video-demo-thumb" />
              <span className="video-demo-label">Demo</span>
              <strong>{video.title}</strong>
              <span>{video.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
