import { getSeoPageBySlug, getSeoPagesBySection } from "@/lib/seoPages";
import {
  OG_SIZE,
  OG_CONTENT_TYPE,
  renderSimpleOgImage,
} from "@/lib/ogImageSimple";

export const alt = "Tabularis Solutions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getSeoPagesBySection("solutions").map((page) => ({ slug: page.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoPageBySlug("solutions", slug);
  return renderSimpleOgImage({
    kicker: "Solutions",
    title: page?.meta.title ?? "Tabularis Solutions",
    subtitle: page?.meta.excerpt,
  });
}
