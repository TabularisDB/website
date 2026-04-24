import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { NewsletterForm } from "@/components/NewsletterForm";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getAllVideoDemos, getVideoDemoBySlug } from "@/lib/videos";
import {
  buildBreadcrumbJsonLd,
  buildVideoObjectJsonLd,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllVideoDemos().map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoDemoBySlug(slug);
  if (!video) return {};

  return {
    title: `${video.title} | Tabularis Demo`,
    description: video.description,
    alternates: { canonical: `/videos/${video.slug}` },
    openGraph: {
      type: "video.other",
      url: `/videos/${video.slug}`,
      title: `${video.title} | Tabularis Demo`,
      description: video.description,
      images: [video.poster],
      videos: [video.src],
    },
    twitter: {
      card: "summary_large_image",
      title: `${video.title} | Tabularis Demo`,
      description: video.description,
      images: [video.poster],
    },
  };
}

export default async function VideoDemoPage({ params }: PageProps) {
  const { slug } = await params;
  const video = getVideoDemoBySlug(slug);
  if (!video) notFound();

  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Product Demos", path: "/videos" },
            { name: video.title, path: `/videos/${video.slug}` },
          ]),
          buildVideoObjectJsonLd(video),
        ]}
      />
      <SiteHeader
        crumbs={[
          { label: "videos", href: "/videos" },
          { label: video.title },
        ]}
      />

      <section className="video-demo-page">
        <div className="blog-intro">
          <img
            src="/img/logo.png"
            alt="Tabularis Logo"
            className="blog-intro-logo"
          />
          <div className="blog-intro-body">
            <h3>{video.title}</h3>
            <p>{video.description}</p>
          </div>
        </div>

        <VideoPlayer
          src={video.src}
          poster={video.poster}
          wrapperClassName="video-demo-player"
          ariaLabel={video.title}
        />

        <div className="video-demo-copy">
          <p>
            This demo is a quick way to evaluate the workflow before installing
            Tabularis locally. If it matches your use case, download the desktop
            app and test it against a real development database.
          </p>
          <div className="cta-links">
            <Link className="btn-cta" href="/download">
              Download Tabularis
            </Link>
            <Link className="btn-cta discord" href={video.relatedHref}>
              {video.relatedLabel}
            </Link>
          </div>
        </div>

        <NewsletterForm
          compact
          title="Get future demo updates"
          description="Receive new workflow demos, release notes, and practical setup tips as Tabularis evolves."
          buttonLabel="Notify me"
        />
      </section>

      <Footer />
    </div>
  );
}
