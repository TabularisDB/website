import Link from "next/link";
import { resolveAuthors, authorAvatarUrl } from "@/lib/authors";

interface AuthorBylineProps {
  /** Frontmatter author handles. Falls back to the default author when empty. */
  handles?: string[];
  /** `sm` for post cards, `md` for the byline at the top of a post. */
  size?: "sm" | "md";
}

/**
 * Compact avatar + name byline. Each author links to their archive at
 * /blog/author/<handle>. Used at the top of a post and on post cards.
 */
export function AuthorByline({ handles, size = "sm" }: AuthorBylineProps) {
  const authors = resolveAuthors(handles);
  if (authors.length === 0) return null;

  return (
    <div className={`author-byline author-byline-${size}`}>
      {authors.map((author) => (
        <Link
          key={author.handle}
          href={`/blog/author/${author.handle}`}
          className="author-byline-link"
        >
          <img
            src={authorAvatarUrl(author.github)}
            alt={author.name}
            className="author-byline-avatar"
            loading="lazy"
          />
          <span className="author-byline-name">{author.name}</span>
        </Link>
      ))}
    </div>
  );
}
