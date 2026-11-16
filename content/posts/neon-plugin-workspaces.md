---
title: 'Neon 0.4 in Tabularis'
date: '2026-11-16T19:00:00+00:00'
authors: ['NewtTheWolf']
tags: ['plugins', 'neon', 'postgresql', 'cloud', 'preview']
excerpt: 'Neon 0.4 adds binary file uploads and downloads, Auth organization invitations, administrator password resets, and live SQL subscriptions to Tabularis.'
og:
    template: 'screenshot-split'
    title: 'Neon in Tabularis'
    accent: 'Version 0.4'
    claim: 'Files, Auth administration, and live queries alongside your SQL.'
    image: '/img/posts/neon-plugin-overview.png'
---

# Neon 0.4 in Tabularis

The [Neon plugin](https://registry.tabularis.dev/plugins/neon) puts your database branches, Functions, and Neon services in the Tabularis Explorer. Version **0.4.0** adds file transfers, Auth invitations and password resets, and live query results.

![Neon overview in Tabularis, showing the branch, database, and service tabs](/img/posts/neon-plugin-overview.png)

*The overview in our test workspace.*

## Files in Storage

You can upload binary or text files, choose a bucket and destination key, and download the original object. Uploads use multipart transfers and support files up to Neon's 10 GiB limit, with progress and cancellation.

The text editor still has a 1 MiB preview limit. Larger files go through the file download instead of being loaded into the editor.

## Auth invitations and password resets

The Auth view can list, create, and cancel invitations for your application's Auth organizations. A user's detail page also lets an Auth administrator set a new password.

These actions use an application Auth login, separate from your Neon Console API key. Invitation emails follow your project's Auth settings; creating the invitation doesn't mean an email has been sent.

## Live queries

Start a live query and the results update as the database changes. You can stop the subscription when you're done. The existing snapshot and wait-for-value options are there too.

Branches open as separate connections, so moving to another branch leaves your existing SQL tabs where they were. Functions have a JavaScript/TypeScript editor, validation, deployment controls, environment updates, and test requests. Auth users, AI Gateway, and usage information have their own views in the Explorer.

Neon sometimes took roughly two minutes to serve updated Function code in our tests, even after reporting the deployment as completed. The plugin lets you test the response separately.

## Install it

You'll need **Tabularis 0.33.0 or newer** and **Node.js 22+**, with Node matching your Tabularis architecture. The plugin runs on Node; the Neon CLI is optional when using an API key.

Packages are available for **Windows, macOS, and Linux**, on **x64 and ARM64**. It also works in `tabularis web`, with Node running on the server.

Install it from the [registry](https://registry.tabularis.dev/plugins/neon), then choose **Add Connection → Neon**. The [README](https://github.com/TabularisDB/neon-plugin#readme) covers setup and permissions, and [GitHub Releases](https://github.com/TabularisDB/neon-plugin/releases) has the packages and checksums.
