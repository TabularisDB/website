import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const REPO = process.env.TABULARIS_APP_REPO ?? "TabularisDB/tabularis";
const REF = process.env.TABULARIS_APP_REF ?? "main";
const BASE = `https://raw.githubusercontent.com/${REPO}/${REF}`;
const TABULARIUM = (process.env.TABULARIUM_REGISTRY_URL ?? "https://registry.tabularis.dev").replace(/\/+$/, "");

const targets = [
  {
    url: `${BASE}/src/version.ts`,
    out: "src/lib/version.ts",
    transform: (body) => {
      const match = body.match(/APP_VERSION\s*=\s*"([^"]+)"/);
      if (!match) throw new Error("Could not parse APP_VERSION from upstream src/version.ts");
      return `export const APP_VERSION = "${match[1]}";\n`;
    },
  },
  { url: `${BASE}/CHANGELOG.md`, out: "CHANGELOG.md" },
];

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchJson(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tabularis-website-build",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function writeTarget(out, body) {
  const abs = resolve(process.cwd(), out);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, body);
}

// No GitHub headers/token here — plain JSON endpoints (the Tabularium API).
async function fetchPlainJson(url) {
  return JSON.parse(await fetchText(url));
}

// Per-platform tracked download URL, so website downloads show up in the
// registry's analytics. Falls back to the direct asset URL for platform keys
// without an os-arch shape (e.g. "universal").
function trackedAssets(pluginId, version, assets) {
  return Object.fromEntries(
    Object.entries(assets).map(([platform, asset]) => {
      const i = platform.lastIndexOf("-");
      if (i === -1) return [platform, asset.url];
      const os = platform.slice(0, i);
      const arch = platform.slice(i + 1);
      return [
        platform,
        `${TABULARIUM}/api/plugins/${pluginId}/releases/${version}?os=${os}&arch=${arch}&redirect=1`,
      ];
    }),
  );
}

// Tabularium plugin detail -> the legacy registry.json shape every consumer
// (src/lib/plugins.ts, the :::plugin::: extension, the search index) reads.
function toLegacyPlugin(detail) {
  return {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    author: detail.author,
    homepage: detail.homepage || detail.repoUrl,
    registry_url: `${TABULARIUM}/plugins/${detail.id}`,
    latest_version: detail.latestVersion,
    // legacy registry.json lists releases oldest-first; the API is newest-first
    releases: [...(detail.releases ?? [])].reverse().map((release) => ({
      version: release.version,
      min_tabularis_version: release.minRuntimeVersion ?? null,
      assets: trackedAssets(detail.id, release.version, release.assets ?? {}),
    })),
  };
}

async function fetchTabulariumPlugins() {
  const listed = [];
  for (let page = 1; ; page += 1) {
    // kind=driver: the /plugins page lists database drivers; other registry
    // kinds (once they exist) need their own surface.
    const res = await fetchPlainJson(`${TABULARIUM}/api/plugins?kind=driver&page=${page}`);
    listed.push(...res.plugins);
    if (listed.length >= res.total || res.plugins.length === 0) break;
  }
  const details = await Promise.all(
    listed.map((plugin) => fetchPlainJson(`${TABULARIUM}/api/plugins/${plugin.id}`)),
  );
  return details.map(toLegacyPlugin).filter((p) => p.latest_version && p.releases.length > 0);
}

// COMPAT(registry-ga): merge the legacy static registry.json (app repo) with
// the Tabularium registry API; Tabularium wins per plugin id. Once every
// plugin lives in Tabularium, drop the legacy fetch and keep only the API.
async function buildRegistry() {
  const legacy = JSON.parse(await fetchText(`${BASE}/plugins/registry.json`));
  let fromTabularium = [];
  try {
    fromTabularium = await fetchTabulariumPlugins();
  } catch (err) {
    // The site must stay deployable when the registry API is down; the next
    // 6-hour rebuild picks the data up again.
    console.warn(`tabularium registry unavailable, keeping legacy data only: ${err}`);
  }
  const merged = new Map(legacy.plugins.map((plugin) => [plugin.id, plugin]));
  for (const plugin of fromTabularium) {
    merged.set(plugin.id, plugin);
  }
  return { ...legacy, plugins: [...merged.values()] };
}

async function main() {
  for (const { url, out, transform } of targets) {
    const raw = await fetchText(url);
    const body = transform ? transform(raw) : raw;
    await writeTarget(out, body);
    console.log(`fetched ${url} -> ${out}`);
  }

  const registry = await buildRegistry();
  await writeTarget("plugins/registry.json", JSON.stringify(registry, null, 2) + "\n");
  console.log(
    `merged ${TABULARIUM}/api/plugins + ${BASE}/plugins/registry.json -> plugins/registry.json (${registry.plugins.length} plugins)`,
  );

  const releasesUrl = `https://api.github.com/repos/${REPO}/releases?per_page=30`;
  const releases = await fetchJson(releasesUrl);
  const nightly = releases.find(
    (release) =>
      !release.draft &&
      typeof release.tag_name === "string" &&
      release.tag_name.startsWith("nightly-"),
  );
  if (!nightly) {
    throw new Error(`No nightly-* release found in ${REPO}`);
  }

  const nightlyVersion = String(nightly.name ?? "").match(/\bv?(\d+\.\d+\.\d+)\b/)?.[1] ?? null;
  const nightlyData = {
    tag: nightly.tag_name,
    name: nightly.name || nightly.tag_name,
    version: nightlyVersion,
    publishedAt: nightly.published_at,
    url: nightly.html_url,
    assets: (nightly.assets ?? []).map((asset) => ({
      name: asset.name,
      url: asset.browser_download_url,
    })),
  };
  const nightlyOut = "src/lib/nightly.ts";
  await writeTarget(
    nightlyOut,
    `// Generated by scripts/fetch-app-data.mjs. Do not edit by hand.\nexport const NIGHTLY_RELEASE = ${JSON.stringify(nightlyData, null, 2)} as const;\n`,
  );
  console.log(`fetched ${releasesUrl} -> ${nightlyOut}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
