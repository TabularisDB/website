export interface Review {
  /** Stable id (also used as the logo filename under /public/img/reviews/<id>.svg). */
  id: string;
  /** Platform display name. */
  name: string;
  /** Direct link to the Tabularis review / listing on that platform. */
  href: string;
  /** Optional logo image under /public (e.g. "/img/reviews/g2.svg"). */
  logoImg?: string;
  /** Monogram shown when no logoImg is set. */
  char: string;
  /** Background color for the monogram badge. */
  bg: string;
}

/**
 * Third-party platforms where Tabularis has been reviewed / listed.
 * Rendered as a scrolling marquee on the homepage (pre-footer) and as a
 * compact link row in the footer. Logo + name only — no ratings.
 *
 * To use real brand logos, drop an SVG/PNG under /public/img/reviews/ and set
 * `logoImg` on the matching entry; otherwise the monogram badge is used.
 */
/** Append referral UTM params to a review link. */
export function withReviewUtm(url: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "tabularis");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", "reviews");
  return u.toString();
}

// Order matters: the first three are surfaced in the compact "As featured on"
// stack in the hero; the rest are revealed on click.
export const REVIEWS: Review[] = [
  {
    id: "accuratereviews",
    name: "AccurateReviews",
    href: "https://www.accuratereviews.com/database-client-software-reviews-list/tabularis-review/",
    logoImg: "/img/reviews/accuratereviews.png",
    char: "AR",
    bg: "#2563eb",
  },
  {
    id: "devglobe",
    name: "DevGlobe",
    href: "https://devglobe.app/blog/open-source-database-client-tabularis",
    logoImg: "/img/reviews/devglobe.svg",
    char: "DG",
    bg: "#6366f1",
  },
  {
    id: "g2",
    name: "G2",
    href: "https://www.g2.com/products/tabularis/reviews",
    logoImg: "/img/reviews/g2.svg",
    char: "G2",
    bg: "#ff492c",
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    href: "https://www.producthunt.com/products/tabularis",
    logoImg: "/img/reviews/producthunt.svg",
    char: "P",
    bg: "#da552f",
  },
  {
    id: "sourceforge",
    name: "SourceForge",
    href: "https://sourceforge.net/projects/tabularis/",
    logoImg: "/img/reviews/sourceforge.svg",
    char: "SF",
    bg: "#ff6600",
  },
  {
    id: "devhunt",
    name: "DevHunt",
    href: "https://devhunt.org/tool/tabularis",
    logoImg: "/img/reviews/devhunt.png",
    char: "DH",
    bg: "#f59e0b",
  },
];
