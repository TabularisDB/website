import Link from "next/link";
import { type PostMeta, postOgImage, formatDate } from "@/lib/posts";
import { AuthorByline } from "./AuthorByline";

interface FeaturedPostProps {
  post: PostMeta;
  /** Show the author byline above the meta row (blog index). */
  showByline?: boolean;
  /** Show the primary-tag badge in the meta row (tag pages). */
  showTagBadge?: boolean;
}

/** The large "hero" card for the first post on the blog index and tag pages. */
export function FeaturedPost({
  post,
  showByline = false,
  showTagBadge = false,
}: FeaturedPostProps) {
  return (
    <div className="blog-hero-post">
      <Link
        href={`/blog/${post.slug}`}
        className="blog-hero-visual"
        aria-hidden="true"
        tabIndex={-1}
      >
        <img src={postOgImage(post.slug)} alt="" className="blog-hero-image" />
      </Link>

      <div className="blog-hero-content">
        {showByline && (
          <div className="blog-hero-byline">
            <AuthorByline handles={post.authors} size="md" />
          </div>
        )}
        <div className="blog-hero-meta">
          <span>{formatDate(post.date)}</span>
          <span className="post-byline-sep">&middot;</span>
          <span>{post.readingTime} min read</span>
          {post.release && (
            <>
              <span className="post-byline-sep">&middot;</span>
              <span className="post-release">{post.release}</span>
            </>
          )}
          {showTagBadge && post.tags && post.tags.length > 0 && (
            <>
              <span className="post-byline-sep">&middot;</span>
              <span className="blog-hero-tag-badge">#{post.tags[0]}</span>
            </>
          )}
        </div>
        <h2 className="blog-hero-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="blog-hero-excerpt">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="blog-hero-cta">
          Read article <span className="arrow">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
