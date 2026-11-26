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

Tabularis removes both headers before handling the request and rejects requests where they are missing or wrong. Since v0.34.0 this holds for every protected HTTP request and WebSocket upgrade, including those that already carry a valid session cookie, so a cookie alone no longer gets past a request that did not come through the proxy. A correct request reuses its session; it does not create or extend one. Never expose the listener directly: a client that bypasses the proxy could send these headers itself.

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

## Serving Under a Sub-Path

Since v0.34.0 the mount path is a runtime option. Start the server with `--base-path`, and the same build serves at `/`, `/tools/database/` or any other path:

```bash
tabularis web --no-open --auth password \
  --public-url https://tabularis.example.com \
  --allowed-origin https://tabularis.example.com \
  --base-path /tools/database/
```

The path must be a local absolute path. A missing trailing slash is added; origins, empty or dot segments, backslashes, percent encodings, query strings, fragments and non-ASCII characters fail at startup. No request header, query parameter or forwarded prefix can change it. It is not part of the origin: keep `--public-url` / `TABULARIS_PUBLIC_URL` and every `--allowed-origin` without a path.

The server writes the path into the page it serves, and the router, static assets, HTTP API, WebSocket events, transfers, plugin assets, connection icons and browser windows use it. The server also scopes its session and logout cookies, the login form, error-page retries and redirects to the path, so the built-in password page works under a sub-path without rewrites at the proxy, and proxy mode works as before. Pages and login responses are sent with `Cache-Control: no-store`, so the page of one mount path is never served from cache for another.

The server still answers at `/`. The reverse proxy must strip the prefix, preserve the public `Host` and `Origin`, forward WebSocket upgrades, and redirect `/tools/database` to `/tools/database/`. With Apache:

```apache
ProxyPreserveHost On
ProxyPass /tools/database/ http://127.0.0.1:8080/ upgrade=websocket
ProxyPassReverse /tools/database/ http://127.0.0.1:8080/
```

### Build-Time `TABULARIS_BASE_PATH`

The build-time setting from v0.33.0 is still supported:

```bash
TABULARIS_BASE_PATH=/tools/database/ pnpm build
# or a custom image
docker build -f docker/Dockerfile --build-arg TABULARIS_BASE_PATH=/tools/database/ -t tabularis:custom-path .
```

A frontend built this way records its prefix, which the server uses when `--base-path` is omitted; a different `--base-path` fails at startup. A frontend built for `/` accepts any runtime path, but one built before v0.34.0 cannot use a non-root `--base-path` until it is rebuilt. When you move to `--base-path`, remove the cookie-path, `Location` and login-page rewrites that the build-time setting needed in password mode, because applying them twice produces wrong paths. Never mix a server and a frontend from different releases. The repository's [`docs/web/WEB_BASE_PATH.md`](https://github.com/TabularisDB/tabularis/blob/main/docs/web/WEB_BASE_PATH.md) has the Apache configurations for both setups.

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

## Managed Connections

`--connection-mode managed-only` puts an instance's connections under the administrator's control; since v0.34.0 the server and the Web UI enforce it. Browser users can open them and query within the database account's privileges, but cannot create, edit, delete, duplicate, import, export or test connections, change the databases a connection targets, point it at another destination, or read stored credentials. The server rejects these requests before reading their payload, with HTTP 403 and the code `managed_connection_denied`. The Connections page hides the actions and shows a notice that the connections are managed, and the SSH, Backup and Credential Profiles settings tabs are hidden. Without the option (or with `--connection-mode standalone`) nothing changes, and the desktop app is not affected.

```bash
tabularis web --no-open --auth password \
  --public-url https://tabularis.example.com \
  --allowed-origin https://tabularis.example.com \
  --connection-mode managed-only
```

> Every authenticated user of an instance shares all of its managed connections. There are no per-user grants and no multi-tenant isolation: run a separate instance for each group of users that needs different access.

- The server refuses to start without `--auth`, together with `--allow-high-risk`, or when a stored credential is shorter than four characters.
- `--managed-allow-branding` lets users change connection colors and icons, and `--managed-allow-organization` groups and tags. Both are stored in the instance's connections file, so a change applies to every user.
- Connection responses never include passwords, connection URIs, SSH or proxy credentials, or plugin secrets, and error messages and live events are scrubbed of stored credentials. A credential rotated while the instance runs can appear in an event for up to 30 seconds. Query results are not scrubbed.
- Importing a connections file cannot mark a connection as managed.

Prepare the connections before starting the instance, for example by running it once without the option, or maintain them with the provisioning API.

### Provisioning API

Since v0.34.0 an opt-in machine API manages the connections of a managed instance while it runs. It is enabled by `TABULARIS_PROVISIONING_TOKEN` or `TABULARIS_PROVISIONING_TOKEN_FILE` (never both), a random token of at least 32 non-whitespace bytes, and needs `--connection-mode managed-only` without the branding and organization switches; otherwise the server does not start. Only `Authorization: Bearer <token>` authorizes it. Cookies, CSRF tokens and proxy user headers do not, a request carrying an `Origin` header is rejected, and the token does not authorize browser requests. Keep it out of browsers and URLs, and restrict the endpoints at the gateway as well.

| Request | Effect |
| :--- | :--- |
| `PUT /api/v1/provisioning/connections/{external_ref}` | Create or replace a connection; retries are idempotent |
| `GET /api/v1/provisioning/connections` | List provisioned connections (metadata only) |
| `GET /api/v1/provisioning/connections/{external_ref}` | Read one connection's metadata |
| `DELETE /api/v1/provisioning/connections/{external_ref}` | Remove it; retries also return 204 |

The reference is 1–128 ASCII letters, digits, underscores or hyphens, and the connection id is always `provisioned-<external_ref>`. The PUT body has a `name`, the connection `params` with `driver` set to `postgres`, `mysql` or an installed plugin driver's id, and optional `plugin_secret_changes`. Responses carry only `id`, `external_ref`, `name`, `driver` and `managed`, never parameters or credentials; an omitted password keeps the stored one. PUT does not test the connection. Updates and deletes take effect without a restart: pools, cached credentials and sessions of that connection are released, but queries admitted earlier may finish, so revoke the database account too when access must end at once. Request bodies are limited to 1 MiB. The full contract, including error codes, is in [`docs/web/WEB_PROVISIONING.md`](https://github.com/TabularisDB/tabularis/blob/main/docs/web/WEB_PROVISIONING.md).

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
