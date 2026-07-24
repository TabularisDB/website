"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { SURVEY_CONFIGURED } from "@/lib/siteConfig";
import { getRepoStars, formatStars } from "@/lib/github";
import { GitHubIcon } from "@/components/Icons";
import { SOCIAL_URLS } from "@/lib/social";
import { SurveyForm, SURVEY_STORAGE_KEY } from "./SurveyForm";

// Routes where the floating prompt must never appear: the survey already lives
// on /survey, thank-you / confirmation pages are post-conversion dead-ends, and
// /download already puts the same CTA front and center.
const EXCLUDED_PATHS = [
  "/survey",
  "/thanks-survey",
  "/thanks-newsletter",
  "/sponsors/confirm",
  "/download",
];

function isExcluded(pathname: string | null): boolean {
  if (!pathname) return false;
  return EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// We piggyback on the cookie-consent key so the prompt never overlaps the
// cookie banner (which lives in the same bottom-right slot).
const COOKIE_KEY = "tabularis-cookie-consent";

// Unlike the survey (permanent opt-out once dismissed/submitted), the promo
// CTA is low-stakes and allowed to resurface after a cooldown.
const PROMO_STORAGE_KEY = "tabularis-promo-cta-v1";
const PROMO_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;

// Minimum dwell before the prompt may appear, so it never pops the instant a
// short page is scrolled to the bottom.
const MIN_DWELL_MS = 8000;
// Fraction of the page that must be scrolled to trigger.
const SCROLL_TRIGGER = 0.6;

type Content = "survey" | "star" | "download";

// Matomo event category per prompt variant.
const EVENT_CATEGORY: Record<Content, string> = {
  survey: "survey",
  star: "invite-github-star",
  download: "invite-download",
};

function promoInCooldown(): boolean {
  try {
    const raw = localStorage.getItem(PROMO_STORAGE_KEY);
    if (!raw) return false;
    const lastShown = Number(raw);
    return !Number.isNaN(lastShown) && Date.now() - lastShown < PROMO_COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function EngagementPrompt() {
  const [content, setContent] = useState<Content | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const shownRef = useRef(false);
  const pathname = usePathname();
  const excluded = isExcluded(pathname);
  // The blog already pitches download + star (side rail, closing CTA), so the
  // floating prompt there is survey-only — promo variants would be redundant.
  const surveyOnly = pathname?.startsWith("/blog") ?? false;

  useEffect(() => {
    getRepoStars().then(setStars);
  }, []);

  useEffect(() => {
    if (excluded) return;

    const surveyEligible =
      SURVEY_CONFIGURED && !localStorage.getItem(SURVEY_STORAGE_KEY);
    const promoEligible = !surveyOnly && !promoInCooldown();
    if (!surveyEligible && !promoEligible) return;

    const mountedAt = Date.now();

    const reveal = () => {
      if (shownRef.current) return;
      // Don't compete with the cookie banner — wait until consent is recorded.
      if (!localStorage.getItem(COOKIE_KEY)) return;
      if (Date.now() - mountedAt < MIN_DWELL_MS) return;
      shownRef.current = true;

      // Pick randomly among whichever prompts are currently eligible, so the
      // low-key promo CTA and the survey take turns instead of always
      // showing the same one.
      const pool: Array<"survey" | "promo"> = [];
      if (surveyEligible) pool.push("survey");
      if (promoEligible) pool.push("promo");
      const picked = pool[Math.floor(Math.random() * pool.length)];
      const chosen: Content =
        picked === "survey" ? "survey" : Math.random() < 0.5 ? "star" : "download";

      setContent(chosen);
      if (chosen !== "survey") {
        try {
          localStorage.setItem(PROMO_STORAGE_KEY, String(Date.now()));
        } catch {
          // localStorage unavailable (private mode) — non-fatal.
        }
      }
      trackEvent(EVENT_CATEGORY[chosen], "shown");
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
  }, [excluded, surveyOnly]);

  if (excluded || !content) return null;
  const shown = content;

  function dismiss() {
    if (shown === "survey") {
      // Closing counts as "seen" — the prompt won't reappear on later visits.
      try {
        localStorage.setItem(SURVEY_STORAGE_KEY, "dismissed");
      } catch {
        // localStorage unavailable (private mode) — non-fatal.
      }
    }
    trackEvent(EVENT_CATEGORY[shown], "dismissed");
    setContent(null);
  }

  return (
    <div
      className="survey-prompt"
      role="dialog"
      aria-label={
        content === "survey" ? "Quick product survey" : "Tabularis quick promo"
      }
    >
      <button
        type="button"
        className="survey-close"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        ×
      </button>

      {content === "survey" && <SurveyForm source="popup" />}

      {content === "star" && (
        <div className="promo-cta">
          <span className="promo-cta__icon">
            <GitHubIcon size={22} />
          </span>
          <p className="promo-cta__text">
            Enjoying Tabularis? A star on GitHub helps more developers
            discover it.
          </p>
          <a
            href={SOCIAL_URLS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-cta__btn"
            onClick={() => trackEvent(EVENT_CATEGORY.star, "click")}
          >
            Star on GitHub{stars !== null ? ` · ${formatStars(stars)}` : ""}
          </a>
        </div>
      )}

      {content === "download" && (
        <div className="promo-cta">
          <span className="promo-cta__icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <p className="promo-cta__text">
            Haven&apos;t tried Tabularis yet? It&apos;s free to download for
            your platform.
          </p>
          <Link
            href="/download"
            className="promo-cta__btn"
            onClick={() => trackEvent(EVENT_CATEGORY.download, "click")}
          >
            Download for free
          </Link>
        </div>
      )}
    </div>
  );
}
