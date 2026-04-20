import { formatDate } from "@/lib/posts";
import { PostTagBadge } from "./PostTagBadge";

interface PostMetaBarProps {
  date: string;
  readingTime: number;
  release?: string;
  tags?: string[];
}

export function PostMetaBar({ date, readingTime, release, tags = [] }: PostMetaBarProps) {
  return (
    <div className="post-meta">
      <span>{formatDate(date)}</span>
      <span>&middot;</span>
      <span>{readingTime} min read</span>
      {release && (
        <>
          <span>&middot;</span>
          <span className="post-release">{release}</span>
        </>
      )}
      {tags.length > 0 && (
        <>
          <span>&middot;</span>
          {tags.map((t) => (
            <PostTagBadge key={t} tag={t} />
          ))}
        </>
      )}
    </div>
  );
}
