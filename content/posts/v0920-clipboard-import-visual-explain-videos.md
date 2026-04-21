---
title: "v0.9.20: Clipboard Import, Visual EXPLAIN Import, and a Community Look & Feel"
date: "2026-04-21T12:00:00"
release: "v0.9.20"
tags: ["release", "import", "explain", "website", "community", "themes"]
excerpt: "v0.9.20 is a community-shaped release: clipboard data import lands in the app, Visual EXPLAIN gains import support for existing plans, every built-in theme gets a readability pass, and the website goes from static screenshots to dynamic video demos across the hero, wiki, and feature pages."
og:
  title: "v0.9.20:"
  accent: "Clipboard Import, Visual EXPLAIN Import, Videos Everywhere."
  claim: "A community-shaped release: paste-to-import in the app, plan import for Visual EXPLAIN, a readability pass across every theme, and dynamic video demos across the website."
  image: "/img/overview.png"
---

# v0.9.20: Clipboard Import, Visual EXPLAIN Import, and a Community Look & Feel

**v0.9.20** owes a lot to the community. The two headline app features, **clipboard data import** and **plan import for Visual EXPLAIN**, ship alongside two outside contributions that change how Tabularis feels to use: a readability pass across every built-in theme, and a full visual overhaul of the website with video demos instead of screenshots.

If v0.9.19 was about polish, v0.9.20 is about reach. Getting data into Tabularis, understanding query plans inside it, and figuring out what Tabularis actually is before you install it are all easier in this release.

---

## A New Look & Feel for the Website

The most visible change in v0.9.20 is not inside the app. It's on [tabularis.dev](https://tabularis.dev) itself, and it comes from [@Nako0](https://github.com/Nako0) in PR [#142](https://github.com/TabularisDB/tabularis/pull/142).

Screenshots are fine for static features, but a database client is about motion: you type in the editor, results appear, tabs get flipped, plans get expanded. A still image can't really carry any of that, and the old site didn't try to.

Here's what changed:

- The **hero section** now auto-plays a short overview video instead of a static screenshot, so the first thing you see is the app actually running.
- The **wiki** gained **11 embedded video demos**: first connection, SQL editor, Visual Query Builder, SQL Notebook, Visual EXPLAIN, data grid, split view, plugins, AI assistant, keyboard shortcuts, and more. Each one has an auto-generated poster frame so the page still reads well before the video loads.
- A reusable `VideoPlayer` client component with loading states, an error overlay with a retry button, multi-event readiness detection (`canplay`, `playing`, `loadeddata`, `timeupdate`), and `prefers-reduced-motion` support for visitors who don't want autoplay.
- A server-side `wrapVideosInHtml` helper so wiki, blog, and SEO markdown authors can drop a plain `<video>` tag into content and get the same player for free.
- The GitHub README now opens with an `overview.gif` instead of a static PNG, so people coming in from search or social see the product in motion before they reach the site.

The site used to be a page of screenshots. It's a page of demos now, and that's entirely Nako's work.

Here's the overview video itself, the one that sits at the top of the home page. It's a good sample of the care that went into the rest:

<video src="/videos/overview.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

Nako's own project, [devglobe.xyz](https://devglobe.xyz), is a genius idea and worth a detour. It's a live 3D globe of developers coding around the world in real time: you can see who is writing what, in which language, from which city, right now. A small Language Server plugin sends a heartbeat every 30 seconds while you're active, sharing only the language, a city-level location, and the editor name. There's a [Zed extension](https://github.com/CaadriFR/zed-devglobe) already, and more editors in the works. It's the kind of thing that sounds obvious in hindsight and somehow nobody had built yet.

:::newsletter:::

---

## Readability Across Every Theme

[@thomaswasle](https://github.com/thomaswasle)'s PR [#139](https://github.com/TabularisDB/tabularis/pull/139) is a readability pass across **every built-in theme**, not just the default.

Tabularis ships with a range of themes (Dracula, light, dark, high-contrast, and more), and each one had picked up small contrast issues over time. Thomas went through all of them and normalized the spots where text, borders, or highlighted rows were harder to read than they should be. v0.9.18 did this for Dracula on its own; v0.9.20 brings the rest up to the same bar.

Easy to miss if you stick to one theme. Very noticeable if you switch around, or if you've been quietly putting up with low contrast in one of the less-used ones.

---

## Clipboard Import — Paste Data Directly Into a Table

Sometimes the shortest path from a spreadsheet to a database is a copy and a paste.

v0.9.20 adds a **Clipboard Import** flow: copy tabular data from a spreadsheet, a CSV preview, a rendered Markdown table, or another SQL client, and paste it straight into Tabularis. The app detects the structure, proposes a target table and column mapping, and lets you review the rows before they're inserted.

It pairs well with the existing CSV and SQL dump imports. When you only have a handful of rows and no file on disk, opening a dialog just to save a throwaway `.csv` is friction. Clipboard import skips that step.

The wiki has the full walkthrough, and the website's **Features** section now has a dedicated entry on when clipboard import is the right choice versus a file-based import.

---

## Import Existing Plans Into Visual EXPLAIN

[Visual EXPLAIN](/blog/v0917-visual-explain) gains **import support** in v0.9.20: EXPLAIN output captured elsewhere (a plan pasted from a colleague, a snippet from a GitHub issue, an export from another client) opens straight into the viewer without re-running the query.

Makes it much easier to share a plan and reason about it together, instead of treating Visual EXPLAIN as a purely local tool.

---

## Comparison Pages and Other Website Work

v0.9.20 also ships the first batch of **comparison pages**: side-by-side pages showing where Tabularis lines up with (and differs from) other database clients. They use a shared comparison-builder component, proper logos (now in PNG for crisper rendering), and styling consistent with the rest of the site.

Alongside them:

- The website now reads the app version from a single `APP_VERSION` source of truth, so release-tied strings stay in sync automatically.
- The sitemap is referenced from `robots.txt`, which helps the new comparison pages get indexed faster.
- A new long-form post, [*Databases Are Not Becoming Chatbots*](/blog/databases-are-not-becoming-chatbots), ships alongside the release.

---

## Under the Hood

Two smaller changes worth calling out:

- **React hook deps and tooltip wrapper fix.** A rare case where memoized settings definitions could end up with stale state in a few tooltip-wrapped controls. Memoization and callbacks are stable now, state no longer drifts.
- **CLI parsing extracted into its own module.** The Tauri entry point in the Rust backend used to carry its argument-parsing logic inline. Pure refactor, no behavior change, but it makes future CLI flags (and their tests) a lot easier to add.

---

## A Community Release

Worth naming plainly what this release is: of the six headline changes, **three came from outside contributors**. That ratio is new for Tabularis, and it's a good sign.

To **[@Nako0](https://github.com/Nako0)** for turning the site from screenshots into demos: thank you, seriously. Tabularis looks like a different product now. And go check out [devglobe.xyz](https://devglobe.xyz) while you're at it.

To **[@thomaswasle](https://github.com/thomaswasle)** for quietly pushing the themes towards being uniformly readable: the app is more comfortable to spend a day in because of your work.

:::contributors:::

---

_v0.9.20 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.9.20)._
