"use client";

import { useState, useEffect } from "react";
import { PLATFORM_CONFIG, ALL_PLATFORMS } from "@/lib/downloadConfig";
import type { Platform } from "@/lib/downloadConfig";

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  windows: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  macos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  ),
  linux: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3.712 7.062c.05-.589.072-1.18.104-1.77.288-5.101 8.08-5.101 8.368 0 .034.606.06 1.212.123 1.816.388.834 2.057 4.514 1.107 4.898-.224.09-.61-.283-1.044-.954a4.4 4.4 0 0 1-1.311 2.395c.685.233 1.275.551 1.275.887 0 .584-8.667.592-8.667 0 0-.336.59-.654 1.275-.887-.68-.644-1.119-1.481-1.318-2.39-.433.667-.818 1.04-1.04.95-.958-.388.731-4.1 1.128-4.945" clipRule="evenodd" fill="transparent" />
      <path fill="currentColor" d="m6.119 6.6 1.57 1.29c.17.14.44.14.61 0l1.57-1.29c.27-.22.08-.6-.3-.6h-3.14c-.38 0-.57.38-.3.6z" />
    </svg>
  ),
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "windows";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button className="dli-copy-btn" onClick={handleCopy} aria-label="Copy command" title="Copy">
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function DownloadInline() {
  const [detected, setDetected] = useState<Platform | null>(null);

  useEffect(() => {
    setDetected(detectPlatform());
  }, []);

  const orderedPlatforms = detected
    ? [detected, ...ALL_PLATFORMS.filter((p) => p !== detected)]
    : ALL_PLATFORMS;

  return (
    <div className="dli-grid">
      {orderedPlatforms.map((platform) => {
        const config = PLATFORM_CONFIG[platform];
        const isDetected = platform === detected;
        return (
          <div key={platform} className={`dli-card${isDetected ? " dli-card--detected" : ""}`}>
            <div className="dli-card-header">
              <span className="dli-platform-icon">{PLATFORM_ICONS[platform]}</span>
              <h3 className="dli-platform-name">{config.label}</h3>
              {isDetected && <span className="dli-detected-badge">Your OS</span>}
            </div>

            <div className="dli-options">
              {config.options.map((opt) =>
                opt.kind === "command" ? (
                  <div key={opt.command} className="dli-option dli-option--command">
                    <div className="dli-option-info">
                      <span className="dli-option-label">{opt.label}</span>
                      <span className="dli-option-desc">{opt.desc}</span>
                    </div>
                    <div className="dli-cmd-row">
                      <code className="dli-cmd">{opt.command}</code>
                      <CopyButton text={opt.command} />
                    </div>
                  </div>
                ) : (
                  <a key={opt.url} href={`/download/thank-you?url=${encodeURIComponent(opt.url)}`} className="dli-option">
                    <div className="dli-option-info">
                      <span className="dli-option-label">{opt.label}</span>
                      <span className="dli-option-desc">{opt.desc}</span>
                    </div>
                    <span className="dli-option-ext">{opt.ext}</span>
                  </a>
                )
              )}
            </div>

            {config.note && (
              <div className="dli-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        );
      })}
    </div>
  );
}
