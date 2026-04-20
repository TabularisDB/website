import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { DownloadThankYou } from "@/components/DownloadThankYou";

export const metadata: Metadata = {
  title: "Your download has started! | Tabularis",
  description:
    "Thank you for downloading Tabularis. Explore our community and resources while your download completes.",
  robots: { index: false, follow: false },
};

export default function DownloadThankYouPage() {
  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "download", href: "/download" }, { label: "thank you" }]} />

      <section className="dl-thankyou">
        <Suspense>
          <DownloadThankYou />
        </Suspense>
      </section>

      <Footer />
    </div>
  );
}
