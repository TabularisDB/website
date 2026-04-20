"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TagFilterProps {
  tags: string[];
  activeTag?: string;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(tag: string | null) {
    setOpen(false);
    if (tag === null) {
      router.push("/blog");
    } else {
      router.push(`/blog/tag/${encodeURIComponent(tag)}`);
    }
  }

  return (
    <div className="tag-filter" ref={ref}>
      <button
        className="tag-filter-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {activeTag ? (
          <>
            <span className="tag-filter-label">Tag:</span>
            <span className="tag-filter-active">#{activeTag}</span>
          </>
        ) : (
          <span className="tag-filter-label">Filter by tag</span>
        )}
        <svg
          className={`tag-filter-chevron${open ? " tag-filter-chevron--open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="tag-filter-dropdown">
          {activeTag && (
            <button
              className="tag-filter-item tag-filter-item--clear"
              onClick={() => select(null)}
            >
              All posts
            </button>
          )}
          {tags.map((t) => (
            <button
              key={t}
              className={`tag-filter-item${t === activeTag ? " tag-filter-item--active" : ""}`}
              onClick={() => select(t)}
            >
              <span className="tag-filter-hash">#</span>
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
