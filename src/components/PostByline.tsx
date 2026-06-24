import { formatDate } from "@/lib/posts";
import { PostTagBadge } from "./PostTagBadge";
import { AuthorByline } from "./AuthorByline";

interface PostBylineProps {
  authors?: string[];
  date: string;
  readingTime: number;
  release?: string;
  tags?: string[];
}

/**
 * Author-led byline at the top of a post: avatar + name (linking to the
 * author's archive) followed by date and reading time, with tags on the line
 * below.
 */
export function PostByline({
  authors,
  date,
  readingTime,
  release,
  tags = [],
}: PostBylineProps) {
  return (
    <div className="post-byline-wrap">
      <div className="post-byline">
        <AuthorByline handles={authors} size="md" />
        <span className="post-byline-meta">
          <span className="post-byline-sep">&middot;</span>
          <span>{formatDate(date)}</span>
          <span className="post-byline-sep">&middot;</span>
          <span>{readingTime} min read</span>
          {release && (
            <>
              <span className="post-byline-sep">&middot;</span>
              <span className="post-release">{release}</span>
            </>
          )}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="post-byline-tags">
          {tags.map((t) => (
            <PostTagBadge key={t} tag={t} />
          ))}
        </div>
      )}
    </div>
  );
}
