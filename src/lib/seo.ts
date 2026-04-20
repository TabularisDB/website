import { APP_VERSION } from "./version";

const BASE_URL = "https://tabularis.dev";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path}`;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tabularis",
    url: BASE_URL,
    logo: toAbsoluteUrl("/img/logo.png"),
    sameAs: [
      "https://github.com/TabularisDB/tabularis",
      "https://discord.gg/YrZPHAwMSG",
    ],
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tabularis",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Database client",
    operatingSystem: "Windows, macOS, Linux",
    softwareVersion: APP_VERSION,
    downloadUrl: toAbsoluteUrl("/download"),
    url: BASE_URL,
    image: toAbsoluteUrl("/img/og.png"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Open-source desktop database client with support for PostgreSQL, MySQL/MariaDB, and SQLite. Hackable with plugins, with notebooks, AI, and MCP built in.",
  };
}

export function buildArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedTime?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: toAbsoluteUrl(input.path),
    datePublished: input.publishedTime,
    author: {
      "@type": "Person",
      name: "Andrea Debernardi",
      url: "https://github.com/debba",
    },
    publisher: {
      "@type": "Organization",
      name: "Tabularis",
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl("/img/logo.png"),
      },
    },
    image: input.image ? [toAbsoluteUrl(input.image)] : [toAbsoluteUrl("/img/og.png")],
    mainEntityOfPage: toAbsoluteUrl(input.path),
  };
}
