"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface NewsletterFormProps {
  compact?: boolean;
  title?: string;
  description?: string;
  buttonLabel?: string;
}

const EMAILCHEF_SCRIPT =
  "https://app.emailchef.com/signup/form.js/7o22666s726q5s6964223n2237353333227q/en/api";
const EMAILCHEF_ACTION =
  "https://app.emailchef.com/signupwl/7o22666s726q5s6964223n2237353333227q/en";

// Anti-spam guard (client-side only — the site is a static export, so the
// real gate is double opt-in on the emailchef list). These checks stop the
// bulk of form-filling bots without touching the user experience:
//   - honeypot: a visually hidden text field no human fills in;
//   - minimum dwell time: humans don't submit within 3s of page render;
//   - JS-gated submit: the button ships disabled and is enabled on mount,
//     so no-JS scrapers can't post the form at all;
//   - stricter email check: dotted TLD required, disposable domains refused.
const MIN_DWELL_MS = 3000;
const HONEYPOT_NAME = "website_url";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "throwawaymail.com",
  "fakeinbox.com",
  "mohmal.com",
  "emailondeck.com",
]);

function isSuspiciousEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return true;
  const domain = email.slice(email.lastIndexOf("@") + 1);
  return DISPOSABLE_DOMAINS.has(domain);
}

function useSpamGuard() {
  const formRef = useRef<HTMLFormElement>(null);
  const mountedAt = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
    setReady(true);

    const form = formRef.current;
    if (!form) return;

    // Capture-phase native listener so the check runs before emailchef's
    // form.js (which attaches its own submit handler) can send anything.
    const onSubmit = (event: Event) => {
      const data = new FormData(form);
      const honeypot = String(data.get(HONEYPOT_NAME) ?? "");
      const email = String(data.get("field[-1]") ?? "");
      const elapsed = Date.now() - mountedAt.current;

      let reason: string | null = null;
      if (honeypot !== "" || elapsed < MIN_DWELL_MS) {
        // Bot-like: fail silently, don't teach the bot what tripped.
        reason = "Something went wrong. Please try again.";
      } else if (isSuspiciousEmail(email)) {
        reason = "Please enter a valid, non-disposable email address.";
      }

      if (reason) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setError(reason);
        return;
      }
      setError(null);
    };

    form.addEventListener("submit", onSubmit, { capture: true });
    return () => form.removeEventListener("submit", onSubmit, { capture: true });
  }, []);

  return { formRef, ready, error, clearError: () => setError(null) };
}

function HoneypotField() {
  return (
    <div className="newsletter-hp" aria-hidden="true">
      <label htmlFor={HONEYPOT_NAME}>Website</label>
      <input
        type="text"
        id={HONEYPOT_NAME}
        name={HONEYPOT_NAME}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

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

  const { formRef, ready, error, clearError } = useSpamGuard();

  if (compact) {
    return (
      <div className="newsletter-box newsletter-compact">
        <div className="newsletter-compact-body">
          <div className="newsletter-compact-text">
            <h3>{resolvedTitle}</h3>
            <p>{resolvedDescription}</p>
          </div>
          <form
            ref={formRef}
            method="POST"
            action={EMAILCHEF_ACTION}
            className="newsletter-form newsletter-form-inline"
          >
            <input type="hidden" name="form_id" value="7533" />
            <input type="hidden" name="lang" value="" />
            <input type="hidden" name="referrer" value="" />
            <input type="hidden" name="redirect" value="/thanks-newsletter" />
            <HoneypotField />
            <div className="newsletter-inline-fields">
              <input
                type="email"
                name="field[-1]"
                placeholder="Enter your email"
                required
                className="newsletter-input"
                aria-label="Email address"
                onChange={clearError}
              />
              <button type="submit" className="newsletter-btn" disabled={!ready}>
                {buttonLabel} &rarr;
              </button>
            </div>
            {error && (
              <p className="newsletter-error" role="alert">
                {error}
              </p>
            )}
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
        ref={formRef}
        method="POST"
        action={EMAILCHEF_ACTION}
        className="newsletter-form"
      >
        <input type="hidden" name="form_id" value="7533" />
        <input type="hidden" name="lang" value="" />
        <input type="hidden" name="referrer" value="" />
        <HoneypotField />
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
              onChange={clearError}
            />
          </div>
        </div>
        {error && (
          <p className="newsletter-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="newsletter-btn" disabled={!ready}>
          {buttonLabel}
        </button>
        <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
      </form>
    </div>
  );
}
