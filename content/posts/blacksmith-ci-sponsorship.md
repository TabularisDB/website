---
title: "Tabularis CI, Now Powered by Blacksmith"
date: "2026-10-29T22:10:00+01:00"
tags: ["community", "sponsors", "partnership", "open-source", "ci"]
excerpt: "Blacksmith is sponsoring Tabularis by powering our CI. Here is why fast runners matter for a cross-platform desktop app, and what changes for contributors."
og:
  cover: "/img/posts/blacksmith-ci-sponsorship.png"
---

# Tabularis CI, Now Powered by Blacksmith

<p style="text-align:center;margin:1.5rem 0 2rem;"><img class="no-lightbox" src="/img/posts/blacksmith-ci-sponsorship.png" alt="Tabularis CI, now powered by Blacksmith" style="width:100%;max-width:1000px;height:auto;display:block;margin:0 auto;" /></p>

**[Blacksmith](https://www.blacksmith.sh) is now sponsoring Tabularis by powering our CI.** The GitHub Actions workflows that build, test and check every pull request are moving to Blacksmith runners.

If you have never thought about CI for a desktop database client, here is the short version: it is a lot of compute. And every minute it takes is a minute a contributor spends waiting to find out whether their change is good.

## What our CI actually does

Tabularis is a Tauri app with a Rust backend and a React frontend, shipped for macOS, Windows and Linux. A single pull request can trigger:

- **Rust and TypeScript checks**: formatting, linting, type checks, the test suite and a full frontend build.
- **Browser end-to-end tests** with Playwright across Chromium, Firefox and WebKit.
- **Integration tests against real databases**: dedicated PostgreSQL and MySQL workflows spin up real servers and run the drivers against them, because a database client that is only tested against mocks is not tested.
- **Design and accessibility checks** on the UI.
- **Cross-platform builds**: release and nightly builds compile the full app for macOS (Apple Silicon and Intel), Windows and Linux, plus Docker images and Linux packages.

Rust compile times are not famous for being short. Multiply them by a platform matrix, add database containers and a frontend build, and CI quickly becomes the slowest part of the contribution loop.

## Why Blacksmith

Blacksmith is a drop-in replacement for GitHub-hosted runners. Jobs run on bare-metal machines with CPUs picked for high single-core performance, which is exactly what a Rust build wants. Dependency caches sit next to the runners instead of across the internet, and Docker layers are cached between runs, so repeated work is not repeated.

The part we like most is how little has to change. Moving a job is one line in the workflow file:

```yaml
jobs:
  check:
    # before: runs-on: ubuntu-latest
    runs-on: blacksmith-4vcpu-ubuntu-2404
```

The steps, actions and secrets stay exactly as they are. That matters for an open-source project: anyone reading our workflows still sees plain GitHub Actions, and a fork can keep running them on standard runners if it wants to.

Blacksmith also gives us a console to look at CI as a whole, with searchable logs across runs and a view of which jobs are slow or flaky. That is useful when a test fails once in twenty runs and nobody can reproduce it locally.

## What changes for contributors

Nothing in how you contribute. You open a pull request, the checks run, and the results show up on GitHub as they always have. The goal is simply that they show up sooner, so reviews and fixes can happen while the change is still fresh in your head.

If you have been holding off on a contribution, the [repository is open](https://github.com/TabularisDB/tabularis) and the [contributing guide](https://github.com/TabularisDB/tabularis/blob/main/CONTRIBUTING.md) explains how to get a development build running.

## Thank you, Blacksmith

Thank you to the Blacksmith team for supporting Tabularis. Fast, reliable CI is one of those things nobody notices until it is missing, and having it taken care of lets us spend our time on the client itself.

And thank you to everyone sending pull requests, plugins, translations and bug reports. You are the reason the CI is busy in the first place.

You can find Blacksmith alongside the other organizations helping the project on our [sponsors page](/sponsors). If you run your own GitHub Actions workflows, Blacksmith includes 3,000 free minutes every month to try it out.

:::star:::

---

_The Tabularis Team_
