---
title: "Connection Management"
order: 2
excerpt: "Learn how to manage your database connections securely with SSH tunneling and keychain integration."
category: "Database Objects"
---

# Connection Management

Tabularis stores connection profiles as JSON (non-sensitive fields) and delegates all secrets to the OS keychain — Keychain Access on macOS, Windows Credential Manager on Windows, and libsecret (GNOME Keyring / KWallet) on Linux.

![Connection Manager](/img/tabularis-connection-manager.png)

## Supported Drivers

The following drivers are registered at startup and available natively, with no plugin required:

| Driver ID | Database | Default Port | Multi-database |
| :--- | :--- | :--- | :--- |
| `postgres` | PostgreSQL | 5432 | — (uses schemas) |
| `mysql` | MySQL / MariaDB | 3306 | Yes |
| `sqlite` | SQLite | *(file path)* | — (file-based) |

Each built-in driver renders with its own branded icon in the Connections page — the PostgreSQL elephant, MySQL dolphin, and SQLite cylinder — displayed in the driver's official color. Plugin drivers use any icon declared in their manifest, or a generic fallback.

Additional drivers can be added via the [Plugin System](/wiki/plugins).

## Connections Page

The Connections page (`Cmd/Ctrl + Shift + C`) lists all saved profiles and supports two display modes, switchable from the toolbar:

- **Grid** — each connection is a card with the driver icon, status badge, host/database info, and SSH indicator.
- **List** — the same information in compact rows, better suited for large numbers of connections.

A search bar filters by name or host in real time.

Double-click a card or row to connect immediately.

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
| **Password** | No | Stored in OS keychain; never written to disk |
| **Save in keychain** | — | Controls whether the password persists after closing |
| **SSH enabled** | No | Activates the SSH tunnel for this connection |
| **SSH profile** | — | Which saved SSH profile to use for the tunnel |
| **Allow interactive prompts** | No | Lets the SSH tunnel prompt in-app for a key passphrase, security-key PIN, or password when it can't authenticate silently. See [SSH Tunneling → Interactive Authentication](/wiki/ssh-tunneling#interactive-authentication-passphrases--security-keys). |
| **Startup script** | No | SQL run on every new pooled connection (see [Startup Script](#startup-script) below). |
| **Kubernetes** | No | Tunnels the connection through a managed `kubectl port-forward`. Mutually exclusive with SSH. See [Kubernetes Tunneling](/wiki/kubernetes-tunneling). |
| **CA Certificate** | No | Path to a PEM bundle to trust for TLS (PostgreSQL only). See [TLS & CA Certificates](#tls--ca-certificates) below. |
| **Detect JSON in text columns** | No | Per-connection toggle: when enabled, plain `TEXT` / `VARCHAR` values that parse as JSON are routed through the JSON cell renderer in the data grid (chevron, viewer window, diff). The same flag also enables native array detection for `text[]` / `int[]` (PostgreSQL) and Firestore arrays. See [Data Grid → JSON & long text cells](/wiki/data-grid#json--long-text-cells). |

*Not required for SQLite, which takes a file path instead.

### TLS & CA Certificates (PostgreSQL)

Tabularis terminates Postgres TLS with [`tokio-postgres-rustls`](https://crates.io/crates/tokio-postgres-rustls) and verifies the server certificate via [`rustls-platform-verifier`](https://crates.io/crates/rustls-platform-verifier), so the platform's trust store (macOS Keychain, Windows certificate store, Linux CA bundle) is honored automatically.

If your database uses a CA the system store doesn't trust — typical for **AWS RDS**, GCP Cloud SQL with private CAs, or self-hosted Postgres behind a private PKI — paste the path to a PEM bundle into the connection's **CA Certificate** field. The bundle is loaded as an additional trust anchor only for that connection.

**AWS RDS in particular**: download the global certificate bundle from <https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem> and point the field at it. Tabularis intentionally does not vendor the bundle — AWS rotates these CAs every one to three years, and a vendored copy would silently break released apps the moment the next rotation lands.

MySQL/MariaDB connections continue to use `native-tls` and the system trust store; the `ssl_ca` field is a Postgres-only option for now. As of v0.13.0 the selected MySQL **SSL Mode** is honored on every code path — including the test-connection path, which previously attempted TLS even with `ssl_mode=disabled` — and connection pools are keyed by their TLS settings, so editing a connection's SSL mode can never silently reuse a pool created under the old mode.

The **SSL Mode** selector aligns with libpq semantics:

| Mode | Behavior |
| :--- | :--- |
| `disable` | No encryption. |
| `allow` | Try non-SSL first; fall back to SSL if the server requires it. |
| `prefer` | Try SSL first; fall back to non-SSL. |
| `require` | Force encryption, but **do not** require certificate validation. Use this with self-signed certificates (e.g., default AWS RDS without an explicit CA). |
| `verify-ca` | Force encryption **and** validate that the server certificate is signed by a trusted CA (paste the CA bundle into the **CA Certificate** field). |
| `verify-full` | Same as `verify-ca`, plus verify that the server hostname matches the certificate CN or SAN. Strictest mode; recommended for production. |

### Startup Script

A connection can carry an optional **startup script** — SQL that Tabularis runs on every new physical connection in the pool. Because it executes per pooled connection (MySQL/SQLite via `after_connect`, PostgreSQL via the pool's `post_create` hook), session-level settings stick across the whole pool regardless of which connection serves a given query.

![Startup script field in the Advanced tab of the connection modal](/img/posts/tabularis-startup-script.png)

The motivating case is development against row-level security: a script like

```sql
SELECT set_config('app.bypass_rls', 'on', false);
```

applies to every subsequent query instead of randomly depending on which pooled connection you landed on. Any `SET` or session-setup statement works; multiple statements can be separated normally, and blank or whitespace-only scripts are skipped. The script is stored with the connection profile as non-secret configuration.

### SQLite

For SQLite, provide the absolute path to the `.db` or `.sqlite` file using the file picker. There is no host, port, or authentication.

### Testing before saving

Click **Test** before saving. Tabularis makes a real connection attempt and returns the exact database error if it fails (e.g., `FATAL: password authentication failed for user "admin"`). The test goes through the SSH tunnel if one is configured.

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
| **Key passphrase** | Stored in OS keychain if "Save in keychain" is checked |

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

## Connection Actions

Right-click any connection — in the sidebar or on the Connections page — for:

- **Edit** — modify any field, including switching the SSH profile
- **Duplicate** — clone the profile with a new name and ID
- **Delete** — removes the profile from `connections.json` and the associated keychain entry
- **Disconnect** — closes the active connection pool and SSH tunnel without deleting the profile
- **Open in New Window** — opens the connection in its own standalone window (see below)

### Open in New Window

**Open in New Window** spins a connection out into its own OS window — useful for keeping one database on a second monitor while you work in the main window. Tabularis **test-connects first** and only creates the window on success, so a failing connection surfaces its error where you triggered it rather than in a freshly-opened empty window.

A connection opened this way is **owned** by its window and detaches from the originating sidebar rail (its underlying pool stays warm and is reused). Open state is shared across every window — a connection open anywhere shows as open on every window's Connections page. Disconnecting closes the dedicated window; the main window is never auto-closed. Closing a dedicated window tears its connection down so nothing leaks.

## Per-Connection Appearance

Every saved connection can override its driver's default icon and accent color. Open the New Connection modal (or edit an existing one) and expand the **Appearance** section in the General tab.

- **Accent color** — pick from a 12-swatch curated palette or paste a custom hex. The accent applies to the connection card on the Connections page, the sidebar entry once the connection is open, the Visual Explain modal's connection chip, and the **editor tab bar** of the active connection — the active-tab indicator, body gradient, loading bar, rename input, and split-pane panel headers all follow the connection color (falling back to the default blue when no connection is active). Falls back to the driver manifest color when no override is set.
- **Icon** — four mutually-exclusive tabs:
  - **Default** — keeps the driver's manifest icon.
  - **Pack** — a curated 30-icon subset of lucide-react covering the common shapes (cubes, clouds, layers, shields, branches…).
  - **Emoji** — a single emoji grapheme of your choice.
  - **Image** — upload a PNG, JPG, WebP, or SVG (max 512 KB). MIME type is validated against the file's magic bytes; SVGs are rejected if they contain `<script>`, `javascript:` URLs, or `on*=` event handlers. Custom images are stored under `<app_data>/connection-icons/` and cascade-deleted when the connection is removed.

The override is persisted alongside the rest of the connection profile in `connections.json` and round-trips through Export / Import like every other field. The classic use case is differentiating two same-driver connections that would otherwise look identical in the sidebar — for example, a `MySQL local` in green next to a `MySQL prod` in red, each with its own icon.

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

**Import** takes that payload — detecting the encrypted envelope and prompting for the password when needed — and merges it with the existing config (existing connection IDs are kept; new ones are appended), writes any embedded passwords back into the OS keychain under the same service-name conventions described in [Keychain Details](#keychain-details), and persists `connections.json` and `ssh_connections.json`. Empty password fields leave the matching keychain entry untouched, so partial payloads are safe. Plain exports produced by older versions import unchanged.

A confirmation dialog is shown before import; the dialog uses a non-destructive variant to signal that nothing is being overwritten in place.

## Import From Other SQL Clients (Beta)

Since v0.15.0, the **Import** dropup next to *Add Connection* can also read saved connections directly from other clients installed on your machine: **DBeaver**, **Beekeeper Studio**, **TablePlus**, **DataGrip**, and **Sequel Ace**. Each source is parsed into a neutral format, and stored credentials are decrypted or read from the source client's keychain when you opt in.

![Import from App modal reviewing connections found in DBeaver, with per-connection action and target-group selectors](/img/tabularis-import-from-app.png)

Nothing is merged blindly: a preview lists every connection found, flags duplicates against your existing set (keep, replace, or skip), and lets each new connection pick a target group — or create one on the fly — with defaults seeded from the source app's own folder structure.

The feature is marked **beta**: parser coverage across five apps and three platforms will keep improving, and the modal links directly to the [issue tracker](https://github.com/TabularisDB/tabularis/issues) for files that don't parse cleanly.

## Multi-Database Support (MySQL / MariaDB)

MySQL and MariaDB allow a single connection to read and write across multiple databases on the same server. Tabularis exposes this natively: when creating or editing a MySQL connection, open the **Databases** tab and click **Load Databases** to fetch every database visible to your user. Check the ones you want and save.

Each selected database appears as its own collapsible node in the Explorer sidebar. Expand a node to see its tables and views. Double-click a table to open it in the editor.

Cross-database references use fully qualified names (`database_name.table_name`) automatically, so MySQL resolves them correctly regardless of which database the connection was initially opened against.

The connection format accepts either a plain string (`"mydb"`) or an array (`["db1", "db2", "db3"]`). Existing single-database connections continue to work without any changes.

This feature applies only to drivers that support cross-database access from a single connection. SQLite (file-based) and PostgreSQL (schema-based) are unaffected.

### Cleartext Password Plugin (MySQL bastions)

Some MySQL proxies — notably [Warpgate](https://github.com/warp-tech/warpgate) — require the `mysql_clear_password` auth plugin and do not implement the prepared-statement protocol, so ordinary prepared queries fail with server error 1047. Enable **Cleartext password plugin** in the MySQL connection's advanced options to authenticate through them; when it's on, the driver routes every statement through the text protocol instead of preparing it.

Because the plugin sends the password in cleartext, the toggle is only available when an **enforced** TLS mode is selected (`require`, `verify-ca`, or `verify-full`) — `prefer` and `disable` are rejected, since they can silently fall back to an unencrypted link.

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

Open **Settings → General → Connection Health Check** and adjust the **Ping Interval** slider (0–120 seconds). Setting it to **0** disables health checks entirely.

The setting maps to the `pingInterval` key in `config.json` (see [Configuration](/wiki/configuration)).

### What happens on failure

When a health check failure triggers a disconnection:

- The connection pool is closed and resources are freed.
- Any SSH tunnel associated with the connection is torn down.
- A toast notification appears with the error message and a button to navigate back to the Connections page.
- You can reconnect at any time by clicking the connection again.

## Read-Only Mode

Toggle **Read-Only** on a connection to block DML and DDL statements at the application layer. Tabularis parses the SQL AST before execution and refuses to run `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `CREATE`, or `ALTER` statements. This is a client-side guard — not a substitute for proper database-level permissions.

## Keychain Details

The keychain service names used by Tabularis follow these patterns:

| Secret type | Keychain service key |
| :--- | :--- |
| DB password | `tabularis-connection-<uuid>` |
| SSH password | `tabularis-ssh-<uuid>` |
| SSH key passphrase | `tabularis-ssh-passphrase-<uuid>` |
| AI API key | `tabularis-ai-<provider>` |

On macOS you can inspect an entry manually:
```bash
security find-generic-password -s "tabularis-connection-<uuid>" -w
```

On Linux with `secret-tool`:
```bash
secret-tool lookup service tabularis-connection-<uuid>
```
