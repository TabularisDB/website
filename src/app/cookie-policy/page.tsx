import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cookie Policy | Tabularis",
  description:
    "Learn how Tabularis uses cookies and how you can control them.",
};

export default function CookiePolicyPage() {
  return (
    <div className="container">
      <SiteHeader crumbs={[{ label: "cookie policy" }]} />

      <article className="wiki-article">
        <h1>Cookie Policy</h1>
        <p className="cookie-policy-updated">Last updated: March 2026</p>

        <section className="cookie-policy-section">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored in your browser when you visit a
            website. They allow the site to remember certain information across
            page visits and sessions.
          </p>
        </section>

        <section className="cookie-policy-section">
          <h2>How we use cookies</h2>
          <p>
            This website uses a minimal set of cookies, grouped into the
            categories below. You can manage your preferences at any time using
            the cookie banner.
          </p>
        </section>

        <section className="cookie-policy-section">
          <h2>Cookie categories</h2>

          <div className="cookie-policy-category">
            <div className="cookie-policy-category-header">
              <span className="cookie-policy-badge cookie-policy-badge--required">
                Always active
              </span>
              <h3>Necessary</h3>
            </div>
            <p>
              These are required for the website to function correctly and
              cannot be disabled. This category also includes{" "}
              <strong>cookieless, anonymised page-view analytics</strong> via{" "}
              <a
                href="https://matomo.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Matomo
              </a>{" "}
              (self-hosted). No cookies are set, the last two bytes of your IP
              address are removed before storage, and no data is shared with
              third parties. This processing is based on legitimate interest
              (aggregate, anonymous traffic statistics).
            </p>
            <table className="cookie-policy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>tabularis-cookie-consent</code>
                  </td>
                  <td>tabularis.dev</td>
                  <td>Stores your cookie consent preferences</td>
                  <td>Persistent (localStorage)</td>
                </tr>
                <tr>
                  <td>
                    <em>None (cookieless)</em>
                  </td>
                  <td>analytics.debbaweb.it</td>
                  <td>
                    Anonymised page-view statistics without persistent
                    identifiers
                  </td>
                  <td>Session only</td>
                </tr>
                <tr>
                  <td>
                    <code>_GRECAPTCHA</code>
                  </td>
                  <td>google.com</td>
                  <td>
                    Google reCAPTCHA — spam and bot protection on the{" "}
                    <Link href="/sponsors">sponsors</Link> contact form
                  </td>
                  <td>6 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cookie-policy-category">
            <div className="cookie-policy-category-header">
              <span className="cookie-policy-badge cookie-policy-badge--optional">
                Optional
              </span>
              <h3>Measurement</h3>
            </div>
            <p>
              Enabling this category upgrades the base cookieless tracking to
              full cookie-based analytics via{" "}
              <a
                href="https://matomo.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Matomo
              </a>
              . Persistent cookies allow us to recognise returning visitors and
              measure engagement over time. IP addresses are still anonymised
              and no data is shared with third parties.
            </p>
            <table className="cookie-policy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>_pk_id.*</code>
                  </td>
                  <td>analytics.debbaweb.it</td>
                  <td>Identifies a returning visitor across sessions</td>
                  <td>13 months</td>
                </tr>
                <tr>
                  <td>
                    <code>_pk_ses.*</code>
                  </td>
                  <td>analytics.debbaweb.it</td>
                  <td>Tracks a single visit session</td>
                  <td>30 minutes</td>
                </tr>
                <tr>
                  <td>
                    <code>_pk_ref.*</code>
                  </td>
                  <td>analytics.debbaweb.it</td>
                  <td>Stores referral source for the visit</td>
                  <td>6 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cookie-policy-category">
            <div className="cookie-policy-category-header">
              <span className="cookie-policy-badge cookie-policy-badge--optional">
                Optional
              </span>
              <h3>Marketing</h3>
            </div>
            <p>
              These cookies are set by third-party services used on this
              website. The{" "}
              <Link href="/sponsors">sponsors</Link> page uses{" "}
              <a
                href="https://www.emailchef.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                EmailChef
              </a>{" "}
              to manage sponsorship contact form submissions. By submitting the
              form you agree to EmailChef&apos;s{" "}
              <a
                href="https://www.emailchef.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              .
            </p>
            <table className="cookie-policy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>ec_*</code>
                  </td>
                  <td>emailchef.com</td>
                  <td>
                    Tracks form submission state and prevents duplicate
                    submissions on the sponsors contact form
                  </td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>
                    <code>_ec_visitor</code>
                  </td>
                  <td>emailchef.com</td>
                  <td>
                    Identifies the visitor for EmailChef analytics and
                    mailing list management
                  </td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="cookie-policy-section">
          <h2>Managing your preferences</h2>
          <p>
            You can review and change your cookie preferences at any time. Your
            current consent is stored locally in your browser and is never sent
            to any server.
          </p>
          <p>
            To withdraw consent or change your choices, clear the{" "}
            <code>tabularis-cookie-consent</code> entry from your browser&apos;s
            local storage, or reload the page after clearing site data —the
            consent banner will reappear.
          </p>
        </section>

        <section className="cookie-policy-section">
          <h2>Contact</h2>
          <p>
            If you have any questions about this cookie policy, please open an
            issue on{" "}
            <a
              href="https://github.com/TabularisDB/tabularis"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            or join our{" "}
            <a
              href="https://discord.gg/YrZPHAwMSG"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            .
          </p>
        </section>
      </article>

      <Footer />
    </div>
  );
}
