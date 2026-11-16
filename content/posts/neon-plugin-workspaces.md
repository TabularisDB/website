---
title: 'A Neon Plugin for Tabularis'
date: '2026-11-16T19:00:00+00:00'
authors: ['NewtTheWolf']
tags: ['plugins', 'neon', 'postgresql', 'cloud', 'preview']
excerpt: 'Neon 0.3.0 is in the registry, with branches, a Function editor, and tabs for Auth, Storage, Realtime, and AI Gateway. Available for Windows, macOS, and Linux.'
og:
    template: 'screenshot-split'
    title: 'Neon in Tabularis'
    accent: 'The plugin is here.'
    claim: 'Branches, Functions, and Neon services alongside your SQL.'
    image: '/img/posts/neon-plugin-overview.png'
---

# A Neon Plugin for Tabularis

[Neon 0.3.0](https://registry.tabularis.dev/plugins/neon) is now in the plugin registry. It adds branch management and Neon service tabs to Tabularis, alongside the SQL editor.

Connecting to a Neon database through the PostgreSQL driver still works. With this plugin, you can also pick a project and branch from your account, manage Functions, and open Auth, Storage, Realtime, or AI Gateway from the Explorer.

![Neon overview in Tabularis, showing the branch, database, and service tabs](/img/posts/neon-plugin-overview.png)

*The overview in our test workspace.*

## What's in it

The branch view lets you create a branch from a selected parent, rename it, or delete it. Opening another branch creates a separate connection, so the queries you already have open stay on their original branch.

Functions have a JavaScript and TypeScript editor with validation before deployment. You can change environment values, deploy, and send GET or POST requests to check the result. For external npm dependencies, you'll still need to bundle through the Neon CLI.

The other tabs cover user and role management in Auth, text objects in the private `assets` bucket, a Realtime SQL snapshot, and model selection with a test completion through AI Gateway. The overview shows usage and limits where Neon provides them.

## Still a preview

This is version 0.3.0, and it doesn't cover the whole Neon console. Storage currently handles UTF-8 text reads up to 1 MiB. Auth invitations and password resets aren't implemented, and Realtime is a snapshot/wait tool rather than a subscription dashboard.

One thing we ran into during testing: Neon can mark a Function deployment as completed while the endpoint still serves the previous code or environment. We sometimes saw a delay of roughly two minutes. The plugin lets you check the response separately instead of treating the deployment status as proof that the new version is running.

## Install it

You'll need **Tabularis 0.33.0 or newer** and **Node.js 22+**, with Node matching your Tabularis architecture. The plugin itself runs on Node; the Neon CLI is optional if you sign in with an API key.

Packages are available for **Windows, macOS, and Linux**, on **x64 and ARM64**. All six have passed native build, runtime, and packaged-driver tests. It also works in `tabularis web`, where Node runs on the server.

Install it from the [registry](https://registry.tabularis.dev/plugins/neon), then choose **Add Connection → Neon** and use an API key or an existing Neon CLI profile. The [README](https://github.com/TabularisDB/neon-plugin#readme) has the setup details, and the [0.3.0 release](https://github.com/TabularisDB/neon-plugin/releases/tag/v0.3.0) has the downloads and checksums.
