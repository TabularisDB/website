---
title: "Connection Management"
order: 2
excerpt: "Learn how to manage your database connections securely with SSH tunneling and keychain integration."
category: "Database Objects"
---

Tabularis stores connection profiles as JSON in `connections.json`. With **Save passwords in Keychain** enabled, secrets go to the OS keychain instead — Keychain Access on macOS, Windows Credential Manager on Windows, and the Secret Service (GNOME Keyring / KWallet) on Linux. Since v0.28.0 the option is on by default for a new connection; existing connections keep their setting. With the option off, the database and SSH passwords are written to `connections.json` in plain text, and the form warns: *"Passwords will be stored in plain text in the connection file."* On Unix, `connections.json` and the SSH and Kubernetes connection files are written with mode `0600`, and an existing file with looser permissions is tightened on the next save.

![Connection Manager](/img/tabularis-connection-manager.png)

![New MySQL connection form with Save passwords in Keychain unticked and the plain-text password warning](/img/tabularis-new-connection-keychain-warning.png)

## Supported Drivers

The following drivers are registered at startup and available natively, with no plugin required:

| Driver ID | Database | Default Port | Multi-database |
| :--- | :--- | :--- | :--- |
| `postgres` | PostgreSQL | 5432 | Opt-in, database → schema (see [below](#multi-database-support-postgresql)) |
| `mysql` | MySQL / MariaDB | 3306 | Yes |
| `sqlite` | SQLite | *(file path)* | — (file-based) |

Each built-in driver renders with its own branded icon in the Connections page — the PostgreSQL elephant, MySQL dolphin, and SQLite cylinder — displayed in the driver's official color. Plugin drivers use any icon declared in their manifest, or a generic fallback.

Additional drivers can be installed as [plugins](/wiki/installing-plugins).

### Deprecated Built-in PostgreSQL Driver and Plugin Migration

Since v0.23.0 the built-in `postgres` driver is **deprecated** in favour of the [PostgreSQL plugin](https://github.com/TabularisDB/tabularis-postgresql-plugin) (`postgresql`), with a tentative removal date of 2026-10-05. The migration is opt-in in this release: nothing changes unless you click.

- **Automatic plugin install.** At launch, if at least one saved connection uses the built-in `postgres` driver and a compatible plugin release is available, Tabularis installs and activates the `postgresql` plugin in the background. This re-triggers on every launch while such a connection exists, so uninstalling the plugin reinstalls it next time.
- **Deprecated badge.** The built-in entry carries a **Deprecated** badge (tooltip: replacement and removal date) in the connection catalogue, on its card in **Settings → Plugins**, and on every connection row still using it. The plugin's catalogue entry sorts ahead of the built-in one.
- **Banner.** The Connections page shows a dismissible *Try the new PostgreSQL plugin* banner once the plugin is ready (or a *couldn't be downloaded, we'll retry on the next launch* variant when the registry was unreachable). Dismissing hides it for the connections that existed at that moment; a new built-in connection brings it back.
- **Switch to plugin.** Each built-in PostgreSQL connection has a migrate button on its card and a **Switch to plugin** entry in its context menu. After confirmation the driver flips to `postgresql`, the connection is reconnected if it was open, and a connection test runs. The resulting toast always offers **Undo** (which flips back and reconnects) and, on failure, **Report an issue**, which opens a pre-filled GitHub Issue Form in the plugin repository. A connection whose connection string is stored in the keychain gets a different confirmation: the secret does not carry over to the plugin and must be re-entered afterwards. Already migrated connections offer **Switch back to built-in**.
- **Review connections.** The banner link opens a bulk checklist of every connection still on the built-in driver. Connections that use a capability the installed plugin does not declare (SSL or connection strings) are listed unchecked with the gap named inline and a **Report this gap** action; keychain-stored connection strings are unchecked with the re-entry warning; everything else is checked. **Migrate N selected** works through the rows sequentially with per-row status, one failure does not stop the rest, and migration continues if you close the modal.
- Migrations are recorded in a persisted history. MySQL and SQLite are not deprecated yet and show no badge or migration action.

<div class="post-gallery">

![Connections page with the dismissible Try the new PostgreSQL plugin banner announcing the built-in driver retirement (tentatively 2026-10-05) and its Review connections link, above the connection cards, one of which carries the Deprecated badge next to its driver chip](/img/tabularis-postgres-deprecation-banner.png)

![The Review connections modal opened from the banner: it lists the one connection still on the built-in driver as a checked row, with Close and Migrate 1 selected buttons](/img/tabularis-migration-checklist.png)

</div>

## Connections Page

The Connections page (`Cmd/Ctrl + Shift + C`) lists all saved profiles and supports two display modes, switchable from the toolbar:

- **Grid** — each connection is a card with the driver icon, status badge, host/database info, and SSH indicator.
- **List** — the same information in compact rows, better suited for large numbers of connections.

A search bar filters by name or host in real time.

Double-click a card or row to connect immediately.

When a connection fails to open, an error banner appears at the top of the page. Technical details are collapsed behind **Show details**, and since v0.29.0 a **Copy** button copies the complete error, technical details included, to the clipboard.

Since v0.27.0 connections can be reordered within a group, in both views: drag a card or row onto another connection of the same group (or both ungrouped) and it takes that slot, with a dashed outline marking the target. The order is saved. Dropping onto a connection in a different group moves it there, at the end of that group. New, duplicated and imported connections sort after the ones you have ordered.

With **Reopen Last Connections** (Settings → General, on by default), Tabularis reconnects at startup to the connections that were open when you last closed it.

## Connection Profile Fields

When creating a connection (`+` button in the sidebar or `Cmd/Ctrl + Shift + N`):

| Field | Required | Description |
| :--- | :--- | :--- |
| **Name** | Yes | Display label in the sidebar |
| **Driver** | Yes | Selects the database type |
| **Host** | Yes* | Hostname or IP address |
| **Port** | Yes* | Auto-filled from the driver default |
| **Database** | Yes* | The database name to connect to |
| **Username** | Yes* | Database user |
| **Password** | No | Stored in the OS keychain when **Save passwords in Keychain** is checked; otherwise written to `connections.json` in plain text |
| **Save passwords in Keychain** | — | On by default for new connections since v0.28.0 (off before). When checked, the database and SSH passwords are kept in the OS keychain and removed from `connections.json`. If the keychain refuses the write, the connection is still saved, with the password in the file and the plain-text warning shown |
| **Use SSH Tunnel** | No | Activates the SSH tunnel for this connection |
| **SSH profile** | — | **Use Existing SSH Connection** picks a saved SSH profile; **Configure SSH Inline** defines the tunnel on this connection only |
| **Allow SSH password/PIN prompt** | No | Lets the SSH tunnel prompt in-app for a key passphrase, security-key PIN, or password when it can't authenticate silently. See [SSH Tunneling → Interactive Authentication](/wiki/ssh-tunneling#interactive-authentication-passphrases--security-keys). |
| **Startup script** | No | SQL run on every new pooled connection (see [Startup Script](#startup-script) below). |
| **Pooler mode** | No | PostgreSQL only, since v0.29.0. Declares that the connection goes through PgBouncer in transaction or session mode (see [Pooler Mode](#pooler-mode-pgbouncer) below). |
| **Browse multiple databases on this connection** | No | PostgreSQL only, since v0.29.0. Switches the connection to multi-database browsing (see [Multi-Database Support (PostgreSQL)](#multi-database-support-postgresql) below). |
| **Kubernetes** | No | Tunnels the connection through a managed `kubectl port-forward`. Mutually exclusive with SSH and AWS SSM. See [Kubernetes Tunneling](/wiki/kubernetes-tunneling). |
| **AWS SSM** | No | Since v0.25.0. Forwards the connection through an AWS Systems Manager Session Manager port-forwarding session opened with the AWS CLI. Takes a managed node id plus optional profile and region. Mutually exclusive with SSH and Kubernetes. See [AWS SSM Tunneling](/wiki/aws-ssm-tunneling). |
| **CA Certificate** | No | Path to a PEM bundle to trust for TLS (PostgreSQL and MySQL/MariaDB). See [TLS & CA Certificates](#tls--ca-certificates) below. |
| **Client Certificate** / **Client Key** | No | PEM paths for mutual TLS (PostgreSQL and MySQL/MariaDB). Since v0.21.0 they are presented to servers that require client authentication. See [Client Certificates](#client-certificates-mtls) below. |
| **Detect JSON in text columns** | No | Per-connection toggle: when enabled, plain `TEXT` / `VARCHAR` values that parse as JSON are routed through the JSON cell renderer in the data grid (chevron, viewer window, diff). The same flag also enables native array detection for `text[]` / `int[]` (PostgreSQL) and Firestore arrays. See [Data Grid → JSON & long text cells](/wiki/data-grid#json--long-text-cells). |

*Not required for SQLite, which takes a file path instead.

### Connection String Import

The **Connection String** field of the connection form (network drivers) fills the host, port, database, credentials and SSL settings from a URL such as `postgres://user:pass@host:5432/db` or `mysql://user:pass@localhost:3306/db`. Since v0.28.0 it also accepts JDBC URLs, `jdbc:postgresql://…` and `jdbc:mysql://…`: credentials in the query string are used when the URL has none before the host, and PostgreSQL and MySQL SSL modes (including `sslMode` in any case) land in the form. Drivers that pass the raw JDBC URL through keep it untouched.

### TLS & CA Certificates

Tabularis terminates Postgres TLS with [`tokio-postgres-rustls`](https://crates.io/crates/tokio-postgres-rustls). In `verify-full` mode without a CA file, the server certificate is verified via [`rustls-platform-verifier`](https://crates.io/crates/rustls-platform-verifier), so the platform's trust store (macOS Keychain, Windows certificate store, Linux CA bundle) is honored automatically.

If your database uses a CA the system store doesn't trust — typical for **AWS RDS**, GCP Cloud SQL with private CAs, or self-hosted Postgres behind a private PKI — paste the path to a PEM bundle into the connection's **CA Certificate** field. When a CA file is set, it **replaces** the platform trust store for that connection: only the roots in the bundle are trusted.

**AWS RDS in particular**: download the global certificate bundle from <https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem> and point the field at it. Tabularis intentionally does not vendor the bundle — AWS rotates these CAs every one to three years, and a vendored copy would silently break released apps the moment the next rotation lands.

MySQL/MariaDB connections use `rustls`. The **CA Certificate** is passed to the TLS layer only in `verify_ca` and `verify_identity` modes (connections using AWS IAM authentication are upgraded to `verify_ca` automatically when a CA is set); **Client Certificate** and **Client Key** are sent whenever they are set. As of v0.13.0 the selected MySQL **SSL Mode** is honored on every code path — including the test-connection path, which previously attempted TLS even with `ssl_mode=disabled` — and connection pools are keyed by their TLS settings, so editing a connection's SSL mode can never silently reuse a pool created under the old mode.

For PostgreSQL, the **SSL Mode** selector uses libpq mode names:

| Mode | Behavior |
| :--- | :--- |
| `disable` | No encryption. |
| `allow` | Behaves like `prefer` (the underlying driver has no non-SSL-first mode). |
| `prefer` | Try SSL first; fall back to non-SSL. No certificate validation. |
| `require` | Force encryption, but **do not** require certificate validation. Use this with self-signed certificates (e.g., default AWS RDS without an explicit CA). |
| `verify-ca` | Force encryption **and** validate that the server certificate is signed by the CA in the **CA Certificate** field. A CA file is required in this mode; the platform trust store is not used. |
| `verify-full` | Same as `verify-ca`, plus verify that the server hostname matches the certificate CN or SAN. Strictest mode; recommended for production. |

For MySQL/MariaDB the selector offers the MySQL mode names instead: `disabled`, `preferred`, `required` (the default), `verify_ca`, and `verify_identity`.

Since v0.28.0 an unknown SSL mode (for example a typo like `verfy-full` in an imported or hand-edited connection) fails the connection with a message listing the accepted values, instead of falling back to a weaker mode. Matching is case-insensitive and a blank value still means the default. When the host is remote and the selected mode does not verify the server certificate, the form suggests `verify-full` (PostgreSQL) or `verify_identity` (MySQL/MariaDB).

![SSL tab for a remote MySQL host in Required mode with the hint to use verify_identity](/img/tabularis-ssl-remote-hint.png)

![MySQL connection editor with the SSL Mode dropdown open, showing Disabled, Preferred, Required, Verify CA and Verify Identity](/img/tabularis-mysql-ssl-modes.png)

### Client Certificates (mTLS)

Servers that require client-side certificate authentication (Google Cloud SQL with mTLS enabled, or a private PKI) reject connections with `connection requires a valid client certificate`. Since v0.21.0, filling both **Client Certificate** and **Client Key** with PEM paths makes Tabularis present them during the TLS handshake in every SSL mode other than `disable`. Connection pools are keyed by these paths as well, so editing the certificate never reuses a pool built without it.

![PostgreSQL connection editor, SSL tab: SSL mode Verify Full with CA Certificate, Client Certificate and Client Key path fields](/img/tabularis-postgres-client-cert.png)

### HTTP / SOCKS5 Proxy Override

Since v0.24.0, the connection's **Advanced** section has a proxy override: **Inherit** the global [Network settings](/wiki/configuration#network--proxies), use a **Custom** HTTP CONNECT or SOCKS5 endpoint, or **Disable** proxying for this connection. Custom and disabled modes override the global scope selection. Optional proxy passwords are stored in the OS keychain.

For a direct database connection the proxy carries database TCP traffic. With SSH it applies to the bastion hop instead; the local SSH/Kubernetes tunnel leg is not proxied again. Reconnect after changing global proxy settings, which stop existing SSH tunnels and forwards.

### Startup Script

A connection can carry an optional **startup script** — SQL that Tabularis runs on every new physical connection in the pool. Because it executes per pooled connection (MySQL/SQLite via `after_connect`, PostgreSQL via the pool's `post_create` hook), session-level settings stick across the whole pool regardless of which connection serves a given query.

![Startup script field in the Advanced tab of the connection modal](/img/posts/tabularis-startup-script.png)

The motivating case is development against row-level security: a script like

```sql
SELECT set_config('app.bypass_rls', 'on', false);
```

applies to every subsequent query instead of randomly depending on which pooled connection you landed on. Any `SET` or session-setup statement works; multiple statements can be separated normally, and blank or whitespace-only scripts are skipped. The script is stored with the connection profile as non-secret configuration.

### Pooler Mode (PgBouncer)

Since v0.29.0, PostgreSQL connections have a **Pooler mode** field in the **Advanced** tab, with three options: **None (direct connection)**, **PgBouncer transaction** and **PgBouncer session**. Tabularis does not detect a pooler at runtime; the field is a declaration, stored as `pooler_mode` in the connection profile (omitted for direct connections) and passed to the driver.

The [PostgreSQL plugin](https://github.com/TabularisDB/tabularis-postgresql-plugin) reads it: in transaction mode it skips its own named prepared statements, which a transaction-mode pooler can lose between two messages, and explains the errors that custom types can still trigger. With **PgBouncer transaction** selected, the form recommends setting `max_prepared_statements > 0` in `pgbouncer.ini` when the database uses custom types (enums, composites, extension types), so named statements survive connection reassignment. The deprecated built-in `postgres` driver ignores the field.

### SQLite

For SQLite, provide the absolute path to the `.db` or `.sqlite` file using the file picker. There is no host, port, or authentication.

You can also create the file from inside Tabularis: **New SQLite Database…** in the Connections menu and empty state, or the **+ New** button in the SQLite file picker inside the connection modal. Existing files are never overwritten, and `create_if_missing` stays disabled — a typo in a path cannot silently produce an empty database. A database created from the quick-create flow is auto-named and opened; created from the modal, it only fills in the path and leaves the usual Test/Save flow alone.

### In-memory databases (plugin drivers)

Since v0.29.0, a file-based plugin driver that declares the `in_memory` capability gets an **In-memory** button next to the file picker. It fills in the path `:memory:` and shows as pressed while that path is selected; **Test Connection** then skips the file existence check. The database lives in the plugin process: connections that use `:memory:` share it, and its data is lost when the plugin process stops. DuckDB is the first plugin to declare it. The built-in SQLite driver does not offer the button, because each pooled connection would get its own empty `:memory:` database.

### Testing before saving

Click **Test Connection** before saving. Tabularis makes a real connection attempt and returns the exact database error if it fails (e.g., `FATAL: password authentication failed for user "admin"`). The test goes through the SSH tunnel if one is configured.

The test reports its progress step by step — SSH tunnel, Kubernetes port-forward, database connect — so a test that hangs tells you *where* it hangs. A **Stop** button abandons an in-flight test; late results from an abandoned run are discarded.

When a test fails, the error is **classified** rather than dumped as one truncated line. Categories cover SSH authentication, an unreachable SSH host, generic SSH failures, database authentication, network problems, and a missing database, each with a translated summary and a recovery hint. Credentials embedded in raw error text are redacted. With a tunnel active, a "connection refused" is attributed to the tunnel rather than to the database host.

A **diagnostics modal** opens on failure — or when you press Stop — showing the classified summary, the recovery hint, a timestamped log of each step, the sanitized raw error, and a copy-to-clipboard report suitable for pasting into an issue. The **Show log** link in the modal footer reopens it.

<video src="/videos/posts/tabularis-connection-diagnostics.mp4" poster="/videos/posts/tabularis-connection-diagnostics.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## SSH Tunnel System

![SSH Connections](/img/tabularis-ssh-tunneling.png)

Tabularis has a full SSH tunneling implementation in Rust with two backends, selected automatically based on your auth method.

### Two backends

**russh (Native Rust SSH)**
Used when a password is provided for the SSH connection. The tunnel is established entirely within the Rust process — no external `ssh` binary is involved. Host keys are checked against your `~/.ssh/known_hosts` (trust-on-first-use for unknown hosts; key-changed errors are surfaced as a hard failure).

**System SSH**
Used when no password is provided (key-only authentication). Tabularis spawns your system's `ssh` binary and parses your `~/.ssh/config`, which means `ProxyJump` chains, `IdentityFile` directives, and all other `~/.ssh/config` features work automatically.

### Dynamic port assignment

When a tunneled connection opens, Tabularis asks the OS for a free ephemeral port on `127.0.0.1`, establishes the SSH tunnel to that port, then points the database driver at `127.0.0.1:<ephemeral_port>`. You never need to pick a local port manually.

### SSH profiles

SSH connections are stored as separate reusable profiles (`ssh_connections.json`). A single SSH profile (e.g., your production bastion) can be reused across multiple database connections. Manage SSH profiles via **Settings → SSH Connections** or the `SshConnectionsModal`.

| SSH field | Description |
| :--- | :--- |
| **Host** | Bastion hostname or IP |
| **Port** | Default `22` |
| **User** | Your user on the bastion host |
| **Auth type** | `password` or `ssh_key` — determines which fields are shown in the UI |
| **Password** | SSH password (uses Russh backend when set) |
| **Key file** | Path to private key (for `ssh_key` auth; uses System SSH backend when no password) |
| **Key passphrase** | Stored in OS keychain if "Save passwords in Keychain" is checked |

### ProxyJump / multi-hop example

Define the chain in `~/.ssh/config` and use the System SSH backend:

```
Host bastion
    HostName bastion.example.com
    User ec2-user
    IdentityFile ~/.ssh/prod.pem

Host db-host
    HostName 10.0.1.50
    User ubuntu
    ProxyJump bastion
```

Set the SSH profile host to `db-host`, auth type to `ssh_key`, and leave the password field empty. With no password provided, Tabularis uses the System SSH backend, which delegates to `ssh` and resolves the chain automatically.

## Kubernetes Tunnels

For databases running inside a Kubernetes cluster, the connection modal's **Kubernetes** tab runs a managed `kubectl port-forward` as the transport — pick a context, namespace, resource, and container port via cascading dropdowns discovered from your kubeconfig. Saved K8s profiles live in `k8s_connections.json` and are reusable across connections, mirroring the SSH profile pattern. Connections with a tunnel show a blue **K8s badge** in the sidebar and on the Connections page.

Full reference: [Kubernetes Tunneling](/wiki/kubernetes-tunneling).

## AWS SSM Port Forwarding

Since v0.25.0 the connection modal has an **AWS SSM** tab. Enable **Use AWS SSM Port Forwarding**, enter the **Managed Node** id and, optionally, an **AWS Profile** and **AWS Region**. On connect Tabularis runs `aws ssm start-session` as a port-forwarding session and points the driver at the local port it reports. The forward target is the connection's own host and port from the General tab: a loopback target uses `AWS-StartPortForwardingSession`, any other host uses `AWS-StartPortForwardingSessionToRemoteHost`, and the tab shows which one applies. **Test SSM** opens a real session and closes it again without connecting to the database. Credentials are handled entirely by the AWS CLI; nothing SSM-specific is stored in the keychain. Connections using SSM show an **SSM** chip on the Connections page and in the sidebar. SSH, Kubernetes and AWS SSM are mutually exclusive on a connection.

Full reference: [AWS SSM Tunneling](/wiki/aws-ssm-tunneling).

![Connection editor with the AWS SSM port forwarding settings](/img/tabularis-aws-ssm-tab.png)

## Connection Actions

Right-click any connection — in the sidebar or on the Connections page — for:

- **Edit** — modify any field, including switching the SSH profile
- **Duplicate** — clone the profile with a new name and ID
- **Delete** — removes the profile from `connections.json` and the associated keychain entry
- **Disconnect** — closes the active connection pool without deleting the profile. SSH tunnels are shared between connections that use the same bastion and target, and stay open until Tabularis quits or the proxy settings change
- **Open in New Window** — opens the connection in its own standalone window (see below)
- **Switch to plugin** / **Switch back to built-in** — on built-in PostgreSQL connections only, since v0.23.0 (see [Deprecated Built-in PostgreSQL Driver and Plugin Migration](#deprecated-built-in-postgresql-driver-and-plugin-migration))

### Open in New Window

**Open in New Window** spins a connection out into its own OS window — useful for keeping one database on a second monitor while you work in the main window. Tabularis **test-connects first** and only creates the window on success, so a failing connection surfaces its error where you triggered it rather than in a freshly-opened empty window.

A connection opened this way is **owned** by its window and detaches from the originating sidebar rail (its underlying pool stays warm and is reused). Open state is shared across every window — a connection open anywhere shows as open on every window's Connections page. Disconnecting closes the dedicated window; the main window is never auto-closed. Closing a dedicated window tears its connection down so nothing leaks.

## Per-Connection Appearance

Every saved connection can override its driver's default icon and accent color. Open the New Connection modal (or edit an existing one) and switch to the **Appearance** tab.

<video src="/videos/wiki/16-per-connection-appearance.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

- **Accent color** — pick from a 12-swatch curated palette or paste a custom hex. The accent applies to the connection card on the Connections page, the sidebar entry once the connection is open, the Visual Explain modal's connection chip, and the **editor tab bar** of the active connection — the active-tab indicator, body gradient, loading bar, rename input, and split-pane panel headers all follow the connection color (falling back to the default blue when no connection is active). Falls back to the driver manifest color when no override is set.
- **Icon** — four mutually-exclusive tabs:
  - **Default** — keeps the driver's manifest icon.
  - **Pack** — a curated 30-icon subset of lucide-react covering the common shapes (cubes, clouds, layers, shields, branches…).
  - **Emoji** — a single emoji grapheme of your choice.
  - **Image** — upload a PNG, JPG, WebP, or SVG (max 512 KB). MIME type is validated against the file's magic bytes; SVGs are rejected if they contain `<script>`, `javascript:` URLs, or `on*=` event handlers. Custom images are stored under `<app_data>/connection-icons/` and cascade-deleted when the connection is removed.

The override is persisted alongside the rest of the connection profile in `connections.json` and round-trips through Export / Import like every other field. The classic use case is differentiating two same-driver connections that would otherwise look identical in the sidebar — for example, a `MySQL local` in green next to a `MySQL prod` in red, each with its own icon.

## Tags and Environments

Since v0.19.0, two complementary ways to keep a long connection list honest.

### Colored Tags

Free-form colored tags can be attached to any connection from the **Appearance** section of the connection modal: create tags inline on the shared accent palette, or switch to manage mode to rename, recolor or delete them. Tag names are unique (case-insensitive) and capped at 32 characters.

Tags render as colored chips on connection cards and list rows, and tag names participate in the connection search filter. They are stored in `connections.json` alongside groups and ride along in Export / Import and automatic backups: selective exports include only the tags actually in use, and imports merge by id first, then by name — re-importing a profile that uses a "prod" tag on another machine reuses the existing tag instead of duplicating it.

### Environment Classification

Each connection can optionally declare itself **development**, **staging**, or **production**, picked in the connection modal's title bar and preserved across duplicate and import. Production identity is deliberately loud:

- a **PROD** badge on connection cards and list rows,
- a red ring on open sidebar entries,
- a permanent red banner while the active connection is production.

![The Connections page with colored tag chips and environment badges on the cards: a red "work" tag next to STAGING and DEV badges, PROD in red, and connections with no environment set](/img/tabularis-connection-tags-environments.png)

### Production Write Guard

On a production connection, any statement that isn't provably read-only asks for confirmation first, with a SQL preview and a per-connection "don't ask again" that lasts for the session. Detection is conservative: only `SELECT`, `SHOW`, `DESCRIBE`, `PRAGMA` and `EXPLAIN` of a `SELECT` count as read-only — data-modifying CTEs, `EXPLAIN ANALYZE` of a write (which executes the write on PostgreSQL) and unknown statement types (`CALL`, `SET`, …) all prompt. The guard covers editor runs, staged grid-edit commits, immediate cell edits, row insertion, notebook cells and AI-generated queries. Since v0.21.0 it runs *before* the destructive-query guard and replaces it on production connections, so a `DELETE` without a `WHERE` shows one production warning instead of two dialogs. The optional five-second countdown (**Settings → General → Delay safety confirmations**, off by default) applies here too. The red production banner is shown on the connection editor only, not in Settings.

## Connection Groups

Connections can be organized into collapsible folder groups, and since v0.15.0 groups can be **nested** to arbitrary depth — folders inside folders. Right-click on the connection list background and select **New Group**, or hover a group header and click the **+** button to create a subfolder inline.

Both inputs accept `/` as a path separator: typing `clients/acme/staging` creates the whole chain in one go, reusing any existing segment case-insensitively. Drag connections between groups by grabbing them in the sidebar; dragging a group onto another group's header past one indent step moves it *inside* that group, while dropping near the left edge keeps the plain reorder. Moving a folder into one of its own descendants is rejected with an error.

Deleting a group **cascade-deletes its entire subtree** — nested groups and every connection inside them. A folder's count badge sums direct and descendant connections, so a collapsed tree still shows what it holds.

### Multi-Select and Bulk Actions

Hovering a connection card (grid or list view) reveals a selection checkbox. With one or more connections selected, a pinned action bar shows the count and offers **Move to group** (a submenu of the nested group tree, plus *Ungrouped*), **Delete selected** (behind a confirmation), and **Export** — which writes only the selected connections, pruning the group list to the ancestor chains they actually need. Credentials of unselected connections are never resolved from the keychain during a selective export.

![Three connections selected with the pinned action bar showing Export selected, Move to group with its nested-group submenu open, and Delete selected](/img/tabularis-connections-multiselect.png)

## Export / Import

The toolbar on the Connections page exposes **Export** and **Import** buttons (the Import button also appears on the empty-state view of a fresh install). Both operate on a single JSON payload that round-trips your full connection set — including the nested group hierarchy — between machines.

**Export** opens a modal offering three modes:

- **Encrypted with a password** (default) — the payload is encrypted with AES-256-GCM under an Argon2id-derived key. This is the mode to use whenever the file will cross a machine boundary.
- **Plain text without passwords** — secrets are stripped from the payload; useful for sharing a connection topology without credentials.
- **Plain text with all passwords** — every credential (database password, SSH password, SSH key passphrase) is resolved from the OS keychain and written in cleartext. Treat the file like a `.env` and store it accordingly.

![Export Connections modal with the three export modes, the encrypted option selected and password fields below](/img/tabularis-export-connections-modes.png)

**Import** takes that payload — detecting the encrypted envelope and prompting for the password when needed — and opens the same review modal used for [importing from other SQL clients](#import-from-other-sql-clients-beta): every connection in the file is listed, duplicates of existing connections can be imported as new (**Import**), replace the existing one (**Replace**), or be skipped (**Skip**), and each new connection can be assigned a target group. Embedded passwords go into the OS keychain (see [Keychain Details](#keychain-details)) for connections with **Save passwords in Keychain** enabled, and into `connections.json` otherwise. Plain exports produced by older versions import unchanged.

## Automatic Backups

Since v0.16.0, the manual export has an automated counterpart: a **Backup** tab in Settings that periodically writes an encrypted export of your connections. Automatic backups always use the encrypted envelope (AES-256-GCM under an Argon2id-derived key) — plaintext automatic backups are deliberately not offered.

<video src="/videos/posts/tabularis-backup-settings.mp4" poster="/videos/posts/tabularis-backup-settings.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

- **Triggers** — manual ("Back up now"), on an interval (6h / 12h / daily / weekly presets or a custom value, with the next scheduled run shown in the settings), on app launch, or on app close. The on-close backup is bounded by a timeout so it can never prevent the app from quitting.
- **Destinations** — a local folder, or a **WebDAV** collection (Nextcloud and compatible servers).
- **Retention** — old backups are rotated by count; rotation only ever touches `tabularis-backup-*.json` files, so other files in the same directory are never removed.
- **Credentials** — the backup encryption password and WebDAV credentials are stored in the OS keychain, never in `config.json`. Changing the backup password only affects future backups; files already written keep the password they were encrypted with.

Settings changes apply without a restart, and each backup run is logged — including which trigger fired it — in the Logs tab. A backup file is a regular encrypted export: restore it through the normal [Import](#export--import) flow.

### Scheduled Database Backups

The backups above save connection profiles, not data. Since v0.30.0 the same tab has a second section, **Scheduled Database Content Backups**, which writes a daily SQL dump of a database through the [dump pipeline](dump-import).

A plan has:

- a **connection** and, for multi-database connections, the **database** to dump;
- a **daily time** (default `02:00`) and a **timezone**, an IANA name or the local one;
- a **destination folder** and how many backups to keep (default 7);
- whether to dump the **structure**, the **data** or both.

The daily time is evaluated in the plan's timezone: on a daylight-saving gap the run moves one hour later, and on a fold it runs at the first occurrence. A failed run is retried after 15 minutes. A failed or cancelled run removes its partial file and leaves the existing backups alone, and pruning only touches the files of that plan (`tabularis-db-backup-<connection>--<database>--…`). The section shows the last run, its outcome and the next run, with **Run now** and **Cancel**.

![The Scheduled Database Content Backups section in Settings, Backup, enabled for a SQLite connection at 02:00 local time, keeping 7 backups of structure and data, with the last run successful](/img/tabularis-scheduled-database-backups.png)

Backups run only while Tabularis is open. Plugin drivers are supported when they declare a SQL dialect and are neither connectionless nor folder-based; otherwise the section explains why the connection can't be dumped. In [Tabularis Web](web-mode) the schedule runs on the server and needs local-administrator rights. A dump is restored like any other, through [Import](dump-import).

## Import From Other SQL Clients (Beta)

Since v0.15.0, the **Import** dropup next to *Add Connection* can also read saved connections directly from other clients installed on your machine: **DBeaver**, **Beekeeper Studio**, **TablePlus**, **DataGrip**, and **Sequel Ace**. Each source is parsed into a neutral format, and stored credentials are decrypted or read from the source client's keychain when you opt in.

![Import from App modal reviewing connections found in DBeaver, with per-connection action and target-group selectors](/img/tabularis-import-from-app.png)

Nothing is merged blindly: a preview lists every connection found, flags duplicates against your existing set (keep, replace, or skip), and lets each new connection pick a target group — or create one on the fly — with defaults seeded from the source app's own folder structure.

If TablePlus stores its data outside the default Application Support location, auto-discovery reports the source as unavailable; since v0.21.0 you can point the importer at the TablePlus `Data` directory (or a plist inside it) instead.

The feature is marked **beta**: parser coverage across five apps and three platforms will keep improving, and the modal links directly to the [issue tracker](https://github.com/TabularisDB/tabularis/issues) for files that don't parse cleanly.

## Multi-Database Support (MySQL / MariaDB)

MySQL and MariaDB allow a single connection to read and write across multiple databases on the same server. Tabularis exposes this natively: when creating or editing a MySQL connection, open the **Databases** tab and pick a mode.

![The Databases tab of the connection modal with the All databases / Choose databases mode switch, All databases selected, and the hint explaining that the server list is resolved at connect time](/img/tabularis-all-databases-mode.png)

**All databases** is the default for new connections: save without selecting anything and Tabularis resolves the full server list at connect time. New databases show up on their own, dropped ones disappear, and you never have to edit the connection to see them. The sidebar's refresh button re-syncs the list on demand — nothing is persisted — and toasts what was added and removed. Pasting a connection URI with no database in it switches to this mode automatically. Connection cards label such a connection "All databases" instead of showing a database count.

**Choose databases** is the explicit mode: click **Load Databases** to fetch every database visible to your user, check the ones you want, and save. The "select at least one database" save block only applies here. Narrowing an all-databases connection to a subset from the sidebar's manage popover persists that choice and exits all-databases mode.

Since v0.29.0, **Choose databases** mode also has a **Default database** selector: new query tabs open on the database you pick there, even when another one comes first in the server's list. The default is stored as the first entry of the selection, so existing connections keep theirs. Reloading the database list preserves the order and deselections; removing the default from the selection makes the next selected database the default. **All databases** mode keeps its current behavior.

An all-databases connection has no default schema, so it always issues database-qualified queries — including when the server happens to hold a single database.

Each selected database appears as its own collapsible node in the Explorer sidebar. Expand a node to see its tables and views. Double-click a table to open it in the editor.

Cross-database references use fully qualified names (`database_name.table_name`) automatically, so MySQL resolves them correctly regardless of which database the connection was initially opened against.

The connection format accepts either a plain string (`"mydb"`) or an array (`["db1", "db2", "db3"]`). Existing single-database connections continue to work without any changes.

This flat database → table layout applies only to drivers that support cross-database access from a single connection. SQLite (file-based) is unaffected; PostgreSQL uses its own nested layout, described in [Multi-Database Support (PostgreSQL)](#multi-database-support-postgresql).

### Cleartext Password Plugin (MySQL bastions)

Some MySQL proxies — notably [Warpgate](https://github.com/warp-tech/warpgate) — require the `mysql_clear_password` auth plugin and do not implement the prepared-statement protocol, so ordinary prepared queries fail with server error 1047. Enable **Enable cleartext password plugin** in the MySQL connection's advanced options to authenticate through them; when it's on, the driver routes every statement through the text protocol instead of preparing it.

Because the plugin sends the password in cleartext, the toggle is only available when an **enforced** TLS mode is selected (`required`, `verify_ca`, or `verify_identity`) — `preferred` and `disabled` are rejected, since they can silently fall back to an unencrypted link.

### AWS RDS IAM Authentication (MySQL)

![MySQL connection editor on the SSL tab with Required mode and the Use AWS IAM Authentication (RDS) option available](/img/tabularis-mysql-iam.png)

For MySQL/MariaDB on AWS RDS, enable **Use AWS IAM Authentication (RDS)** and paste the output of `aws rds generate-db-auth-token` into the password field. The token is sent with the cleartext password plugin, so a TLS mode is required: `disabled` is refused and `preferred` is upgraded to `required`. Tokens expire every 15 minutes and are never read from the keychain — paste a fresh one when you connect.

### PIPES_AS_CONCAT

MySQL connections run with the `PIPES_AS_CONCAT` SQL mode by default (**Set PIPES_AS_CONCAT sql_mode on connect**), so `||` concatenates strings as in standard SQL. Servers that reject the setting, such as Vitess and PlanetScale, are detected and the mode is skipped automatically, so the option can stay enabled.

## Multi-Database Support (PostgreSQL)

Since v0.29.0 a PostgreSQL connection can browse several databases on the same server. It is opt-in: an existing connection with a single database name keeps the schema-only layout described below, and is not reclassified.

1. In the connection form, check **Browse multiple databases on this connection**. The single **Database** field is cleared and the **Databases** tab opens.
2. Pick a mode, as for MySQL: **All databases** loads every database on the server at connect time; **Choose databases** lets you load the list, check the databases you want and choose the **Default database**.

Each database becomes a top-level node in the Explorer sidebar, with its own schema picker, and expands into its schemas and then their tables, views, routines and triggers. Everything available on a single-database connection works inside each node: create and drop tables, columns, indexes, foreign keys, views and triggers; run, edit and drop routines; open a console; open the [ER diagram](/wiki/er-diagram), whose window has a schema switcher; [dump and import](/wiki/dump-import). Every command is sent to the database you clicked, on the built-in driver and on the PostgreSQL plugin's RPC path. The command palette's object search covers the nested databases as well.

Persisted schema selections and preferences are kept per database. The [MCP server](/wiki/mcp-server) tools `list_tables`, `describe_table` and `run_query` take an optional `database` argument to target one of these databases.

The ER diagram window shows a schema picker, and a schema-load error is shown instead of an empty canvas. When a [trigger](/wiki/triggers) is created, its backing function is schema-qualified in both the `CREATE FUNCTION` and the `CREATE TRIGGER` statement.

<video src="/videos/posts/tabularis-postgres-multi-database.mp4" poster="/videos/posts/tabularis-postgres-multi-database.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

## Multi-Schema Support (PostgreSQL)

When connected to PostgreSQL, Tabularis loads all schemas by default. To control which schemas appear in the sidebar for a given connection, use the schema selector in the sidebar header. Your selection is persisted per connection in `config.json` under `selectedSchemas`.

The schema preference (which schema is "active" for DDL operations like `CREATE TABLE`) is also persisted per connection under `schemaPreferences`.

## Connection Health Check

Tabularis continuously monitors every active connection with a lightweight ping loop. If the backend detects that a connection is no longer reachable, it automatically disconnects it and notifies you with a toast alert.

### How it works

1. Every **N seconds** (default: 30), Tabularis sends a ping to each open connection.
2. Built-in drivers (PostgreSQL, MySQL, SQLite) use a pool-level `ping` — no extra query is executed.
3. Plugin drivers receive a `ping` JSON-RPC call. If the plugin has not implemented `ping`, Tabularis falls back to `test_connection` automatically.
4. After **2 consecutive failures**, the connection pool is closed, the connection is removed from the active set, and a `connection-health-failed` event is emitted to the UI.

### Configuring the interval

Open **Settings → General → Connection Health Check** and set the **Ping Interval** field (0–120 seconds). Setting it to **0** disables health checks entirely.

The setting maps to the `pingInterval` key in `config.json` (see [Configuration](/wiki/configuration)).

### What happens on failure

When a health check failure triggers a disconnection:

- The connection pool is closed and resources are freed. Shared SSH tunnels are left running.
- A toast notification appears with the error message and a button to navigate back to the Connections page.
- You can reconnect at any time by clicking the connection again.

## Read-Only Access

The connection editor has no read-only toggle. Two mechanisms cover the common cases:

- Mark the connection as **production** to get the [Production Write Guard](#production-write-guard), which asks for confirmation before any statement that isn't provably read-only.
- For AI clients, [MCP Read-Only Mode](/wiki/mcp-readonly-mode) blocks writes from MCP on selected connections or on all of them.

Neither is a substitute for proper database-level permissions: for a hard guarantee, connect with a database user that only has read privileges.

## Keychain Details

Every keychain entry uses the service name `tabularis`; the account identifies the secret:

| Secret type | Keychain account |
| :--- | :--- |
| DB password | `<uuid>:db` |
| Connection string (plugin drivers) | `<uuid>:connection_uri` |
| SSH password | `<uuid>:ssh` |
| SSH key passphrase | `<uuid>:ssh_passphrase` |
| AI API key | `ai_key:<provider>` |

On macOS you can inspect an entry manually:
```bash
security find-generic-password -s "tabularis" -a "<uuid>:db" -w
```

On Linux with `secret-tool`:
```bash
secret-tool lookup service tabularis username "<uuid>:db"
```

See [Security & Credentials](/wiki/security-credentials) for the full list.
