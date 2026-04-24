const REPO = "TabularisDB/tabularis";

let cached: Promise<number | null> | null = null;

export function formatStars(count: number): string {
  if (count >= 10000) return `${(count / 1000).toFixed(0)}k`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export function getRepoStars(): Promise<number | null> {
  if (!cached) {
    cached = fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count?: number } | null) =>
        typeof data?.stargazers_count === "number"
          ? data.stargazers_count
          : null,
      )
      .catch(() => null);
  }
  return cached;
}
