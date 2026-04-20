import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GitHubIcon, DiscordIcon } from "@/components/Icons";
import { PostCard } from "@/components/PostCard";
import { TagFilter } from "@/components/TagFilter";
import { getAllTags, getPostsByTag } from "@/lib/posts";

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

  return (
    <div className="container">
      <SiteHeader
        crumbs={[
          { label: "blog", href: "/blog" },
          { label: `#${tag}` },
        ]}
      />

      <section>
        <TagFilter tags={allTags} activeTag={tag} />

        <p className="tag-page-count">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>

        <div className="post-list">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>

        <div className="cta-strip">
          <a className="btn-cta" href="https://github.com/TabularisDB/tabularis">
            <GitHubIcon size={16} />
            Star on GitHub
          </a>
          <a
            className="btn-cta discord"
            href="https://discord.gg/YrZPHAwMSG"
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
