import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ClosingCta } from "@/components/ClosingCta";
import { CtaSocialLinks } from "@/components/CtaSocialLinks";
import { NotFoundQueryPath } from "@/components/NotFoundQueryPath";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="container">
      <SiteHeader />

      <div className="nf-hero">
        <div className="nf-hero-copy">
          <div className="hero-badges">
            <span className="badge nf-badge-error">Error 404</span>
            <span className="badge">0 rows returned</span>
          </div>

          <h1 className="nf-title">Page not found.</h1>

          <p className="nf-desc">
            The page you are looking for does not exist or has been moved. The
            database client, however, is very much alive.
          </p>

          <nav className="not-found-nav">
            <Link href="/" className="not-found-link not-found-link--primary">
              ← Go home
            </Link>
            <Link href="/wiki" className="not-found-link">
              Wiki
            </Link>
            <Link href="/blog" className="not-found-link">
              Blog
            </Link>
            <Link href="/plugins" className="not-found-link">
              Plugins
            </Link>
          </nav>
        </div>

        <div className="nf-hero-visual">
          <div
            className="nf-window"
            role="img"
            aria-label="SQL query returning no rows"
          >
            <div className="nf-window-bar">
              <span className="nf-dot nf-dot--red" />
              <span className="nf-dot nf-dot--yellow" />
              <span className="nf-dot nf-dot--green" />
              <span className="nf-window-title">tabularis — query.sql</span>
            </div>
            <div className="nf-window-body">
              <div className="nf-sql">
                <div className="nf-line">
                  <span className="nf-line-no">1</span>
                  <span className="nf-line-code">
                    <span className="nf-sql-kw">SELECT</span> *{" "}
                    <span className="nf-sql-kw">FROM</span> pages
                  </span>
                </div>
                <div className="nf-line">
                  <span className="nf-line-no">2</span>
                  <span className="nf-line-code">
                    <span className="nf-sql-kw">WHERE</span> path ={" "}
                    <NotFoundQueryPath />;
                    <span className="nf-caret" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div className="nf-result">
                <span className="nf-result-badge">404</span>
                <span className="nf-result-text">0 rows returned</span>
                <span className="nf-result-time">(0.404 ms)</span>
              </div>
              <div className="nf-hint">
                <span className="nf-hint-label">HINT:</span> the page was
                dropped, renamed, or never migrated.
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClosingCta
        title="Looking for a database client instead?"
        lede="The page is gone, Tabularis isn't. Free and open source (Apache 2.0) — download it for Windows, macOS, or Linux, and a star on GitHub helps more developers find it."
      >
        <CtaSocialLinks />
      </ClosingCta>

      <Footer />
    </div>
  );
}
