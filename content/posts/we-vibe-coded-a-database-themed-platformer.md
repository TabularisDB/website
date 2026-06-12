---
title: "We Vibe-Coded a Database-Themed Platformer"
date: "2026-06-12T10:00:00"
tags: ["fable", "game", "experiment", "community", "open-source"]
excerpt: "We gave Fable 5 a single day and accidentally shipped a browser platformer themed entirely around Tabularis — three database worlds, boss mascots, hidden plugins. It's free, it's open source, and we're not game developers. If you are, let's build new worlds together."
og:
  title: "We Vibe-Coded a"
  accent: "Database-Themed Platformer."
  claim: "One day with Fable 5 and a tiny browser platformer fell out — three database worlds, boss mascots, hidden plugins. Free, open source, and looking for level designers."
  image: "/img/og/tabularis-run.png"
  cover: "/img/og/tabularis-run.png"
---

# We Vibe-Coded a Database-Themed Platformer

<p style="text-align:center;margin:1.5rem 0 2rem;"><img class="no-lightbox" src="/img/posts/tabularis-run-demo.gif" alt="Tabularis Run — a Super Mario-style browser platformer themed around Tabularis" style="width:100%;max-width:800px;height:auto;display:block;margin:0 auto;border-radius:8px;" /></p>

We gave **Fable 5** a single day after it dropped and accidentally shipped a video game.

It's called **Tabularis Run** — a tiny Super Mario-style platformer that runs in your browser, themed entirely around Tabularis. No download, no account, no catch. It's free, it's open source, and the whole point is to have a bit of fun — and maybe put Tabularis in front of a few people who'd never have clicked on a database client otherwise.

👉 **[Play it right now → game.tabularis.dev](https://game.tabularis.dev?utm_source=blog)**

## How it plays

Run, jump, climb network cables and fire SQL "queries" across **three worlds** — SQLite, MySQL and PostgreSQL — each one ending in a boss fight against that database's mascot: a hummingbird, a dolphin, and an elephant.

- **12 levels**, including a vertical *WAL ascent* climb
- **27 hidden plugins** to collect, plus power-ups — an MCP gun, an Index shield, a Vertical Scaling RAM stick
- **SQL flavor everywhere**: `COMMIT;` is the flag at the end of a level, `ROLLBACK` is what happens when you die, `BEGIN;` marks your checkpoints
- **4 playable characters**: TAB, PRIMARY KEY, CURSOR and TRIGGER
- Plays on **desktop** (keyboard or gamepad) and **mobile** (touch controls)

Every pixel is procedural — the sprite art is drawn from character grids, the music is WebAudio chiptune, there are zero external assets and zero runtime dependencies. It's just vanilla JavaScript and a `<canvas>`. Beat it and you can share a generated score card straight to your socials.

:::star:::

## Full disclosure: we're not game developers

Let's be honest about how this got made, because it matters.

We're not game designers. We're not really game developers either. A good chunk of **Tabularis Run is straight-up vibe-coded** — we described what we wanted, Fable 5 wrote a lot of it, and we steered. The physics are tuned by feel, the level design is whatever felt fun at 1am, and an actual professional would probably wince at some of the choices.

And that's kind of the point. It's the same thing we keep writing about on this blog — [we handed Fable 5 a real task on the Tabularis codebase and it opened an 1,800-line PR in 30 minutes](/blog/fable-5-opened-a-1800-line-pr-in-30-minutes). A whole game in a day is just the playful version of the same shift: the gap between "we have an idea" and "it's live on the internet" is collapsing.

## Want to build a world?

Here's where you come in.

The game is **fully open source**, and we'd genuinely love for people who know what they're doing to jump in. Tweak the physics, fix our questionable level design, add enemies, or — the fun one — let's design **entirely new worlds together**. The engine already supports three; there's no reason it has to stop there. New database mascots, new mechanics, new bosses: it's all on the table.

👉 **[Game source on GitHub → github.com/TabularisDB/game](https://github.com/TabularisDB/game)**

The codebase is small and approachable on purpose: levels are authored in a little grid DSL, sprites are character grids, and there's a test suite that validates every level is actually beatable. PRs are very welcome, and if you want to riff on an idea first, the Discord is the place.

## Why a game, though?

Because Tabularis grows when people hear about it — and a game travels in places a database client never will. Someone shares a high score, a friend asks "wait, what's Tabularis?", and the curve nudges upward.

So if you enjoy it, the single best thing you can do is **share it** — a clip, a screenshot, your best run. Have fun with it. That's the whole brief.

And if you came here for the actual database client: [Tabularis](https://tabularis.dev?utm_source=blog) is a free, open-source database client for the AI era — one fast, native app for SQLite, MySQL, PostgreSQL and many more. The game is just a love letter to it.

:::newsletter:::

---

_The Tabularis Team_
