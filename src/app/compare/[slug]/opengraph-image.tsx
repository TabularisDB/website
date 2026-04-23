import { getSeoPageBySlug, getSeoPagesBySection } from "@/lib/seoPages";
import {
  OG_SIZE,
  OG_CONTENT_TYPE,
  renderSimpleOgImage,
} from "@/lib/ogImageSimple";

export const alt = "Compare Tabularis";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getSeoPagesBySection("compare").map((page) => ({ slug: page.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoPageBySlug("compare", slug);
  return renderSimpleOgImage({
    kicker: "Compare",
    title: page?.meta.title ?? "Compare Tabularis",
  });
}
