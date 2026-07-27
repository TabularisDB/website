"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BlueskyIcon,
  LinkedInIcon,
  RedditIcon,
  ShareIcon,
  XBrandIcon,
} from "@/components/Icons";
import { DownloadButtons } from "@/components/DownloadButtons";
import { VideoModal } from "@/components/VideoModal";
import { trackEvent } from "@/lib/analytics";
import { formatStars } from "@/lib/github";
import { SOCIAL_URLS, buildSocialShareUrls } from "@/lib/social";

const SCROLL_THRESHOLD = 480;

interface PostStickyBarProps {
  title: string;
  url: string;
  stars: number | null;
}

/* Slim fixed bar at the bottom of post pages — the counterpart of the side
   rail for viewports too narrow to hold it (the rail only exists ≥1780px,
   this bar is hidden there via CSS). Slides in after the reader scrolls past
   the header and retracts once the closing CTA scrolls into view, which
   repeats the same download call-to-action. */
export function PostStickyBar({ title, url, stars }: PostStickyBarProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const cta = document.querySelector(".closing-cta");
    const update = () => {
      const pastHeader = window.scrollY > SCROLL_THRESHOLD;
      const ctaInView = cta
        ? cta.getBoundingClientRect().top < window.innerHeight
        : false;
      setVisible(pastHeader && !ctaInView);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleCopy = useCallback(() => {
    const absoluteUrl = new URL(url, "https://tabularis.dev").toString();
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  const absoluteUrl = new URL(url, "https://tabularis.dev").toString();
  const shareUrls = buildSocialShareUrls({
    url: absoluteUrl,
    text: `${title} — Tabularis`,
  });

  const platforms = [
    { label: "Share on Bluesky", href: shareUrls.bluesky, icon: <BlueskyIcon size={15} /> },
    { label: "Share on X", href: shareUrls.x, icon: <XBrandIcon size={15} /> },
    { label: "Share on LinkedIn", href: shareUrls.linkedin, icon: <LinkedInIcon size={15} /> },
    { label: "Share on Reddit", href: shareUrls.reddit, icon: <RedditIcon size={15} /> },
  ];

  return (
    <div
      className={`post-sticky-bar${visible ? " post-sticky-bar--visible" : ""}`}
      aria-label="Share this post or download Tabularis"
      aria-hidden={!visible}
    >
      <div className="post-sticky-bar__share">
        {platforms.map(({ label, href, icon }) => (
          <a
            key={label}
            className="post-sticky-bar__icon-btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            tabIndex={visible ? undefined : -1}
          >
            {icon}
          </a>
        ))}
        <button
          className={`post-sticky-bar__icon-btn${copied ? " copied" : ""}`}
          onClick={handleCopy}
          aria-label="Copy link"
          title="Copy link"
          tabIndex={visible ? undefined : -1}
        >
          {copied ? <span aria-hidden="true">✓</span> : <ShareIcon size={15} />}
        </button>
      </div>
      <a
        href={SOCIAL_URLS.github}
        target="_blank"
        rel="noopener noreferrer"
        className="post-sticky-bar__stars"
        aria-label={
          stars !== null
            ? `Star Tabularis on GitHub (${stars} stars)`
            : "Star Tabularis on GitHub"
        }
        title="Star Tabularis on GitHub"
        tabIndex={visible ? undefined : -1}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
        </svg>
        {stars !== null && formatStars(stars)}
      </a>
      <button
        className="post-sticky-bar__demo"
        onClick={() => {
          trackEvent("post-sticky-bar-video", "open", "click");
          setVideoOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={videoOpen}
        aria-label="Watch the Tabularis overview video"
        title="Watch the Tabularis overview video"
        tabIndex={visible ? undefined : -1}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="post-sticky-bar__demo-label">
          Demo<span className="post-sticky-bar__demo-duration"> · 53s</span>
        </span>
      </button>
      <VideoModal
        src="/videos/overview.mp4"
        poster="/videos/overview-hero.webp"
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
      />
      <DownloadButtons showReleasesLink={false} />
    </div>
  );
}
