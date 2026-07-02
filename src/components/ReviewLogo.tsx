import type { Review } from "@/lib/reviews";

/**
 * Renders a review platform's logo (or a colored monogram fallback).
 *
 * - default: fixed height, automatic width — for inline rows (footer).
 * - boxed: fits entirely inside a `size`×`size` box — for the avatar stack.
 */
export function ReviewLogo({
  review,
  size = 26,
  boxed = false,
}: {
  review: Review;
  size?: number;
  boxed?: boolean;
}) {
  if (review.logoImg) {
    const style: React.CSSProperties = boxed
      ? {
          maxHeight: size,
          maxWidth: size,
          width: "auto",
          height: "auto",
          objectFit: "contain",
          display: "block",
        }
      : {
          height: size,
          width: "auto",
          maxWidth: size * 2.4,
          objectFit: "contain",
          display: "block",
        };
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={review.logoImg}
        alt={review.name}
        style={style}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: review.bg,
        color: "#ffffff",
        borderRadius: "8px",
        fontSize: size * (review.char.length > 1 ? 0.34 : 0.46),
        fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      {review.char}
    </span>
  );
}
