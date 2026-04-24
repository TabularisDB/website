const REPO = "TabularisDB/tabularis";

let cachedStars: Promise<number | null> | null = null;
let cachedDownloads: Promise<number | null> | null = null;

export function formatStars(count: number): string {
  if (count >= 10000) return `${(count / 1000).toFixed(0)}k`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 10_000) return `${(count / 1000).toFixed(0)}k`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toLocaleString("en-US");
}

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export function getRepoStars(): Promise<number | null> {
  if (!cachedStars) {
    cachedStars = fetch(`https://api.github.com/repos/${REPO}`, {
      headers: apiHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count?: number } | null) =>
        typeof data?.stargazers_count === "number"
          ? data.stargazers_count
          : null,
      )
      .catch(() => null);
  }
  return cachedStars;
}

interface ReleaseAsset {
  download_count?: number;
}
interface Release {
  assets?: ReleaseAsset[];
}

export function getTotalDownloads(): Promise<number | null> {
  if (!cachedDownloads) {
    cachedDownloads = (async () => {
      let total = 0;
      let found = false;
      for (let page = 1; page <= 5; page++) {
        const res = await fetch(
          `https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`,
          { headers: apiHeaders() },
        );
        if (!res.ok) return found ? total : null;
        const releases = (await res.json()) as Release[];
        if (!Array.isArray(releases) || releases.length === 0) break;
        found = true;
        for (const release of releases) {
          for (const asset of release.assets ?? []) {
            if (typeof asset.download_count === "number") {
              total += asset.download_count;
            }
          }
        }
        if (releases.length < 100) break;
      }
      return found ? total : null;
    })().catch(() => null);
  }
  return cachedDownloads;
}
