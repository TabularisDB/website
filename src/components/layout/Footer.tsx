import {REVIEWS, withReviewUtm} from '@/lib/reviews';
import Link from 'next/link';
import {ManageCookiesButton} from './ManageCookiesButton';

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <span className="footer-brand-name">Tabularis</span>
                    <span className="footer-brand-tagline">The open-source desktop database client.</span>
                </div>
                <nav className="footer-social" aria-label="Social links"></nav>
            </div>

            <div className="footer-reviews">
                <span className="footer-reviews-label">As featured on</span>
                <nav className="footer-reviews-links" aria-label="Reviews and listings">
                    {REVIEWS.map((review) => (
                        <a
                            key={review.id}
                            href={withReviewUtm(review.href)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social-link footer-review-link"
                        >
                            <span>{review.name}</span>
                        </a>
                    ))}
                </nav>
            </div>

            <div className="footer-bottom">
                <p className="footer-copy">
                    &copy; 2026 Tabularis Project &mdash; Crafted by <a href="https://github.com/debba">Debba</a>.
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
