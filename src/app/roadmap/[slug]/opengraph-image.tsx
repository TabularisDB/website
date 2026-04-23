import {
  getAllInitiativeSlugs,
  getInitiativeBySlug,
  type InitiativeStatus,
} from "@/lib/roadmap";
import {
  OG_SIZE,
  OG_CONTENT_TYPE,
  renderSimpleOgImage,
} from "@/lib/ogImageSimple";

export const alt = "Tabularis Roadmap";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllInitiativeSlugs().map((slug) => ({ slug }));
}

const STATUS_LABEL: Record<InitiativeStatus, string> = {
  "in-progress": "In progress",
  planned: "Planned",
  done: "Shipped",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initiative = getInitiativeBySlug(slug);
  const meta = initiative?.meta;

  const kickerParts = ["Roadmap"];
  if (meta?.status) kickerParts.push(STATUS_LABEL[meta.status]);

  return renderSimpleOgImage({
    kicker: kickerParts.join(" · "),
    title: meta?.title ?? "Tabularis Roadmap",
  });
}
