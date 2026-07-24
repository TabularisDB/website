import {
  DiscordIcon,
  BlueskyIcon,
  MastodonIcon,
  XBrandIcon,
} from "@/components/Icons";
import { SOCIAL_URLS } from "@/lib/social";

/** The standard social row for ClosingCta secondary links. */
export function CtaSocialLinks() {
  return (
    <>
      <a
        className="btn-cta discord"
        href={SOCIAL_URLS.discord}
      >
        <DiscordIcon size={15} />
        Join Discord
      </a>
      <a
        className="btn-cta"
        href={SOCIAL_URLS.bluesky}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BlueskyIcon size={15} />
        Bluesky
      </a>
      <a
        className="btn-cta"
        href={SOCIAL_URLS.mastodon}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MastodonIcon size={15} />
        Mastodon
      </a>
      <a
        className="btn-cta"
        href={SOCIAL_URLS.x}
        target="_blank"
        rel="noopener noreferrer"
      >
        <XBrandIcon size={15} />
        Follow on X
      </a>
    </>
  );
}
