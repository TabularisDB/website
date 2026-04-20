"use client";

import { useState, useRef, useEffect } from "react";

export function ExpandableText({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, []);

  return (
    <div className="expandable-text">
      <p ref={ref} className={!expanded ? "expandable-text--clamped" : undefined}>
        {children}
      </p>
      {(overflows || expanded) && (
        <button className="expandable-text-toggle" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? "Show less" : "Show more"}>
          {expanded ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          )}
        </button>
      )}
    </div>
  );
}
