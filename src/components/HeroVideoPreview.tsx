"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VideoPlayer } from "@/components/VideoPlayer";
import { trackEvent } from "@/lib/analytics";

interface HeroVideoPreviewProps {
  poster: string;
  posterSmall?: string;
  src: string;
}

const CHARGE_MS = 3000;

const FOCUSABLE_SELECTOR =
  'video, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function HeroVideoPreview({ poster, posterSmall, src }: HeroVideoPreviewProps) {
  const [open, setOpen] = useState(false);
  const [charging, setCharging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
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
    trackEvent("hero-video", "open", "click");
    setOpen(true);
  }, [cancelCharge]);

  const close = useCallback(() => setOpen(false), []);

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
      trackEvent("hero-video", "open", "hover-charge");
      setOpen(true);
    }, CHARGE_MS);
  }, [open, preloadVideo]);

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
        onPointerEnter={preloadVideo}
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
          sizes={posterSmall ? "(max-width: 960px) 100vw, 50vw" : undefined}
          alt=""
          width="1592"
          height="1080"
          className="hero-demo-image"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
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
