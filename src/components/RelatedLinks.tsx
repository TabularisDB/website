import Link from "next/link";
import type { RelatedLink } from "@/lib/seoRelated";

export function RelatedLinks({
  title = "Related",
  links,
}: {
  title?: string;
  links: RelatedLink[];
}) {
  if (!links.length) return null;

  return (
    <div className="plugin-cta related-links-box">
      <h3>{title}</h3>
      <div className="plugin-list">
        {links.map((link) => (
          <div key={link.href} className="plugin-entry">
            <div className="plugin-entry-info">
              <div className="plugin-entry-header">
                <Link href={link.href} className="plugin-name">
                  {link.label}
                </Link>
              </div>
            </div>
            <Link href={link.href} className="btn-plugin">
              Open &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
