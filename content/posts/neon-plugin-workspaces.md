---
title: 'Neon in Tabularis: SQL, Branches, and Service Workspaces'
date: '2026-11-16T19:00:00+00:00'
authors: ['NewtTheWolf']
tags: ['plugins', 'neon', 'postgresql', 'cloud', 'preview']
excerpt: 'The Neon plugin brings account setup, database branches, and service workspaces into Tabularis. Version 0.3.0 ships native packages for Windows, macOS, and Linux on x64 and ARM64.'
og:
    template: 'screenshot-split'
    title: 'Neon in Tabularis'
    accent: 'Beyond the SQL tab.'
    claim: 'Postgres, branches, and service workspaces in one client. Available as a preview plugin.'
    image: '/img/posts/neon-plugin-overview.png'
---

# Neon in Tabularis: SQL, Branches, and Service Workspaces

The [Neon plugin](https://registry.tabularis.dev/plugins/neon) is now available as **version 0.3.0**, with native packages for Windows, macOS, and Linux, each on x64 and ARM64.

You could already connect to Neon through Tabularis's PostgreSQL driver. That remains a good choice when you only need SQL. The new plugin adds the account and branch context around that database, with dedicated tabs for Neon services alongside your queries.

**This is a preview.** It requires **Tabularis 0.33.0 or a newer compatible build** and **Node.js 22+** on the machine running Tabularis. Node's architecture must match your Tabularis build. Installing the plugin does not bundle Node or enable services in your Neon project.

![Neon overview in Tabularis, with service workspaces in the Explorer and the selected branch's database details](/img/posts/neon-plugin-overview.png)

*A capture from our integration-test workspace. The account notice and service states reflect that test setup; availability depends on your Neon project.*

## Connect an account, then choose a database

Choose **Add Connection → Neon**. You can link an existing Neon CLI profile (8.15.1 or a newer 8.x release) or use a Neon account API key, then select your organization, project, branch, database, and role.

The plugin discovers the services already enabled for that project. Creating Storage or AI Gateway credentials is a separate opt-in. Account keys and database passwords are kept in the host's secret store and are not returned to the plugin UI.

Once imported, the database is a normal SQL connection: you can browse schemas, write queries, inspect results, and use the existing PostgreSQL tools. Disconnecting the local Neon account does not delete anything in Neon, and the imported SQL connection remains independently usable.

## Give each branch its own workspace

The branch selector keeps the active Neon branch visible in the Explorer. Open another branch and it gets a separate connection; existing SQL tabs stay attached to their original connection.

The **Branches** workspace can list branches, create one from an explicit parent, rename it, and confirm deletion. Branch changes refresh the other open views of the same project. Protections and confirmation checks still apply: switching a selector is not permission to delete a branch.

## Service tabs next to your queries

The Explorer opens each service in its own tab:

- **Auth** lets you search and inspect users, create a user, change a user/admin role, and confirm deletion. Invitations, password resets, and session revocation are not included in this preview.
- **Storage** browses the private `assets` bucket with paginated listings and text-object controls. Reads are limited to 1 MiB of UTF-8 text; writes and deletes require confirmation. It is not a general file uploader or multi-bucket browser.
- **Functions** provides a JavaScript/TypeScript editor, compilation checks, deployment controls, environment updates, logs when available, and explicit GET/POST test requests. The editor supports Node built-in imports; bundle external npm dependencies with the Neon CLI.
- **Realtime** can take a bounded live SQL snapshot or wait for a matching value. It is not a general subscription dashboard.
- **AI Gateway** lists enabled models and can send a small test completion. Requests use your project's provider access and can incur provider charges.

The overview also shows scoped usage and limits when the Neon API supplies them. Missing information is shown as unavailable rather than estimated.

### A completed deployment still needs a runtime check

During live testing, Neon sometimes reported a Function deployment as active before requests began executing the new code and environment. In the scope we tested, propagation could take roughly two minutes.

The plugin therefore keeps deployment acceptance separate from runtime verification. Use an explicit safe test request and a nonsecret response marker to check the revision you expect. It does not automatically invoke an arbitrary handler just to see whether a deployment has finished.

## A plugin, with shared host support

The Neon implementation lives in its [own repository](https://github.com/TabularisDB/neon-plugin). Tabularis 0.33.0 supplies the reusable provider-workspace support: account setup, connection-scoped tabs, and sandboxed plugin UI. The same integration also runs in `tabularis web`; Node and CLI authentication run on the server hosting it.

Each release archive includes a native Function compiler for its target. All six packages passed native runtime tests and an extracted-package smoke test that exercises the driver and JavaScript/TypeScript compilation. The Linux CI also tests the packaged UI inside the real Core sandbox.

## Try the preview

Update Tabularis, install Node.js 22+ with the matching architecture, and get the plugin from the [Neon registry page](https://registry.tabularis.dev/plugins/neon). The [0.3.0 release](https://github.com/TabularisDB/neon-plugin/releases/tag/v0.3.0) contains the six ZIPs and their checksums; the [README](https://github.com/TabularisDB/neon-plugin#readme) covers installation and the current service limits.

Start with a disposable branch when trying management actions. If something breaks, [report it in the plugin repository](https://github.com/TabularisDB/neon-plugin/issues) with the plugin version, operating system, and steps to reproduce. Leave account keys and connection credentials out of the report.
