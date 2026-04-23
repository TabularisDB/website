import { OG_SIZE, OG_CONTENT_TYPE, renderSimpleOgImage } from "@/lib/ogImageSimple";

export const dynamic = "force-static";
export const alt = "Tabularis Plugins";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderSimpleOgImage({
    kicker: "Plugins",
    title: "Community drivers",
  });
}
