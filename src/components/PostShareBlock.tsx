import {
  BlueskyIcon,
  LinkedInIcon,
  RedditIcon,
  XBrandIcon,
} from "@/components/Icons";
import { ShareButton } from "@/components/ShareButton";
import { buildSocialShareUrls } from "@/lib/social";

interface PostShareBlockProps {
  title: string;
  url: string;
  compact?: boolean;
}

export function PostShareBlock({
  title,
  url,
  compact = false,
}: PostShareBlockProps) {
  const absoluteUrl = new URL(url, "https://tabularis.dev").toString();
  const shareText = `${title} — Tabularis`;
  const shareUrls = buildSocialShareUrls({
    url: absoluteUrl,
    text: shareText,
  });

  const platforms = [
    {
      label: "Bluesky",
      href: shareUrls.bluesky,
      icon: <BlueskyIcon size={15} />,
      className: "bluesky",
    },
    {
      label: "Share on X",
      href: shareUrls.x,
      icon: <XBrandIcon size={15} />,
      className: "x",
    },
    {
      label: "LinkedIn",
      href: shareUrls.linkedin,
      icon: <LinkedInIcon size={15} />,
      className: "linkedin",
    },
    {
      label: "Reddit",
      href: shareUrls.reddit,
      icon: <RedditIcon size={15} />,
      className: "reddit",
    },
  ];

  return (
    <section
      className={`post-share-block${compact ? " post-share-block--compact post-rail-card" : ""}`}
      aria-label="Share this post"
    >
      <div className="post-share-block__copy">
        {!compact && (
          <span className="post-share-block__eyebrow">// pass it on</span>
        )}
        <h2>Share this post</h2>
      </div>
      <div className="post-share-block__actions">
        {platforms.map(({ label, href, icon, className }) => (
          <a
            key={label}
            className={`post-share-block__button ${className}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {icon}
            {label}
          </a>
        ))}
        <ShareButton />
      </div>
    </section>
  );
}
