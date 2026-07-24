export const SOCIAL_URLS = {
  github: "https://github.com/TabularisDB/tabularis",
  discord: "https://discord.com/invite/K2hmhfHRSt",
  bluesky: "https://bsky.app/profile/tabularis.bsky.social",
  x: "https://x.com/tabularisdb",
  mastodon: "https://mastodon.social/@tabularis",
} as const;

interface SocialShareInput {
  url: string;
  text: string;
  blueskyText?: string;
  redditTitle?: string;
}

export function buildSocialShareUrls({
  url,
  text,
  blueskyText = `${text}\n\n${url}`,
  redditTitle = text,
}: SocialShareInput) {
  const encodedUrl = encodeURIComponent(url);

  return {
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(blueskyText)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(redditTitle)}`,
  } as const;
}
