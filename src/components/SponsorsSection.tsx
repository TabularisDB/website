"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SPONSORS, type Sponsor } from "@/lib/sponsors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function withUtm(url: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "tabularis");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", "sponsor");
  return u.toString();
}

// ─── Shared icons ─────────────────────────────────────────────────────────────

export function IconExternalLink({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function IconArrow({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

export function SponsorLogo({ sponsor, size, imgOverride }: { sponsor: Sponsor; size: number; imgOverride?: string }) {
  const containerStyle = sponsor.logoImgBg
    ? { background: sponsor.logoImgBg, borderRadius: "10px", padding: "0.4rem" }
    : undefined;
  const src = imgOverride ?? sponsor.logoImg;

  return (
    <div style={containerStyle}>
      {src ? (
        <Image
          src={src}
          alt={sponsor.name}
          width={size}
          height={size}
          style={{ objectFit: "contain", width: size, height: size, display: "block" }}
        />
      ) : (
        <span
          style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: sponsor.logoBg,
            borderRadius: "12px",
            fontSize: size * 0.4,
          }}
        >
          {sponsor.logoChar}
        </span>
      )}
    </div>
  );
}

function SponsorModalBody({ sponsor }: { sponsor: Sponsor }) {
  const hasContent = sponsor.modalDescription || sponsor.features?.length || sponsor.offer;

  if (!hasContent) {
    return (
      <div className="sponsor-modal-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 12h6M9 15h4" />
        </svg>
        <p>Content coming soon.</p>
      </div>
    );
  }

  return (
    <div className="sponsor-modal-content">
      {sponsor.modalDescription && (
        <p className="sponsor-modal-desc">{sponsor.modalDescription}</p>
      )}
      {sponsor.features && sponsor.features.length > 0 && (
        <ul className="sponsor-modal-features">
          {sponsor.features.map((f, i) => (
            <li key={i}>
              <span className="sponsor-modal-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      )}
      {sponsor.offer && (
        <div
          className="sponsor-modal-offer"
          style={{
            borderColor: `color-mix(in srgb, ${sponsor.highlightColor ?? sponsor.accentColor} 40%, transparent)`,
            background: `color-mix(in srgb, ${sponsor.highlightColor ?? sponsor.accentColor} 6%, transparent)`,
          }}
        >
          <div className="sponsor-modal-offer-title">
            <IconStar />
            {sponsor.offer.title}
          </div>
          <p>{sponsor.offer.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SponsorModal({ sponsor, onClose }: { sponsor: Sponsor | null; onClose: () => void }) {
  const open = sponsor !== null;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className={`sponsor-overlay${open ? " open" : ""}`}
      onClick={handleOverlayClick}
      aria-hidden={!open}
    >
      {sponsor && (
        <div
          className="sponsor-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`About ${sponsor.name}`}
          style={{ "--sponsor-accent": sponsor.highlightColor ?? sponsor.accentColor } as React.CSSProperties}
        >
          <div className="sponsor-modal-header">
            <div className="sponsor-modal-brand">
              <SponsorLogo sponsor={sponsor} size={36} imgOverride={sponsor.logoImgCompact} />
              <div>
                <div className="sponsor-modal-name">{sponsor.name}</div>
                <a href={withUtm(sponsor.url)} target="_blank" rel="noopener noreferrer" className="sponsor-modal-url">
                  {sponsor.url.replace(/^https?:\/\//, "")}
                  <IconExternalLink size={10} />
                </a>
              </div>
            </div>
            <button className="dl-modal-close" onClick={onClose} aria-label="Close">
              <IconClose />
            </button>
          </div>

          <div className="sponsor-modal-body">
            <SponsorModalBody sponsor={sponsor} />
          </div>

          <div className="sponsor-modal-footer">
            <a
              href={withUtm(sponsor.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-modal-cta"
              style={{ background: sponsor.accentColor, color: sponsor.ctaTextColor ?? "#ffffff" }}
            >
              Visit {sponsor.name}
              <IconExternalLink size={13} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function SponsorCard({ sponsor, onLearnMore }: { sponsor: Sponsor; onLearnMore: () => void }) {
  return (
    <div
      className="sponsor-card"
      style={{ "--sponsor-accent": sponsor.highlightColor ?? sponsor.accentColor } as React.CSSProperties}
    >
      <div className="sponsor-card-glow" />

      <div className="sponsor-card-top">
        <div className="sponsor-logo">
          <SponsorLogo sponsor={sponsor} size={100} />
        </div>
        <a
          href={withUtm(sponsor.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="sponsor-external-link"
          aria-label={`Visit ${sponsor.name} website`}
        >
          <IconExternalLink size={13} />
        </a>
      </div>

      <div className="sponsor-card-body">
        <h3 className="sponsor-name">
          <a href={withUtm(sponsor.url)} target="_blank" rel="noopener noreferrer">
            {sponsor.name}
          </a>
        </h3>
        <p className="sponsor-tagline">{sponsor.tagline}</p>
      </div>

      <div className="sponsor-card-footer">
        <button className="sponsor-learn-btn" onClick={onLearnMore}>
          Learn more
          <IconArrow size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Section (homepage) ───────────────────────────────────────────────────────

export function SponsorsSection() {
  const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  function handleScroll() {
    const el = sliderRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIndex(index);
  }

  function scrollTo(index: number) {
    const clamped = Math.max(0, Math.min(SPONSORS.length - 1, index));
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: el.offsetWidth * clamped, behavior: "smooth" });
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") scrollTo(activeIndex - 1);
      if (e.key === "ArrowRight") scrollTo(activeIndex + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 40) return;
    scrollTo(delta > 0 ? activeIndex + 1 : activeIndex - 1);
  }

  return (
    <>
      <section className="section" id="sponsors">
        <h2>_sponsors</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>
          These companies support Tabularis development. Thank you for keeping
          the project alive and free.
        </p>

        <div
          className="sponsors-grid"
          ref={sliderRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {SPONSORS.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onLearnMore={() => setActiveSponsor(sponsor)}
            />
          ))}
        </div>

        <div className="sponsors-dots">
          {SPONSORS.map((_, i) => (
            <button
              key={i}
              className={`sponsors-dot${i === activeIndex ? " active" : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to sponsor ${i + 1}`}
            />
          ))}
        </div>

        <p className="sponsor-footnote">
          Interested in sponsoring Tabularis?{" "}
          <a href="/sponsors">
            Get in touch →
          </a>
        </p>
      </section>

      <SponsorModal sponsor={activeSponsor} onClose={() => setActiveSponsor(null)} />
    </>
  );
}
