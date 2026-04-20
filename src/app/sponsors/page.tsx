import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SponsorsGrid } from "@/components/SponsorsGrid";
import { SponsorContactForm } from "@/components/SponsorContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors | Tabularis",
  description:
    "Companies supporting Tabularis development. Interested in sponsoring? Get in touch.",
  openGraph: {
    title: "Sponsors | Tabularis",
    description:
      "Companies supporting Tabularis development. Interested in sponsoring? Get in touch.",
    url: "https://tabularis.dev/sponsors",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsors | Tabularis",
    description:
      "Companies supporting Tabularis development. Interested in sponsoring? Get in touch.",
  },
};

export default function SponsorsPage() {
  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "sponsors" }]} />

      <section>
        <div className="blog-intro">
          <img
            src="/img/logo.png"
            alt="Tabularis Logo"
            className="blog-intro-logo"
          />
          <div className="blog-intro-body">
            <h3>Our Sponsors</h3>
            <p>
              These companies support Tabularis development and help keep it
              free and open source for everyone. Thank you.
            </p>
          </div>
        </div>

        <SponsorsGrid />

        <div className="plugin-cta">
          <h3>Become a Sponsor</h3>
          <p>
            Interested in reaching a developer-focused audience? Sponsoring
            Tabularis puts your product in front of thousands of developers who
            work with databases every day. You get a logo and link on the
            homepage, a dedicated modal with features and CTA, and mentions in
            release notes and community channels.
          </p>
          <ul className="sponsors-page-perks">
            <li><span>🌐</span><span>Logo and link on homepage and sponsors page</span></li>
            <li><span>📋</span><span>Informational modal with features, offer, and CTA</span></li>
            <li><span>💬</span><span>Mention in release notes and community channels</span></li>
            <li><span>🔗</span><span>UTM-tagged links for accurate traffic attribution</span></li>
          </ul>

          <div style={{ marginTop: "2rem" }}>
            <SponsorContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
