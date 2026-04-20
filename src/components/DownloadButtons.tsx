"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadModal } from "./DownloadModal";
import type { Platform } from "./DownloadModal";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "windows";
}


const PLATFORM_LABELS: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

const ALL_PLATFORMS: Platform[] = ["windows", "macos", "linux"];

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "windows") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
  if (platform === "macos") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
  // linux
  return (
    <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3.712 7.062c.05-.589.072-1.18.104-1.77.288-5.101 8.08-5.101 8.368 0 .034.606.06 1.212.123 1.816.388.834 2.057 4.514 1.107 4.898-.224.09-.61-.283-1.044-.954a4.4 4.4 0 0 1-1.311 2.395c.685.233 1.275.551 1.275.887 0 .584-8.667.592-8.667 0 0-.336.59-.654 1.275-.887-.68-.644-1.119-1.481-1.318-2.39-.433.667-.818 1.04-1.04.95-.958-.388.731-4.1 1.128-4.945" clipRule="evenodd" fill="transparent" />
      <path fill="currentColor" d="m6.119 6.6 1.57 1.29c.17.14.44.14.61 0l1.57-1.29c.27-.22.08-.6-.3-.6h-3.14c-.38 0-.57.38-.3.6z" />
    </svg>
  );
}

export function DownloadButtons({ showInstallLink = false }: { showInstallLink?: boolean }) {
  const [modalPlatform, setModalPlatform] = useState<Platform | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detected, setDetected] = useState<Platform>("windows");
  const others = ALL_PLATFORMS.filter((p) => p !== detected);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDetected(detectPlatform());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <div className="download-wrap" ref={wrapperRef}>
        <div className="download-split">
          <button
            className="download-split__main"
            onClick={() => { setModalPlatform(detected); setDropdownOpen(false); }}
          >
            <PlatformIcon platform={detected} />
            Download for <strong>{PLATFORM_LABELS[detected]}</strong>
          </button>
          <button
            className={`download-split__chevron${dropdownOpen ? " download-split__chevron--open" : ""}`}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Other platforms"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {dropdownOpen && (
          <div className="download-dropdown">
            {others.map((p) => (
              <button
                key={p}
                className="download-dropdown__item"
                onClick={() => { setModalPlatform(p); setDropdownOpen(false); }}
              >
                <PlatformIcon platform={p} />
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.75rem", display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        {showInstallLink && (
          <a
            href="/download"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            Homebrew, Snap, AUR and more →
          </a>
        )}
        <a
          href="https://github.com/TabularisDB/tabularis/releases"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          View all releases on GitHub →
        </a>
      </p>

      <DownloadModal platform={modalPlatform} onClose={() => setModalPlatform(null)} />
    </>
  );
}
