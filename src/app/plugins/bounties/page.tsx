import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PluginBountyBoard } from "@/components/PluginBountyBoard";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Plugin Bounty Board | Tabularis",
  description:
    "Request, sponsor, discuss, or claim the database drivers and plugins the Tabularis community wants next.",
  alternates: { canonical: "/plugins/bounties" },
  openGraph: {
    type: "website",
    url: "https://tabularis.dev/plugins/bounties/",
    title: "Plugin Bounty Board | Tabularis",
    description:
      "A public market for the next Tabularis database drivers and plugin integrations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plugin Bounty Board | Tabularis",
    description:
      "Request, sponsor, discuss, or claim the database drivers and plugins the community wants next.",
  },
};

export default function PluginBountyBoardPage() {
  return (
    <div className="container">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Plugins", path: "/plugins" },
            { name: "Bounties", path: "/plugins/bounties" },
          ]),
        ]}
      />
      <SiteHeader
        crumbs={[
          { label: "plugins", href: "/plugins" },
          { label: "bounties" },
        ]}
      />

      <PluginBountyBoard />

      <Footer />
    </div>
  );
}
