import { OG_SIZE, OG_CONTENT_TYPE, renderSimpleOgImage } from "@/lib/ogImageSimple";

export const dynamic = "force-static";
export const alt = "Tabularis Newsletter";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderSimpleOgImage({
    kicker: "Newsletter",
    title: "Stay in the loop",
    subtitle:
      "Release announcements, development insights and project updates — straight to your inbox.",
  });
}
