import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Thanks for the feedback! | Tabularis",
  description: "Thank you for sharing what you expect from a database tool.",
  robots: { index: false, follow: false },
};

export default function ThanksSurveyPage() {
  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "thank you" }]} />

      <section className="nl-thankyou">
        <div className="nl-thankyou-hero">
          <span className="nl-thankyou-kicker">Got it</span>
          <h1 className="nl-thankyou-title">Thanks for your feedback</h1>
          <p className="nl-thankyou-desc">
            Your answers go straight into how we prioritise Tabularis. If we
            follow up, it&apos;ll only be about what you told us — no spam.
          </p>
        </div>

        <div className="dl-thankyou-cards">
          <Link href="/download" className="dl-thankyou-card">
            <div className="dl-thankyou-card-visual dl-thankyou-card-visual--docs">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 className="dl-thankyou-card-title">Download Tabularis</h3>
            <p className="dl-thankyou-card-desc">
              Try it for yourself on Windows, macOS, or Linux and start working
              with your databases.
            </p>
          </Link>

          <Link href="/roadmap" className="dl-thankyou-card">
            <div className="dl-thankyou-card-visual dl-thankyou-card-visual--github">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="dl-thankyou-card-title">See the roadmap</h3>
            <p className="dl-thankyou-card-desc">
              Track what we&apos;re building next and where your feedback fits
              in.
            </p>
          </Link>
        </div>

        <div className="thankyou-socials">
          <span className="thankyou-socials-label">Follow Tabularis</span>
          <div className="social-links-row">
            <SocialLinks linkClassName="social-links-row-link" iconSize={18} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
