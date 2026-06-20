# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The source of [tabularis.dev](https://tabularis.dev) — the marketing site, wiki, blog, changelog and plugin registry for [Tabularis](https://github.com/TabularisDB/tabularis), an open-source desktop database client. It is a Next.js App Router project that **must build as a static export** (`output: "export"` in `next.config.ts`). It is deployed to Vercel on every push to `main`; the Vercel build command (see `vercel.json`) runs `pnpm fetch-app-data && pnpm build`.

Hard constraint: no runtime-only Next.js features (`getServerSideProps`, API routes, on-demand ISR, middleware, runtime image optimization). Images are `unoptimized: true`. Any new route must be fully expressible at build time.

## Commands

Package manager is pinned: **pnpm 10.33.0** (see `packageManager` in `package.json`). Node 20+.

| Task | Command |
| --- | --- |
| Install | `pnpm install` |
| Dev server (http://localhost:3000) | `pnpm dev` |
| Full static build into `out/` | `pnpm build` |
| Refresh upstream app data | `pnpm fetch-app-data` |

There is **no lint or test command**. `eslint.config.mjs` explicitly ignores `**/*`; do not try to add lint runs to "verify" a change.

`pnpm build` runs four steps in order, all of which must succeed:

1. `scripts/generate-search-index.mjs` → `public/search-index.json` (Orama index built from wiki + posts + SEO + plugin registry).
2. `scripts/generate-sponsors.mjs` → `public/sponsors.json` (re-emits `src/lib/sponsors.ts` as JSON).
3. `next build` → emits the site to `out/`.
4. `scripts/generate-latest-posts.mjs` → `public/latest-posts.json` (top-5 posts for the home widget). Runs **after** `next build` because it writes into the build output.

Redirects (e.g. after renaming a slug) are configured in `vercel.json` under the `redirects` array, which Vercel serves as real HTTP 308/301 redirects.

## Upstream app data

Three pieces of data are fetched from `TabularisDB/tabularis` at build time by `scripts/fetch-app-data.mjs` (defaults: `TABULARIS_APP_REPO=TabularisDB/tabularis`, `TABULARIS_APP_REF=main`):

| Upstream | Local file | Consumer |
| --- | --- | --- |
| `src/version.ts` | `src/lib/version.ts` (re-emitted as a single `APP_VERSION` export) | download links, SEO metadata, JSON-LD |
| `CHANGELOG.md` | `CHANGELOG.md` | `/changelog` page via `src/lib/changelog.ts` |
| `plugins/registry.json` | `plugins/registry.json` | `/plugins` page via `src/lib/plugins.ts`, and the `:::plugin <id>:::` markdown extension |

These three files are **committed** to the repo so local dev works without network access. The Vercel build overwrites them before `next build` (via the `fetch-app-data` step in the build command). When editing them locally, be aware the deploy will blow your changes away — fix upstream instead.

Rebuilds can be triggered from the app repo via a `repository_dispatch` event of type `app-data-updated`, handled by `.github/workflows/vercel-rebuild.yml`, which POSTs to a Vercel deploy hook (`VERCEL_DEPLOY_HOOK_URL` secret). The same workflow also rebuilds on a 6-hour cron to refresh baked-in GitHub API values (stargazers, total downloads).

## Architecture

### Content-first model

Almost every page is driven by Markdown in `content/`, loaded by a matching `src/lib/<type>.ts` module:

| Content dir | Loader | Routes |
| --- | --- | --- |
| `content/posts/` | `src/lib/posts.ts` | `/blog`, `/blog/[slug]`, `/blog/page/[page]`, `/blog/tag/[tag]` |
| `content/wiki/` | `src/lib/wiki.tsx` | `/wiki`, `/wiki/[slug]` |
| `content/seo/` | `src/lib/seoPages.ts` | `/solutions`, `/solutions/[slug]`, `/compare`, `/compare/[slug]` (section is chosen via frontmatter `section: solutions \| compare`) |
| `content/roadmap/` | `src/lib/roadmap.ts` | `/roadmap`, `/roadmap/[slug]` |
| `CHANGELOG.md` (fetched) | `src/lib/changelog.ts` | `/changelog` |
| `plugins/registry.json` (fetched) | `src/lib/plugins.ts` | `/plugins` |

Loaders all follow the same pattern: read files with `fs` at module scope, parse frontmatter with `gray-matter`, render body with the shared `marked` instance from `src/lib/markdown.ts`. This only works because `next build` runs Node — do not import these loaders into a client component.

Two exceptions to the loader pattern:

- **`content/home.md`** is parsed inline by `getHomeContent()` inside `src/app/page.tsx` (not via a `src/lib/home.ts` module). It's split by `#`/`###` headings into the hero, capabilities grid, and closing CTA — edits to `home.md` structure need to stay compatible with that parser.
- **`/videos` and `/videos/[slug]`** are **not** markdown-driven. They render from a hardcoded `VIDEO_DEMOS` array in `src/lib/videos.ts`; add/edit demos there, and remember the referenced `public/videos/...` asset must also exist.

`src/app/sitemap.ts` fans out over every loader **and** the `videos` array, and must be updated when adding a new content type or code-driven route family.

### Custom Markdown extensions

`src/lib/markdown.ts` is the **only** place `marked` should be imported from — it registers three custom fenced-block extensions that work in any Markdown content:

- `:::plugin <plugin-id>:::` → renders a plugin card using the registry (`plugins/registry.json`). Plugin id must match `registry.json`.
- `:::newsletter:::` → inserts `<div data-newsletter></div>`, hydrated on the client.
- `:::star:::` → renders a "Star on GitHub" call-to-action card (`renderStarCta`) linking to the Tabularis app repo. Must be on its own line; takes no arguments. Use sparingly — typically once near the end of a post.

Blog posts additionally support a `:::contributors:::` placeholder expanded in `getPostBySlug` in `src/lib/posts.ts`. It fires **live GitHub API calls** at build time (comparing releases and searching merged PRs between two tags) to render per-release contributor avatars. A post's frontmatter `release:` tag is required for this to resolve.

Code blocks are syntax-highlighted by `marked-highlight` + `highlight.js`. The theme is loaded globally in `src/app/layout.tsx` (`atom-one-dark`).

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). Use it consistently — mixed `@/lib/...` and `../../lib/...` imports in the same file make grep harder.

### Static output quirks

- Route groups that take params must export `generateStaticParams` — pagination pages, tag pages, wiki slugs, roadmap slugs, and both SEO sections already do this. Forgetting it silently drops the route from `out/`.
- `export const dynamic = "force-static"` is used in `src/app/sitemap.ts`; keep any similar declarative-only routes static.
- `public/search-index.json`, `public/sponsors.json`, and `public/latest-posts.json` are **generated** — do not hand-edit.

## Content authoring conventions

- New blog post → add a `.md` file under `content/posts/` with frontmatter: `title`, `date` (ISO, include time for same-day ordering), `tags` (array), `excerpt`, optional `release` (e.g. `"v0.9.20"`) to link to a Tabularis release and enable `:::contributors:::`, optional `og: { title, accent, claim, image }` for custom OG cards. To **force** a fully pre-made OG image (skip the generated template), add `og.cover` pointing to a ready 1200×630 image under `/public`; `blog/[slug]/opengraph-image.tsx` renders it full-bleed. Reading time is auto-estimated (200 wpm).
- Wiki page → frontmatter needs `title`, `order`, `excerpt`, `category` (one of the values in `WIKI_CATEGORIES` in `src/lib/wiki.tsx`).
- SEO page → frontmatter needs `section: solutions \| compare` plus `title`, `order`, `excerpt`, `description`. The section determines which route ( `/solutions/...` vs `/compare/...`) the page lives under.
- Roadmap initiative → frontmatter needs `title`, `slug`, `category`, `status` (`in-progress | planned | done`), `order`, `lede`, and optionally `progressDone`/`progressTotal`/`progressLabel` and a `links:` array.
- After renaming a slug or fixing a published-but-wrong URL, add a redirect entry to the `redirects` array in `vercel.json` (`source` → `destination`, `permanent: true`).

## Contribution boundary

Feature or bug reports about the **desktop app itself** belong on [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis/issues), not this repo. This repo is for the site, its content, and the plugin registry consumer.
