"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { searchIndex, type SearchDoc } from "@/lib/search";

type SearchResult = {
  type: "post" | "wiki" | "plugin" | "page";
  slug: string;
  title: string;
  excerpt: string;
  meta: string;
  badge?: string;
  url?: string;
  score: number;
};

function SearchTypeGlyph({ type }: { type: SearchResult["type"] }) {
  if (type === "page") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3.75h7.5L19.25 8.5v11.75a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15.5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 3.75V8.5h4.75"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 12h6M9 15.5h6M9 19h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return <>{type === "post" ? "\u2726" : type === "wiki" ? "\u25C8" : "\u2B21"}</>;
}

const TYPE_CONFIG = {
  post: { label: "Blog", color: "var(--warning)" },
  wiki: { label: "Wiki", color: "var(--accent)" },
  plugin: { label: "Plugin", color: "var(--success)" },
  page: { label: "Guide", color: "var(--brand)" },
} as const;

const SUGGESTIONS: ({ label: string; query: string } | { label: string; href: string })[] = [
  { label: "Installation guide", query: "install" },
  { label: "DBeaver alternative", query: "dbeaver alternative" },
  { label: "SQL notebooks", query: "sql notebooks" },
  { label: "SSH database client", query: "ssh database client" },
  { label: "Plugin registry", query: "plugin" },
  { label: "Configuration", query: "config" },
  { label: "Getting started", query: "getting started" },
  { label: "Download", href: "/download" },
];

export function SearchModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wikiOnly = pathname.startsWith("/wiki");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const closeModal = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const navigateResult = useCallback(
    (result: SearchResult) => {
      closeModal();
      if (result.type === "plugin" && result.url) {
        window.open(result.url, "_blank");
        return;
      }
      const path =
        result.type === "post"
          ? `/blog/${result.slug}`
          : result.type === "page" && result.url
            ? result.url
            : `/wiki/${result.slug}`;
      router.push(path);
    },
    [closeModal, router]
  );

  // Perform search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const oramaResults = await searchIndex(
          trimmed,
          wikiOnly ? "wiki" : undefined,
        );
        const mapped: SearchResult[] = oramaResults.hits.map((hit) => {
          const doc = hit.document as unknown as SearchDoc;
          return {
            type: doc.type,
            slug: doc.slug,
            title: doc.title,
            excerpt: doc.excerpt,
            meta: doc.meta,
            badge: doc.badge || undefined,
            url: doc.url || undefined,
            score: hit.score,
          };
        });
        setResults(mapped);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, wikiOnly]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
        setQuery("");
        setActiveIndex(-1);
      }
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      setQuery("");
      setActiveIndex(-1);
    }
    document.addEventListener("openSearch", handleOpen);
    return () => document.removeEventListener("openSearch", handleOpen);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function handleKeyboardNav(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateResult(results[activeIndex]);
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) closeModal();
  }

  const isEmpty = query.trim() && results.length === 0 && !searching;
  const showSuggestions = !query.trim() && !wikiOnly;

  return (
    <div
      className={`search-overlay${open ? " open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="search-modal">
        {/* Header */}
        <div className="search-header">
          <span className="search-icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder={wikiOnly ? "Search docs..." : "Search wiki, blog, guides, plugins..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyboardNav}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery("")} type="button" aria-label="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions (empty state) */}
        {showSuggestions && (
          <div className="search-suggestions">
            <p className="search-section-label">Quick searches</p>
            <div className="search-suggestion-chips">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  className="search-chip"
                  onClick={() => {
                    if ("href" in s) {
                      closeModal();
                      router.push(s.href);
                    } else {
                      setQuery(s.query);
                    }
                  }}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <p className="search-section-label search-section-label--results">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <ul className="search-results" ref={listRef}>
              {results.map((result, i) => {
                const cfg = TYPE_CONFIG[result.type];
                return (
                  <li
                    key={`${result.type}-${result.slug}`}
                    className={`search-result-item${i === activeIndex ? " active" : ""}`}
                    onClick={() => navigateResult(result)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className="search-result-type-icon" style={{ color: cfg.color }}>
                      <SearchTypeGlyph type={result.type} />
                    </span>
                    <div className="search-result-body">
                      <div className="search-result-title">
                        {result.title}
                      </div>
                      {result.excerpt && (
                        <div className="search-result-excerpt">{result.excerpt}</div>
                      )}
                    </div>
                    <div className="search-result-aside">
                      <span className="search-result-type-badge" style={{ color: cfg.color, borderColor: cfg.color }}>
                        {cfg.label}
                      </span>
                      {(result.type === "post" || result.type === "plugin") && result.badge && (
                        <span className="search-result-release">{result.badge}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* No results */}
        {isEmpty && (
          <div className="search-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, margin: "0 auto 0.75rem", display: "block" }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>No results for <strong>&ldquo;{query}&rdquo;</strong></span>
          </div>
        )}

        {/* Footer */}
        <div className="search-footer">
          <span className="search-hint"><kbd>&uarr;&darr;</kbd> navigate</span>
          <span className="search-hint"><kbd>&crarr;</kbd> open</span>
          <span className="search-hint"><kbd>Esc</kbd> close</span>
          <a className="search-powered-by" href="https://orama.com" target="_blank" rel="noopener noreferrer">
            Search by <strong>Orama</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
