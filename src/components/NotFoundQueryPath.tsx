"use client";

import { useEffect, useState } from "react";

/** Shows the actual missing path inside the 404 SQL query. Static export
 *  serves the same 404.html for every unknown URL, so the real path is only
 *  known client-side. */
export function NotFoundQueryPath() {
  const [path, setPath] = useState("/this-page");

  useEffect(() => {
    if (window.location.pathname) setPath(window.location.pathname);
  }, []);

  return <span className="nf-sql-string">&apos;{path}&apos;</span>;
}
