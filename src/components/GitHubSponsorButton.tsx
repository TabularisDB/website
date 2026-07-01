"use client";

import { useState, useEffect } from "react";
import { SPONSOR_TIERS } from "@/lib/sponsors";
import { GitHubIcon } from "@/components/Icons";
import { trackEvent } from "@/lib/analytics";

const SPONSOR_URL = "https://github.com/sponsors/debba";

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Deep-link to the GitHub checkout with the frequency toggle preselected. */
function tierUrl(frequency: "recurring" | "one-time"): string {
  return `${SPONSOR_URL}?frequency=${frequency}`;
}

export function GitHubSponsorButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="btn-cta github"
        onClick={() => {
          trackEvent("Sponsor", "Open Tiers Modal");
          setOpen(true);
        }}
      >
        <GitHubIcon />
        Sponsor on GitHub
      </button>

      <div
        className={`sponsor-overlay${open ? " open" : ""}`}
        onClick={handleOverlayClick}
        aria-hidden={!open}
      >
        {open && (
          <div
            className="sponsor-modal tiers-modal"
            role="dialog"
            aria-modal="true"
            aria-label="GitHub Sponsors tiers"
          >
            <div className="sponsor-modal-header">
              <div className="sponsor-modal-brand">
                <GitHubIcon />
                <div>
                  <div className="sponsor-modal-name">Sponsor Tabularis</div>
                  <span className="sponsor-modal-url">Choose a tier on GitHub Sponsors</span>
                </div>
              </div>
              <button className="dl-modal-close" onClick={() => setOpen(false)} aria-label="Close">
                <IconClose />
              </button>
            </div>

            <div className="sponsor-modal-body">
              <ul className="tiers-list">
                {SPONSOR_TIERS.map((tier) => (
                  <li key={tier.id} className={`tier-card${tier.featured ? " featured" : ""}`}>
                    {tier.featured && <span className="tier-badge">Popular</span>}
                    <div className="tier-head">
                      <span className="tier-name">{tier.name}</span>
                      <span className="tier-price">
                        ${tier.amount}
                        <span className="tier-freq">
                          {tier.frequency === "recurring" ? "/mo" : " once"}
                        </span>
                      </span>
                    </div>
                    <p className="tier-desc">{tier.description}</p>
                    <ul className="tier-benefits">
                      {tier.benefits.map((b, i) => (
                        <li key={i}>
                          <IconCheck />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={tierUrl(tier.frequency)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tier-cta"
                      onClick={() => trackEvent("Sponsor", "Select Tier", tier.id)}
                    >
                      Select on GitHub
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
