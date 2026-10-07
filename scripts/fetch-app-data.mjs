import {writeFile, mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

const REPO = process.env.TABULARIS_APP_REPO ?? 'TabularisDB/tabularis';
const REF = process.env.TABULARIS_APP_REF ?? 'main';
const BASE = `https://raw.githubusercontent.com/${REPO}/${REF}`;
const TABULARIUM = (process.env.TABULARIUM_REGISTRY_URL ?? 'https://registry.tabularis.dev').replace(/\/+$/, '');

const targets = [
    {
        url: `${BASE}/src/version.ts`,
        out: 'src/lib/download/version.ts',
        transform: (body) => {
            const match = body.match(/APP_VERSION\s*=\s*"([^"]+)"/);
            if (!match) throw new Error('Could not parse APP_VERSION from upstream src/version.ts');
            return `export const APP_VERSION = "${match[1]}";\n`;
        },
    },
    {url: `${BASE}/CHANGELOG.md`, out: 'CHANGELOG.md'},
    // Served at the schemas' public $id URLs (tabularis.dev/schemas/...) so the
    // $schema references in plugin manifests and the scaffolder resolve.
    {url: `${BASE}/plugins/manifest.schema.json`, out: 'public/schemas/plugin-manifest.json'},
    {url: `${BASE}/plugins/tabularium-extensions.schema.json`, out: 'public/schemas/tabularium-extensions.json'},
];

async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    return res.text();
}

async function fetchJson(url) {
    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'tabularis-website-build',
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, {headers});
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    return res.json();
}

async function writeTarget(out, body) {
    const abs = resolve(process.cwd(), out);
    await mkdir(dirname(abs), {recursive: true});
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
            const i = platform.lastIndexOf('-');
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
// (src/lib/plugins/index.ts, the :::plugin::: extension, the search index) reads,
// plus the plugin's kind, which the detail endpoint does not carry.
function toLegacyPlugin(detail, kind) {
    return {
        id: detail.id,
        kind,
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

// Every plugin of every registry kind (drivers, themes, …). The kind comes from
// the listing it was found in.
async function fetchTabulariumPlugins() {
    const {kinds} = await fetchPlainJson(`${TABULARIUM}/api/kinds`);
    const listed = [];
    for (const {key} of kinds) {
        const ofKind = [];
        for (let page = 1; ; page += 1) {
            const res = await fetchPlainJson(`${TABULARIUM}/api/plugins?kind=${encodeURIComponent(key)}&page=${page}`);
            ofKind.push(...res.plugins.map((plugin) => ({id: plugin.id, kind: key})));
            if (ofKind.length >= res.total || res.plugins.length === 0) break;
        }
        listed.push(...ofKind);
    }
    const details = await Promise.all(
        listed.map(async ({id, kind}) => toLegacyPlugin(await fetchPlainJson(`${TABULARIUM}/api/plugins/${id}`), kind)),
    );
    return details.filter((p) => p.latest_version && p.releases.length > 0);
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
    // The static registry.json only ever listed drivers.
    const merged = new Map(legacy.plugins.map((plugin) => [plugin.id, {kind: 'driver', ...plugin}]));
    for (const plugin of fromTabularium) {
        merged.set(plugin.id, plugin);
    }
    return {...legacy, plugins: [...merged.values()]};
}

// Plugin kinds reference for the :::plugin-kinds::: block on the Plugin Kinds
// wiki page. Labels and descriptions come from the registry's kind catalogue
// (/api/kinds); fields come from the per-kind branches of the published
// manifest schema, where each kind is an `if kind == <key> then {properties,
// required}` entry in allOf. A branch lists the core fields too, so the fields
// shared by every kind are treated as core and left out. Example manifests are
// not part of the schema; they come from the registry's structured docs
// (examples.perKind), which carry the admin's custom example when one is set.
function schemaType(node) {
    if (Array.isArray(node.enum) && node.enum.length > 0) return node.enum.map(String);
    if (node.type === 'array' && node.items?.type) return `array<${node.items.type}>`;
    return node.type ?? 'any';
}

async function buildPluginKinds() {
    const [{kinds}, schema, docs] = await Promise.all([
        fetchPlainJson(`${TABULARIUM}/api/kinds`),
        fetchPlainJson(`${TABULARIUM}/manifest.schema.json`),
        fetchPlainJson(`${TABULARIUM}/api/docs/plugin-development`),
    ]);
    const examples = new Map((docs.examples?.perKind ?? []).map((e) => [e.kindKey, e]));
    const branches = new Map(
        (schema.allOf ?? [])
            .filter((entry) => entry.if?.properties?.kind?.const && entry.then?.properties)
            .map((entry) => [entry.if.properties.kind.const, entry.then]),
    );
    const keySets = [...branches.values()].map((branch) => new Set(Object.keys(branch.properties)));
    const isShared = (field) => keySets.length > 1 && keySets.every((keys) => keys.has(field));

    return {
        kinds: kinds.map((kind) => {
            const branch = branches.get(kind.key) ?? {properties: {}, required: []};
            const required = new Set(branch.required ?? []);
            return {
                key: kind.key,
                label: kind.label,
                description: kind.description ?? null,
                catalogue_url: kind.publicPageEnabled ? `${TABULARIUM}/c/${kind.key}` : null,
                fields: Object.entries(branch.properties)
                    .filter(([field]) => !isShared(field))
                    .map(([field, node]) => ({
                        key: field,
                        type: schemaType(node),
                        required: required.has(field),
                        description: node.description ?? null,
                    })),
                example: examples.has(kind.key)
                    ? {yaml: examples.get(kind.key).yaml, json: examples.get(kind.key).json}
                    : null,
            };
        }),
    };
}

// Repo stars + total release-asset downloads, baked into the static HTML so
// visitors' browsers never hit the unauthenticated GitHub API (60 req/h per IP).
// The 6-hour rebuild cron keeps them fresh.
async function buildGithubStats() {
    const repo = await fetchJson(`https://api.github.com/repos/${REPO}`);
    if (typeof repo.stargazers_count !== 'number') {
        throw new Error(`No stargazers_count in https://api.github.com/repos/${REPO}`);
    }

    let downloads = 0;
    for (let page = 1; page <= 10; page += 1) {
        const releases = await fetchJson(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`);
        if (!Array.isArray(releases) || releases.length === 0) break;
        for (const release of releases) {
            for (const asset of release.assets ?? []) {
                if (typeof asset.download_count === 'number') downloads += asset.download_count;
            }
        }
        if (releases.length < 100) break;
    }

    return {stars: repo.stargazers_count, downloads};
}

// Every open issue across the public repos of the org, with its labels, for the
// /community issue board. Baked in at build time like the stats above; the
// 6-hour rebuild cron keeps the list fresh. Featured labels lead the board's
// label filter; closed-in-spirit labels are left out.
const ORG = REPO.split('/')[0];
const FEATURED_LABELS = ['good first issue', 'help wanted'];
const HIDDEN_LABELS = new Set(['duplicate', 'invalid', 'wontfix']);

async function buildCommunityIssues() {
    const q = `org:${ORG} is:issue is:open is:public`;
    const issues = [];
    // The search API caps a query at 1000 results (10 pages of 100).
    for (let page = 1; page <= 10; page += 1) {
        const res = await fetchJson(
            `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=100&page=${page}`,
        );
        for (const item of res.items ?? []) {
            const labels = (item.labels ?? []).map((l) => ({name: l.name, color: l.color}));
            const names = labels.map((l) => l.name.toLowerCase());
            if (names.some((name) => HIDDEN_LABELS.has(name))) continue;
            issues.push({
                repo: item.repository_url.split('/').pop(),
                number: item.number,
                title: item.title,
                url: item.html_url,
                labels,
                kind: names.includes('bug')
                    ? 'bug'
                    : names.includes('enhancement') || names.includes('feature request')
                      ? 'feature'
                      : null,
                assignees: (item.assignees ?? []).map((a) => ({login: a.login, avatarUrl: a.avatar_url})),
                comments: item.comments ?? 0,
                createdAt: item.created_at,
            });
        }
        if (!res.items || res.items.length < 100) break;
    }
    return issues;
}

async function main() {
    for (const {url, out, transform} of targets) {
        const raw = await fetchText(url);
        const body = transform ? transform(raw) : raw;
        await writeTarget(out, body);
        console.log(`fetched ${url} -> ${out}`);
    }

    try {
        const kinds = await buildPluginKinds();
        await writeTarget('plugins/kinds.json', JSON.stringify(kinds, null, 2) + '\n');
        console.log(
            `fetched ${TABULARIUM}/api/kinds + ${TABULARIUM}/manifest.schema.json -> plugins/kinds.json (${kinds.kinds.length} kinds)`,
        );
    } catch (err) {
        // Same policy as buildRegistry: the site must stay deployable when the
        // registry is down — the committed copy from the last successful fetch ships.
        console.warn(`plugin kinds unavailable, keeping committed copy: ${err}`);
    }

    const registry = await buildRegistry();
    await writeTarget('plugins/registry.json', JSON.stringify(registry, null, 2) + '\n');
    console.log(
        `merged ${TABULARIUM}/api/plugins + ${BASE}/plugins/registry.json -> plugins/registry.json (${registry.plugins.length} plugins)`,
    );

    const releasesUrl = `https://api.github.com/repos/${REPO}/releases?per_page=30`;
    const releases = await fetchJson(releasesUrl);
    const nightly = releases.find(
        (release) => !release.draft && typeof release.tag_name === 'string' && release.tag_name.startsWith('nightly-'),
    );
    if (!nightly) {
        throw new Error(`No nightly-* release found in ${REPO}`);
    }

    const nightlyVersion = String(nightly.name ?? '').match(/\bv?(\d+\.\d+\.\d+)\b/)?.[1] ?? null;
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
    const nightlyOut = 'src/lib/download/nightly.ts';
    await writeTarget(
        nightlyOut,
        `// Generated by scripts/fetch-app-data.mjs. Do not edit by hand.
export interface NightlyReleaseAsset {
    name: string;
    url: string;
}

export interface NightlyRelease {
    tag: string;
    name: string;
    version: string | null;
    publishedAt: string;
    url: string;
    assets: NightlyReleaseAsset[];
}

export const NIGHTLY_RELEASE: NightlyRelease = ${JSON.stringify(nightlyData, null, 2)} as const;
`,
    );
    console.log(`fetched ${releasesUrl} -> ${nightlyOut}`);

    const statsOut = 'src/lib/github/stats.ts';
    try {
        const {stars, downloads} = await buildGithubStats();
        await writeTarget(
            statsOut,
            `// Generated by scripts/fetch-app-data.mjs. Do not edit by hand.
export const REPO_STARS = ${stars};
export const TOTAL_DOWNLOADS = ${downloads};
`,
        );
        console.log(`fetched GitHub stats -> ${statsOut} (${stars} stars, ${downloads} downloads)`);
    } catch (err) {
        // Same policy as buildRegistry: stale numbers beat a failed deploy —
        // the committed copy from the last successful fetch ships.
        console.warn(`GitHub stats unavailable, keeping committed copy: ${err}`);
    }

    const issuesOut = 'src/lib/community/issues.ts';
    try {
        const issues = await buildCommunityIssues();
        await writeTarget(
            issuesOut,
            `// Generated by scripts/fetch-app-data.mjs. Do not edit by hand.
import type {CommunityIssue} from './types';

export const ISSUES_ORG = ${JSON.stringify(ORG)};
export const FEATURED_LABELS = ${JSON.stringify(FEATURED_LABELS)};
export const ISSUES_FETCHED_AT = ${JSON.stringify(new Date().toISOString())};
export const COMMUNITY_ISSUES: CommunityIssue[] = ${JSON.stringify(issues, null, 2)};
`,
        );
        console.log(`fetched ${ORG} community issues -> ${issuesOut} (${issues.length} issues)`);
    } catch (err) {
        // Same policy as buildRegistry: a stale list beats a failed deploy.
        console.warn(`community issues unavailable, keeping committed copy: ${err}`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
