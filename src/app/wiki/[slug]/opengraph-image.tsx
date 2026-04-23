import { getAllWikiPages, getWikiPageBySlug } from "@/lib/wiki";
import {
  OG_SIZE,
  OG_CONTENT_TYPE,
  renderSimpleOgImage,
} from "@/lib/ogImageSimple";

export const alt = "Tabularis Wiki";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllWikiPages().map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getWikiPageBySlug(slug);
  return renderSimpleOgImage({
    kicker: page ? `Wiki · ${page.meta.category}` : "Wiki",
    title: page?.meta.title ?? "Tabularis Wiki",
    subtitle: page?.meta.excerpt,
  });
}
