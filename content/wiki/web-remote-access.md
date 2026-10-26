---
title: "Remote Access & Reverse Proxy"
order: 3
excerpt: "Expose Tabularis Web beyond localhost safely: HTTPS reverse proxy, password or proxy authentication, allowed origins and the high-risk policy."
category: "Self-Hosting"
---

Remote access to [Tabularis Web](/wiki/web-mode) exposes database administration, stored credentials, tunnels, plugins and AI providers. It is therefore disabled until an authentication mode, a public HTTPS URL and an allowlist of origins are configured: binding to a non-loopback address without them fails at startup.

For the official image, Docker Compose and the Helm chart, see [Docker & Helm](/wiki/docker-helm). The rules on this page apply to containers too.

## Deployment Boundary

Tabularis serves plain HTTP and does not terminate TLS itself. A remote deployment must:

1. Put the Tabularis listener behind a trusted reverse proxy that terminates TLS.
2. Keep the listener unreachable from client networks (firewall rules, a private network or a Kubernetes NetworkPolicy). A public HTTPS URL does not stop direct HTTP access to the listener.
3. Preserve the public `Host` header.
4. Proxy WebSocket upgrades.

Run the server under a dedicated account and restrict its data directory.

## Choose an Authentication Mode

| Mode | Option | Secret | Use it when |
| :--- | :--- | :--- | :--- |
| **Password** | `--auth password` | `TABULARIS_WEB_PASSWORD`, at least 12 characters | A built-in login page is enough |
| **Proxy** | `--auth proxy` | `TABULARIS_WEB_PROXY_SECRET`, at least 32 characters | Your proxy already authenticates users (OIDC, SSO, basic auth) |

Pass secrets through the environment, never on the command line, where they show up in process listings.

### Password Mode

```bash
export TABULARIS_WEB_PASSWORD='replace-with-a-long-unique-password'

tabularis web \
  --host 127.0.0.1 \
  --port 8080 \
  --no-open \
  --auth password \
  --public-url https://tabularis.example.com \
  --allowed-origin https://tabularis.example.com
```

The server shows a minimal `/login` page and exchanges a valid password for a `Secure`, `HttpOnly`, `SameSite=Strict` session cookie. It keeps only a hash of the password in memory.

Five failed attempts from one client within a minute lock that client out for five minutes (HTTP 429); other clients can still sign in. To identify clients behind your proxy, list the proxy's address with `--trusted-proxy`, for example `--trusted-proxy 127.0.0.1/32`, and have the proxy append `X-Forwarded-For` (Nginx `$proxy_add_x_forwarded_for`). Without it, forwarded headers are ignored. Trust only proxy addresses, never client networks.

### Proxy Mode

```bash
export TABULARIS_WEB_PROXY_SECRET="$(openssl rand -base64 48)"

tabularis web \
  --host 127.0.0.1 \
  --port 8080 \
  --no-open \
  --auth proxy \
  --public-url https://tabularis.example.com \
  --allowed-origin https://tabularis.example.com
```

After authenticating the user, the proxy must **replace** (not append) two request headers:

- `X-Tabularis-User`: the authenticated, non-empty user identifier;
- `X-Tabularis-Proxy-Secret`: the same secret as `TABULARIS_WEB_PROXY_SECRET`.

Tabularis removes both headers before handling the request and rejects requests where they are missing or wrong. Never expose the listener directly: a client that bypasses the proxy could send these headers itself.

Example Nginx location, after your own `auth_request`, OIDC or basic-auth configuration:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;

    proxy_set_header Host $http_host;
    proxy_set_header X-Tabularis-User $remote_user;
    proxy_set_header X-Tabularis-Proxy-Secret "replace-with-the-environment-secret";

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Keep the proxy secret in the proxy's protected secret store rather than in a world-readable configuration file.

## Public URL and Allowed Origins

`--public-url` and every `--allowed-origin` must be an HTTPS origin with no path, query, fragment or credentials, and the public URL must also be in the allowlist. The only exception is a loopback host (`localhost`, `127.0.0.0/8`, `[::1]`), which may use HTTP because the traffic never leaves the machine.

Requests with an unexpected `Host` or `Origin` get HTTP 403, and state-changing requests also need the session's CSRF token. Add further origins only if the same owner controls them:

```bash
--public-url https://tabularis.example.com \
--allowed-origin https://tabularis.example.com \
--allowed-origin https://admin.example.com
```

## What Remote Sessions Can Do

Remote sessions are limited to database work by default: connections, metadata, queries, data editing and notebooks. Denied operations return HTTP 403.

- A remote session can edit a saved connection's metadata and credentials, but changing its driver, destination, or transport and authentication settings needs administrator rights. Stored credentials stay bound to the target an administrator approved.
- File-based drivers, including SQLite, need administrator rights, because SQL itself can open other files (for example with `ATTACH`).

These groups stay denied unless you start the server with `--allow-high-risk`:

- SSH and Kubernetes tunnels;
- AI provider keys, generation, approvals and activity exports;
- credential import and export, backups, dumps and sensitive file operations;
- plugin installation and lifecycle;
- logs, task management, global settings and host filesystem actions.

MCP configuration stays unavailable to remote sessions even with that option.

> Enable `--allow-high-risk` only for a deployment used by a single trusted administrator, never for a shared or weakly authenticated one.

## Sessions and Audit Logs

- Sessions last eight hours, live in memory and end on logout. The server accepts at most 1,024 live sessions; beyond that, new logins get HTTP 503 while existing sessions keep working.
- Security events (sign-ins, denials, rate limiting, rejected hosts or origins, logouts and completed commands) are logged to stderr under the `tabularis::web_audit` target, with a request ID and an opaque session ID. They never include passwords, proxy secrets, access tokens, request bodies, SQL text or results.

## systemd Example

Run the packaged binary as a dedicated account, behind the TLS reverse proxy. Create `/etc/tabularis/web.env`, owned by `root:tabularis` with mode `0640`:

```ini
TABULARIS_WEB_PASSWORD=replace-with-a-long-unique-password
```

Then `/etc/systemd/system/tabularis-web.service`:

```ini
[Unit]
Description=Tabularis Web
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tabularis
Group=tabularis
EnvironmentFile=/etc/tabularis/web.env
Environment=HOME=/var/lib/tabularis
StateDirectory=tabularis
UMask=0077
ExecStart=/usr/bin/tabularis web --host 127.0.0.1 --port 8080 --no-open --auth password --public-url https://tabularis.example.com --allowed-origin https://tabularis.example.com
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6

[Install]
WantedBy=multi-user.target
```

A headless service has no desktop keychain: give it a working keyring backend, or set `TABULARIS_SECRET_STORE=file`; see [Security & Credentials](/wiki/security-credentials#encrypted-file-store).

## Verification Checklist

1. The upstream port is unreachable from a client network.
2. HTTP redirects to HTTPS at the proxy, and the browser receives a `Secure` session cookie.
3. An unlisted `Origin` and a wrong `Host` get HTTP 403.
4. Repeated invalid credentials end in HTTP 429.
5. A default remote session gets HTTP 403 for an administrator-only action.
6. Live progress and events reconnect through the proxy.
7. Audit logs show request and session IDs but no secrets or SQL.
