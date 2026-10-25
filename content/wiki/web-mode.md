---
title: "Tabularis Web"
order: 1
excerpt: "Run Tabularis in a browser with `tabularis web`, locally or on a server, with the same interface and Rust services as the desktop app."
category: "Self-Hosting"
---

Since v0.30.0, Tabularis Web is the desktop application served to a browser. The `tabularis web` command starts an HTTP and WebSocket server that serves the same React interface and runs the same Rust services, so connections, queries, notebooks, plugins and settings behave as they do on the desktop. Running `tabularis` without the `web` subcommand still starts the desktop app.

Use it to work with Tabularis on a headless machine, keep it next to your databases on a server, or reach it from any browser.

## Two Ways to Run It

| Setup | Command | When to use it |
| :--- | :--- | :--- |
| **Local** | `tabularis web` from an installed Tabularis | One person, on the same machine as the browser |
| **Container** | Docker, Docker Compose or Helm | A server, a homelab or a Kubernetes cluster; see [Docker & Helm](/wiki/docker-helm) |

Both serve the browser UI over plain HTTP. Access from another machine always goes through an HTTPS reverse proxy with authentication; see [Remote Access & Reverse Proxy](/wiki/web-remote-access).

## Running It Locally

```bash
tabularis web
# Tabularis Web is available at http://127.0.0.1:8080
```

![Tabularis Web in Google Chrome: the explorer of a SQLite connection and a query on daily_sales with its result in the grid](/img/tabularis-web-browser-grid.png)

By default the server listens on `127.0.0.1:8080` and opens your default browser. Even on loopback, the session is authenticated:

1. On startup Tabularis creates a single-use access token that expires after 60 seconds.
2. The browser opens a URL carrying that token. The server exchanges it for an eight-hour session cookie (`HttpOnly`, `SameSite=Strict`) and removes the token from the address bar.
3. Every request is checked against the expected `Host` and `Origin`, and state-changing requests also need the session's CSRF token.

Closing the browser tab does not stop the server. Stop it with `Ctrl+C` in the terminal, or stop its service.

- **Headless machine or SSH session:** if the browser cannot be opened, Tabularis prints the one-time URL in the terminal instead. It works once, within one minute; restart `tabularis web` to get a new one.
- **Another port:** `tabularis web --port 8081`. There is no automatic fallback when the port is taken.
- **Services:** `--no-open` skips the browser and deliberately does not print the one-time URL, so it never ends up in a service log. Use it for services and remote deployments, not to open a local session by hand.

All options are listed in [Command Line Interface](/wiki/cli#web).

## What Differs From the Desktop App

The browser cannot use native operating-system features, so a few workflows are adapted:

- **Files:** imports go through authenticated uploads, and exports, dumps and BLOB downloads become expiring, usually single-use browser downloads. A path typed in the browser is never treated as a path on the server.
- **Server files:** browsing folders on the server (for example to open or create a SQLite file) is disabled unless you allow specific directories with `--server-file-browser-root`.
- **Windows:** result, diagram, EXPLAIN, task and connection windows open as browser tabs or routes. A popup blocker can stop them from opening.
- **Clipboard and notifications** depend on the browser's permissions. When one is denied, the UI says so instead of failing silently.
- **Updates:** the built-in updater, restart and window controls do not apply. **Settings → Info** shows the server's version and build, and upgrades are done on the server; see [Updates](/wiki/updates#tabularis-web-servers).
- **Desktop only:** ChatGPT sign-in and the developer tools are not available in the browser.
- **Plugin deep links** open an `/install-plugin` page that asks for confirmation.
- **MCP** configuration is a local-host operation and is unavailable to remote browser sessions.

## Limits

| Limit | Value |
| :--- | :--- |
| Rows per query page | 10,000 |
| Serialized query response | 16 MiB |
| Concurrent requests | 64 per server, 16 per session |

Paginate, select fewer columns, or use a streamed export for larger results. Requests beyond the concurrency limit fail immediately rather than queuing.

Refreshing the page reconnects to live events. Sessions and running jobs are kept in memory, so they do not survive a server restart.

## Data and Credentials

Tabularis Web uses the same configuration and data folders as the desktop app for the account that runs it; see [Configuration](/wiki/configuration). Passwords, connection URIs, SSH passphrases and AI keys stay in the OS credential store, or in an encrypted file on machines without one (the default in containers); see [Security & Credentials](/wiki/security-credentials#encrypted-file-store). The browser never receives stored credentials: edit dialogs show that a value is stored, and leaving a field empty keeps it.

## Plugins

Database driver plugins still run as subprocesses of the Tabularis server over the same JSON-RPC protocol, so the browser never loads driver binaries or database credentials. A driver works when its release supports the server's operating system and architecture.

[UI extensions](/wiki/ui-extensions) use the same slots and `@tabularis/plugin-api` in the browser. An enabled extension runs as trusted code in the page, so install only plugins you trust.

## Supported Browsers

A current Chromium, Firefox or WebKit-based browser, with cookies, JavaScript and WebSockets enabled.
