"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VideoPlayer } from "@/components/VideoPlayer";
import { trackEvent } from "@/lib/analytics";

interface HeroVideoPreviewProps {
  poster: string;
  posterSmall?: string;
  src: string;
  /** Matomo event category — override when embedding outside the hero. */
  analyticsCategory?: string;
  /** Poster <img sizes>; the default matches the home hero column. */
  sizes?: string;
  /** Load the poster eagerly at high priority (the hero is the LCP). */
  eager?: boolean;
}

const CHARGE_MS = 3000;

const FOCUSABLE_SELECTOR =
  'video, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function HeroVideoPreview({
  poster,
  posterSmall,
  src,
  analyticsCategory = "hero-video",
  sizes = "(max-width: 960px) 100vw, 50vw",
  eager = true,
}: HeroVideoPreviewProps) {
  const [open, setOpen] = useState(false);
  const [charging, setCharging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [hovering, setHovering] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const chargeTimerRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const preloadVideo = useCallback(() => {
    if (preloadRef.current) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.src = src;
    video.addEventListener("canplaythrough", () => setPreviewReady(true), {
      once: true,
    });
    video.load();
    preloadRef.current = video;
  }, [src]);

  const cancelCharge = useCallback(() => {
    if (chargeTimerRef.current !== null) {
      window.clearTimeout(chargeTimerRef.current);
      chargeTimerRef.current = null;
    }
    setCharging(false);
  }, []);

  const openPlayer = useCallback(() => {
    cancelCharge();
    trackEvent(analyticsCategory, "open", "click");
    setOpen(true);
  }, [analyticsCategory, cancelCharge]);

  const close = useCallback(() => setOpen(false), []);

  const handleEnter = useCallback(() => {
    preloadVideo();
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setHovering(true);
  }, [preloadVideo]);

  const handleLeave = useCallback(() => setHovering(false), []);

  // Inline preview: once the preload finished, hovering the hero plays the
  // video muted in place of the poster. Pauses and rewinds on leave/open.
  const previewing = hovering && previewReady && !open;

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    if (previewing) {
      video.play().catch(() => {});
      return;
    }
    // Keep playing through the fade-out so it doesn't freeze mid-dissolve
    // (duration matches the .hero-demo-preview opacity transition).
    const timer = window.setTimeout(() => {
      video.pause();
      video.currentTime = 0;
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [previewing]);

  // Hovering the CTA chip fills it over 3s, then the video opens on its own.
  const startCharge = useCallback(() => {
    if (open || chargeTimerRef.current !== null) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    preloadVideo();
    setCharging(true);
    chargeTimerRef.current = window.setTimeout(() => {
      chargeTimerRef.current = null;
      setCharging(false);
      trackEvent(analyticsCategory, "open", "hover-charge");
      setOpen(true);
    }, CHARGE_MS);
  }, [analyticsCategory, open, preloadVideo]);

  useEffect(() => cancelCharge, [cancelCharge]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || active === dialog) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      } else if (active && !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [close, open]);

  const modal = open && (
    <div
      className="hero-video-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="hero-video-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Tabularis overview video"
        tabIndex={-1}
      >
        <VideoPlayer
          src={src}
          poster={poster}
          wrapperClassName="hero-video-player"
          videoClassName="hero-video-player-video"
          ariaLabel="Tabularis product overview"
        />
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`hero-demo${charging ? " is-charging" : ""}`}
        onClick={openPlayer}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onFocus={preloadVideo}
        onTouchStart={preloadVideo}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Watch the Tabularis overview video"
      >
        <img
          src={poster}
          srcSet={
            posterSmall ? `${posterSmall} 800w, ${poster} 1592w` : undefined
          }
          sizes={posterSmall ? sizes : undefined}
          alt=""
          width="1592"
          height="1080"
          className="hero-demo-image"
          decoding="async"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
        {previewReady && (
          <video
            ref={previewRef}
            className={`hero-demo-preview${previewing ? " is-playing" : ""}`}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
        <span className="hero-demo-shade" aria-hidden="true" />
        <span
          className="hero-demo-cta"
          aria-hidden="true"
          onPointerEnter={startCharge}
          onPointerLeave={cancelCharge}
        >
          <span className="hero-demo-cta-fill" />
          <span className="hero-demo-cta-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch demo · 53s
          </span>
        </span>
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
