"use client";

import Script from "next/script";

interface NewsletterFormProps {
  compact?: boolean;
  title?: string;
  description?: string;
  buttonLabel?: string;
}

const EMAILCHEF_SCRIPT =
  "https://app.emailchef.com/signup/form.js/7o22666s726q5s6964223n2237353333227q/en/api";

export function NewsletterForm({
  compact = false,
  title,
  description,
  buttonLabel = "Subscribe",
}: NewsletterFormProps) {
  const resolvedTitle = title ?? (compact ? "Stay in the loop" : "Subscribe to the newsletter");
  const resolvedDescription =
    description ??
    (compact
      ? "Get release notes, tips, and project updates. No spam, unsubscribe anytime."
      : "Get release announcements, development insights, tips, and project updates delivered to your inbox. No spam, unsubscribe anytime.");

  if (compact) {
    return (
      <div className="newsletter-box newsletter-compact">
        <div className="newsletter-compact-body">
          <div className="newsletter-compact-text">
            <h3>{resolvedTitle}</h3>
            <p>{resolvedDescription}</p>
          </div>
          <form
            method="POST"
            action="https://app.emailchef.com/signupwl/7o22666s726q5s6964223n2237353333227q/en"
            className="newsletter-form newsletter-form-inline"
          >
            <input type="hidden" name="form_id" value="7533" />
            <input type="hidden" name="lang" value="" />
            <input type="hidden" name="referrer" value="" />
            <input type="hidden" name="redirect" value="/thanks-newsletter" />
            <div className="newsletter-inline-fields">
              <input
                type="email"
                name="field[-1]"
                placeholder="Enter your email"
                required
                className="newsletter-input"
                aria-label="Email address"
              />
              <button type="submit" className="newsletter-btn">
                {buttonLabel} &rarr;
              </button>
            </div>
            <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="newsletter-box">
      <div className="newsletter-header">
        <h3>{resolvedTitle}</h3>
        <p>{resolvedDescription}</p>
      </div>
      <form
        method="POST"
        action="https://app.emailchef.com/signupwl/7o22666s726q5s6964223n2237353333227q/en"
        className="newsletter-form"
      >
        <input type="hidden" name="form_id" value="7533" />
        <input type="hidden" name="lang" value="" />
        <input type="hidden" name="referrer" value="" />
        <div className="newsletter-fields newsletter-fields-single">
          <div className="newsletter-row">
            <label className="newsletter-label" htmlFor="nl-email">
              Email <span className="newsletter-required">*</span>
            </label>
            <input
              type="email"
              id="nl-email"
              name="field[-1]"
              className="newsletter-input"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <button type="submit" className="newsletter-btn">
          {buttonLabel}
        </button>
        <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
      </form>
    </div>
  );
}
