import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { getAllAuthorHandles, getPostsByAuthor } from "@/lib/posts";
import { AUTHORS, getAuthor, authorAvatarUrl, authorGitHubUrl } from "@/lib/authors";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export function generateStaticParams() {
  // Only authors with at least one published post get an archive page.
  return getAllAuthorHandles()
    .filter((handle) => handle in AUTHORS)
    .map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const key = handle.toLowerCase();
  if (!(key in AUTHORS)) notFound();
  const author = getAuthor(key);
  const title = `${author.name} | Tabularis Blog`;
  const description = `Posts by ${author.name} on the Tabularis blog. ${author.bio}`;
  // No per-author card exists, and the opengraph-image convention does not
  // cascade into this nested segment, so fall back to the generated blog-section
  // card (renamed to `.png` by scripts/finalize-og-images.mjs). Setting `images`
  // explicitly is required: an openGraph block without it emits no og:image.
  const images = [
    {
      url: "https://tabularis.dev/blog/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: title,
    },
  ];
  return {
    title,
    description,
    openGraph: {
      type: "profile",
      url: `https://tabularis.dev/blog/author/${author.handle}`,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function AuthorArchivePage({ params }: PageProps) {
  const { handle } = await params;
  const key = handle.toLowerCase();
  if (!(key in AUTHORS)) notFound();

  const author = getAuthor(key);
  const posts = getPostsByAuthor(key);
  if (posts.length === 0) notFound();

  return (
    <div className="container">
      <SiteHeader
        crumbs={[{ label: "blog", href: "/blog" }, { label: author.name }]}
      />

      <section className="blog-section">
        <header className="author-archive-header">
          <img
            src={authorAvatarUrl(author.github)}
            alt={author.name}
            className="author-archive-avatar"
          />
          <div className="author-archive-info">
            <h1 className="author-archive-name">{author.name}</h1>
            <p className="author-archive-bio">
              {author.bio}{" "}
              <a
                href={authorGitHubUrl(author.github)}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{author.github}
              </a>
            </p>
            <p className="author-archive-count">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
        </header>

        <div className="blog-archive">
          <div className="blog-posts-grid">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
