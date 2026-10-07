<br />
<p align="center">
  <img src=".github/assets/banner-light.png#gh-light-mode-only" alt="tabularis.dev" width="100%">
  <img src=".github/assets/banner-dark.png#gh-dark-mode-only" alt="tabularis.dev" width="100%">
</p>

# Tabularis website

This repository powers [tabularis.dev](https://tabularis.dev), the official website of [Tabularis](https://github.com/TabularisDB/tabularis). It covers the product pages, docs, blog, changelog, downloads and plugin registry. The site is a static [Next.js](https://nextjs.org) export, deployed to Vercel on every push to `main`.

<p align="center">
  <b><a href="https://tabularis.dev">Website</a></b> ·
  <b><a href="https://tabularis.dev/wiki">Docs</a></b> ·
  <b><a href="https://tabularis.dev/blog">Blog</a></b> ·
  <b><a href="https://github.com/TabularisDB/tabularis">App repo</a></b>
</p>

<br />

<p align="center">
  <a href="https://discord.com/invite/K2hmhfHRSt"><img src="https://img.shields.io/discord/1502944695808950282?color=5865F2&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

<p align="center">
  <a href="https://vercel.com/open-source-program"><img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge-2026.svg" /></a>
</p>

<br />

## Table of Contents

- [What's on the site](#whats-on-the-site)
- [Data from the app repo](#data-from-the-app-repo)
    - [Rebuilds](#rebuilds)
- [Development](#development)
- [Project layout](#project-layout)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## What's on the site

- **Home, solutions and comparison pages:** positioning content for Tabularis, with landing-page copy in `content/seo/`.
- **Wiki:** product documentation (connections, editor, notebooks, plugins, MCP, ...) from `content/wiki/`.
- **Blog:** release notes and long-form posts from `content/posts/`, with RSS and JSON feeds.
- **Changelog:** generated from the app's `CHANGELOG.md`.
- **Download:** stable and nightly builds, always pointing at the latest release.
- **Plugins:** the plugin registry and the [bounty board](https://tabularis.dev/plugins/bounties).
- **Roadmap, demos and sponsors** pages.

Every page also gets an Open Graph image, rendered at build time (`src/lib/og/`). The site is exported with `output: "export"`, so it runs on any static host without a server.

## Data from the app repo

The site lives apart from the app, but part of its content comes from [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis), the [Tabularium registry](https://registry.tabularis.dev) and the GitHub API. `scripts/fetch-app-data.mjs` pulls it before each build:

| Source                                                     | Lands in                             | Used by                                       |
| ---------------------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| `src/version.ts`                                           | `src/lib/download/version.ts`        | `APP_VERSION` in download links, SEO, JSON-LD |
| `CHANGELOG.md`                                             | `CHANGELOG.md`                       | `/changelog`                                  |
| `plugins/registry.json` + Tabularium API (Tabularium wins) | `plugins/registry.json`              | `/plugins` and the search index               |
| Plugin manifest schemas                                    | `public/schemas/`                    | `$schema` URLs in plugin manifests            |
| Tabularium plugin development docs                         | `content/wiki/plugin-development.md` | Wiki                                          |
| Latest `nightly-*` GitHub release                          | `src/lib/download/nightly.ts`        | Stable/nightly selector on `/download`        |
| Repo stars and total downloads                             | `src/lib/github/stats.ts`            | Stats shown on the site                       |

The fetched files are committed, so local development works offline. If the registry or the GitHub stats are unavailable, the build keeps the committed copy instead of failing.

| Variable                  | Default                                 |
| ------------------------- | --------------------------------------- |
| `TABULARIS_APP_REPO`      | `TabularisDB/tabularis`                 |
| `TABULARIS_APP_REF`       | `main`                                  |
| `TABULARIUM_REGISTRY_URL` | `https://registry.tabularis.dev`        |
| `GITHUB_TOKEN`            | Optional, raises GitHub API rate limits |

### Rebuilds

[`.github/workflows/vercel-rebuild.yml`](./.github/workflows/vercel-rebuild.yml) calls a Vercel deploy hook (secret `VERCEL_DEPLOY_HOOK_URL`):

- every 6 hours, to refresh stars, downloads and registry data;
- manually, from the Actions tab;
- on a `repository_dispatch` of type `app-data-updated`, sent by the app repo when the version, changelog or plugin registry changes:

```yaml
- name: Trigger website rebuild
  run: |
      gh api repos/TabularisDB/website/dispatches \
        -f event_type=app-data-updated
  env:
      GH_TOKEN: ${{ secrets.WEBSITE_DISPATCH_PAT }}
```

`WEBSITE_DISPATCH_PAT` must be a PAT with `repo` scope on this repo.

## Development

Requires Node.js 20+ and pnpm (pinned via `packageManager` in `package.json`).

**Setup**

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

**Refresh app data**

```bash
pnpm fetch-app-data
```

**Build**

```bash
pnpm build
```

The build runs, in order:

1. `fetch-app-data.mjs`: app data (see [above](#data-from-the-app-repo)).
2. `generate-search-index.mjs`: Orama search index, `public/search-index.json`.
3. `generate-sponsors.mjs`: `public/sponsors.json`.
4. `generate-latest-posts.mjs`: `public/latest-posts.json`.
5. `generate-feed.mjs`: `public/feed.xml` and `public/feed.json`.
6. `next build`: the static site, emitted to `out/`.

**Lint**

```bash
pnpm lint
```

## Project layout

```
.
├── content/                  # Markdown sources
│   ├── posts/                # blog posts
│   ├── roadmap/              # roadmap initiatives
│   ├── seo/                  # landing-page copy
│   └── wiki/                 # wiki articles
├── plugins/
│   └── registry.json         # fetched, see "Data from the app repo"
├── public/                   # static assets (images, videos, schemas, robots.txt)
├── scripts/                  # fetch and build-time generators
├── src/
│   ├── app/                  # Next.js App Router routes, including og/ images
│   ├── components/           # layout, pages and ui components
│   ├── lib/                  # data loaders and helpers (blog, wiki, plugins, og, seo, ...)
│   └── styles/
├── CHANGELOG.md              # fetched from the app repo
├── next.config.ts
└── vercel.json               # build command and redirects
```

## Contributing

Typos, broken links, new wiki articles and new blog posts are all welcome, see [CONTRIBUTING.md](./CONTRIBUTING.md).

- **Content:** edit the Markdown under `content/` and open a PR.
- **UI or components:** the site must export statically, so avoid runtime-only Next.js features (`getServerSideProps`, API routes, on-demand ISR, ...).
- **Bugs or features in the app itself:** open them on [`TabularisDB/tabularis`](https://github.com/TabularisDB/tabularis/issues) instead.

> [!TIP]
> **Discord:** [Join our Discord server](https://discord.com/invite/K2hmhfHRSt) to talk with the maintainers and the community.

## Acknowledgements

Special thanks to:

- [@wajrock](https://github.com/wajrock) for designing and building [tabularis.dev](https://tabularis.dev)
- [@Nako0](https://github.com/Nako0) for creating the demo videos featured on the site

## License

[Apache License 2.0](./LICENSE), same as the main [Tabularis](https://github.com/TabularisDB/tabularis) project.
