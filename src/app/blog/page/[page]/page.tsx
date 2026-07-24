import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { PostCard } from "@/components/PostCard";
import { TagFilter } from "@/components/TagFilter";
import { Pagination } from "@/components/Pagination";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import { getPaginatedPosts, getTotalPages } from "@/lib/posts";
import { SOCIAL_URLS } from "@/lib/social";

export function generateStaticParams() {
  const totalPages = getTotalPages();
  const count = Math.max(0, totalPages - 1);
  return Array.from({ length: count }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Blog – Page ${page} | Tabularis`,
    description:
      "Release notes and updates from the Tabularis project — one post per release.",
  };
}

export default async function BlogPageN({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageStr } = await params;
  const page = Number(pageStr);
  const { posts, totalPages, currentPage } = getPaginatedPosts(page);

  if (!posts.length || currentPage !== page) {
    notFound();
  }

  return (
    <div className="container">
      <SiteHeader
        crumbs={[
          { label: "blog", href: "/blog" },
          { label: `page ${page}` },
        ]}
      />

      <section className="blog-section">
        <TagFilter activeTag={undefined} />

        <div className="blog-archive">
          <div className="blog-archive-head">
            <h2>All posts</h2>
          </div>
          <div className="blog-posts-grid">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} />

        <BlogNewsletter />

        <div className="cta-strip">
          <a className="btn-cta" href={SOCIAL_URLS.github}>
            <GitHubIcon size={16} />
            Star on GitHub
          </a>
          <a
            className="btn-cta discord"
            href={SOCIAL_URLS.discord}
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
