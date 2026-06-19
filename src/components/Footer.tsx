import Link from "next/link";
import { ManageCookiesButton } from "./ManageCookiesButton";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-brand-name">Tabularis</span>
          <span className="footer-brand-tagline">
            The open-source desktop database client.
          </span>
        </div>
        <nav className="footer-social" aria-label="Social links">
          <SocialLinks linkClassName="footer-social-link" iconSize={16} />
        </nav>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; 2026 Tabularis Project &mdash;{" "}
          Crafted by <a href="https://github.com/debba">Debba</a>.
        </p>
        <p className="footer-links">
          <Link href="/subscribe">Subscribe</Link>
          <Link href="/cookie-policy">Cookie Policy</Link>
          <ManageCookiesButton />
        </p>
      </div>
    </footer>
  );
}
