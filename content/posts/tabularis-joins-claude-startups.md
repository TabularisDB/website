---
title: "Tabularis Joins Claude Startups"
date: "2026-10-08T09:53:00"
tags: ["community", "claude", "ai", "open-source"]
excerpt: "Tabularis is now part of Claude Startups, Anthropic's program for early-stage companies. Here's what the program includes and what it changes for a small open-source database client."
og:
  title: "Tabularis joins Claude Startups —"
  accent: "Build with us. Code with Claude."
  claim: "Anthropic's startup program, and what it gives a small open-source project built in public."
  image: "/img/og/claude-startups.png"
  cover: "/img/og/claude-startups.png"
---

# Tabularis Joins Claude Startups

Some news I'm genuinely happy to share: **Tabularis is now part of [Claude Startups](https://claude.com/programs/startups)**, Anthropic's program for early-stage companies building with Claude.

If you've followed this blog for a while, this probably won't come as news. Claude is already part of how Tabularis gets built, from the [AI assistant](/blog/ai-assistant) inside the app to the [MCP server](/blog/v099-mcp-multi-client) to experiments like [the one where Fable 5 opened an 1,800-line PR in 30 minutes](/blog/fable-5-opened-a-1800-line-pr-in-30-minutes). Joining the program makes that relationship official and gives a small project like ours resources that are hard to get otherwise.

![We're in: Tabularis joins the Claude for Startups program](/img/posts/tabularis-joins-claude-startups.png)

## What Claude Startups is

Claude Startups is Anthropic's program for young companies. It's open to startups **founded in the last 5 years or funded in the last 2**, and you don't need venture funding: bootstrapped and pre-seed teams are welcome too. You apply from the Claude Console with a company email and a short description of what you're building. Most applications are decided within minutes, and the rest go through a manual review that usually takes a couple of business days.

Here's what the program includes:

- **One year of Claude Team, free:** up to **five Premium seats** for organizations new to the Team plan.
- **$1,000 in Claude API credits:** valid for six months on the first-party Claude API via the Claude Console.
- **Higher API rate limits:** applied automatically to members who receive program credits.
- **The Claude Startup Stack:** partner offers worth up to **$45K** from third-party companies (ClickHouse Cloud credits, ElevenLabs, Granola, Hex, Gamma, Firecrawl and more), redeemed directly from the Console.
- **Office hours with Anthropic's Applied AI team:** 45-minute live sessions every other week.
- **Events:** Founder House, Founder Days, Builder Days, hackathons, community meetups and online AMAs.
- **More credits through partner VCs:** founders backed by a VC in Anthropic's partner network can get up to **$100K** in additional API credits.

The full details, eligibility rules and FAQ are on the [official program page](https://claude.com/programs/startups).

## Why it matters for Tabularis

Tabularis is open source, and for most of its life it has been built by one person plus a growing group of contributors. No company budget, no AI line item. Every agent experiment, every long refactor, every "let's see if Claude can untangle this" session came out of my own pocket.

The program changes a few practical things:

- **More room to experiment.** API credits and higher rate limits mean we can push harder on AI-assisted workflows: automated PR reviews, longer agentic runs on the codebase, and testing the in-app AI features against real models without counting every token.
- **Better AI features in the app.** The AI assistant, the MCP server and the [AI safety and approval layer](/blog/v0100-ai-safety-audit-approval) all get better when we can iterate on them quickly. Office hours with the Applied AI team are a great way to sanity-check design choices with people who know the models best.
- **Useful tools beyond Claude.** A few Startup Stack offers are a natural fit for a database client. ClickHouse Cloud credits, for example, make it much easier to keep a real test environment around for the [ClickHouse driver](/blog/v096-redis-clickhouse-filters).
- **A shared workspace for the core team.** Claude Team gives the people working on Tabularis day to day a common place to share projects, context and long-running conversations about the codebase.

## What's next

Joining Claude Startups doesn't change what Tabularis is: an open-source, cross-platform database client, built in public, with a plugin system anyone can extend. It does give us more fuel to build it faster and to try more ambitious ideas, and I'll keep sharing those experiments here on the blog, including what works and what doesn't.

If you've never contributed to Tabularis before, there's never been a better time to start. Pick an issue labelled `good first issue` on [GitHub](https://github.com/TabularisDB/tabularis/issues), improve a translation, write a plugin, or fix that small thing in the UI that has been bugging you.

A big thank you to Anthropic for the support, and to everyone who has opened an issue, sent a PR, written a plugin or simply told a friend about Tabularis. See you on [Discord](https://discord.com/invite/K2hmhfHRSt).

One last thing: if you join the [Discord](https://discord.com/invite/K2hmhfHRSt) this week, there's a little surprise waiting for you. We can't spoil it here. 😉

:::newsletter:::

:::star:::
