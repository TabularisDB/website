---
title: "Security & Credentials"
order: 2.3
excerpt: "How Tabularis stores passwords and secrets, and how to keep them in your OS keychain instead of on disk."
category: "Security & Networking"
---

Tabularis can keep every password, API key, and passphrase in your operating system's native keychain, with only non-sensitive metadata (hostnames, ports, usernames) in JSON config files. For connection passwords this depends on the **Save passwords in Keychain** option, which since v0.28.0 is on by default for new connections (connections created earlier keep their setting): when it is unchecked, the database password, SSH password, and SSH key passphrase are written to `connections.json` in plain text, and the form warns *"Passwords will be stored in plain text in the connection file."* Enable it on every connection whose credentials you want to keep off disk.

![Connection security settings with keychain-backed credential storage](/img/tabularis-secure-connection-keychain.png)

## Keychain Backends

| OS | Keychain | Notes |
| :--- | :--- | :--- |
| **macOS** | Keychain Access | Managed via the `security` CLI or Keychain Access app |
| **Windows** | Credential Manager | Stored under "Generic Credentials" |
| **Linux** | libsecret (GNOME Keyring / KWallet) | Requires a running secret service (most desktop environments include one) |

Tabularis uses the [`keyring`](https://docs.rs/keyring) Rust crate, which abstracts across all three platforms.

## What Is Stored Where

### In the OS Keychain (encrypted)

| Secret | Keychain key format |
| :--- | :--- |
| Database password | `{connection_id}:db` |
| SSH password | `{connection_id}:ssh` |
| SSH key passphrase | `{connection_id}:ssh_passphrase` |
| AI provider API key | `ai_key:{provider}` |
| Connection string (plugin drivers) | `{connection_id}:connection_uri` |
| Proxy password | `proxy:global`, `proxy:ai:{provider}`, `proxy:connection:{connection_id}` |
| Backup encryption password | `connections-backup` |
| Backup target credential (e.g. WebDAV) | `connections-backup-{target}` |

The keychain service name is `tabularis` for all entries.

### On Disk (plain JSON)

| File | Content |
| :--- | :--- |
| `connections.json` | Connection profiles: name, host, port, username, driver, SSH profile reference. Also holds the passwords of connections saved without **Save passwords in Keychain** |
| `ssh_connections.json` | SSH profiles: host, port, username, key file path. The SSH password and key passphrase are also stored here in plain text if the profile's **Save passwords in Keychain** toggle (on by default) is unchecked |
| `config.json` | App preferences, theme, editor settings |
| `saved_queries/meta.json` | Saved query metadata |

Since v0.28.0, on Linux and macOS the files that can hold secrets (`connections.json`, `ssh_connections.json` and `k8s_connections.json`) are written with mode `0600`, readable only by your user; an existing file with looser permissions is tightened the next time it is saved. Windows writes them as before.

These files live in the app config directory (or in the custom data folder chosen under **Settings → Storage** since v0.23.0, see [Configuration](/wiki/configuration#custom-storage-location)):

- **Linux**: `~/.config/tabularis`
- **macOS**: `~/Library/Application Support/tabularis`
- **Windows**: `%APPDATA%\tabularis`

## Credential Cache

To avoid hitting the OS keychain on every database operation, Tabularis maintains an in-memory credential cache. The cache uses a simple `HashMap` protected by a `Mutex` with five buckets: database passwords, connection strings, SSH passwords, SSH passphrases, and AI keys.

Key behaviors:

- **Read-through**: on cache miss, the keychain is queried and the result is cached (including misses, stored as `Absent` to prevent repeated lookups).
- **Write-through**: when you save a password, both the keychain and the cache are updated atomically.
- **Invalidation**: when you delete a connection, the corresponding cache entry and keychain entry are both removed.
- The cache lives only in process memory — it is never written to disk and is cleared when Tabularis exits.

## "Save passwords in Keychain" Toggle

When creating or editing a connection, the **Save passwords in Keychain** checkbox (on by default for new connections since v0.28.0, off before) controls where secrets are stored:

- **Checked** — the password is stored in the OS keychain, removed from `connections.json`, and loaded automatically on next launch.
- **Unchecked** — the password is saved in `connections.json` in plain text, together with the rest of the profile.

This applies to database passwords, SSH passwords, and SSH key passphrases.

If the toggle is checked but the OS keychain refuses the write, the connection is still saved: the password stays in `connections.json`, the toggle is stored as unchecked, and the plain-text warning is shown. Saving a connection URI (plugin drivers) still requires the toggle.

## Inspecting Keychain Entries

### macOS

```bash
security find-generic-password -s "tabularis" -a "<connection_id>:db" -w
```

### Linux (secret-tool)

```bash
secret-tool lookup service tabularis username "<connection_id>:db"
```

### Windows

Open **Credential Manager → Windows Credentials** and search for entries with `tabularis` in the service name.

## Deleting Credentials

When you delete a connection in Tabularis, the associated keychain entries are automatically removed. To manually clean up orphaned entries, use the OS-specific commands above to find and delete them.

## AI API Keys

AI provider keys (OpenAI, Anthropic, OpenRouter, MiniMax, Ollama) follow the same keychain pattern. The key format is `ai_key:<provider>`, where provider is one of `openai`, `anthropic`, `openrouter`, `minimax`, `custom-openai`. Ollama runs locally and typically does not require an API key.

If no key is found in the keychain, Tabularis falls back to an environment variable: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `MINIMAX_API_KEY`, or `CUSTOM_OPENAI_API_KEY`.

Re-enter an API key from **Settings → AI** if it stops working — the old keychain entry is overwritten in place.

## Guarding Against Accidental Writes

There is no per-connection read-only toggle in the connection editor. Marking a connection as **production** enables the [Production Write Guard](/wiki/connections#production-write-guard), which asks for confirmation before any statement that isn't provably read-only, and [MCP Read-Only Mode](/wiki/mcp-readonly-mode) blocks writes coming from AI clients. For a hard guarantee, connect with a database user that only has read privileges.
