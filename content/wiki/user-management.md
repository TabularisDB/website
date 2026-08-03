---
title: "Users & Privileges"
order: 6.8
excerpt: "List server accounts, create and drop users, change passwords, and edit grants scope by scope on MySQL and MariaDB."
category: "Database Objects"
---

# Users & Privileges

Since v0.18.0 Tabularis can administer server accounts, not just read the schema they have access to. The **Users & Privileges** tab lists the accounts on the server, creates and drops them, changes passwords, and edits grants scope by scope.

<video src="/videos/posts/tabularis-user-management-grant.mp4" poster="/videos/posts/tabularis-user-management-grant.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

The tab is available on any connection whose driver declares the `user_management` capability — today **MySQL** and **MariaDB** among the built-in drivers. PostgreSQL support is planned as a follow-up. Plugin drivers can opt in through `capabilities.userManagement`: all seven trait methods are forwarded over JSON-RPC, and the privilege catalog comes from the driver rather than being hard-coded for MySQL.

## Opening the Tab

Open it from the Explorer sidebar of the active connection. It opens as a regular editor tab, so it sits alongside your console, table and notebook tabs and can be reordered and closed like any of them. Opening it a second time focuses the existing tab instead of adding another.

## The Account List

The list shows every account the server reports, with a **Locked** badge for locked accounts, and a filter box for large servers.

If your account cannot read `mysql.user`, the list does not fail or come up empty — it falls back to `CURRENT_USER`, so you still see and can manage your own grants.

## Creating, Dropping, and Changing Passwords

| Action | Notes |
| :--- | :--- |
| **New user** | Username, host and password. You can grant an initial set of privileges in the same step: pick a database (optionally a table), or leave the scope empty to grant globally. |
| **Change password** | Sets a new password for the selected account. |
| **Drop user** | Asks for confirmation first, naming the exact account — this cannot be undone. |

## The Privilege Editor

Selecting an account shows one card per scope, built from the parsed output of `SHOW GRANTS`:

- **Global** — `*.*`
- **Database** — `database.*`
- **Table** — `database.table`

Each card holds checkboxes for the privileges valid at that scope; the set of privileges offered comes from the driver's catalog. Checking a box grants, unchecking revokes, and **Add database / table** adds a card for a scope the account does not have grants on yet. Press **Apply** to submit a card's changes; revoking asks for confirmation, naming the privileges, the account and the scope.

The editor revokes before granting, so narrowing an account from `ALL PRIVILEGES` down to a subset does the right thing rather than leaving the broad grant in place.

## What the Editor Does Not Model

Some grants cannot be represented as scope-plus-checkbox: roles, column-level privileges, and proxy grants. Rather than hide them, the tab keeps the raw `SHOW GRANTS` output for the selected account and shows it under **Current grants**. The checkbox UI therefore never implies a privilege set it isn't actually representing — if something looks missing from the cards, it will be visible in the raw output.

## Safety

- Every privilege is validated against a per-scope allow-list before it reaches a `GRANT` or `REVOKE` statement.
- Account names, hosts and passwords are embedded as escaped string literals — account-management statements cannot use bind parameters — with escaping that follows the server's `sql_mode` (including `NO_BACKSLASH_ESCAPES`).
- The SQL builders and the grant parser are unit-tested independently of a live server.

## Related

- [Connection Management](/wiki/connections) — connection profiles, credentials and keychain storage
- [Security & Credentials](/wiki/security-credentials) — where secrets live
- [Read-Only Mode](/wiki/connections#read-only-mode) — preventing writes on a connection entirely
