import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { PostCard } from "@/components/PostCard";
import { FeaturedPost } from "@/components/FeaturedPost";
import { TagFilter } from "@/components/TagFilter";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { SOCIAL_URLS } from "@/lib/social";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} | Tabularis Blog`,
    description: `All Tabularis blog posts tagged with "${tag}".`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  const allTags = getAllTags();

  if (!posts.length) notFound();

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.slice(1);

  return (
    <div className="container">
      <SiteHeader
        crumbs={[
          { label: "blog", href: "/blog" },
          { label: `#${tag}` },
        ]}
      />

      <section className="blog-section">
        <TagFilter activeTag={tag} />

        <p className="tag-page-count">
          {posts.length} {posts.length === 1 ? "post" : "posts"} tagged with <strong>#{tag}</strong>
        </p>

        {/* Featured Post (Hero) */}
        {featuredPost && <FeaturedPost post={featuredPost} showTagBadge />}

        {/* Posts archive */}
        {gridPosts.length > 0 && (
          <div className="blog-archive">
            <div className="blog-archive-head">
              <h2>More in #{tag}</h2>
            </div>
            <div className="blog-posts-grid">
              {gridPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}

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
