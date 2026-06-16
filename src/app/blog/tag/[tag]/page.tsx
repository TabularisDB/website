import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { PostCard } from "@/components/PostCard";
import { TagFilter } from "@/components/TagFilter";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import { getAllTags, getPostsByTag, formatDate } from "@/lib/posts";

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
        {featuredPost && (
          <div className="blog-hero-post">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="blog-hero-visual"
              aria-hidden="true"
              tabIndex={-1}
            >
              <img
                src={`/blog/${featuredPost.slug}/opengraph-image`}
                alt=""
                className="blog-hero-image"
              />
            </Link>
            
            <div className="blog-hero-content">
              <div className="blog-hero-meta">
                <span>{formatDate(featuredPost.date)}</span>
                <span>&middot;</span>
                <span>{featuredPost.readingTime} min read</span>
                {featuredPost.release && (
                  <>
                    <span>&middot;</span>
                    <span className="post-release">{featuredPost.release}</span>
                  </>
                )}
                {featuredPost.tags && featuredPost.tags.length > 0 && (
                  <>
                    <span>&middot;</span>
                    <span className="blog-hero-tag-badge">#{featuredPost.tags[0]}</span>
                  </>
                )}
              </div>
              <h2 className="blog-hero-title">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>
              <p className="blog-hero-excerpt">{featuredPost.excerpt}</p>
              <Link href={`/blog/${featuredPost.slug}`} className="blog-hero-cta">
                Read article <span className="arrow">&rarr;</span>
              </Link>
            </div>
          </div>
        )}

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
          <a className="btn-cta" href="https://github.com/TabularisDB/tabularis">
            <GitHubIcon size={16} />
            Star on GitHub
          </a>
          <a
            className="btn-cta discord"
            href="https://discord.com/invite/K2hmhfHRSt"
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
