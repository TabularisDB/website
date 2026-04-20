"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DiscordIcon } from "@/components/Icons";

export function DownloadThankYou() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  useEffect(() => {
    if (!url) return;
    const timer = setTimeout(() => {
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 500);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <>
      <div className="dl-thankyou-hero">
        <span className="dl-thankyou-kicker">Welcome to Tabularis</span>
        <h1 className="dl-thankyou-title">Your download has started!</h1>
        <p className="dl-thankyou-desc">
          While Tabularis is downloading, here are some great ways to get
          started with our community and resources.
        </p>
        {url && (
          <p className="dl-thankyou-fallback">
            If your download didn&apos;t start automatically,{" "}
            <a href={url} download>click here</a>.
          </p>
        )}
      </div>

      <div className="dl-thankyou-cards">
        <a
          href="https://discord.gg/YrZPHAwMSG"
          target="_blank"
          rel="noopener noreferrer"
          className="dl-thankyou-card"
        >
          <div className="dl-thankyou-card-visual dl-thankyou-card-visual--discord">
            <DiscordIcon size={48} />
          </div>
          <h3 className="dl-thankyou-card-title">Join our Discord Community</h3>
          <p className="dl-thankyou-card-desc">
            Connect with other developers using Tabularis. Get help, share tips,
            and stay updated on the latest features.
          </p>
        </a>

        <a
          href="/wiki"
          className="dl-thankyou-card"
        >
          <div className="dl-thankyou-card-visual dl-thankyou-card-visual--docs">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="8" y1="7" x2="16" y2="7" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <h3 className="dl-thankyou-card-title">Explore our Documentation</h3>
          <p className="dl-thankyou-card-desc">
            Learn about Tabularis features, keyboard shortcuts, configuration
            options, and how to make the most of your new database client.
          </p>
        </a>

        <a
          href="https://github.com/TabularisDB/tabularis"
          target="_blank"
          rel="noopener noreferrer"
          className="dl-thankyou-card"
        >
          <div className="dl-thankyou-card-visual dl-thankyou-card-visual--github">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <h3 className="dl-thankyou-card-title">Star us on GitHub</h3>
          <p className="dl-thankyou-card-desc">
            Check out the source code, report bugs, request features, and
            contribute to the project on GitHub.
          </p>
        </a>
      </div>
    </>
  );
}
