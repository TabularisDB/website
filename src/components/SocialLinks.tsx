import type { ComponentType } from "react";
import {
  GitHubIcon,
  DiscordIcon,
  BlueskyIcon,
  XBrandIcon,
  MastodonIcon,
} from "@/components/Icons";
import { SOCIAL_URLS } from "@/lib/social";

interface IconProps {
  size?: number;
  className?: string;
}

interface Social {
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
  /** Extra rel tokens (e.g. "me" for Mastodon identity verification). */
  rel?: string;
}

export const SOCIAL_LINKS: Social[] = [
  {
    label: "GitHub",
    href: SOCIAL_URLS.github,
    Icon: GitHubIcon,
  },
  {
    label: "Discord",
    href: SOCIAL_URLS.discord,
    Icon: DiscordIcon,
  },
  {
    label: "Bluesky",
    href: SOCIAL_URLS.bluesky,
    Icon: BlueskyIcon,
  },
  {
    label: "X",
    href: SOCIAL_URLS.x,
    Icon: XBrandIcon,
  },
  {
    label: "Mastodon",
    href: SOCIAL_URLS.mastodon,
    Icon: MastodonIcon,
    rel: "me",
  },
];

interface SocialLinksProps {
  /** Class applied to each anchor. */
  linkClassName?: string;
  /** Icon size in px. */
  iconSize?: number;
}

/**
 * Renders the project social links as icon + label anchors.
 * Used in the footer and on the thank-you pages.
 */
export function SocialLinks({ linkClassName, iconSize = 14 }: SocialLinksProps) {
  return (
    <>
      {SOCIAL_LINKS.map(({ label, href, Icon, rel }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel={`noopener noreferrer${rel ? ` ${rel}` : ""}`}
          className={linkClassName}
        >
          <Icon size={iconSize} />
          <span>{label}</span>
        </a>
      ))}
    </>
  );
}
