# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The source of [tabularis.dev](https://tabularis.dev) — the marketing site, wiki, blog, changelog and plugin registry for [Tabularis](https://github.com/TabularisDB/tabularis), an open-source desktop database client. It is a Next.js App Router project that **must build as a static export** (`output: "export"` in `next.config.ts`). It is deployed to Vercel on every push to `main`; the Vercel build command (see `vercel.json`) is `pnpm build`, which fetches the upstream app data first.

Hard constraint: no runtime-only Next.js features (`getServerSideProps`, API routes, on-demand ISR, middleware, runtime image optimization). Images are `unoptimized: true`. Any new route must be fully expressible at build time.

## Commands

Package manager is pinned: **pnpm 10.33.0** (see `packageManager` in `package.json`). Node 20+.

| Task                               | Command               |
| ---------------------------------- | --------------------- |
| Install                            | `pnpm install`        |
| Dev server (http://localhost:3000) | `pnpm dev`            |
| Full static build into `out/`      | `pnpm build`          |
| Refresh upstream app data          | `pnpm fetch-app-data` |
| Lint (ESLint + Prettier)           | `pnpm lint`           |

There is no test command. `pnpm lint` runs `eslint .` with `typescript-eslint`'s type-checked rules and Prettier (4-space indent, single quotes, no bracket spacing, 120 columns; see `eslint.config.mjs` and `.prettierrc`). It ignores `scripts/`, `src/lib/`, `notes/` and `workers/`, and fails on errors only (Prettier issues are warnings; `pnpm exec eslint . --fix` clears them). Run it after touching components: the lint check run on Vercel fails on any error. Recurring ones:

- Promise-returning handlers passed to JSX props (`onClick`, `onSubmit`, callback props typed `() => void`) → wrap them: `onSubmit={(e) => void handleSubmit(e)}` (`no-misused-promises`).
- Fire-and-forget promises in effects → prefix with `void` (`no-floating-promises`).
- `@next/next/*` rules are not configured, so an `eslint-disable` comment naming one is itself an error.

`pnpm build` runs these steps in order, all of which must succeed:

1. `scripts/fetch-app-data.mjs` → refreshes the upstream files (see below).
2. `scripts/generate-search-index.mjs` → `public/search-index.json` (Orama index built from wiki + posts + SEO + roadmap + demo videos + plugin registry, plus every static `src/app/**/page.tsx` route not marked `noindex`, discovered automatically from its `title`/`description`).
3. `scripts/generate-sponsors.mjs` → `public/sponsors.json` (re-emits `src/lib/sponsors.ts` as JSON).
4. `scripts/generate-latest-posts.mjs` → `public/latest-posts.json` (top-5 posts for the home widget).
5. `scripts/generate-feed.mjs` → `public/feed.xml` and `public/feed.json` (blog RSS/JSON feeds).
6. `next build` → emits the site to `out/`, copying the generated `public/` files in.

Redirects (e.g. after renaming a slug) are configured in `vercel.json` under the `redirects` array, which Vercel serves as real HTTP 308/301 redirects.

## Upstream app data

Three pieces of data are fetched from `TabularisDB/tabularis` at build time by `scripts/fetch-app-data.mjs` (defaults: `TABULARIS_APP_REPO=TabularisDB/tabularis`, `TABULARIS_APP_REF=main`):

| Upstream                | Local file                                                         | Consumer                                                                                 |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `packages/web-ui/src/version.ts` | `src/lib/download/version.ts` (re-emitted as a single `APP_VERSION` export) | download links, SEO metadata, JSON-LD                                                    |
| `CHANGELOG.md`          | `CHANGELOG.md`                                                     | `/changelog` page via `src/lib/changelog.ts`                                             |
| `plugins/registry.json` | `plugins/registry.json`                                            | `/plugins` page via `src/lib/plugins.ts`, and the `:::plugin <id>:::` markdown extension |

`plugins/registry.json` also merges every published plugin from the Tabularium registry, one listing per kind, and tags each entry with its `kind` (`driver`, `theme`, …); the `/plugins` page filters on it, and the home hero counts only drivers.

Plugin kinds come from the Tabularium registry (`TABULARIUM_REGISTRY_URL`, default `https://registry.tabularis.dev`): `/api/kinds` for labels and descriptions, the per-kind `allOf` branches of `/manifest.schema.json` for fields, and `examples.perKind` of `/api/docs/plugin-development` for example manifests. They are written to `plugins/kinds.json` (committed, same overwrite rules) and rendered by the `:::plugin-kinds:::` block on `content/wiki/plugin-kinds.md`. The rest of that page and `content/wiki/plugin-development.md` are hand-written.

These three files are **committed** to the repo so local dev works without network access. Every `pnpm build` (local and Vercel) overwrites them before `next build`. When editing them locally, be aware the deploy will blow your changes away — fix upstream instead.

The **Plugin Bounty Board** (`/plugins/bounties`) is built from Tabularium plugin requests: `GET /api/requests?status=approved,fulfilled` is mapped onto `src/data/pluginBounties.json` (committed, same overwrite rules; `constellationIds` stays site-owned). Bounty metadata (tagline, scope, difficulty, board label…) is edited by registry admins in `/admin/requests`; fields they leave empty fall back to the last committed copy. Status is derived, never stored by hand: `shipped` when the request is fulfilled, `in-progress` while anyone has claimed it, otherwise the admin's board label (`bountyStatus()` in `src/lib/plugins/bounties.ts`, mirrored in the fetch script). In the browser the board refreshes votes and claims with one credentialed call to the registry and lets signed-in visitors upvote, claim and scaffold a repository (`src/lib/plugins/requests.ts`, `useLiveBounties`); signed-out actions go through the Tabularium sign-in and are replayed on return. A registry without request review (no `status` in the response) leaves the committed board untouched.

Tabularium rebuilds the site through a webhook with the **Static site rebuild** preset, subscribed to `request.approved|rejected|claimed|unclaimed|fulfilled` and pointed at the Vercel deploy hook (upvotes do not trigger rebuilds). Rebuilds can also be triggered from the app repo via a `repository_dispatch` event of type `app-data-updated`, handled by `.github/workflows/vercel-rebuild.yml`, which POSTs to a Vercel deploy hook (`VERCEL_DEPLOY_HOOK_URL` secret). The same workflow also rebuilds on a 6-hour cron to refresh baked-in GitHub API values (stargazers, total downloads).

## Architecture

### Content-first model

Almost every page is driven by Markdown in `content/`, loaded by a matching `src/lib/<type>.ts` module:

| Content dir                       | Loader                 | Routes                                                                                                                               |
| --------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `content/posts/`                  | `src/lib/posts.ts`     | `/blog`, `/blog/[slug]`, `/blog/page/[page]`, `/blog/tag/[tag]`                                                                      |
| `content/wiki/`                   | `src/lib/wiki.tsx`     | `/wiki`, `/wiki/[slug]`                                                                                                              |
| `content/seo/`                    | `src/lib/seoPages.ts`  | `/solutions`, `/solutions/[slug]`, `/compare`, `/compare/[slug]` (section is chosen via frontmatter `section: solutions \| compare`) |
| `content/roadmap/`                | `src/lib/roadmap.ts`   | `/roadmap`, `/roadmap/[slug]`                                                                                                        |
| `CHANGELOG.md` (fetched)          | `src/lib/changelog.ts` | `/changelog`                                                                                                                         |
| `plugins/registry.json` (fetched) | `src/lib/plugins.ts`   | `/plugins`                                                                                                                           |

Loaders all follow the same pattern: read files with `fs` at module scope, parse frontmatter with `gray-matter`, render body with the shared `marked` instance from `src/lib/markdown.ts`. This only works because `next build` runs Node — do not import these loaders into a client component.

Two exceptions to the loader pattern:

- **`content/home.md`** is parsed inline by `getHomeContent()` inside `src/app/page.tsx` (not via a `src/lib/home.ts` module). It's split by `#`/`###` headings into the hero, capabilities grid, and closing CTA — edits to `home.md` structure need to stay compatible with that parser.
- **`/videos` and `/videos/[slug]`** are **not** markdown-driven. They render from a hardcoded `VIDEO_DEMOS` array in `src/lib/videos.ts`; add/edit demos there, and remember the referenced `public/videos/...` asset must also exist.

`src/app/sitemap.ts` fans out over every loader **and** the `videos` array, and must be updated when adding a new content type or code-driven route family.

### Custom Markdown extensions

`src/lib/markdown.ts` is the **only** place `marked` should be imported from — it registers three custom fenced-block extensions that work in any Markdown content:

- `:::plugin <plugin-id>:::` → renders a plugin card using the registry (`plugins/registry.json`). Plugin id must match `registry.json`.
- `:::newsletter:::` → inserts `<div data-newsletter></div>`, hydrated on the client.
- `:::plugin-kinds:::` → expands (as Markdown, in the `preprocess` hook) to one section per plugin kind with its extension field table and example manifests, from `plugins/kinds.json` via `src/lib/plugins/kinds.ts`. Must be on its own line.
- `:::star:::` → renders a "Star on GitHub" call-to-action card (`renderStarCta`) linking to the Tabularis app repo. Must be on its own line; takes no arguments. Use sparingly — typically once near the end of a post.

Blog posts additionally support a `:::contributors:::` placeholder expanded in `getPostBySlug` in `src/lib/posts.ts`. It fires **live GitHub API calls** at build time (comparing releases and searching merged PRs between two tags) to render per-release contributor avatars. A post's frontmatter `release:` tag is required for this to resolve.

Code blocks are syntax-highlighted by `marked-highlight` + `highlight.js`. The theme is loaded globally in `src/app/layout.tsx` (`atom-one-dark`).

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). Use it consistently — mixed `@/lib/...` and `../../lib/...` imports in the same file make grep harder.

### Static output quirks

- Route groups that take params must export `generateStaticParams` — pagination pages, tag pages, wiki slugs, roadmap slugs, and both SEO sections already do this. Forgetting it silently drops the route from `out/`.
- `export const dynamic = "force-static"` is used in `src/app/sitemap.ts`; keep any similar declarative-only routes static.
- `public/search-index.json`, `public/sponsors.json`, `public/latest-posts.json`, `public/feed.xml` and `public/feed.json` are **generated** — do not hand-edit.

## Content authoring conventions

- New blog post → add a `.md` file under `content/posts/` with frontmatter: `title`, `date` (ISO, include time for same-day ordering), `tags` (array), `excerpt`, optional `release` (e.g. `"v0.9.20"`) to link to a Tabularis release and enable `:::contributors:::`, optional `og: { title, accent, claim, image }` for custom OG cards. To **force** a fully pre-made OG image (skip the generated template), add `og.cover` pointing to a ready 1200×630 image under `/public`; `blog/[slug]/opengraph-image.tsx` renders it full-bleed. Reading time is auto-estimated (200 wpm).
- Wiki page → frontmatter needs `title`, `order`, `excerpt`, `category` (one of the values in `WIKI_CATEGORIES` in `src/lib/wiki.tsx`). The page h1 is rendered from `title` by `getWikiPageBySlug`, so the body must not contain its own `# ` heading — start at `##`.
- SEO page → frontmatter needs `section: solutions \| compare` plus `title`, `order`, `excerpt`, `description`. The section determines which route ( `/solutions/...` vs `/compare/...`) the page lives under.
- Roadmap initiative → frontmatter needs `title`, `slug`, `category`, `status` (`in-progress | planned | done`), `order`, `lede`, and optionally `progressDone`/`progressTotal`/`progressLabel` and a `links:` array.
- After renaming a slug or fixing a published-but-wrong URL, add a redirect entry to the `redirects` array in `vercel.json` (`source` → `destination`, `permanent: true`).

## Contribution boundary

Feature or bug reports about the **desktop app itself** belong on [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis/issues), not this repo. This repo is for the site, its content, and the plugin registry consumer.
