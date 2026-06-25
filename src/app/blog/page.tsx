import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { Rss } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { FeaturedPost } from "@/components/FeaturedPost";
import { TagFilter } from "@/components/TagFilter";
import { Pagination } from "@/components/Pagination";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import { getPaginatedPosts, getAllTags } from "@/lib/posts";
import { OG_IMAGE_URL } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Blog | Tabularis",
  description:
    "Release notes and updates from the Tabularis project — one post per release.",
  openGraph: {
    type: "website",
    url: "https://tabularis.dev/blog/",
    title: "Blog | Tabularis",
    description:
      "Release notes and updates from the Tabularis project — one post per release.",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Tabularis",
    description:
      "Release notes and updates from the Tabularis project — one post per release.",
    images: [OG_IMAGE_URL],
  },
};

export default function BlogPage() {
  const { posts, totalPages, currentPage } = getPaginatedPosts(1);
  const tags = getAllTags();

  const isFirstPage = currentPage === 1;
  const featuredPost = isFirstPage && posts.length > 0 ? posts[0] : null;
  const gridPosts = isFirstPage ? posts.slice(1) : posts;

  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "blog" }]} />

      <section className="blog-section">
        <TagFilter tags={tags} />

        {/* Featured Post (Hero) */}
        {featuredPost && <FeaturedPost post={featuredPost} showByline />}

        {/* Posts archive */}
        {gridPosts.length > 0 && (
          <div className="blog-archive">
            <div className="blog-archive-head">
              <h2>{featuredPost ? "More posts" : "All posts"}</h2>
            </div>
            <div className="blog-posts-grid">
              {gridPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} />

        <BlogNewsletter />

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
            href="https://discord.com/invite/K2hmhfHRSt"
          >
            <DiscordIcon size={16} />
            Join Discord
          </a>
          <a className="btn-cta" href="/feed.xml">
            <Rss size={16} />
            RSS feed
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
