---
title: "Your First Tabularis Driver in 20 Minutes: Google Sheets, Step by Step"
date: "2026-04-21T12:00:00"
tags: ["plugins", "tutorial", "google-sheets", "rust", "oauth", "extensibility"]
excerpt: "A hands-on walkthrough of @tabularis/create-plugin and @tabularis/plugin-api — from an empty directory to a working Google Sheets driver with OAuth, custom connection form, and sheets-as-SQL tables."
og:
  title: "Your First Driver"
  accent: "in 20 Minutes."
  claim: "A step-by-step tutorial: scaffold, wire, install — and end up with Google Sheets as a SQL database in Tabularis."
  image: "/img/tabularis-plugin-manager.png"
---

# Your First Tabularis Driver in 20 Minutes: Google Sheets, Step by Step

Tabularis' plugin system has had three missing pieces since [v0.9.0](/posts/plugin-ecosystem) launched it:

1. A **published npm package** with the plugin UI types — so authors stop copying type definitions from the host repo by hand.
2. A **scaffolder CLI** — so nobody has to write 33 JSON-RPC stubs, a cross-platform release workflow, and a manifest against a 230-line JSON schema from scratch.
3. An **actual tutorial** — not a reference; something you can follow top to bottom and end with a working driver.

The first two shipped as [`@tabularis/plugin-api`](https://www.npmjs.com/package/@tabularis/plugin-api) and [`@tabularis/create-plugin`](https://www.npmjs.com/package/@tabularis/create-plugin). This post is the third.

I wrote it while scaffolding a **Google Sheets** driver from zero, so every command is one I actually ran. The final plugin lives at [`tabularis-google-sheets-plugin`](https://github.com/TabularisDB/tabularis-google-sheets-plugin) — clone it if you want the finished state to diff against.

**What you'll end with:** Google Sheets shows up in Tabularis' driver picker. Authenticate once with OAuth. Paste a spreadsheet URL. Sidebar lists every tab as a table. Run `SELECT * FROM "Sheet1" LIMIT 5` and get rows.

---

## Why Google Sheets

Two reasons.

**It's not a database.** Real drivers don't wrap RDBMSs exclusively — a registry plugin can expose anything queryable as SQL. Hacker News ([posted here](/posts/hackernews-plugin)) exposes the HN Firebase API. A CSV-folder plugin exposes a directory. Google Sheets is another point on that axis: a row-oriented data source where each tab is a table and the first row is the header. No host, no port, no password — just OAuth.

**It exercises two UI extension slots.** The tutorial walks through both. Most plugins touch zero slots; some touch one. Two is the point at which the scaffolder's `--with-ui` defaults stop fitting and you learn how the IIFE loader actually works.

---

## 1. Scaffold

```bash
npm create @tabularis/plugin@latest -- \
  --db-type=api \
  --dir ~/Progetti/google-sheets \
  google-sheets
```

Three flags matter:

- **`--db-type=api`** — Google Sheets has no host/port/user/pass. The scaffolder sets `no_connection_required: true` in `manifest.json` and leaves the default ports null.
- **`--dir`** — scaffold outside your normal cwd so you can keep a "before/after" next to it.
- **`google-sheets`** — the plugin id. Used for the crate name, the binary, the manifest `id`, and the install path (`~/.local/share/tabularis/plugins/google-sheets/` on Linux).

Ten seconds later, `~/Progetti/google-sheets/` contains:

```
google-sheets/
├── Cargo.toml
├── manifest.json           # metadata + UI extensions + data types
├── justfile                # build / install / test recipes
├── rust-toolchain.toml
├── .github/workflows/release.yml    # 5-platform matrix for v* tags
└── src/
    ├── main.rs             # JSON-RPC stdin/stdout loop
    ├── rpc.rs              # dispatch → handlers/
    ├── handlers/{metadata,query,crud,ddl}.rs
    ├── utils/{identifiers,pagination}.rs    # tested helpers
    ├── client.rs           # scaffold leftover (delete later)
    ├── error.rs            # scaffold leftover
    ├── models.rs           # scaffold leftover
    └── bin/test_plugin.rs  # local REPL
```

Every handler returns something valid:

- Metadata methods return empty arrays — the plugin **loads** in Tabularis without errors.
- `test_connection` returns `{"success": true}` hard-coded — the driver **appears in the picker** immediately after `just dev-install`.
- Query/CRUD/DDL methods return `-32601 method not implemented` — you haven't implemented them yet, and the host surfaces a clean error rather than crashing.

This matters. A newcomer to any plugin system needs to see their driver in the UI before writing a single line of real logic. "Empty but alive" is the right default.

```bash
cd ~/Progetti/google-sheets
cargo check  # should be green in seconds
```

---

## 2. Declare the driver

Open `manifest.json`. The scaffold gives you the right structural defaults for `--db-type=api`. You need to add three things: the settings, the UI extensions, and the data types.

**Settings** — five fields the plugin persists across restarts. The user never edits these; the OAuth wizard (step 6) writes them:

```json
"settings": [
  { "key": "client_id",     "label": "OAuth Client ID",     "type": "string" },
  { "key": "client_secret", "label": "OAuth Client Secret", "type": "string" },
  { "key": "access_token",  "label": "Access Token",        "type": "string" },
  { "key": "refresh_token", "label": "Refresh Token",       "type": "string" },
  { "key": "token_expiry",  "label": "Token Expiry",        "type": "number" }
]
```

**UI extensions** — two slots. `module` paths point to the IIFE bundles Vite will produce in step 6:

```json
"ui_extensions": [
  { "slot": "settings.plugin.before_settings",
    "module": "ui/dist/google-auth.js", "order": 10 },
  { "slot": "connection-modal.connection_content",
    "module": "ui/dist/google-sheets-db-field.js", "order": 10,
    "driver": "google-sheets" }
]
```

`settings.plugin.before_settings` mounts a component **above** the settings form of this plugin — perfect for an OAuth setup wizard. `connection-modal.connection_content` replaces the default host/port/user/pass form in the "new connection" modal with a custom layout — we need this because a Google Sheets connection has **one field** (spreadsheet id or URL) and none of the usual ones.

**Data types** — the three Sheets uses. `infer_type` in `src/sheets.rs` will pick one of these per column when the user opens a table:

```json
"data_types": [
  { "name": "TEXT",    "category": "string",  "requires_length": false, "requires_precision": false },
  { "name": "INTEGER", "category": "numeric", "requires_length": false, "requires_precision": false },
  { "name": "REAL",    "category": "numeric", "requires_length": false, "requires_precision": false }
]
```

---

## 3. Three helper modules

Google Sheets is **an API call away** — the heavy lifting lives in three small Rust modules you drop into `src/`. They're not generated by the scaffolder because they're Sheets-specific; everything in `src/handlers/` routes through them.

**`src/auth.rs`** — a module-level `Mutex<AuthState>` holding OAuth tokens. Exposes `access_token(&client) -> Result<String>` that transparently refreshes via `https://oauth2.googleapis.com/token` if the cached token is expired. ~110 lines. The `initialize` RPC (step 5) pushes saved settings into this state.

**`src/sheets.rs`** — a blocking `reqwest` client for the Sheets REST API. The public surface is thin:

```rust
pub fn get_sheet_names(spreadsheet_id: &str) -> Result<Vec<String>>
pub fn get_sheet_data(spreadsheet_id: &str, sheet_name: &str) -> Result<(Vec<String>, Vec<Vec<Value>>)>
pub fn append_row(spreadsheet_id: &str, sheet_name: &str, row: Vec<String>) -> Result<()>
pub fn update_cell(spreadsheet_id: &str, sheet_name: &str, col: &str, row: usize, value: &str) -> Result<()>
pub fn delete_row(spreadsheet_id: &str, sheet_id: i64, row: usize) -> Result<()>
pub fn infer_type(values: &[Value]) -> &'static str    // TEXT | INTEGER | REAL
pub fn extract_spreadsheet_id(raw: &str) -> &str       // accepts full URL or bare id
```

Every call goes through `auth::access_token()`. No service accounts — OAuth2 desktop flow only. ~300 lines.

**`src/sql.rs`** — a regex-based parser for the subset of SQL the driver handles:

```rust
pub enum Query { Select(...), Insert(...), Update(...), Delete(...) }
pub fn parse(raw: &str) -> Result<Query>
pub fn eval_where(where_clause: &str, row: &HashMap<String, String>) -> bool
pub fn extract_row_num(where_clause: &str) -> Result<usize>  // for UPDATE/DELETE "WHERE _row = N"
```

**Don't write this by hand.** It supports `SELECT`, `INSERT`, `UPDATE WHERE _row = N`, `DELETE WHERE _row = N`, `COUNT(*)`, plus basic `WHERE` with `AND`/`LIKE`/`=`/`>`/etc. Nothing fancy. Copy from the [companion repo](https://github.com/TabularisDB/tabularis-google-sheets-plugin/blob/main/src/sql.rs) — it's 320 lines of compiled regexes and string slicing. Replace with [`sqlparser`](https://crates.io/crates/sqlparser) when you care about joins and subqueries.

Add the dependencies to `Cargo.toml`:

```toml
anyhow = "1"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", features = ["blocking", "json"] }
regex = "1"
```

And register the modules in `src/main.rs`:

```rust
mod auth;
mod handlers;
mod rpc;
mod sheets;
mod sql;
// ...plus the scaffold leftovers for now
```

:::newsletter:::

---

## 4. Metadata — make the sidebar come alive

`src/handlers/metadata.rs` starts with every method returning an empty array. Three of them need real data.

**`get_databases`** — one "database" per connection: the spreadsheet id extracted from the `database` field of the connection form. The host calls this when opening the connection picker — it drives what shows up in the sidebar as the top-level node.

```rust
pub fn get_databases(id: Value, params: &Value) -> Value {
    match spreadsheet_id(&id, params) {
        Ok(sid) => ok_response(id, json!([sid])),
        Err(resp) => resp,
    }
}
```

**`get_tables`** — each sheet tab becomes a table. `get_sheet_names` calls `GET /v4/spreadsheets/{id}`, reads `sheets[].properties.title`, returns a list.

```rust
pub fn get_tables(id: Value, params: &Value) -> Value {
    let sid = match spreadsheet_id(&id, params) { Ok(s) => s, Err(resp) => return resp };
    match get_sheet_names(&sid) {
        Ok(names) => {
            let tables: Vec<Value> = names.into_iter()
                .map(|n| json!({ "name": n, "schema": null, "comment": null }))
                .collect();
            ok_response(id, json!(tables))
        }
        Err(e) => error_response(id, -32000, &e.to_string()),
    }
}
```

**`get_columns`** — read row 1 as headers, sample rows 2..102, infer each column's type. Prepend a synthetic `_row INTEGER PRIMARY KEY` — this is what UPDATE/DELETE will `WHERE` on (the Sheets API indexes by position, there's no surrogate key).

Fill in `get_schema_snapshot` (for the ER diagram) and `get_all_columns_batch` (batch fetch at connection load) with the same pattern. Everything else (`get_foreign_keys`, `get_indexes`, `get_views`, routines) stays empty. Google Sheets has no such concepts; returning empty is the **correct** answer, not a stub.

**Checkpoint.** `cargo check`. If it compiles, the driver will light up the sidebar when installed. Save yourself some time and keep a second terminal open with `cargo check --all-targets` on `fswatch` — the scaffold's `rust-toolchain.toml` pins a stable channel so you won't hit nightly incompatibilities.

---

## 5. Initialize and execute

Two more handler files.

### `src/handlers/init.rs`

The scaffold's default `initialize` returns `null` — fine for simple plugins, not fine here. The host sends `params.settings` containing whatever we saved via the UI extension (client_id, tokens, etc.), and we need to push those into the `auth` module:

```rust
pub fn initialize(id: Value, params: &Value) -> Value {
    let settings = params.get("settings").cloned().unwrap_or(Value::Null);
    let mut state = auth().lock().unwrap();
    *state = AuthState::default();
    state.oauth_client_id     = string_setting(&settings, "client_id");
    state.oauth_client_secret = string_setting(&settings, "client_secret");
    state.oauth_access_token  = string_setting(&settings, "access_token");
    state.oauth_refresh_token = string_setting(&settings, "refresh_token");
    state.oauth_token_expiry  = settings.get("token_expiry").and_then(Value::as_u64);
    ok_response(id, Value::Null)
}
```

Register it in `src/handlers/mod.rs` (`pub mod init;`) and in `src/rpc.rs`:

```rust
"initialize" => handlers::init::initialize(id, &params),
```

### `src/handlers/query.rs`

Replace the scaffold's hard-coded `test_connection` with a real check, then implement `execute_query` by dispatching on the parsed query:

```rust
match parsed {
    Query::Select(sel) => run_select(id, &sid, sel, page, page_size, t0),
    Query::Insert(ins) => { /* fetch headers, build row in column order, sheets::append_row */ }
    Query::Update(upd) => { /* extract _row from WHERE, sheets::update_cell per SET entry */ }
    Query::Delete(del) => { /* extract _row from WHERE, sheets::delete_row */ }
}
```

`run_select` is the biggest function (~80 lines): fetches the sheet, prepends a synthetic `_row` column to every row, applies `sql::eval_where` in-memory, handles `COUNT(*)`, applies LIMIT/OFFSET, projects columns. Copy it from the [companion repo's `handlers/query.rs`](https://github.com/TabularisDB/tabularis-google-sheets-plugin/blob/main/src/handlers/query.rs).

Fill in `handlers/crud.rs` (insert/update/delete via `_row` primary key) and `handlers/ddl.rs` (`get_create_table_sql` reflects types inferred from row samples; every other DDL method returns `-32601` with a **clear** message like `"Google Sheets does not support indexes."` Users see these messages in the UI — ambiguity costs them a trip to GitHub issues).

**Checkpoint.**

```bash
cargo build --release
```

30–60 seconds. The binary is at `target/release/google-sheets-plugin`. It's ~3 MB thanks to the scaffold's `[profile.release]` with `lto`, `codegen-units = 1`, `strip = "symbols"`.

---

## 6. UI extensions, the typed way

Tabularis loads plugin UI as **IIFE bundles** — self-contained `.js` files assigning a React component to `__tabularis_plugin__`. You can hand-write raw IIFE and drop it in, or — the point of this whole exercise — you write TSX, Vite produces the IIFE, and the [`@tabularis/plugin-api`](https://www.npmjs.com/package/@tabularis/plugin-api) npm package gives you typed slot contracts and hook signatures.

The scaffold's `--with-ui` flag already wired this up for one slot (`data-grid.toolbar.actions`). We need two slots, so we replace the single-entry Vite config with two configs sharing the same externals and output directory.

### Workspace

```
ui/
├── package.json              # @tabularis/plugin-api + react + vite
├── tsconfig.json             # strict mode
├── vite.auth.config.ts       # entry: src/google-auth.tsx
├── vite.db-field.config.ts   # entry: src/google-sheets-db-field.tsx
└── src/
    ├── google-auth.tsx
    ├── google-sheets-db-field.tsx
    └── styles.ts             # shared CSSProperties objects
```

Each Vite config is a ~20-line `defineConfig` with `build.lib.entry` pointing at one TSX file, `formats: ["iife"]`, and the critical externals map:

```ts
rollupOptions: {
  external: ["react", "react/jsx-runtime", "@tabularis/plugin-api"],
  output: {
    globals: {
      react: "React",
      "react/jsx-runtime": "ReactJSXRuntime",
      "@tabularis/plugin-api": "__TABULARIS_API__",
    },
  },
},
```

That's the whole protocol contract: **the host injects the globals, the bundle consumes them**. No React gets shipped twice.

### The connection form (`src/google-sheets-db-field.tsx`)

Slot: `connection-modal.connection_content`. When the user picks "Google Sheets" as the driver in the new-connection modal, the host renders this component **in place of** the usual host/port/user/pass grid. One labeled text input for the spreadsheet ID or URL.

```tsx
import { defineSlot, type TypedSlotProps } from "@tabularis/plugin-api";
import { PLUGIN_ID } from "./styles";

// plugin-api v0.1.0 types this slot's context as { driver: string }, but the
// host also passes `database` and `onDatabaseChange`. Augment locally until
// the next plugin-api release tightens the shape.
type FieldContext =
  TypedSlotProps<"connection-modal.connection_content">["context"]
  & { database?: string; onDatabaseChange?: (value: string) => void };

const GoogleSheetsDatabaseField = defineSlot(
  "connection-modal.connection_content",
  ({ context }) => {
    const c = context as FieldContext;
    if (c.driver !== PLUGIN_ID) return null;  // don't render for other drivers

    return (
      <div>
        <label>Spreadsheet ID or URL</label>
        <input
          type="text"
          value={c.database ?? ""}
          onChange={e => c.onDatabaseChange?.(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/…"
        />
      </div>
    );
  },
);

export default GoogleSheetsDatabaseField.component;
```

`defineSlot` is what the package brings. It wraps your component in a tagged `{ __slot, component }` and — more importantly — **types `context` per slot**. If you wrote `context.tableName` here, TypeScript would refuse to compile: that field exists on `data-grid.toolbar.actions`, not here. The `as FieldContext` cast is only needed because this one slot's types are temporarily too narrow.

`default export` must be the component itself (`.component`) — the host loader reads that off the IIFE return value.

### The OAuth wizard (`src/google-auth.tsx`)

Slot: `settings.plugin.before_settings`. Renders in the plugin's row in Settings. Click "Connect with Google" → a two-step modal wizard handles the OAuth dance.

Three plugin-api hooks do the heavy lifting:

```tsx
const { getSetting, setSetting, setSettings } = usePluginSetting(PLUGIN_ID);
const { openModal, closeModal }               = usePluginModal();
// plus the standalone `openUrl` helper
```

- **`usePluginSetting(PLUGIN_ID)`** — typed `getSetting<T>`, `setSetting`, `setSettings` for the five OAuth fields from the manifest. Persists across restarts; the Rust side reads the same keys on `initialize`.
- **`usePluginModal()`** — host-managed modal. Pass it a React element as `content` and it portals to `document.body`. We use it for the wizard's two steps (credentials → paste redirect URL).
- **`openUrl(url)`** — `window.open` does not open external URLs in a Tauri webview. `openUrl` routes through `@tauri-apps/plugin-opener` and launches the system browser. Always use this for external URLs in plugins.

Slot component outline:

```tsx
const GoogleSheetsOAuth = defineSlot(
  "settings.plugin.before_settings",
  ({ context }) => {
    if (context.targetPluginId !== PLUGIN_ID) return null;  // typed!
    const { getSetting, setSetting, setSettings } = usePluginSetting(PLUGIN_ID);
    const { openModal, closeModal } = usePluginModal();

    const isConnected = !!(getSetting("refresh_token") || getSetting("access_token"));

    return (
      <div className="google-account-panel">
        <Header connected={isConnected} />
        {isConnected
          ? <ConnectedActions onReauth={/* openModal(...) */} onDisconnect={/* setSettings(...) */} />
          : <ConnectButton onClick={/* openModal(...) */} />}
      </div>
    );
  },
);
export default GoogleSheetsOAuth.component;
```

Inside the wizard, the exchange is plain `fetch`:

```tsx
async function exchangeCode(clientId, clientSecret, code) {
  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: "http://127.0.0.1",
    grant_type: "authorization_code",
  });
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}
```

Complete file (~330 lines with the full wizard UI and styling) at [`ui/src/google-auth.tsx`](https://github.com/TabularisDB/tabularis-google-sheets-plugin/blob/main/ui/src/google-auth.tsx).

### Build

```bash
cd ui
pnpm install
pnpm run typecheck    # strict mode catches slot/context mismatches at build time
pnpm run build        # → dist/google-auth.js (≈8.5 KB) + dist/google-sheets-db-field.js (≈1.2 KB)
```

Gzipped, the two bundles add up to ~4 KB — because React and `@tabularis/plugin-api` are externalised, not bundled.

---

## 7. Install and demo

With `just` (one command builds Rust + UI, copies everything):

```bash
just dev-install
```

Without `just`:

```bash
cargo build --release
pnpm --dir ui install && pnpm --dir ui build

PLUGIN_DIR="$HOME/.local/share/tabularis/plugins/google-sheets"
mkdir -p "$PLUGIN_DIR/ui/dist"
cp target/release/google-sheets-plugin "$PLUGIN_DIR/"
cp manifest.json "$PLUGIN_DIR/"
cp ui/dist/*.js "$PLUGIN_DIR/ui/dist/"
```

Restart Tabularis (or toggle the plugin in **Settings → Plugins** if it was already enabled). Then:

1. **Settings → Plugins → Google Sheets → gear icon.** The OAuth wizard renders above the settings form thanks to `settings.plugin.before_settings`.
2. Paste Client ID + Client Secret from Google Cloud Console. Click **Open Authorization Page →**. Grant access in the browser, copy the redirect URL, paste it back, click **Save Token**.
3. **New Connection → Driver: Google Sheets.** The whole form collapses to a single "Spreadsheet ID or URL" input thanks to `connection-modal.connection_content`. Paste a spreadsheet URL.
4. **Connect.** The sidebar lists every tab as a table. Click one: row 1 becomes the column header, rows 2..N the data.
5. Try it in the editor: `SELECT * FROM "Sheet1" LIMIT 5`.

That's the full loop.

:::contributors:::

---

## What this tutorial cut

The 20-minute budget was honest. These each deserve their own post:

- **Row-level editing in the data grid.** The `crud.rs` handlers are implemented but not demoed — once `capabilities.readonly` is `false` the Tabularis grid offers inline row editing via the `_row` primary key.
- **Deep dive on `@tabularis/plugin-api`.** The tutorial uses `defineSlot`, `usePluginSetting`, `usePluginModal`, and `openUrl`. The package also ships `usePluginQuery`, `usePluginToast`, `usePluginTranslation`, `usePluginTheme`, `usePluginConnection`, and version-compatibility helpers — all typed, all worth a separate post.
- **Release packaging.** The scaffold's `.github/workflows/release.yml` builds for 5 platforms on every `v*` tag and uploads zipped artifacts ready for the [registry](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json).
- **A real SQL parser.** The 320-line regex parser handles Sheets' needs; it won't handle joins, CTEs, or window functions. Swap in [`sqlparser`](https://crates.io/crates/sqlparser) when your driver grows up.

---

## Where to go next

- **[`plugins/PLUGIN_TUTORIAL.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_TUTORIAL.md)** — the canonical, repo-versioned copy of the walkthrough above.
- **[`plugins/PLUGIN_GUIDE.md`](https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md)** — the complete reference. Every RPC method, every manifest field, every UI slot, every capability flag.
- **[`@tabularis/plugin-api`](https://www.npmjs.com/package/@tabularis/plugin-api)** — TypeScript types for slot contexts and host hooks.
- **[`@tabularis/create-plugin`](https://www.npmjs.com/package/@tabularis/create-plugin)** — scaffolder CLI source and flags.
- **[`tabularis-google-sheets-plugin`](https://github.com/TabularisDB/tabularis-google-sheets-plugin)** — the finished plugin from this tutorial. Clone it for the full working state.
- **[Plugin registry](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json)** — eight community drivers with eight different shapes worth copying from.

The promise from [v0.9.0](/posts/plugin-ecosystem) was that adding a database to Tabularis should not require a patch to the core app. With the scaffolder and the plugin-api package, it now takes about twenty minutes.

Write one. It's faster than you think.
