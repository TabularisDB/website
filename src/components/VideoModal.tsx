"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { VideoPlayer } from "@/components/VideoPlayer";

const FOCUSABLE_SELECTOR =
  'video, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface VideoModalProps {
  src: string;
  poster: string;
  open: boolean;
  onClose: () => void;
  ariaLabel?: string;
  /** Element to refocus on close; falls back to whatever was focused on open. */
  restoreFocusTo?: RefObject<HTMLElement | null>;
}

/* Fullscreen video overlay (portal + focus trap + scroll lock) shared by
   every "watch demo" trigger: the home/rail poster preview and the post
   sticky bar chip. */
export function VideoModal({
  src,
  poster,
  open,
  onClose,
  ariaLabel = "Tabularis overview video",
  restoreFocusTo,
}: VideoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
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
      (restoreFocusTo?.current ?? previousFocusRef.current)?.focus();
    };
  }, [onClose, open, restoreFocusTo]);

  if (!open) return null;

  return createPortal(
    <div
      className="hero-video-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="hero-video-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
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
    </div>,
    document.body,
  );
}
