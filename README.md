<div align="center">
  <img src="public/img/logo.png" width="120" height="120" alt="Tabularis" />
</div>

# tabularis-website

<p align="center">
  <a href="https://tabularis.dev"><strong>tabularis.dev</strong></a> &mdash; the marketing site, wiki, blog and changelog for
  <a href="https://github.com/TabularisDB/tabularis">Tabularis</a>, the open-source desktop client for modern databases.
</p>

<p align="center">
  <a href="https://github.com/TabularisDB/website/actions/workflows/static.yml"><img src="https://github.com/TabularisDB/website/actions/workflows/static.yml/badge.svg" alt="Deploy website to Pages" /></a>
  <a href="https://discord.gg/YrZPHAwMSG"><img src="https://img.shields.io/discord/1470772941296894128?color=5865F2&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

## About

This repository hosts the source of [tabularis.dev](https://tabularis.dev). It is a [Next.js](https://nextjs.org) static-export site deployed to GitHub Pages on every push to `main`.

Content served here:

- **Home, solutions and comparison pages** &mdash; positioning content for Tabularis as a PostgreSQL/MySQL/SQLite client.
- **Wiki** &mdash; product documentation (connections, editor, notebooks, plugins, MCP, etc.).
- **Blog** &mdash; release notes and long-form posts rendered from Markdown in `content/posts/`.
- **Changelog** &mdash; generated from the upstream `CHANGELOG.md` of the main app repo.
- **Download page** &mdash; always points at the latest Tabularis release, driven by the upstream app version.
- **Plugin registry** &mdash; rendered from `plugins/registry.json`, the same registry consumed by the desktop app.

The site is statically generated (`next build` with `output: "export"`) so it can be hosted on GitHub Pages without a runtime server.

## Relation to the main app repo

The main app lives at [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis). This website used to live inside that repo under `website/` as part of a pnpm workspace and was released in lockstep with the app.

It is now a **standalone repo**. Three pieces of data still come from the app repo &mdash; they are fetched over HTTPS from `raw.githubusercontent.com` before each build:

| Upstream file | Where it lands | Consumed by |
| --- | --- | --- |
| `src/version.ts` | `src/lib/version.ts` | `APP_VERSION` used in download links, SEO metadata, JSON-LD |
| `CHANGELOG.md` | `CHANGELOG.md` | `/changelog` page (`src/lib/changelog.ts`) |
| `plugins/registry.json` | `plugins/registry.json` | `/plugins` page (`src/lib/plugins.ts`) |

The fetcher is `scripts/fetch-app-data.mjs`. It hits `https://raw.githubusercontent.com/${TABULARIS_APP_REPO}/${TABULARIS_APP_REF}/...` and writes the files into place. Defaults: `TABULARIS_APP_REPO=TabularisDB/tabularis`, `TABULARIS_APP_REF=main`.

Run it manually:

```bash
pnpm fetch-app-data
```

In CI the step runs before `pnpm build` &mdash; see [`.github/workflows/static.yml`](./.github/workflows/static.yml).

The three fetched files are committed to the repo so local development works without network access; CI overwrites them with the latest upstream versions.

### Triggering rebuilds from the app repo

The deploy workflow accepts a `repository_dispatch` event of type `app-data-updated`. After tagging a new release or updating the plugin registry in the app repo, dispatch it from a GitHub Action:

```yaml
- name: Trigger website rebuild
  run: |
    gh api repos/TabularisDB/website/dispatches \
      -f event_type=app-data-updated
  env:
    GH_TOKEN: ${{ secrets.WEBSITE_DISPATCH_PAT }}
```

(`WEBSITE_DISPATCH_PAT` must be a PAT with `repo` scope on this repo.)

## Development

### Prerequisites

- Node.js 20+
- pnpm (pinned via `packageManager` in `package.json`)

### Install

```bash
pnpm install
```

### Run the dev server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Refresh app data (version, changelog, plugin registry)

```bash
pnpm fetch-app-data
```

### Build the static site

```bash
pnpm build
```

The build:

1. Generates the Orama search index into `public/search-index.json` (`scripts/generate-search-index.mjs`).
2. Runs `next build` with `output: "export"` &mdash; the static site is emitted to `out/`.
3. Generates `public/latest-posts.json` for the widget on the home page (`scripts/generate-latest-posts.mjs`).

The output in `out/` is what GitHub Pages serves.

## Project layout

```
.
├── content/                  # Markdown sources
│   ├── home.md
│   ├── posts/                # blog posts
│   ├── seo/                  # landing-page copy
│   └── wiki/                 # wiki articles
├── plugins/
│   └── registry.json         # fetched from app repo
├── public/                   # static assets (images, videos, robots.txt)
├── scripts/
│   ├── fetch-app-data.mjs    # pulls version/changelog/registry from app repo
│   ├── generate-search-index.mjs
│   └── generate-latest-posts.mjs
├── src/
│   ├── app/                  # Next.js App Router routes
│   ├── components/           # React components
│   └── lib/                  # data loaders and helpers (version, changelog, plugins, seo, ...)
├── CHANGELOG.md              # fetched from app repo
└── next.config.ts
```

## Contributing

Typos, broken links, new wiki articles and new blog posts are all welcome.

- **Content**: edit Markdown under `content/` and open a PR.
- **UI or components**: keep in mind the site must statically export &mdash; avoid runtime-only Next.js features (`getServerSideProps`, API routes, on-demand ISR, etc.).
- **Feature or bug reports about the app itself**: please open them on [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis/issues) instead.

Join the conversation on [Discord](https://discord.gg/YrZPHAwMSG).


## Acknowledgements

Special thanks to [@Nako0](https://github.com/Nako0) for creating the demo videos featured on the [Tabularis website](https://tabularis.dev).

## License

Apache License 2.0 &mdash; same as the main [Tabularis](https://github.com/TabularisDB/tabularis) project.
