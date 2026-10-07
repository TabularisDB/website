---
title: "Technical Architecture"
order: 10
excerpt: "A deep dive into the Tabularis core: Tauri, Rust drivers, and the React frontend bridge."
category: "Reference"
---

Tabularis represents a modern approach to desktop application development, moving away from resource-heavy Electron in favor of the **Tauri** framework. It bridges the performance and memory safety of **Rust** with the component-driven UI capabilities of **React**.

## The Tauri IPC Bridge

In Tabularis, the UI runs in a secure, isolated WebView, while all database connections, file I/O, and secure storage happen in the Rust backend. Communication between the two layers happens via Tauri's Asynchronous Inter-Process Communication (IPC) system, specifically through `invoke` commands.

```typescript
// Frontend (React)
const result = await invoke<QueryResult>("execute_query", {
    connectionId: "conn-123",
    query: "SELECT * FROM users",
    limit: 500,
    page: 1,
});
```
```rust
// Backend (Rust)
#[tauri::command]
pub async fn execute_query<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, QueryCancellationState>,
    connection_id: String,
    query: String,
    limit: Option<u32>,      // page size
    page: Option<u32>,
    schema: Option<String>,
    session_id: Option<String>, // pins a tab to one pooled connection
) -> Result<QueryResult, String> {
    // Rust resolves the driver, runs the query, and returns a paginated result
}
```

## Core Rust Components

### 1. Unified Driver Trait
To support diverse database engines, Tabularis implements a strict trait (`DatabaseDriver`) in Rust. This ensures that the frontend React code does not need to know the specifics of PostgreSQL vs MySQL dialects when requesting schemas.
- **Native Drivers**: Asynchronous, connection-pooled access to MySQL and SQLite through the `sqlx` crate, and to PostgreSQL through `tokio-postgres` with a `deadpool-postgres` pool.
- **JSON-RPC Drivers**: For plugins, the Rust backend spawns child processes and implements the `DatabaseDriver` trait by proxying method calls to the plugin via stdin/stdout.

### 2. Connection State & Concurrency
Connection pools are managed using `tokio` and thread-safe static globals. Each driver (PostgreSQL, MySQL, SQLite) has its own pool map:
```rust
// Three separate static globals, one per driver (RwLock is tokio::sync::RwLock)
type PoolMap<T> = Arc<RwLock<HashMap<String, Pool<T>>>>;          // sqlx pools
type PgPoolMap  = Arc<RwLock<HashMap<String, deadpool_postgres::Pool>>>;

static MYSQL_POOLS:    Lazy<PoolMap<MySql>>  = ...;
static POSTGRES_POOLS: Lazy<PgPoolMap>       = ...;
static SQLITE_POOLS:   Lazy<PoolMap<Sqlite>> = ...;
```
Using `RwLock` allows multiple concurrent readers while ensuring exclusive access for writes, so the UI remains responsive while connections are being established or closed.

### 3. Paginated Query Results
When a query returns 100,000 rows, Tabularis doesn't attempt to load everything at once. The Rust backend executes queries with `LIMIT`/`OFFSET` pagination and returns one page at a time across the IPC bridge. The Data Grid fetches the next page on demand, keeping memory usage flat and the UI always responsive.

## Frontend Architecture

- **React 19 & Vite**: Fast HMR during development and optimized, minified builds for production.
- **React Context & Hooks**: Global state management (active tabs, theme, UI state) is handled via React's built-in Context API and custom hooks.
- **Tailwind CSS & Vanilla CSS Variables**: The theming engine is built entirely on native CSS variables, allowing dynamic theme swapping without React re-renders.
- **Monaco & Web Workers**: The SQL Editor parsing logic is offloaded to Web Workers, preventing typing latency on the main UI thread.

## Security Model & Process Isolation
- **Plugin driver processes**: The database side of an external plugin runs as a separate OS process. A memory leak or panic in a community driver crashes the plugin process; Tabularis detects the closed stdout, logs the failure and keeps the main application running.
- **Plugin code in the WebView**: Plugin UI extensions and EXPLAIN parser bundles are JavaScript that runs inside the main WebView (loaded with `new Function`), not in a separate process. The app does not set a Content Security Policy (`csp` is `null` in `tauri.conf.json`), so only install plugins you trust.
