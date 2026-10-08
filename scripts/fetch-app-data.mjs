import {mkdir, readFile, writeFile} from 'node:fs/promises';
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

// The board's project filter groups repos by registry kind (drivers, themes, …):
// the app repo leads, plugin repos take the kind of their registry entry
// (matched on the plugin homepage), repos missing from the registry come last.
function buildProjectGroups(registry, kindLabels, repos) {
    const repoOf = (url) =>
        (url ?? '')
            .replace(/\.git$|\/+$/g, '')
            .match(new RegExp(`^https://github\\.com/${ORG}/([^/]+)$`, 'i'))?.[1]
            ?.toLowerCase();
    const kindOf = new Map();
    for (const plugin of registry.plugins) {
        const repo = repoOf(plugin.homepage);
        if (repo && plugin.kind && !kindOf.has(repo)) kindOf.set(repo, plugin.kind);
    }
    const appRepo = REPO.split('/')[1];
    const groups = new Map([['app', {kind: 'app', label: 'App', repos: []}]]);
    for (const [key, label] of kindLabels) groups.set(key, {kind: key, label, repos: []});
    const other = {kind: 'other', label: 'Other', repos: []};
    for (const repo of [...repos].sort()) {
        const key = repo === appRepo ? 'app' : kindOf.get(repo.toLowerCase());
        if (key && !groups.has(key)) groups.set(key, {kind: key, label: key, repos: []});
        (key ? groups.get(key) : other).repos.push(repo);
    }
    return [...groups.values(), other].filter((group) => group.repos.length > 0);
}

// Open PRs that would close an issue, keyed by "repo#number". Only closing
// keywords count (fixes/closes/resolves #N, ORG/repo#N or the issue URL), the
// same links GitHub draws; bare #N mentions are too noisy (bot release notes).
const CLOSING_REF = new RegExp(
    `\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\b:?\\s+(?:https://github\\.com/${ORG}/([\\w.-]+)/issues/|(?:${ORG}/([\\w.-]+))?#)(\\d+)`,
    'gi',
);

async function buildOpenPullRequests() {
    const q = `org:${ORG} is:pr is:open is:public`;
    const byIssue = new Map();
    for (let page = 1; page <= 10; page += 1) {
        const res = await fetchJson(
            `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=100&page=${page}`,
        );
        for (const item of res.items ?? []) {
            if (item.user?.type === 'Bot') continue;
            const prRepo = item.repository_url.split('/').pop();
            const text = `${item.title ?? ''}\n${item.body ?? ''}`;
            for (const [, urlRepo, refRepo, number] of text.matchAll(CLOSING_REF)) {
                const key = `${(urlRepo ?? refRepo ?? prRepo).toLowerCase()}#${number}`;
                const prs = byIssue.get(key) ?? [];
                if (prs.some((pr) => pr.url === item.html_url)) continue;
                prs.push({number: item.number, url: item.html_url, author: item.user?.login ?? null});
                byIssue.set(key, prs);
            }
        }
        if (!res.items || res.items.length < 100) break;
    }
    return byIssue;
}

async function buildCommunityIssues() {
    const pullRequests = await buildOpenPullRequests();
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
            const repo = item.repository_url.split('/').pop();
            issues.push({
                repo,
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
                pullRequests: pullRequests.get(`${repo.toLowerCase()}#${item.number}`) ?? [],
                comments: item.comments ?? 0,
                createdAt: item.created_at,
            });
        }
        if (!res.items || res.items.length < 100) break;
    }
    return issues;
}

// Every public PR and issue opened across the org in the last
// CONTRIBUTIONS_DAYS days, for the /contribute/leaderboard page, which ranks
// contributors over any date range inside that window on the client. Bots are
// left out; the author association marks team members so the page can hide them.
const CONTRIBUTIONS_DAYS = 120;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// The search API allows 10 unauthenticated requests a minute (30 with a token):
// on a 403/429, wait for the window to reset once and try again.
async function fetchSearch(url) {
    try {
        return await fetchJson(url);
    } catch (err) {
        if (!/-> (403|429)/.test(String(err))) throw err;
        console.warn('search API rate limited, waiting 61s');
        await sleep(61_000);
        return fetchJson(url);
    }
}

// The search API caps a query at 1000 results: split the date range until each half fits.
async function searchCreated(base, from, to) {
    const range = `created:${from.toISOString().replace(/\.\d+Z$/, 'Z')}..${to.toISOString().replace(/\.\d+Z$/, 'Z')}`;
    const url = (page) =>
        `https://api.github.com/search/issues?q=${encodeURIComponent(`${base} ${range}`)}&sort=created&order=desc&per_page=100&page=${page}`;
    const first = await fetchSearch(url(1));
    if (first.total_count > 1000) {
        const mid = new Date((from.getTime() + to.getTime()) / 2);
        return [...(await searchCreated(base, mid, to)), ...(await searchCreated(base, from, mid))];
    }
    const items = [...(first.items ?? [])];
    for (let page = 2; items.length < first.total_count && page <= 10; page += 1) {
        const res = await fetchSearch(url(page));
        if (!res.items?.length) break;
        items.push(...res.items);
    }
    return items;
}

const REJECTED_LABELS = new Set(['duplicate', 'invalid', 'spam', 'wontfix']);
// Labels the app's issue forms set on their own; any other label means a
// maintainer triaged the issue.
const FORM_LABELS = new Set(['bug', 'feature request']);
const CONTRIBUTIONS_OUT = 'src/lib/community/contributions.ts';

// Who closed each issue or merged each PR, and who else approved each
// self-merged PR, from the last committed copy: they never change, so only
// contributions closed since then need a lookup.
async function knownClosers() {
    try {
        const body = await readFile(resolve(process.cwd(), CONTRIBUTIONS_OUT), 'utf8');
        const closers = new Map();
        for (const line of body.split('\n')) {
            const match = line.match(/^\s*(\{"type":.*\}),$/);
            if (!match) continue;
            const c = JSON.parse(match[1]);
            if (c.closedBy)
                closers.set(`${c.type}:${c.repo}#${c.number}`, {closedBy: c.closedBy, approvedBy: c.approvedBy});
        }
        return closers;
    } catch {
        return new Map();
    }
}

// Closing or merging your own work must not climb the board: an issue its
// author closed is withdrawn and worth nothing, a PR its author merged is
// self-merged and scores less, unless someone else approved it before the
// merge. The search API returns neither the closer, the merger nor the reviews,
// so each new closed issue and merged PR costs one request, and each new
// self-merged PR one more; a failed lookup (rate limit) leaves the contribution
// as is until the next build.
async function resolveClosers(contributions) {
    const known = await knownClosers();
    // Team members too: they are hidden by default, but the board can include them.
    const pending = contributions.filter(
        (c) => (c.type === 'issue' && c.state === 'closed') || (c.type === 'pr' && c.state === 'merged'),
    );
    let looked = 0;
    let failed = 0;
    for (let i = 0; i < pending.length; i += 8) {
        await Promise.all(
            pending.slice(i, i + 8).map(async (c) => {
                let {closedBy, approvedBy} = known.get(`${c.type}:${c.repo}#${c.number}`) ?? {};
                if (!closedBy) {
                    try {
                        looked += 1;
                        if (c.type === 'pr') {
                            const pr = await fetchJson(`https://api.github.com/repos/${ORG}/${c.repo}/pulls/${c.number}`);
                            closedBy = pr.merged_by?.login;
                        } else {
                            const issue = await fetchJson(`https://api.github.com/repos/${ORG}/${c.repo}/issues/${c.number}`);
                            closedBy = issue.closed_by?.login;
                        }
                    } catch {
                        failed += 1;
                    }
                }
                if (!closedBy) return;
                c.closedBy = closedBy;
                if (closedBy !== c.author) return;
                c.state = c.type === 'pr' ? 'self-merged' : 'withdrawn';
                if (c.type !== 'pr') return;
                if (approvedBy === undefined) {
                    try {
                        looked += 1;
                        const reviews = await fetchJson(
                            `https://api.github.com/repos/${ORG}/${c.repo}/pulls/${c.number}/reviews?per_page=100`,
                        );
                        approvedBy =
                            reviews.find(
                                (r) =>
                                    r.state === 'APPROVED' &&
                                    r.user &&
                                    r.user.type !== 'Bot' &&
                                    r.user.login !== c.author &&
                                    r.submitted_at <= c.mergedAt,
                            )?.user.login ?? null;
                    } catch {
                        failed += 1;
                    }
                }
                if (approvedBy !== undefined) c.approvedBy = approvedBy;
            }),
        );
    }
    console.log(
        `resolved closers and approvals: ${pending.length} closed issues and merged PRs, ${looked} looked up, ${failed} failed`,
    );
}

async function buildContributions() {
    const to = new Date();
    const from = new Date(to.getTime() - CONTRIBUTIONS_DAYS * 24 * 60 * 60 * 1000);
    const contributors = {};
    const contributions = [];
    for (const type of ['pr', 'issue']) {
        for (const item of await searchCreated(`org:${ORG} is:${type} is:public`, from, to)) {
            if (!item.user || item.user.type === 'Bot' || item.user.login.endsWith('[bot]')) continue;
            const login = item.user.login;
            const team = ['OWNER', 'MEMBER'].includes(item.author_association);
            const known = contributors[login];
            contributors[login] = {avatarUrl: item.user.avatar_url, team: Boolean(known?.team) || team};
            const names = (item.labels ?? []).map((l) => l.name.toLowerCase());
            contributions.push({
                type,
                repo: item.repository_url.split('/').pop(),
                number: item.number,
                title: item.title,
                author: login,
                createdAt: item.created_at,
                state:
                    type === 'pr'
                        ? item.pull_request?.merged_at
                            ? 'merged'
                            : item.state === 'open'
                              ? item.draft
                                  ? 'draft'
                                  : 'open'
                              : 'closed'
                        : item.state === 'open'
                          ? 'open'
                          : item.state_reason === 'not_planned' || names.some((n) => REJECTED_LABELS.has(n))
                            ? 'rejected'
                            : 'closed',
                ...(type === 'pr' && item.pull_request?.merged_at && {mergedAt: item.pull_request.merged_at}),
                firstTime: ['FIRST_TIMER', 'FIRST_TIME_CONTRIBUTOR'].includes(item.author_association),
                ...(type === 'issue' && {triaged: names.some((n) => !FORM_LABELS.has(n) && !REJECTED_LABELS.has(n))}),
                // Write or triage access to the repo: the author can label (triage) their own issues.
                ...(type === 'issue' &&
                    ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(item.author_association) && {maintainer: true}),
            });
        }
    }
    await resolveClosers(contributions);
    contributions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {since: from.toISOString(), contributors, contributions};
}

async function main() {
    for (const {url, out, transform} of targets) {
        const raw = await fetchText(url);
        const body = transform ? transform(raw) : raw;
        await writeTarget(out, body);
        console.log(`fetched ${url} -> ${out}`);
    }

    // Kind labels for the community board's project groups; empty when the
    // registry is down, the groups then fall back to the kind keys.
    let kindLabels = [];
    try {
        const kinds = await buildPluginKinds();
        kindLabels = kinds.kinds.map((kind) => [kind.key, kind.label ?? kind.key]);
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
        const projects = buildProjectGroups(registry, kindLabels, new Set(issues.map((issue) => issue.repo)));
        await writeTarget(
            issuesOut,
            `// Generated by scripts/fetch-app-data.mjs. Do not edit by hand.
import type {CommunityIssue, CommunityProjectGroup} from './types';

export const ISSUES_ORG = ${JSON.stringify(ORG)};
export const FEATURED_LABELS = ${JSON.stringify(FEATURED_LABELS)};
export const ISSUES_FETCHED_AT = ${JSON.stringify(new Date().toISOString())};
export const ISSUE_PROJECT_GROUPS: CommunityProjectGroup[] = ${JSON.stringify(projects, null, 2)};
export const COMMUNITY_ISSUES: CommunityIssue[] = ${JSON.stringify(issues, null, 2)};
`,
        );
        console.log(`fetched ${ORG} community issues -> ${issuesOut} (${issues.length} issues)`);
    } catch (err) {
        // Same policy as buildRegistry: a stale list beats a failed deploy.
        console.warn(`community issues unavailable, keeping committed copy: ${err}`);
    }

    const contributionsOut = CONTRIBUTIONS_OUT;
    try {
        const {since, contributors, contributions} = await buildContributions();
        await writeTarget(
            contributionsOut,
            `// Generated by scripts/fetch-app-data.mjs. Do not edit by hand.
import type {Contribution, ContributorProfile} from './types';

export const CONTRIBUTIONS_ORG = ${JSON.stringify(ORG)};
export const CONTRIBUTIONS_SINCE = ${JSON.stringify(since)};
export const CONTRIBUTIONS_FETCHED_AT = ${JSON.stringify(new Date().toISOString())};
export const CONTRIBUTORS: Record<string, ContributorProfile> = ${JSON.stringify(contributors)};
export const CONTRIBUTIONS: Contribution[] = [
${contributions.map((c) => `    ${JSON.stringify(c)},`).join('\n')}
];
`,
        );
        console.log(`fetched ${ORG} contributions -> ${contributionsOut} (${contributions.length} PRs and issues)`);
    } catch (err) {
        // Same policy as the issue board: a stale leaderboard beats a failed deploy.
        console.warn(`contributions unavailable, keeping committed copy: ${err}`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
