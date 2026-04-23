import { OG_SIZE, OG_CONTENT_TYPE, renderSimpleOgImage } from "@/lib/ogImageSimple";

export const dynamic = "force-static";
export const alt = "Tabularis Wiki";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderSimpleOgImage({
    kicker: "Wiki",
    title: "Documentation",
    subtitle:
      "Everything you need to know about Tabularis — from your first connection to advanced plugin development.",
  });
}
