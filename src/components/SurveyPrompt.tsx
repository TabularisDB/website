"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { SURVEY_CONFIGURED } from "@/lib/siteConfig";
import { SurveyForm, SURVEY_STORAGE_KEY } from "./SurveyForm";

// Routes where the floating prompt must never appear: the survey already lives
// on /survey, and thank-you / confirmation pages are post-conversion dead-ends.
const EXCLUDED_PATHS = [
  "/survey",
  "/thanks-survey",
  "/thanks-newsletter",
  "/sponsors/confirm",
];

function isExcluded(pathname: string | null): boolean {
  if (!pathname) return false;
  return EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// We piggyback on the cookie-consent key so the survey never overlaps the
// cookie banner (which lives in the same bottom-right slot).
const COOKIE_KEY = "tabularis-cookie-consent";

// Minimum dwell before the survey may appear, so it never pops the instant a
// short page is scrolled to the bottom.
const MIN_DWELL_MS = 8000;
// Fraction of the page that must be scrolled to trigger.
const SCROLL_TRIGGER = 0.6;

export function SurveyPrompt() {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);
  const pathname = usePathname();
  const excluded = isExcluded(pathname);

  useEffect(() => {
    if (!SURVEY_CONFIGURED || excluded) return;
    // Already submitted or dismissed → never show again.
    if (localStorage.getItem(SURVEY_STORAGE_KEY)) return;

    const mountedAt = Date.now();

    const reveal = () => {
      if (shownRef.current) return;
      // Don't compete with the cookie banner — wait until consent is recorded.
      if (!localStorage.getItem(COOKIE_KEY)) return;
      if (Date.now() - mountedAt < MIN_DWELL_MS) return;
      shownRef.current = true;
      setVisible(true);
      trackEvent("Survey", "shown");
      cleanup();
    };

    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_TRIGGER) reveal();
    };

    const onMouseOut = (e: MouseEvent) => {
      // Exit intent: cursor leaves through the top of the viewport.
      if (!e.relatedTarget && e.clientY <= 0) reveal();
    };

    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    return cleanup;
  }, [excluded]);

  if (!SURVEY_CONFIGURED || excluded || !visible) return null;

  function dismiss() {
    // Closing counts as "seen" — the prompt won't reappear on later visits.
    try {
      localStorage.setItem(SURVEY_STORAGE_KEY, "dismissed");
    } catch {
      // localStorage unavailable (private mode) — non-fatal.
    }
    setVisible(false);
    trackEvent("Survey", "dismissed");
  }

  return (
    <div
      className="survey-prompt"
      role="dialog"
      aria-label="Quick product survey"
    >
      <button
        type="button"
        className="survey-close"
        onClick={dismiss}
        aria-label="Dismiss survey"
      >
        ×
      </button>

      <SurveyForm source="popup" />
    </div>
  );
}
