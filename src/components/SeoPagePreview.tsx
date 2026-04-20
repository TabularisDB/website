import Image from "next/image";
import type { SeoMeta } from "@/lib/seoPages";
import { getProduct, type Product } from "@/lib/products";

type ComparePreview =
  | {
      variant?: "duo";
      left: string;
      right: string;
      accent: string;
    }
  | {
      variant: "trio";
      left: string;
      center: string;
      right: string;
      accent: string;
    };

const COMPARE_PREVIEW_MAP: Record<string, ComparePreview> = {
  "dbeaver-alternative": {
    left: "dbeaver",
    right: "tabularis",
    accent: "Open-source SQL workspace",
  },
  "tableplus-alternative": {
    left: "tableplus",
    right: "tabularis",
    accent: "Cross-platform SQL workflow",
  },
  "datagrip-alternative": {
    left: "datagrip",
    right: "tabularis",
    accent: "IDE vs workspace",
  },
  "beekeeper-studio-alternative": {
    left: "beekeeper",
    right: "tabularis",
    accent: "Simple client vs broader workflow",
  },
  "dbgate-alternative": {
    left: "dbgate",
    right: "tabularis",
    accent: "Modern open-source workflow",
  },
  "navicat-alternative": {
    left: "navicat",
    right: "tabularis",
    accent: "Commercial admin vs open workspace",
  },
  "pgadmin-alternative": {
    left: "pgadmin",
    right: "tabularis",
    accent: "PostgreSQL desktop workspace",
  },
  "phpmyadmin-alternative": {
    left: "phpmyadmin",
    right: "tabularis",
    accent: "Desktop client vs web panel",
  },
  "heidisql-alternative": {
    left: "heidisql",
    right: "tabularis",
    accent: "Cross-platform native workflow",
  },
  "tabularis-vs-dbeaver": {
    left: "tabularis",
    right: "dbeaver",
    accent: "Open workspace vs mature IDE",
  },
  "tabularis-vs-tableplus": {
    left: "tabularis",
    right: "tableplus",
    accent: "Open workspace vs polished GUI",
  },
  "tableplus-vs-datagrip-vs-tabularis": {
    variant: "trio",
    left: "tableplus",
    center: "datagrip",
    right: "tabularis",
    accent: "Polished GUI vs IDE vs open workspace",
  },
};

function getComparisonPreview(meta: SeoMeta): ComparePreview {
  return (
    COMPARE_PREVIEW_MAP[meta.slug] || {
      left: "tabularis",
      right: "tabularis",
      accent: meta.useCase || "Workflow evaluation",
    }
  );
}

function LogoOrText({ id, className }: { id: string; className: string }) {
  const product: Product | undefined = getProduct(id);
  if (!product) {
    return <span className={className}>{id}</span>;
  }
  return (
    <Image
      src={product.logo}
      alt={product.name}
      width={product.width}
      height={product.height}
      loading="lazy"
      className={className}
    />
  );
}

export function SeoPageThumb({
  meta,
  className = "",
}: {
  meta: SeoMeta;
  className?: string;
}) {
  if (meta.section === "compare") {
    const preview = getComparisonPreview(meta);

    if (preview.variant === "trio") {
      const ids = [preview.left, preview.center, preview.right];
      const ordered = [
        "tabularis",
        ...ids.filter((id) => id !== "tabularis"),
      ];

      return (
        <div
          className={`seo-compare-thumb seo-compare-thumb--trio ${className}`.trim()}
          aria-hidden="true"
        >
          <div className="seo-compare-grid">
            {ordered.map((id) => (
              <span
                key={id}
                className={
                  "seo-compare-panel" +
                  (id === "tabularis" ? " seo-compare-panel--tabularis" : "")
                }
              >
                <LogoOrText id={id} className="seo-compare-panel-logo" />
              </span>
            ))}
          </div>
          <div className="seo-compare-accent">{preview.accent}</div>
        </div>
      );
    }

    const competitor =
      preview.left === "tabularis" ? preview.right : preview.left;

    return (
      <div
        className={`seo-compare-thumb ${className}`.trim()}
        aria-hidden="true"
      >
        <div className="seo-compare-stack">
          <span className="seo-compare-wordmark seo-compare-wordmark--tabularis">
            <LogoOrText id="tabularis" className="seo-compare-logo" />
          </span>
          <span className="seo-compare-vs">vs</span>
          <span className="seo-compare-wordmark">
            <LogoOrText id={competitor} className="seo-compare-logo" />
          </span>
        </div>
        <div className="seo-compare-accent">{preview.accent}</div>
      </div>
    );
  }

  return (
    <img
      src={meta.image || "/img/logo.png"}
      alt={meta.title}
      className={className}
    />
  );
}

export function SeoPageHeroVisual({ meta }: { meta: SeoMeta }) {
  if (meta.section === "compare") {
    return <SeoPageThumb meta={meta} className="seo-compare-hero" />;
  }

  return (
    <img
      src={meta.image || "/img/logo.png"}
      alt={meta.title}
      className="blog-intro-logo"
    />
  );
}
