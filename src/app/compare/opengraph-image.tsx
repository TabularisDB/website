import { OG_SIZE, OG_CONTENT_TYPE, renderSimpleOgImage } from "@/lib/ogImageSimple";

export const dynamic = "force-static";
export const alt = "Compare Tabularis";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderSimpleOgImage({
    kicker: "Compare",
    title: "How Tabularis stacks up",
    subtitle:
      "Side-by-side comparisons against other database clients and SQL tools.",
  });
}
