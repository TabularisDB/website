"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MenuIcon, XIcon, SearchIcon, DiscordIcon, GitHubIcon } from "@/components/Icons";
import { usePathname } from "next/navigation";
import { getRepoStars, formatStars } from "@/lib/github";
import { GithubStarsButton } from "@/components/GithubStarsButton";
import { SOCIAL_URLS } from "@/lib/social";

interface SiteHeaderProps {
  crumbs?: Array<{ label: string; href?: string }>;
  announcement?: {
    href: string;
    eyebrow?: string;
    title: string;
  };
}

type NavGroup = {
  label: string;
  href?: string;
  matchPrefixes: string[];
  columns?: Array<{
    title: string;
    links: Array<{ label: string; href: string; description: string; badge?: string }>;
  }>;
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const navGroups: NavGroup[] = [
  {
    label: "Product",
    matchPrefixes: ["/wiki", "/plugins", "/download", "/roadmap"],
    columns: [
      {
        title: "Core workflow",
        links: [
          {
            label: "Getting Started",
            href: "/wiki/getting-started",
            description: "Install, connect, and get productive quickly.",
          },
          {
            label: "Connections",
            href: "/wiki/connections",
            description: "PostgreSQL, MySQL/MariaDB, and SQLite from one app.",
          },
          {
            label: "SQL Editor",
            href: "/wiki/editor",
            description: "A modern editor with tabs, history, and shortcuts.",
          },
          {
            label: "Data Grid",
            href: "/wiki/data-grid",
            description: "Inspect, filter, and edit records without friction.",
          },
        ],
      },
      {
        title: "Power features",
        links: [
          {
            label: "SQL Notebooks",
            href: "/wiki/notebooks",
            description: "Reusable analysis with SQL, markdown, charts, and variables.",
          },
          {
            label: "Visual Query Builder",
            href: "/wiki/visual-query-builder",
            description: "Compose queries visually, then inspect the generated SQL.",
          },
          {
            label: "Visual EXPLAIN",
            href: "/wiki/visual-explain",
            description: "Turn execution plans into something you can actually read.",
          },
          {
            label: "AI Assistant",
            href: "/wiki/ai-assistant",
            description: "Draft, explain, and refine SQL with your preferred provider.",
          },
        ],
      },
      {
        title: "Platform",
        links: [
          {
            label: "MCP Server",
            href: "/wiki/mcp-server",
            description: "Let AI tools inspect schemas and run actions through Tabularis.",
          },
          {
            label: "Plugins",
            href: "/plugins",
            description: "Extend engines and workflows with the plugin ecosystem.",
          },
          {
            label: "Bounty Board",
            href: "/plugins/bounties",
            description: "Vote, sponsor, or claim the next database drivers.",
          },
          {
            label: "Roadmap",
            href: "/roadmap",
            description: "See what is shipping next and where the product is going.",
          },
          {
            label: "Download",
            href: "/download",
            description: "Get the latest desktop build for your platform.",
          },
        ],
      },
    ],
  },
  {
    label: "Resources",
    matchPrefixes: ["/blog", "/changelog", "/compare", "/solutions", "/videos", "/sponsors"],
    columns: [
      {
        title: "Learn",
        links: [
          {
            label: "Blog",
            href: "/blog",
            description: "Releases, deep dives, and product updates.",
          },
          {
            label: "Wiki",
            href: "/wiki",
            description: "Reference docs and practical usage guides.",
          },
          {
            label: "Solutions",
            href: "/solutions",
            description: "Use-case pages for developer workflows and teams.",
          },
          {
            label: "Product Demos",
            href: "/videos",
            description: "Short videos for the workflows developers evaluate first.",
          },
        ],
      },
      {
        title: "Evaluate",
        links: [
          {
            label: "Visual Explain Online",
            href: "https://explain.tabularis.dev",
            description: "Paste an execution plan and explore it in your browser.",
            badge: "New",
          },
          {
            label: "Compare",
            href: "/compare",
            description: "See how Tabularis stacks up against other database tools.",
          },
          {
            label: "Changelog",
            href: "/changelog",
            description: "Track what changed across recent releases.",
          },
          {
            label: "Download",
            href: "/download",
            description: "Try the latest build and validate it in your workflow.",
          },
        ],
      },
      {
        title: "Community",
        links: [
          {
            label: "GitHub",
            href: SOCIAL_URLS.github,
            description: "Source code, issues, discussions, and stars.",
          },
          {
            label: "Discord",
            href: SOCIAL_URLS.discord,
            description: "Talk to users, contributors, and maintainers.",
          },
          {
            label: "Sponsors & supporters",
            href: "/sponsors",
            description: "The organizations that help keep Tabularis free and independent.",
          },
        ],
      },
    ],
  },
  {
    label: "Docs",
    href: "/wiki",
    matchPrefixes: ["/wiki"],
  },
  {
    label: "Plugins",
    href: "/plugins",
    matchPrefixes: ["/plugins"],
  },
];

function NavLinkLabel({ label, badge }: { label: string; badge?: string }) {
  if (!badge) return <strong>{label}</strong>;
  const words = label.split(" ");
  const last = words.pop();
  return (
    <strong>
      {words.length > 0 && <>{words.join(" ")} </>}
      <span className="nav-badge-keep">
        {last}
        <span className="nav-badge-new">{badge}</span>
      </span>
    </strong>
  );
}

function isActive(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function SiteHeader({ crumbs = [], announcement }: SiteHeaderProps) {
  const [isMac, setIsMac] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  useEffect(() => {
    getRepoStars().then(setStars);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  function openSearch() {
    document.dispatchEvent(new CustomEvent("openSearch"));
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className={`site-header-unified ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="header-container">
        <div className="header-main-row">
          <Link href="/" className="brand-link" onClick={handleLogoClick}>
            <img src="/img/logo.png" alt="Tabularis" className="header-logo" />
            <span className="brand-name">tabularis</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {navGroups.map((group) => {
              const active = isActive(pathname, group.matchPrefixes);

              if (group.columns) {
                return (
                  <div
                    key={group.label}
                    className={`nav-group ${active ? "active" : ""}`}
                  >
                    <button
                      type="button"
                      className={`nav-link nav-link-button ${active ? "active" : ""}`}
                    >
                      <span>{group.label}</span>
                      <ChevronDown className="nav-link-chevron" />
                    </button>
                    <div className="mega-menu">
                      <div className={`mega-menu-grid columns-${group.columns.length}`}>
                        {group.columns.map((column) => (
                          <div key={column.title} className="mega-menu-column">
                            <span className="mega-menu-title">{column.title}</span>
                            {column.links.map((link) => {
                              const external = link.href.startsWith("http");
                              const className = `mega-menu-link ${
                                pathname.startsWith(link.href) ? "active" : ""
                              }`;

                              const labelNode = (
                                <NavLinkLabel label={link.label} badge={link.badge} />
                              );

                              return external ? (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={className}
                                >
                                  {labelNode}
                                  <span>{link.description}</span>
                                </a>
                              ) : (
                                <Link key={link.href} href={link.href} className={className}>
                                  {labelNode}
                                  <span>{link.description}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={group.label}
                  href={group.href!}
                  className={`nav-link ${active ? "active" : ""}`}
                >
                  {group.label}
                </Link>
              );
            })}

            <button
              className="search-trigger"
              onClick={openSearch}
              type="button"
              aria-label="Search"
            >
              <SearchIcon size={14} />
              <kbd>{isMac ? "⌘K" : "Ctrl+K"}</kbd>
            </button>
            <GithubStarsButton stars={stars} compact />
            <Link
              href="/download"
              className={`header-download-btn ${pathname.startsWith("/download") ? "active" : ""}`}
            >
              Download
            </Link>
          </nav>

          <div className="mobile-header-actions">
            <button
              type="button"
              className="mobile-toggle"
              onClick={openSearch}
              aria-label="Search documentation"
            >
              <SearchIcon size={20} />
            </button>
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {announcement && (
          <Link href={announcement.href} className="header-announcement">
            {announcement.eyebrow && (
              <span className="header-announcement-eyebrow">{announcement.eyebrow}</span>
            )}
            <span className="header-announcement-title">{announcement.title} →</span>
          </Link>
        )}

        {crumbs.length > 0 && (
          <div className="header-crumbs">
            {crumbs.map((crumb, i) => (
              <span key={i} className="crumb-item">
                <span className="crumb-sep">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="crumb-link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="crumb-text">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <nav className="mobile-nav" aria-label="Mobile primary">
          {navGroups.map((group) => {
            const active = isActive(pathname, group.matchPrefixes);

            if (group.columns) {
              return (
                <details
                  key={group.label}
                  className={`mobile-nav-group ${active ? "active" : ""}`}
                >
                  <summary className="mobile-nav-summary">
                    <span>{group.label}</span>
                    <ChevronDown className="mobile-nav-summary-chevron" />
                  </summary>
                  <div className="mobile-nav-group-body">
                    {group.columns.map((column) => (
                      <div key={column.title} className="mobile-nav-column">
                        <span className="mobile-nav-column-title">{column.title}</span>
                        {column.links.map((link) => {
                          const external = link.href.startsWith("http");
                          const className = `mobile-nav-sub-link ${
                            !external && pathname.startsWith(link.href) ? "active" : ""
                          }`;

                          const labelNode = (
                            <NavLinkLabel label={link.label} badge={link.badge} />
                          );

                          return external ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              {labelNode}
                              <span>{link.description}</span>
                            </a>
                          ) : (
                            <Link key={link.href} href={link.href} className={className}>
                              {labelNode}
                              <span>{link.description}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </details>
              );
            }

            return (
              <Link
                key={group.label}
                href={group.href!}
                className={`mobile-nav-link ${active ? "active" : ""}`}
              >
                {group.label}
              </Link>
            );
          })}

          <div className="mobile-nav-download-row">
            <Link
              href="/download"
              className={`mobile-nav-cta ${pathname.startsWith("/download") ? "active" : ""}`}
            >
              Download
            </Link>

            {stars !== null && (
              <a
                href={SOCIAL_URLS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-stars"
                aria-label={`Tabularis on GitHub (${stars} stars)`}
              >
                <GitHubIcon size={18} />
                <span className="mobile-nav-stars__count">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
                  </svg>
                  {formatStars(stars)}
                </span>
              </a>
            )}
          </div>

          <a
            href={SOCIAL_URLS.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-discord"
          >
            <DiscordIcon size={18} />
            Join us on Discord
          </a>
        </nav>
      </div>
    </header>
  );
}
