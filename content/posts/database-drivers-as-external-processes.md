---
title: "Database drivers as external processes"
date: "2026-06-24T09:00:00"
authors: ["debba"]
tags: ["plugins", "rust", "architecture", "tokio", "json-rpc", "ipc"]
excerpt: "About three months ago I added support for plugin drivers outside the Tabularis process. External drivers are ordinary programs speaking JSON-RPC over stdin/stdout. This is a retrospective on why that design held up, where it leaked, and the credential bug hidden in a HashMap insert."
og:
  template: "code-terminal"
  title: "Database drivers"
  accent: "as external processes."
  claim: "Every plugin driver is an ordinary process. Tabularis sends JSON-RPC requests on stdin and reads responses on stdout."
  image: "/img/tabularis-plugin-manager.png"
  codeTitle: "tabularis · csv-driver"
  codeLines:
    - '# one process per driver, over a pipe'
    - ''
    - '> {"method":"get_tables",'
    - '  "params":{"db":"sales"},"id":7}'
    - ''
    - '< {"result":["users","orders"],'
    - '  "id":7}'
---

# Database drivers as external processes

About three months ago I added external database drivers to Tabularis. Not dynamic libraries, not WebAssembly modules: ordinary processes that speak JSON-RPC over stdin/stdout.

Enough time has passed for the design to be less theoretical. It has survived real drivers, timeouts, a headless server mode, and one security bug that was hiding in what looked like normal registry code. So this is not a launch post. It is a short retrospective on the shape of the implementation and the places where the shape mattered.

Tabularis still has three database drivers compiled into the application: MySQL, PostgreSQL and SQLite. They use `sqlx`, implement the same Rust trait, and ship with the binary. This is the comfortable case.

The interesting case is the fourth database.

There are many databases I will never run myself, and a few I have not heard of yet. Compiling a client library for each of them into the core binary is not realistic. It also feels wrong: a database GUI should not have every possible vendor SDK, Python runtime, OAuth stack, TLS oddity and transitive dependency in the same address space as the rest of the application.

Still, "it does not support the database I use at work" is a valid reason to close a database GUI and never open it again. So Tabularis needed plugins.

That sounds like a solved problem until you ask what a plugin is, exactly, for a Rust desktop application. In practice I saw three choices: load a dynamic library, run WebAssembly, or start another process. The implementation that shipped chose the least clever one.

## The two options I didn't take

**Dynamic libraries.** Load a `.so`, `.dylib` or `.dll`, find a symbol, call into it. This is the traditional native plugin model, and on paper it is the fastest one. A query method becomes a function call.

There are two problems with it here.

The first one is Rust. Rust does not have a stable ABI, so a plugin compiled with one toolchain cannot safely pass a `String`, `Vec` or trait object to a host compiled with another one. In practice a Rust plugin ABI becomes an `extern "C"` interface: raw pointers, owned buffers, explicit frees, error codes, and a driver author thinking about FFI before thinking about the database.

The second problem is more important. A dynamic library lives in the host process. If the driver segfaults, Tabularis segfaults. If it corrupts memory, the crash can surface later in unrelated code. If a panic crosses an FFI boundary incorrectly, the behavior is not something I want in user crash reports. The fastest plugin boundary is also the boundary with the worst failure mode.

**WebAssembly.** WASM is attractive for the opposite reason. It gives a real memory sandbox, and if the main problem was running hostile code, it would be the first thing to evaluate seriously.

But a database driver is mostly I/O. It opens sockets, negotiates TLS, speaks a binary protocol, and often wants to reuse a vendor SDK or a mature client library that already exists in some language. For this use case WASM does not just sandbox the driver; it removes a lot of the ecosystem the driver author would naturally want to use.

I am not saying WASM is a bad plugin technology. It is probably the right answer for many plugin systems. But for database drivers, the practical constraint is not CPU isolation. The practical constraint is: can somebody write a driver quickly, using the tools that already speak to that database? If the answer is no, the plugin system will be beautiful and mostly empty.

## The boring option

A Tabularis plugin driver is a separate program. It reads requests on stdin, writes responses on stdout, and exits when the host is done with it.

This idea is old enough to be boring. Language servers work like this. Unix tools work like this. CGI worked like this. The reason this shape keeps coming back is that it gives a useful amount of isolation without inventing much:

- The driver can be written in any language. Rust, Python, Go, Java, a shell script if that is really what the database deserves. If it can read a line and print a line, it can be a driver.
- If the driver crashes, the host sees EOF on a pipe. That is a normal error path, not memory corruption in the GUI process.
- The driver brings its own dependencies. The CSV driver is Python. The Google Sheets driver is Rust with an OAuth dependency I do not want in the core application. Both are fine because neither one is linked into Tabularis.

The cost is serialization. Every call is encoded, written through a pipe, read on the other side, decoded, and then the response takes the same trip back.

For a database client, this is a good trade. The thing behind the driver is usually a database server over the network, or at least disk. A bit of JSON framing is not where the time goes. When it does matter, the answer is usually to page or stream the result set, not to put a third-party driver into the main process.

## The wire

The protocol is JSON-RPC 2.0, one message per line. The whole definition lives in [`src-tauri/src/plugins/rpc.rs`](https://github.com/TabularisDB/tabularis/blob/main/src-tauri/src/plugins/rpc.rs), and it is small enough to show:

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: Value,
    pub id: u64,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum JsonRpcResponse {
    Success { jsonrpc: String, result: Value, id: u64 },
    Error   { jsonrpc: String, error: JsonRpcError, id: u64 },
}
```

Line-delimited JSON is intentionally unsophisticated. I could have used `Content-Length` framing like LSP does. Instead a Python driver can do this:

```python
for line in sys.stdin:
    request = json.loads(line)
```

and be done with framing. A JSON serializer escapes newlines inside strings, so a physical newline is a message boundary. This is not the most general protocol in the world. It is the one that makes the first driver take an afternoon instead of a week.

One detail that paid for itself: the child's stderr is inherited, not piped. Driver logs and panics go to the same console as the app logs. I did not build a logging protocol because the operating system already had a useful one.

The method surface is the database trait flattened into strings: `test_connection`, `get_databases`, `get_tables`, `execute_query`, `insert_record`, `get_create_index_sql`, and so on. There are a bit more than thirty methods. The scaffolder generates stubs for all of them, so a driver author fills in behavior rather than copying protocol boilerplate.

At the boundary, `params` and `result` are `serde_json::Value`. Immediately above the boundary they become real types again. This is important: dynamic data at the process boundary is fine; dynamic data spread through the application would not be.

:::newsletter:::

## The part that is actually hard

The phrase "JSON-RPC over stdin/stdout" hides the annoying part: there are two byte streams and many callers.

When a connection opens, the sidebar may ask for schema information while the grid asks for the first page of rows and a background task pings the driver to see if the connection is still alive. Those calls are concurrent. The child process, however, has one stdin and one stdout.

So two things must be true:

- Writes must be serialized. Even if small pipe writes often appear atomic, relying on that would make the protocol depend on an implementation detail.
- Responses must be routed by id. The fast schema request can finish after the slow row request or before it. Order is not a contract.

The way to get both properties is to stop letting callers touch the pipes. One Tokio task owns the child process. Everyone else sends that task a command and waits on a one-shot channel.

The caller side looks like this:

```rust
enum PluginCommand {
    /// Dispatch a request; route the response back via the sender.
    Call(JsonRpcRequest, oneshot::Sender<Result<Value, String>>),
    /// Drop the pending entry for `id` because the caller stopped waiting.
    Cancel(u64),
}
```

The owner holds the only `stdin`, the only `stdout`, and the map of outstanding requests. It waits for three things: a shutdown signal, the next command from the application, or the next line from the plugin.

```rust
let mut pending: HashMap<u64, oneshot::Sender<Result<Value, String>>> = HashMap::new();

loop {
    tokio::select! {
        _ = &mut shutdown_rx => { let _ = child.kill().await; break; }

        msg = rx.recv() => match msg {
            Some(PluginCommand::Call(req, resp_tx)) => {
                pending.insert(req.id, resp_tx);          // remember who's waiting
                let mut line = serde_json::to_string(&req).unwrap();
                line.push('\n');
                stdin.write_all(line.as_bytes()).await?;  // serialized: only this task writes
            }
            Some(PluginCommand::Cancel(id)) => { pending.remove(&id); }
            None => { let _ = child.kill().await; break; } // all callers gone
        },

        line = reader.read_line(&mut buf) => match line {
            Ok(0) => break,                                // EOF: the plugin died
            Ok(_) => {
                match serde_json::from_str::<JsonRpcResponse>(&buf) {
                    Ok(JsonRpcResponse::Success { result, id, .. }) => {
                        if let Some(tx) = pending.remove(&id) { let _ = tx.send(Ok(result)); }
                    }
                    Ok(JsonRpcResponse::Error { error, id, .. }) => {
                        if let Some(tx) = pending.remove(&id) { let _ = tx.send(Err(error.message)); }
                    }
                    Err(e) => log::error!("bad response from plugin: {e}"),
                }
                buf.clear();
            }
            Err(e) => { log::error!("read error: {e}"); break; }
        },
    }
}
```

This is the `PluginProcess` management task in [`src-tauri/src/plugins/driver.rs`](https://github.com/TabularisDB/tabularis/blob/main/src-tauri/src/plugins/driver.rs). The request `id` is a monotonic counter. Responses can arrive in any order, because each one finds its waiting caller through `pending`. Writes are serialized because there is exactly one writer.

The external shape is concurrent. The internal shape is a single owner of a resource that should not be shared. That is the main trick.

A call becomes:

```rust
let (tx, rx) = oneshot::channel();
self.sender.send(PluginCommand::Call(req, tx)).await?;
match tokio::time::timeout(PLUGIN_CALL_TIMEOUT, rx).await {
    Ok(Ok(result)) => result,
    Ok(Err(_))     => Err("plugin did not respond".into()),
    Err(_)         => { /* timed out */ }
}
```

At this point the design looks clean. In my experience, that is a good time to look for the state the code forgot to model.

## Two bugs that showed up

The actor loop was the right abstraction, but two bugs fell directly out of its shape during the first rounds of testing.

**The leak.** A caller waits at most 120 seconds for a reply. If the plugin is slow or wedged, the caller gives up and returns an error.

But the owner still has an entry in `pending`. It contains a `oneshot::Sender` whose receiver is gone. The entry is removed only when a response arrives, and in this case the response may never arrive. So every timeout leaks one map slot. A bad plugin can slowly grow that map for the lifetime of the application.

That is what `Cancel(id)` is for. When a call times out, the caller also tells the owner to forget the request:

```rust
Err(_) => {
    let _ = self.sender.send(PluginCommand::Cancel(id)).await;
    Err(format!("plugin call '{method}' timed out after {}s", timeout.as_secs()))
}
```

This is a small fix, but it is the kind of small fix that is easy to miss because the happy path never needs it. The actor owns the child process, so it must also own the cleanup for abandoned calls.

**The zombies.** Tabularis can also run headless as an MCP server. In that mode a subprocess starts, registers plugins, serves requests, and exits when its stdin reaches EOF.

The first time I tested that path, `ps` still showed plugin processes after the parent had gone away. The owner task was the only place that called `child.kill()`, but Tokio tasks are cancelled when the runtime is torn down. The task that was supposed to clean up the child could be dropped before it reached the shutdown branch.

The fix is one line at spawn time:

```rust
.kill_on_drop(true)
```

Dropping the child handle is enough to terminate the process. This is a better invariant than "the async task will always get a chance to run one more branch before the runtime disappears", because that invariant is not true.

## The registry bug

This is the bug that changed how I think about the registry.

Registering a driver, built-in or plugin, eventually meant inserting it into a map keyed by driver id:

```rust
registry.insert(manifest.id, driver);
```

The built-in drivers have the ids `"mysql"`, `"postgres"` and `"sqlite"`. A plugin declares its id in `manifest.json`.

Nothing stopped a plugin from declaring this:

```json
{ "id": "mysql" }
```

Install that plugin and the map insert shadows the built-in MySQL driver. From that point, an existing MySQL connection can be routed to the third-party process that claimed to be MySQL. Tabularis resolves the password from the OS keychain and hands it to "the MySQL driver". The attacker does not need a memory corruption bug. The attack is a manifest entry.

I caught this during the original implementation, before it shipped, but it was close enough to be uncomfortable. The fix in [`src-tauri/src/plugins/manager.rs`](https://github.com/TabularisDB/tabularis/blob/main/src-tauri/src/plugins/manager.rs) is deliberately boring:

```rust
const BUILTIN_DRIVER_IDS: [&str; 3] = ["mysql", "postgres", "sqlite"];
if BUILTIN_DRIVER_IDS.contains(&config.id.as_str()) {
    return Err(format!(
        "Plugin id '{}' collides with a built-in driver and was refused",
        config.id
    ));
}
```

A plugin that claims a built-in id is refused at load time.

The lesson is not that this particular denylist is clever. It is that an identity namespace shared by trusted and untrusted code is a security boundary. The `HashMap` looked like plumbing. In practice it was deciding which process received credentials from the keychain.

That is a useful class of bug to remember: the dangerous code is not always the code that parses packets or runs SQL. Sometimes it is the code that chooses who gets to run.

:::star:::

## About the word "sandboxed"

It is tempting to call this sandboxing. I have used that word myself, but it needs qualification.

Running a driver as a separate process gives Tabularis two things:

- **Fault isolation.** A crash becomes EOF on a pipe, not a corrupted heap in the GUI.
- **Dependency isolation.** A plugin can bring its own runtime and packages without linking them into the application.

It does not make an untrusted plugin safe. The plugin process runs as the user. It can read files the user can read, open network connections the user can open, and do the normal things any program on the machine can do. A pipe is not a jail.

Real containment against hostile code needs operating-system mechanisms: seccomp, pledge/unveil, the macOS sandbox, Windows job objects and AppContainer-style boundaries, or something equivalent. Tabularis does not have that layer yet.

So the honest trust model is the same one you already use for packages, editor extensions and database client plugins: you are trusting the plugin author. The credential-shadowing fix above solves a narrower problem. It prevents Tabularis from automatically handing credentials to a plugin just because it chose a privileged name. That is worth doing even before a stronger sandbox exists.

## Installing a plugin

The registry is [a JSON file in the repo](https://github.com/TabularisDB/tabularis/blob/main/plugins/registry.json) on GitHub, fetched by [`src-tauri/src/plugins/registry.rs`](https://github.com/TabularisDB/tabularis/blob/main/src-tauri/src/plugins/registry.rs). Installing a plugin, in [`src-tauri/src/plugins/installer.rs`](https://github.com/TabularisDB/tabularis/blob/main/src-tauri/src/plugins/installer.rs), fetches a ZIP over HTTPS, unpacks it into a temporary directory, checks that `manifest.json` exists and parses, and then atomically renames the directory into place:

```rust
fs::rename(&tmp_dir, &final_dir)   // .tmp-<id>  ->  <id>, atomically
    .map_err(|e| format!("Failed to finalize plugin installation: {e}"))?;
```

The atomic rename matters because the loader should never see half of a plugin. Either the install finished and the directory has a valid manifest, or there is no plugin.

Three months later, this is still the weakest part of the install story: no signatures, no checksum pinning. The trust chain is "you trust the registry review, and you trust GitHub over HTTPS to deliver the ZIP". Signing is on the roadmap. Until then, it is better to describe the chain as it is than to imply more security than exists.

## What held up

The part that held up is the original reason for doing this: I do not need to know about your database for Tabularis to speak to it.

Because a driver is just a process that reads a line and writes a line, the CSV driver can be Python, the Google Sheets driver can be Rust with OAuth dependencies, and a future driver can use whatever client library its database community already trusts. The Tabularis core does not need that code in its build, in its address space, or in its release cycle.

This is not a sophisticated plugin architecture. That is the point. The sophistication is in the edges: one owner for the pipes, request ids for out-of-order responses, cancellation for abandoned calls, process cleanup that survives runtime teardown, and an explicit boundary between trusted built-in ids and plugin ids.

The code is in [the Tabularis repo](https://github.com/TabularisDB/tabularis), mostly under [`src-tauri/src/plugins/`](https://github.com/TabularisDB/tabularis/tree/main/src-tauri/src/plugins). If you want to read a real driver instead of the trait in the abstract, the [Google Sheets plugin](https://github.com/TabularisDB/tabularis-google-sheets-plugin) is the one I would start with.
