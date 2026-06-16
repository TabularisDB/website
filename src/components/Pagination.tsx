import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function pageHref(page: number): string {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

// Build a compact page list: always first & last, plus a window around the
// current page, with gaps collapsed into ellipses.
function buildPageItems(currentPage: number, totalPages: number): (number | "…")[] {
  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let offset = 1; offset <= 1; offset++) {
    pages.add(currentPage - offset);
    pages.add(currentPage + offset);
  }

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "…")[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (prev && page - prev > 1) items.push("…");
    items.push(page);
    prev = page;
  }
  return items;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Blog pagination">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="pagination-btn"
          rel="prev"
          aria-label="Previous page"
        >
          <span aria-hidden="true">←</span> Prev
        </Link>
      ) : (
        <span className="pagination-btn disabled" aria-hidden="true">
          ← Prev
        </span>
      )}

      <span className="pagination-pages">
        {items.map((item, i) =>
          item === "…" ? (
            <span key={`gap-${i}`} className="pagination-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(item)}
              className={`pagination-page${item === currentPage ? " active" : ""}`}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </Link>
          ),
        )}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="pagination-btn"
          rel="next"
          aria-label="Next page"
        >
          Next <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="pagination-btn disabled" aria-hidden="true">
          Next →
        </span>
      )}
    </nav>
  );
}
