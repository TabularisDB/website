---
title: "Your Database GUI Shouldn't Need an Account"
date: "2026-06-03T15:34:00"
tags: ["opinion", "local-first", "security", "privacy", "open-source"]
excerpt: "A database client is the most credential-dense application on a developer's machine. Routing any part of it through a vendor account inverts the trust model — and you usually find out why that matters on the day the vendor pivots."
og:
  title: "Your Database GUI"
  accent: "Shouldn't Need an Account."
  claim: "The tool that holds your production credentials should not require an email address to show you a query editor."
  image: "/img/tabularis-secure-connection-keychain.png"
---

# Your Database GUI Shouldn't Need an Account

You download a SQL client because you need to look at a table. You open it, and the first screen is a signup form. The tool that is about to hold your production credentials wants an email address before it will show you a query editor.

This has somehow become normal, and I think it's worth saying plainly: it shouldn't be.

A database client is the most credential-dense application on a developer's machine. It holds connection strings to production, SSH keys, tunnel configs, sometimes the only working path into a customer's VPC. Editors hold code, which is usually in a repo anyway. Browsers hold sessions you can revoke. A database client holds the keys to the data itself. Of all the tools on your machine, it is the one with the strongest case for never talking to anyone but you and your database.

The trend is going the other way. Accounts, cloud workspaces, query history synced to someone else's backend, AI features that route your schema through the vendor's proxy so usage can be metered.

None of this happens because vendors are malicious. It happens because of how these tools are funded. A VC-backed dev tool needs monthly active users, and you can't count users you can't see, so you add an account. Collaboration features need a backend, so queries move to the cloud. AI is the monetization story, so it goes through the vendor's keys instead of yours. Each decision is individually reasonable. The sum is a desktop app whose useful life is coupled to the runway of the company behind it.

And you find out what that coupling costs on the day the company changes course. Arctype was a genuinely good client. It got acquired, and the product was sunset — along with the workspaces where people's queries lived. That's not an edge case. That's the expected lifecycle of an account-based tool: the account is the leash, and eventually somebody pulls it.

:::newsletter:::

Tabularis is built on the opposite bet, so let me be concrete about what "local-first" actually means here, because the term gets thrown around a lot:

**No account.** There is no signup, no license activation, no "continue with Google". You download a binary and connect to a database. That's the whole onboarding.

<video src="/videos/overview.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

**Secrets live in your OS keychain, not in our anything.** Passwords, SSH passphrases, API keys — they go into macOS Keychain, Windows Credential Manager, or libsecret on Linux, under the service name `tabularis`. You can inspect every entry with `security find-generic-password` or `secret-tool` and verify it yourself. If you'd rather a password never persist at all, untick one checkbox and it lives in process memory for the session and dies with it. The details are in the [security docs](/wiki/security-credentials).

**Everything non-secret is a plain file.** Connection profiles, SSH configs, preferences, saved queries: JSON on your disk, in a directory you can grep, diff, back up, and put in your dotfiles. The [AI audit log](/wiki/ai-audit-log) is one JSON line per query, locally. There is no export feature because there is nothing to export from — you already have the files.

**AI is bring-your-own-key, and optional.** If you turn the assistant on, your key goes in the keychain and calls go directly to the provider you chose. Point it at Ollama and nothing leaves your machine at all. We never see your schema, your queries, or your prompts, because there is no "we" in the request path.


:::star:::

In the interest of honesty, here is the complete list of network calls Tabularis makes on its own: the updater checks GitHub releases for a new version. That's it. No telemetry SDK, no crash reporter phoning home, no anonymous usage pings. You can confirm this the boring way — [the code is open](https://github.com/TabularisDB/tabularis), grep it.

This costs us real things, and I'd rather name them than pretend otherwise. We don't have sync, so your connections don't follow you between machines unless you copy the config files yourself. We don't have shared team workspaces. And because there is no telemetry, I genuinely don't know how many people use Tabularis or which features they touch — I find out when someone opens an issue, which makes every bug report worth more and every silent user invisible. Those are the terms of the trade, and I think they're good terms, but they are a trade.

The deeper reason I think this matters goes beyond privacy. A database client is plumbing. Plumbing should be boring, durable, and indifferent to the fortunes of whoever installed it. When your queries are files and your secrets are in the OS keychain, switching away from Tabularis costs you nothing — and that's exactly the point. A tool you can leave at any moment has to earn its place every day. A tool that holds your account, your history, and your team's saved queries only has to be too annoying to migrate from.

I know which kind of pressure produces better software.

"Sign in to continue" was a fine default for a SaaS dashboard. For the tool holding your production credentials, it never was one.
