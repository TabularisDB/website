import { formatStars } from "@/lib/github";

interface GithubStarsButtonProps {
  stars: number | null;
  href?: string;
}

export function GithubStarsButton({
  stars,
  href = "https://github.com/TabularisDB/tabularis",
}: GithubStarsButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="github-stars-btn"
      aria-label={
        stars !== null
          ? `Tabularis on GitHub (${stars} stars)`
          : "Tabularis on GitHub"
      }
    >
      <span className="github-stars-btn__logo">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 .5C5.73.5.67 5.56.67 11.83c0 5.01 3.24 9.26 7.75 10.76.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.15.69-3.82-1.34-3.82-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.39-1.23.71-1.51-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.44.11-3.01 0 0 .95-.3 3.12 1.16.9-.25 1.87-.38 2.83-.38.96 0 1.93.13 2.83.38 2.17-1.47 3.12-1.16 3.12-1.16.62 1.57.23 2.72.11 3.01.73.79 1.17 1.8 1.17 3.04 0 4.36-2.66 5.32-5.19 5.6.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.21.66.79.55 4.51-1.5 7.75-5.75 7.75-10.76C23.33 5.56 18.27.5 12 .5Z" />
        </svg>
      </span>
      <span className="github-stars-btn__label">GitHub</span>
      {stars !== null && (
        <span className="github-stars-btn__count">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
          </svg>
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}
