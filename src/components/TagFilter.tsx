import Link from "next/link";

interface TagFilterProps {
  tags?: string[]; // Kept for interface compatibility
  activeTag?: string;
}

const PRIMARY_TAGS = [
  { label: "All", tag: null, path: "/blog" },
  { label: "Releases", tag: "release", path: "/blog/tag/release" },
  { label: "AI", tag: "ai", path: "/blog/tag/ai" },
  { label: "Plugins", tag: "plugins", path: "/blog/tag/plugins" },
  { label: "Community", tag: "community", path: "/blog/tag/community" },
  { label: "Open Source", tag: "open-source", path: "/blog/tag/open-source" },
  { label: "UX & UI", tag: "ux", path: "/blog/tag/ux" },
];

export function TagFilter({ activeTag }: TagFilterProps) {
  const displayTags = [...PRIMARY_TAGS];
  const isPrimary = activeTag ? PRIMARY_TAGS.some((p) => p.tag === activeTag) : true;

  if (activeTag && !isPrimary) {
    displayTags.push({
      label: `#${activeTag}`,
      tag: activeTag,
      path: `/blog/tag/${encodeURIComponent(activeTag)}`,
    });
  }

  return (
    <div className="tag-filter-bar">
      <div className="tag-filter-scroll">
        {displayTags.map((t) => {
          const isActive = t.tag === null ? !activeTag : t.tag === activeTag;
          return (
            <Link
              key={t.label}
              href={t.path}
              className={`tag-filter-tab${isActive ? " active" : ""}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
