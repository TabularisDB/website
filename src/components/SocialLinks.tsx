import type { ComponentType } from "react";
import {
  GitHubIcon,
  DiscordIcon,
  BlueskyIcon,
  XBrandIcon,
  MastodonIcon,
} from "@/components/Icons";

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
    href: "https://github.com/TabularisDB/tabularis",
    Icon: GitHubIcon,
  },
  {
    label: "Discord",
    href: "https://discord.com/invite/K2hmhfHRSt",
    Icon: DiscordIcon,
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/tabularis.bsky.social",
    Icon: BlueskyIcon,
  },
  {
    label: "X",
    href: "https://x.com/tabularisdb",
    Icon: XBrandIcon,
  },
  {
    label: "Mastodon",
    href: "https://mastodon.social/@tabularis",
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
