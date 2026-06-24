import Link from "next/link";
import { type PostMeta } from "@/lib/posts";
import { PostMetaBar } from "./PostMetaBar";
import { AuthorByline } from "./AuthorByline";

interface PostCardProps {
  post: PostMeta;
  /** Original text-only layout, used by the home page blog section. */
  compact?: boolean;
}

export function PostCard({ post, compact = false }: PostCardProps) {
  if (compact) {
    return (
      <div className="post-card post-card-compact">
        <div className="post-card-byline">
          <AuthorByline handles={post.authors} size="sm" />
        </div>
        <PostMetaBar date={post.date} readingTime={post.readingTime} release={post.release} />
        <Link href={`/blog/${post.slug}`} className="post-card-body">
          <div className="post-title">{post.title}</div>
          <div className="post-excerpt">{post.excerpt}</div>
        </Link>
      </div>
    );
  }

  // Use the post's own Open Graph image as the card visual.
  const imageSrc = `/blog/${post.slug}/opengraph-image`;

  return (
    <div className="post-card">
      <Link href={`/blog/${post.slug}`} className="post-card-visual" aria-hidden="true" tabIndex={-1}>
        <img
          src={imageSrc}
          alt=""
          className="post-card-image"
          loading="lazy"
        />
      </Link>
      <div className="post-card-content">
        <div className="post-card-byline">
          <AuthorByline handles={post.authors} size="sm" />
        </div>
        <PostMetaBar date={post.date} readingTime={post.readingTime} release={post.release} />
        <Link href={`/blog/${post.slug}`} className="post-card-body">
          <h3 className="post-title">{post.title}</h3>
          <p className="post-excerpt">{post.excerpt}</p>
        </Link>
      </div>
    </div>
  );
}
