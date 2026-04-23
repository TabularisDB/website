"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MenuIcon, XIcon, SearchIcon } from "@/components/Icons";
import { usePathname } from "next/navigation";

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
    links: Array<{ label: string; href: string; description: string }>;
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
    matchPrefixes: ["/blog", "/changelog", "/compare", "/solutions"],
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
        ],
      },
      {
        title: "Evaluate",
        links: [
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
            href: "https://github.com/TabularisDB/tabularis",
            description: "Source code, issues, discussions, and stars.",
          },
          {
            label: "Discord",
            href: "https://discord.gg/YrZPHAwMSG",
            description: "Talk to users, contributors, and maintainers.",
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

function isActive(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function SiteHeader({ crumbs = [], announcement }: SiteHeaderProps) {
  const [isMac, setIsMac] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  function openSearch() {
    document.dispatchEvent(new CustomEvent("openSearch"));
  }

  const handleLogoClick = (e: React.MouseEvent) => {
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

                              return external ? (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={className}
                                >
                                  <strong>{link.label}</strong>
                                  <span>{link.description}</span>
                                </a>
                              ) : (
                                <Link key={link.href} href={link.href} className={className}>
                                  <strong>{link.label}</strong>
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

            <button className="search-trigger" onClick={openSearch} type="button">
              <SearchIcon size={14} />
              <span>Search</span>
              <kbd>{isMac ? "⌘K" : "Ctrl+K"}</kbd>
            </button>
            <Link
              href="/download"
              className={`header-download-btn ${pathname.startsWith("/download") ? "active" : ""}`}
            >
              Download
            </Link>
          </nav>

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

                          return external ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              <strong>{link.label}</strong>
                              <span>{link.description}</span>
                            </a>
                          ) : (
                            <Link key={link.href} href={link.href} className={className}>
                              <strong>{link.label}</strong>
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

          <Link
            href="/download"
            className={`mobile-nav-cta ${pathname.startsWith("/download") ? "active" : ""}`}
          >
            Download
          </Link>

          <button className="mobile-search-btn" onClick={openSearch} type="button">
            <SearchIcon size={18} />
            Search documentation
          </button>
        </nav>
      </div>
    </header>
  );
}
