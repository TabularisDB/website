import { OG_SIZE, OG_CONTENT_TYPE, renderSimpleOgImage } from "@/lib/ogImageSimple";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-static";
export const alt = "Download Tabularis";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderSimpleOgImage({
    kicker: `Download · v${APP_VERSION}`,
    title: "Get Tabularis",
  });
}
