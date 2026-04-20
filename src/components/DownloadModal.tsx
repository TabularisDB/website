"use client";

import { useEffect } from "react";
import { PLATFORM_CONFIG } from "@/lib/downloadConfig";

export type { Platform } from "@/lib/downloadConfig";

interface DownloadModalProps {
  platform: import("@/lib/downloadConfig").Platform | null;
  onClose: () => void;
}

export function DownloadModal({ platform, onClose }: DownloadModalProps) {
  const open = platform !== null;
  const config = platform ? PLATFORM_CONFIG[platform] : null;

  useEffect(() => {
    if (!open || !platform) return;
    const _paq: unknown[][] | undefined = (window as unknown as { _paq?: unknown[][] })._paq;
    if (_paq) {
      _paq.push(["trackEvent", "Download", "Lead", platform]);
    }
  }, [open, platform]);

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
      className={`dl-overlay${open ? " open" : ""}`}
      onClick={handleOverlayClick}
      aria-hidden={!open}
    >
      {config && (
        <div
          className="dl-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Download for ${config.label}`}
        >
          <div className="dl-modal-header">
            <span className="dl-modal-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download for <strong>{config.label}</strong>
            </span>
            <button className="dl-modal-close" onClick={onClose} aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="dl-modal-body">
            {config.options.map((opt) =>
              opt.kind === "command" ? (
                <div key={opt.command} className="dl-option dl-option--command">
                  <div className="dl-option-info">
                    <span className="dl-option-label">{opt.label}</span>
                    <span className="dl-option-desc">{opt.desc}</span>
                  </div>
                  <code className="dl-option-cmd">{opt.command}</code>
                </div>
              ) : (
                <a key={opt.url} href={`/download/thank-you?url=${encodeURIComponent(opt.url)}`} className="dl-option">
                  <div className="dl-option-info">
                    <span className="dl-option-label">{opt.label}</span>
                    <span className="dl-option-desc">{opt.desc}</span>
                  </div>
                  <span className="dl-option-ext">{opt.ext}</span>
                </a>
              )
            )}

            {config.note && (
              <div className="dl-modal-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: "1px" }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  {config.note.text}
                  {config.note.command && <> <code>{config.note.command}</code></>}
                </span>
              </div>
            )}
          </div>

          <div className="dl-modal-footer">
            <a
              href="https://github.com/TabularisDB/tabularis/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              View all releases on GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
