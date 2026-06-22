import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SurveyForm } from "@/components/SurveyForm";

const TITLE = "Help shape Tabularis — 2-minute survey";
const DESCRIPTION =
  "Tell us what you expect from a database tool: which databases you use, what matters most, and what's missing today. It takes about two minutes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/survey" },
  openGraph: {
    type: "website",
    url: "https://tabularis.dev/survey",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function SurveyPage() {
  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "survey" }]} />

      <section className="survey-page">
        <div className="survey-page-hero">
          <span className="survey-page-kicker">2-minute survey</span>
          <h1 className="survey-page-title">Help shape Tabularis</h1>
          <p className="survey-page-desc">
            We&apos;re building the database client we always wanted — and your
            input steers what we build next. Tell us what you expect from a
            database tool. It takes about two minutes.
          </p>
        </div>

        <div className="survey-page-card">
          <SurveyForm source="page" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
