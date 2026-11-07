---
title: "Tabularis × Zeny: Fewer Bots, More Possibilities for Our Discord"
date: "2026-11-07T12:00:00+01:00"
authors: ["lejyfps", "NewtTheWolf"]
tags: ["community", "partnership", "discord", "security"]
excerpt: "We're partnering with Zeny to bring our Discord's bot features into one place, with room to do more. Why fewer bots help us manage access, what Zeny offers, and how to keep a server safer."
og:
  title: "Tabularis × Zeny"
  accent: "Fewer bots. More possibilities."
  image: "/img/logos/sponsors/zeny.svg"
  frameless: true
---

# Tabularis × Zeny: Fewer Bots, More Possibilities for Our Discord

**Tabularis is partnering with [Zeny](https://zeny.gg/), an all-in-one Discord bot.** The appeal is straightforward: Zeny can cover the jobs we would otherwise spread across separate bots, and gives us room to do more for the community from one dashboard.

Our [Discord](https://discord.com/invite/K2hmhfHRSt) is where people ask for help, discuss plugins, report problems and share what they're building with Tabularis. Running that space takes work beyond answering questions: onboarding, roles, moderation, support requests and keeping people informed. Adding a new bot for each task is easy. Keeping track of every bot's access, settings and operator gets harder with each addition.

This partnership is an opportunity to bring those jobs together. It's also a good reason to talk about the trust we give bots when we invite them into a server.

*This article builds on a security guide written by lejy, Zeny's developer, with the partnership perspective and editorial contributions from Dominik Spitzli of Tabularis. We're discussing a partner's product here; the permission advice applies to Zeny too.*

## What Zeny brings to the community

Zeny combines everyday server management with features we can grow into. Its [feature overview](https://zeny.gg/) includes:

- **Moderation and safety:** AutoMod, anti-raid, anti-bot measures, verification, global bans and audit logs.
- **Support:** ticket panels with transcripts and a modmail inbox, giving members a clear place to ask for help.
- **Onboarding and roles:** welcome messages, onboarding, autoroles and reaction roles.
- **Updates:** social feeds, including YouTube, Bluesky, X and RSS, plus scheduled posts and reminders.
- **Community features:** suggestions, giveaways, levels, a starboard, birthdays and temporary voice channels.
- **Automation:** autoresponders, server backups and custom commands and automations written in sandboxed Lua, with events, storage and HTTP requests.

That last part matters for a developer community. We can start with the built-in tools and explore custom workflows when we have a concrete need, rather than adding another service for every small automation.

Our aim is to replace the separate bots we need for these jobs with Zeny, then enable additional features where they help the community. This is a direction for our Discord, not a claim that every module is already configured or that every specialist bot on every server has a replacement. We'll check the workflows and permissions as we bring them across.

Zeny is free to use, and **the free limits are very generous**. For a typical small to medium-sized community, the free plan comfortably covers everyday server management and leaves plenty of room to grow. You can bring moderation, support, roles and community updates together without needing a paid plan from day one.

Premium is optional when you need additional features or higher limits. Server backups, for example, are a Premium feature. Check [Zeny’s current plans](https://zeny.gg/premium) for the features and limits that fit your community.

## Why fewer bots are worth caring about

Every bot is another account with access to your server, backed by code and infrastructure someone operates. Each one adds a developer or team to trust, a token to protect, a dashboard to secure and a set of permissions to review. An abandoned bot keeps its access until you remove it.

Consolidating overlapping jobs means fewer independently operated accounts hold those permissions. It also gives moderators fewer dashboards to learn and makes it easier to understand which tool handles a task. Removing an old bot after migration closes an access path; simply leaving it idle does not.

The same principle applies to infrastructure servers: every extra service, integration or credential is something to maintain and secure. A Discord bot is an external integration with authority inside your community. Treat that authority as deliberately as you would a service account on your own systems.

There is a trade-off. A single bot that handles many jobs becomes a bigger dependency. An outage affects more workflows, and a compromise can expose every permission it holds. **Fewer bots make access easier to manage; they do not automatically make a server secure.** Consolidation works best alongside narrow permissions, protected moderator accounts and a recovery plan.

## What clicking “Authorize” actually grants

A bot is a Discord account controlled by code. Its authority depends on both its permissions and its position in the role hierarchy.

**Permissions** control actions such as deleting messages, managing channels or assigning roles. Every bot gets a managed role, and channel overrides can further limit access. **Role hierarchy** limits which members and roles it can manage: a bot cannot kick or ban members whose highest role is equal to or above its own, or manage roles at or above its highest role.

**Administrator** grants all permissions and bypasses channel permission overrides. It does **not** bypass those role hierarchy restrictions. A bot with Administrator still has broad power to damage a server, including deleting channels or creating webhooks. Discord documents the distinction in its [permissions reference](https://docs.discord.com/developers/topics/permissions).

> Zeny's current invite link also requests Administrator. You can deselect it and grant the individual permissions required by the features you enable. That still needs careful setup: give the bot access to the channels and roles it must manage, then test those workflows. Administrator does not fix a bot role placed too low.

A music bot or a bot that only posts updates should not need broad administrative access. Review each permission against the job you actually want it to do, including when that bot is Zeny.

## How access gets abused

You do not need an exotic exploit to lose control of a community. These are practical failure modes to plan for:

**A moderator account is taken over.** Fake login pages, “free Nitro” links and QR-code verification scams can put an attacker behind a trusted account. That may also give them access to bot dashboards.

**A bot token leaks.** A token is a credential for the bot account. Publishing one in a repository, support chat or screenshot can let someone act as that bot, within its permissions, across the servers it belongs to.

**A bot is abandoned, sold or compromised.** The access you granted does not expire when its developer stops maintaining it or ownership changes. This is one reason to periodically review every installed bot.

**A raid overwhelms moderation.** A wave of accounts can flood channels without taking over any privileged account. Verification, AutoMod and anti-raid tools help address a different problem from stolen credentials; you need to consider both.

## A practical checklist for server owners

1. **Protect moderator accounts.** Enable two-factor authentication and Discord's requirement for 2FA on moderator actions. Keep Administrator and Manage Server limited to the people who need them.
2. **Review every bot's permissions and role position.** Keep bot roles below moderator roles unless a specific workflow requires otherwise, and above the member roles they must manage. Check private-channel access too.
3. **Remove bots you no longer use.** When migrating a workflow, test the replacement, then remove the previous bot and review any webhooks or integrations left behind.
4. **Check who operates the bot.** Look for active maintenance, a privacy policy and an explanation of stored data. Zeny publishes its [privacy policy](https://zeny.gg/privacy) and [service status](https://zeny.gg/status).
5. **Use Discord's own safety controls.** Choose a [verification level](https://support.discord.com/hc/en-us/articles/216679607-Verification-Levels) suited to your community and configure built-in AutoMod alongside any bot features you use.
6. **Review audit logs and webhooks.** Investigate unexpected role changes, new integrations or channel changes. Anyone holding a webhook URL may be able to post through it; remove unused webhooks.
7. **Prepare for recovery.** Keep backups of server structure where your tools support them, understand what they can restore, and agree who can lock the server down during a raid. A structural backup is not a copy of every message.

## If you build bots yourself

Bot developers hold credentials that affect other people's communities. Store tokens in environment variables or a secret manager and keep them out of logs, screenshots and source control. If a token leaks, reset it immediately in Discord's Developer Portal; deleting the commit does not revoke the credential.

Request only the permissions and privileged intents your features use. For dashboard actions and commands, verify on the server side that the requesting user has authority in that server. The bot's own permissions are not proof that a user is allowed to tell it what to do.

Apply the same care to the database: use credentials with limited rights, restrict network access and keep moderation records and member data out of public logs. Validate input and rate-limit public endpoints. These are ordinary service security practices, with a community on the other end of the failure.

## Building the community with Zeny

For Tabularis, the partnership means a way to simplify the tools behind our Discord while opening up more possibilities for support, onboarding and automation. We want to spend more time helping people use and build Tabularis, and less time coordinating bots that overlap.

**Thank you to lejy and Zeny for partnering with Tabularis, and for contributing the security guide behind this post.** You can explore [Zeny](https://zeny.gg/), read its [documentation](https://zeny.gg/docs), or join the [Tabularis Discord](https://discord.com/invite/K2hmhfHRSt) to help shape what our community needs next.

**Affiliate link:** If you’d like to try Zeny through our partnership, use the [Tabularis affiliate link](https://zeny.gg/aff/tabularis).
