import {
  DiscordIcon,
  BlueskyIcon,
  MastodonIcon,
  XBrandIcon,
} from "@/components/Icons";

/** The standard social row for ClosingCta secondary links. */
export function CtaSocialLinks() {
  return (
    <>
      <a
        className="btn-cta discord"
        href="https://discord.com/invite/K2hmhfHRSt"
      >
        <DiscordIcon size={15} />
        Join Discord
      </a>
      <a
        className="btn-cta"
        href="https://bsky.app/profile/tabularis.bsky.social"
        target="_blank"
        rel="noopener noreferrer"
      >
        <BlueskyIcon size={15} />
        Bluesky
      </a>
      <a
        className="btn-cta"
        href="https://mastodon.social/@tabularis"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MastodonIcon size={15} />
        Mastodon
      </a>
      <a
        className="btn-cta"
        href="https://x.com/tabularisdb"
        target="_blank"
        rel="noopener noreferrer"
      >
        <XBrandIcon size={15} />
        Follow on X
      </a>
    </>
  );
}
