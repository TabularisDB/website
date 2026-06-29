---
title: "Where Tabularis Keeps Its Secrets: Thank You, 1Password"
date: "2026-06-29T10:00:00"
authors: ["NewtTheWolf"]
tags: ["security", "devops", "ci", "github-actions", "secrets", "open-source"]
excerpt: "An open-source project accumulates secrets like signing keys, certificates and deploy tokens, and they end up pasted across GitHub repo settings with no real story for rotation or audit. 1Password gives open-source projects a free plan, we qualified for it, and it's good enough to deserve a genuine thank-you. Here's why 1Password is a great secret manager for developers, and how we plan to move Tabularis' CI secrets into one vault and pull them into GitHub Actions with op:// references."
og:
  title: "Where Tabularis keeps"
  accent: "its secrets."
  claim: "Thanks to 1Password's free open-source plan. Next: keep our CI secrets in one vault, pulled into GitHub Actions with op:// references instead of pasted into repos."
  image: "/img/og/managing-tabularis-secrets-1password.png"
  cover: "/img/og/managing-tabularis-secrets-1password.png"
---

# Where Tabularis Keeps Its Secrets: Thank You, 1Password

Secrets are invisible right up until they leak. Nobody opens a project and admires how tidily its signing keys are stored; they only ever notice the opposite: a token committed by accident, a certificate that expired over the weekend, a "who even has access to this?" message in a thread at 2am. It's unglamorous, easy-to-postpone work, and like localization it quietly decides how much you trust the thing you shipped.

Tabularis is open source and funded out of pocket, which means the boring infrastructure is all ours to get right. And the part we'd been putting off was the most boring of all: where the project keeps its secrets.

## The mess we'd been living with

A desktop app that ships real builds accumulates real secrets. For Tabularis that's a Tauri updater signing key, an Apple Developer certificate plus notarization credentials, a Windows code-signing setup, an npm token, a Vercel deploy hook, a handful of GitHub tokens. None of it is exotic. All of it is sensitive, and all of it has to be reachable from CI to cut a release.

The default way you end up doing this is: paste each value into **Settings → Secrets** on GitHub, one repo at a time, and move on. It works, and that's exactly the problem. It works just well enough that you never fix it. The values live in a place you can't read back. Rotating one means remembering every repo and workflow that uses it. There's no audit trail worth the name, "access" is whoever has admin on the repo, and the canonical copy of a signing key ends up being a text file in a downloads folder, because that's the only place you can actually still read it.

We didn't want a tidier spreadsheet of secrets. We wanted the pasted-into-GitHub copies to stop being the source of truth at all.

## 1Password, and being honest about what this is

Here's the part we want to be upfront about. **1Password runs a [free plan for open-source projects](https://github.com/1Password/1password-teams-open-source?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you), we applied like anyone can, and we qualified.** That's the whole story: we asked, and they gave Tabularis the paid product for free. We'd rather say it plainly than dress it up.

**And 1Password asks for nothing in return.** They require no blog post, no homepage logo, no "sponsored by" badge, nothing at all. The credit we give them, here and on our site, is entirely our choice and not a deliverable anyone asked for. We're doing it for one reason: the product is genuinely good, the program is a genuinely generous thing to offer maintainers who are footing the bill themselves, and more of them should know it exists. Credit where it's due, freely given.

And 1Password really is the good kind of tool. It's been the quiet standard for a long time because it gets the fundamentals right: strong, audited cryptography; your data encrypted with a key only you hold; a UX polished enough that using it is *easier* than not using it, which is the only property that actually makes a security tool get used. For a maintainer it turns "where's that key" from a small recurring panic into a non-event. That alone would have been worth the thank-you.

It's quietly fixed the un-glamorous day-to-day, too. A project is more than a codebase: there are the social accounts we post from, a domain registrar, analytics logins, the npm org. Those used to live in the worst possible place: a couple of reused passwords and a notes file. Now they're in a shared vault. The X, Bluesky and Mastodon accounts get handed off securely instead of pasted into a DM; weak and reused passwords are gone; and where a service supports it we're on passkeys and 1Password-generated one-time codes instead of an SMS or a PIN someone could guess. It's the kind of upgrade you only notice the first time you *don't* have to ask "wait, what's the login for the Mastodon account again?"

But the reason it changed how we work is the developer side.

1Password is genuinely built for developers. You can integrate it across a whole workflow: managing SSH keys and signing Git commits, authenticating CLIs with biometrics instead of pasted tokens, and securing secrets throughout your projects. Several of those have already earned a place in how we build Tabularis, and one more is next on the list. Here's the one every developer should steal first.

:::newsletter:::

## 1Password as a secret manager for GitHub

This is the part every developer should know about, however you came to 1Password.

1Password isn't just a vault you copy values out of. It's a secret manager you can wire directly into your pipeline. The model is delightfully blunt: instead of storing a secret's *value* in GitHub, you store a **reference** to where it lives in 1Password, written as a `op://vault/item/field` URL. The real value never touches your repo settings.

You create a [1Password service account](https://developer.1password.com/docs/service-accounts/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you) scoped to a single CI vault, and the *one* secret you put into GitHub is its token. Everything else becomes a [secret reference](https://developer.1password.com/docs/cli/secret-references/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you) that the [`load-secrets-action`](https://github.com/1Password/load-secrets-action?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you) resolves at runtime:

```yaml
- name: Load secrets from 1Password
  uses: 1password/load-secrets-action@v2
  with:
    export-env: true
  env:
    OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
    TAURI_SIGNING_PRIVATE_KEY: op://CI/Tauri/key
    APPLE_CERTIFICATE: op://CI/Apple/cert
    NPM_TOKEN: op://CI/npm/token
    VERCEL_DEPLOY_HOOK: op://CI/Vercel/hook
```

Read that workflow and the whole pitch is right there. The only literal secret in GitHub is `OP_SERVICE_ACCOUNT_TOKEN`. Every other line is just an address. The values live in 1Password, get fetched into the job, and are masked in the logs, and when the job ends, they're gone.

What that buys you, concretely:

- **One source of truth.** The vault is canonical. GitHub holds an address book, not a key ring.
- **Rotation is a single edit.** Change the value in 1Password once; every workflow that references it picks up the new one on its next run. No hunting through repo settings.
- **Real access control and audit.** Who can see a secret is vault membership, not repo-admin-by-accident, and 1Password actually logs it.
- **The same secrets work locally.** With the [1Password CLI](https://developer.1password.com/docs/cli/secret-references/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you) you reference the exact same `op://` items from a dev machine, via `op run -- pnpm release`, so the credentials you test a release with are literally the ones CI uses. No drift, nothing copied to disk.

It's the same idea that makes Tabularis itself worth using: keep the sensitive thing in one trustworthy place, and reference it everywhere else instead of making copies. (Tabularis stores *your* database credentials in the OS keychain for exactly that reason: [no account, no copies on a server](/blog/your-database-gui-shouldnt-need-an-account).) Seeing 1Password apply the same principle to CI is what sold us.

## The part that already works today: SSH

The CI migration is still ahead of us, but there's one 1Password feature that already pays off inside Tabularis right now, with zero setup on our side: the [SSH agent](https://developer.1password.com/docs/ssh/agent/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you).

1Password can hold your SSH keys and act as your system's SSH agent, so the private key never sits unencrypted on disk and every single use is an explicit, approved action. What that means for connecting to a database over SSH in Tabularis is the nicest kind of surprise: it just works out of the box. Pick an SSH connection, leave the key-file field empty, hit connect, and the 1Password window pops up. You approve with Touch ID (or however you've set it), and you're connected. No key file to hunt down, no passphrase to paste, no agent to wire up by hand.

We didn't build an integration for this, and that's the whole point. Tabularis talks to the system SSH agent like any well-behaved SSH client, and 1Password registers itself as that agent. The two meet in the middle, and the result is that the most secure option is also the least effort. That's exactly the principle we care about: the safe path should be the easy one.

And we'd like to do more of it. The SSH agent is just the first place 1Password and Tabularis happen to meet, and we want to build proper, first-class integration on top: pulling connection credentials straight from your vault, for one, so a database password never has to be pasted into Tabularis at all. One thing we want to be completely clear about: any of this will be strictly opt-in. Tabularis works fully without 1Password and always will. If you don't use it, nothing changes and nothing nags you, and the OS keychain stays the default. This is an extra door for the people who want it, never a requirement for the people who don't.

## What we plan to do with it

Here's the plan, and to be clear it is still a plan: we haven't moved a single CI secret across yet. The intent is to take Tabularis' release and deploy secrets out of scattered GitHub repo settings, put them in a dedicated 1Password CI vault, and wire `load-secrets-action` into the workflows so every job resolves what it needs from `op://` references. The end state is the one in the diagram above: a single service-account token in GitHub, everything else an address.

We're deliberately not rushing it. The signing keys are the careful part, and moving them is something we'd rather do once, slowly, than twice. So treat this as a direction we've committed to and a use of the free plan we intend to make, not a migration we've finished. The everyday accounts are already in 1Password; the CI pipeline is the next step.

:::star:::

## Thanks

So, plainly: **thank you, 1Password.** For backing open source with a free plan that lets independent maintainers manage secrets the way larger teams do, and for building a product good enough that adopting it felt like an upgrade rather than a chore. Doing that quietly, for projects you have no commercial relationship with, is a generous thing, and it's worth saying so out loud.

If you maintain something open source and you're still pasting tokens into repo settings one at a time, go look at [their open-source program](https://github.com/1Password/1password-teams-open-source?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you) and at [using 1Password in GitHub Actions](https://developer.1password.com/docs/ci-cd/github-actions/?utm_source=tabularis.dev&utm_medium=blog&utm_campaign=1password-thank-you). It's the rare bit of security work that makes your life easier the same day you set it up.

Secrets should be invisible when they're handled right. The least we can do is keep them somewhere we'd trust with our own, and then tell you where that is. [Star Tabularis on GitHub](https://github.com/TabularisDB/tabularis) to follow along, and keep an eye on the [blog](/blog).
