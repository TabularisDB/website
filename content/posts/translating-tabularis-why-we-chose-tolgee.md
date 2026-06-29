---
title: "Translating Tabularis, the Right Way: Why We Chose Tolgee"
date: "2026-06-19T10:00:00"
authors: ["NewtTheWolf"]
tags: ["community", "i18n", "localization", "lingui", "open-source", "sponsors", "roadmap"]
excerpt: "Tabularis ships in 8 languages, but contributing a translation has meant editing raw JSON in a Git diff with no idea where the string lived. We've picked Tolgee to change that: open source, self-hostable, context-rich translating. Tolgee is also backing the project while we do it. Here's the honest why, and what's coming: community translations from the web, delivered over the air, with in-app translating as the long-term goal."
og:
  title: "Translating Tabularis,"
  accent: "the right way."
  claim: "We've chosen Tolgee for localization: open source, self-hostable, context-rich translating, plus the groundwork for community translations delivered over the air."
  image: "/img/og/translating-tabularis-tolgee.png"
  cover: "/img/og/translating-tabularis-tolgee.png"
---

# Translating Tabularis, the Right Way: Why We Chose Tolgee

Localization is invisible. Nobody opens an app and thinks "wow, great translation infrastructure." They notice the opposite: a button label cut off mid-word, a date in the wrong order, a tooltip that's still English when the rest of the menu isn't. It's unglamorous, easy-to-postpone work, and it quietly decides whether someone outside your own language ever gets past the first ten minutes with your tool.

Tabularis already ships in **8 languages**: English, Italian, Spanish, Chinese, French, German, Japanese and Russian. So this isn't a "we should really do i18n someday" post. The bones are there. Under the hood it's `i18next` today with a folder of JSON locale files, one per language — though we're partway through moving that runtime to [Lingui](https://lingui.dev), and I'll explain why below because it turns out to matter for this decision. The app shows whichever language you pick in settings, and falls back to your system language by default. That part works.

What didn't work was everything around it. So we went looking for a better way to manage translations, weighed the options, and landed on [Tolgee](https://tolgee.io/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=why-we-chose-tolgee), who, as it happens, have stepped up to back the project while we do it. To be clear about where we are: this is the outcome of an evaluation, not a finished migration. We've chosen Tolgee, but the actual switch is still ahead of us, not behind us. That backing means a lot, and I'll come back to it. But a tool is only worth writing about if it earns the place on its own, so let me walk through how we got here. It wasn't a "first result on Google" pick, and the *why* matters more than the logo.

## The problem was never the strings. It was the context.

Here's what contributing a translation looked like before. You'd clone the repo, find `src/i18n/locales/`, open a 1,200-line JSON file, and start editing values next to keys like `editor.toolbar.runSelection` and `grid.contextMenu.copyAsInsert`. No screenshots. No idea whether the string is a button (needs to be short) or a paragraph (can breathe). No way to tell whether `"Open"` is the verb on a button or the adjective in a connection-status badge.

That last one isn't a toy example. "Open" as a verb and "Open" as a status are the same four letters in English and two completely different words in German, Japanese, or Russian. A translator working from a flat JSON file gets one of them wrong, every time, because the file doesn't contain the one thing they actually need: *where does this show up?*

The result is the failure mode every localized app has: translations that are technically correct and obviously machine-shaped. Literal, not native. And the barrier to fixing it (clone, find the file, edit JSON, open a PR, wait for review) is high enough that the people most able to fix it, native speakers who *use* the app, almost never do.

We didn't want better JSON files. We wanted to delete the JSON file from the contributor's mental model entirely.

## Why Tolgee, specifically

I looked hard at the usual options before settling on anything. Here's what actually made the decision.

**It fits an open-source, privacy-first project.** Tabularis has no account, no telemetry, and stores your secrets in your OS keychain. The [whole pitch](/blog/your-database-gui-shouldnt-need-an-account) is that it's *your* tool, not a client for someone's backend. Bolting a closed, VC-funded SaaS onto the one project built around not doing that felt wrong on principle. Tolgee is open source and self-hostable. The values line up instead of quietly fighting each other, and if their pricing or direction ever changes, we own the exit. That's the same bet we ask our own users to trust.

**Context-rich translating is the real unlock.** This is the feature that closed it. With Tolgee, a translator isn't staring at keys. They see each string *with the screen it belongs to*: in-context editing while developing, and a translate UI that pairs every string with a screenshot of where it actually appears. "Open" stops being ambiguous the moment you can see it's a button in the connection panel. That's the difference between a translation and a *literal* translation, and between a contributor finishing one string and finishing a hundred.

**It isn't welded to our i18n library, which matters right now.** Here's the wrinkle: we're mid-migration from `i18next` to [Lingui](https://lingui.dev) for the app's runtime. Lingui is ICU-MessageFormat-native, with compile-time message extraction and type-safe macros — for a codebase this size it's a cleaner, safer foundation than hand-maintained i18next JSON keys, and it stops the "is this key still used?" rot before it starts. A translation platform that was bolted to one specific library would be a liability in the middle of that move. Tolgee isn't: it manages translations as ICU messages and exports to whatever format the runtime needs — `i18next` JSON today, Lingui's catalogs as we cut over. So adopting it removes friction instead of adding a third thing to migrate. And because Lingui is ICU-native, it's a *tighter* fit with how Tolgee stores strings internally than i18next ever was — the format round-trip that would otherwise worry me mostly disappears. Our 8 existing languages move over as-is. That's a big part of why the evaluation pointed here: going from 8 to "a lot more" turns into a throughput problem instead of an engineering one.

**Machine translation as a first draft, not a crutch.** Tolgee can pre-fill a new language with machine translation and translation-memory suggestions, which means a human contributor starts from 80% instead of a blank file. They review and correct, which is fast, instead of typing from scratch, which is slow. English stays the source of truth; everything else is a draft until a human who speaks the language signs off.

:::newsletter:::

## What this is *not*

In the interest of being honest the way we try to be about everything else: this doesn't make Tabularis magically fluent in 30 languages overnight, and machine translation is not "done." English remains the canonical source. New strings still start in English in the codebase, and a locale is only as good as the humans who've reviewed it. What changes is that reviewing becomes something a native speaker can do in an afternoon from a web browser, instead of a chore that requires Git, a JSON editor, and a tolerance for ambiguity.

We'd rather ship 12 languages that real speakers have actually looked at than claim 40 that a model guessed.

## The part we're really here for: community translations

There's one more reason [Tolgee](https://tolgee.io/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=why-we-chose-tolgee) won, and it's the one I'm most excited about: **community translations are on [Tolgee's public roadmap](https://tolgee.io/roadmap?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=why-we-chose-tolgee), tracked in [issue #1360](https://github.com/tolgee/tolgee-platform/issues/1360).** We're not building that ourselves. We don't need to, and frankly we couldn't do it better than a team that does localization for a living. We just want to flip it on the moment it lands.

Go read [the issue](https://github.com/tolgee/tolgee-platform/issues/1360). It describes almost exactly the workflow we want: public projects, where community members can *propose* translations, project maintainers *review and merge* them, and a dedicated "translate one string, with a big screenshot of where it lives" UI. That's the whole game. Contributors get context and a low-stakes way to help; maintainers keep a quality gate; nobody touches Git.

The idea is simple to state and has always been annoying to deliver: anyone should be able to help translate the app, and improving a translation in your own language should take minutes, not a pull request. A community-translation workflow on top of the platform we've chosen gets us there without us reinventing the wheel.

Here's how we see it rolling out:

- **First, from the web.** A hosted project where you pick your language, see what's translated and what's missing, and *propose* fixes in context, with no clone, no JSON, no Git. Maintainers review and merge. That's the workflow [#1360](https://github.com/tolgee/tolgee-platform/issues/1360) describes, and it's the part that's coming first.
- **Delivered over the air.** This is the detail that makes it click. With Tolgee's Content Delivery, an approved translation can reach you **without waiting for the next app release**. Tabularis still ships every language bundled inside the app. That's your offline, no-network fallback, and it always works. But when you're online, improvements can land on top. No account, no API key in the build. Your French gets better on a Tuesday; you don't wait for v0.14.
- **Eventually, right inside the app.** The long-run goal: you spot an awkward label while you're actually using Tabularis, fix it on the spot, and send it upstream. Community translation without ever leaving the app. We're honest that we're not there yet; doing it properly while staying offline-first and account-free is the hard part. But that's the direction, and it's why we chose Tolgee over patching JSON forever.

If you've ever wanted to see a tool you use every day speak your language properly, and been put off by the "submit a PR editing this JSON file" barrier, that barrier is on its way out. Your language is going to need you.

:::star:::

## Thanks

Which brings me back to the part I said I'd return to: **Tolgee is backing Tabularis.** Not as a logo on a sponsors page, but as real support for an independent, open-source project that's still funded out of pocket. It's the kind of backing that lets us do localization properly instead of squeezing it between bug fixes. It's one thing to build good developer tooling; it's another to put your weight behind the people building open software with it. We don't take that for granted, and the fact that they're open source themselves is exactly why it feels like a fit rather than a transaction. If you're shipping a multi-language app and still wrangling JSON by hand, go look at what they've built. It's genuinely good.

Localization will always be invisible when it's done right. The least we can do is make it easy for the people who'd notice, and that's exactly what moving to Tolgee is for.

**Want Tabularis in your language?** [Download it](https://tabularis.dev/download), switch the language in settings, and tell us what reads wrong. Issues and PRs are welcome today, and community translations are coming. [Star us on GitHub](https://github.com/TabularisDB/tabularis) to follow along, and keep an eye on the [blog](/blog). When Tolgee's community-translation feature lands, your language is going to need you.
