"use client";

import { useState, useRef, useEffect } from "react";
import { REVIEWS, withReviewUtm } from "@/lib/reviews";
import { ReviewLogo } from "./ReviewLogo";

const PREVIEW_COUNT = 3;

/**
 * Compact "As featured on" proof, sized for the hero. Shows the first three
 * platforms as a stacked avatar cluster with a "+N" chip; clicking expands the
 * cluster horizontally to reveal the remaining platforms inline (each a link).
 * Space-frugal when collapsed, eye-catching when opened.
 */
export function FeaturedOn() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rest = REVIEWS.length - PREVIEW_COUNT;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="featured-on" ref={ref}>
      <span className="featured-on-label">As featured on</span>

      <div className={`featured-on-cluster${open ? " is-open" : ""}`}>
        {REVIEWS.map((review, i) => {
          const extra = i >= PREVIEW_COUNT;
          const hidden = extra && !open;
          return (
            <a
              key={review.id}
              href={withReviewUtm(review.href)}
              target="_blank"
              rel="noopener noreferrer"
              className={`featured-on-avatar${extra ? " featured-on-extra" : ""}`}
              style={{ zIndex: REVIEWS.length - i }}
              title={review.name}
              aria-label={`Tabularis on ${review.name}`}
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : 0}
            >
              <ReviewLogo review={review} size={20} boxed />
            </a>
          );
        })}

        {rest > 0 && (
          <button
            type="button"
            className="featured-on-avatar featured-on-more"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Show fewer platforms" : `Show all ${REVIEWS.length} platforms`}
          >
            {open ? "−" : `+${rest}`}
          </button>
        )}
      </div>
    </div>
  );
}
