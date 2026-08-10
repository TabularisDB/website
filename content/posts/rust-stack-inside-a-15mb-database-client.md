---
title: "The Rust stack inside a ~15 MB installer"
date: "2026-07-30T08:52:00"
authors: ["debba"]
tags: ["rust", "sqlx", "rustls", "engineering", "deep-dive"]
excerpt: "Two database stacks, several TLS verification paths, two SSH clients, a hand-written float16 decoder, and the vendored OpenSSL that refuses to leave: a guided tour of the fifty-odd top-level Rust dependencies behind Tabularis's compact installers — the other half of last week's Tauri story."
og:
  template: "code-terminal"
  title: "The Rust stack"
  accent: "inside a ~15 MB installer."
  claim: "Two database stacks, custom TLS verification, two SSH paths, a hand-rolled float16 decoder — and a vendored OpenSSL whose only remaining job is reading other clients' credential stores."
  image: "/img/tabularis-sql-editor-data-grid.png"
  codeTitle: "tabularis · src-tauri/Cargo.toml"
  codeLines:
    - 'sqlx           = "0.8"   # MySQL, SQLite at runtime'
    - 'tokio-postgres = "0.7"   # not a typo'
    - 'russh          = "0.43"  # …and system ssh'
    - 'rustls         = "0.23"'
    - 'openssl = { vendored }   # ← the exception'
---

# The Rust stack inside a ~15 MB installer

Last week I wrote about [why Tabularis runs on Tauri](/blog/why-tabularis-runs-on-tauri). That post was about the frame: a Rust backend, a web frontend, and the seams between them. It said almost nothing about what the Rust side is actually made of.

This post is the guided tour. The compressed [0.17.0 release](https://github.com/TabularisDB/tabularis/releases/tag/v0.17.0) artifacts range from 12 MB (the Windows NSIS installer) to 17 on Linux and 18 on macOS; the Windows MSI sits at 15.8. Roughly fifteen is useful shorthand for the download, not a claim about the larger installed footprint.

The main `[dependencies]` table in [`Cargo.toml`](https://github.com/TabularisDB/tabularis/blob/main/src-tauri/Cargo.toml) has 53 entries, before platform-specific and build dependencies. Most looked free the day they entered the tree. None stayed free, because dependencies are also boundaries — to protocols, platforms, formats and other people's decisions.

**Every abstraction boundary is a decision, and every decision eventually sends an invoice.**

Here are the invoices I found worth reading twice.

![Horizontal bar chart of the 53 entries in Tabularis's main Rust dependencies table, grouped by job. Everything else: 14. Formats and encoding: 11. Tauri and its plugins: 9. Secrets and crypto: 6, including vendored OpenSSL. TLS and certificates: 4 rustls crates. Database clients and types: 4. Async plumbing: 3. SSH: 2.](/img/posts/tabularis-rust-stack-dependencies.svg)

## Two database stacks, on purpose

The most common assumption about Tabularis's backend is that everything goes through [SQLx](https://github.com/launchbadge/sqlx). It does not. MySQL and SQLite do. PostgreSQL runs on [tokio-postgres](https://crates.io/crates/tokio-postgres) with a deadpool pool, and the split is deliberate.

SQLx earns its place on two engines: shared pool APIs, query builders and a common route into the grid's row model. But a database *client* has a problem a typical CRUD application does not. The application usually knows the types in its own schema. A client must decode whatever the user's schema throws at it, including extension types its database library does not know yet.

With tokio-postgres we can implement `FromSql` by hand, byte by byte, at the boundary of Postgres's binary wire format. That is how Tabularis got [pgvector support](https://github.com/TabularisDB/tabularis/pull/450): `vector`, `halfvec` and `sparsevec` decoded straight from pgvector's `*_send` format. For `halfvec` that meant half-precision floats, and since no direct dependency in the tree decoded IEEE 754 binary16, the driver now contains this:

```rust
/// Decode an IEEE 754 half-precision (`binary16`) value into `f32`.
fn f16_bits_to_f32(bits: u16) -> f32 {
    let sign = if (bits >> 15) & 1 == 1 { -1.0f32 } else { 1.0f32 };
    let exp = (bits >> 10) & 0x1f;
    let mant = bits & 0x3ff;
    match exp {
        0 => sign * (mant as f32) * 2f32.powi(-24), // zero / subnormal
        0x1f if mant == 0 => sign * f32::INFINITY,
        0x1f => f32::NAN,
        _ => sign * (1.0 + (mant as f32) / 1024.0) * 2f32.powi(exp as i32 - 15),
    }
}
```

A hand-rolled float16 decoder in a database GUI. We did not plan for this line item, and we are strangely fond of it.

The cost of owning those codecs arrives as pull requests: binding temporal and UUID values with [explicit wire types](https://github.com/TabularisDB/tabularis/pull/408), casting enums [back to their column type](https://github.com/TabularisDB/tabularis/pull/471) so dropdown editing works, keeping routine introspection alive [on PostgreSQL older than 11](https://github.com/TabularisDB/tabularis/pull/377). SQLx can support [custom `Decode` implementations](https://docs.rs/sqlx/latest/sqlx/trait.Decode.html) too; this was a choice of API surface, not a capability SQLx lacks. In fact, SQLx's `postgres` feature is still enabled in the manifest even though the runtime path no longer uses its PostgreSQL pool. That build-time baggage is an invoice still waiting to be cancelled.

## rustls, and the OpenSSL that stayed

The TLS section of `Cargo.toml` has a fifteen-line comment, which is usually the sign of a scar.

The short version: `tls-native-tls` is deliberately not enabled. On macOS its path through Apple's deprecated Secure Transport APIs failed in Tabularis on real-world CA bundles — the AWS RDS regional bundle among them — with errors like *"One or more parameters passed to a function were not valid."* The same bundle validated with `openssl s_client` and with `mysql --ssl-mode=VERIFY_IDENTITY`. Debugging that path through an opaque error string is not a hobby I recommend.

So every TLS path controlled by Tabularis's Rust code now speaks [rustls](https://github.com/rustls/rustls), using platform roots where appropriate. That second choice matters as much as the first: it keeps the operating system's trust store live, so a corporate CA sitting in the macOS keychain still works. A bundled web PKI root set would not include that private CA, and "silently" is the worst word in that sentence.

Then comes the part rustls does not give you for free. Users expect familiar `sslmode` choices — `prefer`, `require`, `verify-ca`, `verify-full` — while rustls provides verification mechanisms rather than database-client policy. Reproducing those choices took two custom `ServerCertVerifier` implementations plus the standard platform and WebPKI verifier paths. The custom verify-CA-but-not-hostname verifier calls `verify_server_cert_signed_by_trust_anchor` directly, so the "skip hostname check" intent is explicit instead of buried in error recovery.

One of those semantics is a confession. Before v0.10.3, Tabularis's `require` mode validated the certificate chain. It now means "encrypt without authenticating the server", the common interpretation of `require`, which made the application *less* strict. libpq has a backward-compatibility wrinkle: when a root CA file exists, its `require` behaves like `verify-ca`, so Tabularis does not claim byte-for-byte compatibility with every libpq configuration.

Real-world deployments added their own complications: PlanetScale's Vitess rejects the `sql_mode` SQLx sets on every connection, so pool creation [detects it and retries](https://github.com/TabularisDB/tabularis/pull/387); AWS RDS wanted [IAM authentication](https://github.com/TabularisDB/tabularis/pull/404); Postgres needed `ssl_mode` [honored in one more code path](https://github.com/TabularisDB/tabularis/pull/378) than we remembered existed.

And yet, after all this rustls conviction, there is still an `openssl = { version = "0.10", features = ["vendored"] }` in the tree. Today the only place Tabularis's own code calls it is one module, and what that module does is the next section.

## The crypto shelf

Secrets never touch Tabularis's config files. Passwords go to the OS keychain through the [keyring](https://crates.io/crates/keyring) crate — Keychain on macOS, Credential Manager on Windows, the Secret Service on Linux.

But a keychain is a place, not a format, and connections need to *move*: exports, and [automatic encrypted backups](https://github.com/TabularisDB/tabularis/pull/470) to a local folder or a WebDAV server. The envelope is [argon2](https://crates.io/crates/argon2) plus [aes-gcm](https://crates.io/crates/aes-gcm): Argon2id at 64 MiB and three iterations derives the key, AES-256-GCM seals the payload, and the KDF parameters travel inside the envelope so future versions can raise them.

A self-describing envelope has a failure mode that took us longer to see than to fix: the parameters are attacker-supplied. A malicious file could ask the *decrypting* machine for 100 GiB of Argon2 memory, and the DoS would arrive dressed as your own backup. So the decrypt path rejects requests above 1 GiB of memory, 32 iterations or parallelism of 8. Those caps are bounds, not proof that decryption cannot hurt a smaller machine; keeping them low, and expensive derivation off the UI thread, is still worthwhile. Plaintext backups are not supported. There is no checkbox to turn encryption off, because someone would eventually tick it by accident.

The same shelf holds the strangest tools in the codebase. Tabularis [imports connections](https://github.com/TabularisDB/tabularis/pull/393) from TablePlus, Sequel Ace, DBeaver, Beekeeper Studio and DataGrip, which meant learning each client's storage format: [plist](https://crates.io/crates/plist) for the macOS clients, [roxmltree](https://crates.io/crates/roxmltree) for DataGrip's XML, and OpenSSL's AES-CBC for the two encrypted stores.

[DBeaver](/compare/dbeaver-alternative)'s credentials file uses a fixed key; [Beekeeper](/compare/beekeeper-studio-alternative) uses Node's `simple-encryptor` format with a per-install key unwrapped by a fixed bootstrap key. These are local files on the user's own machine and the threat models differ. But it does mean the vendored OpenSSL's last remaining duty in a rustls application is reading other database clients' secrets. Some dependencies retire; this one became a locksmith.

## russh and ssh. Both.

SSH tunnels have two implementations, and the function that picks between them is three lines long: if the user typed a password, use [russh](https://github.com/Eugeny/russh) in-process, because system `ssh` under `BatchMode=yes` cannot do interactive password auth. Otherwise, spawn the system `ssh` binary.

Shelling out sounds like the lazy option. It is actually the compatible one: the system client brings the user's `~/.ssh/config`, agent, jump hosts and FIDO2 support with it, subject to the explicit options and GUI environment Tabularis supplies. `russh` does not try to reproduce every corner of decades of OpenSSH behavior, and Tabularis does not need it to.

The invoice came anyway, in two currencies. On Windows, `ssh.exe` popped a visible console window with every tunnel until [the flags said otherwise](https://github.com/TabularisDB/tabularis/pull/418). And a GUI app spawning `ssh` has nowhere to type a key passphrase — so Tabularis registers *itself* as the `SSH_ASKPASS` helper, re-executing its own binary in a thin client mode that forwards the prompt to the running app over a private local socket. Our app's process tree occasionally contains our app, asking itself for a passphrase. That story deserves its own post.

## The 2⁵³ toll booth

One dependency does not appear in `Cargo.toml`, because it is a language: every query result crosses Tauri's IPC boundary as JSON and lands in `JSON.parse`. Beyond 2⁵³ − 1, JavaScript numbers no longer guarantee that distinct integers remain distinct. A database client that rounds your BIGINT is not a client, it is a rumor.

![Diagram of PostgreSQL's maximum BIGINT crossing JSON.parse. It leaves Rust as 9223372036854775807. The nearest JavaScript Number is 2 to the 63rd power and is commonly displayed as 9223372036854776000. Tabularis instead sends the JSON string "9223372036854775807", preserving every digit.](/img/posts/tabularis-rust-stack-bigint-roundtrip.svg)

So the serializer checks the range: in-range integers cross as JSON numbers, out-of-range ones cross as strings. Write-back is harder. Column metadata decides the binding where it is available; some paths otherwise use a narrow heuristic that recognizes only integer strings outside the safe range. That reduces accidental coercion, but cannot eliminate the ambiguity: a large numeric value in a VARCHAR column is still text, and a leading zero still matters. A tagged wire value, or type-directed binding on every path, is the durable end state. The current range policy fits in roughly fifty lines of `safe_int.rs`; the boundary does not.

## The dependency we wrote ourselves: 31 lines of JSON-RPC

Plugin drivers — DuckDB, Redis, MongoDB, Elasticsearch, Cloudflare D1 — are separate executables speaking JSON-RPC 2.0 over stdin and stdout. The entire wire-type module is 31 lines. I have spent more lines configuring loggers.

The driver and process-management machinery is much larger, but keeping the wire types small is the point: any language that can read a line and write a line can be a Tabularis driver, and the registry already has drivers in Go and in Rust. A protocol whose transport is stdout has one commandment — *nothing else may write to stdout* — and the plugin guide warns every third-party author about it in bold.

Then we shipped [an MCP server that logged to stdout](https://github.com/TabularisDB/tabularis/pull/488) and corrupted its own transport. The rule we wrote for other people, broken in the same protocol and the same repo. The fix was one line. The same subsystem also taught us that "read-only" is a property of a SQL dialect, not of a protocol: `EXPLAIN ANALYZE` *executes* the statement it explains, and [bypassed the read-only gate](https://github.com/TabularisDB/tabularis/pull/456) until the gate started classifying the wrapped statement instead of the `EXPLAIN` prefix. `EXPLAIN ANALYZE SELECT` remains a read; `EXPLAIN ANALYZE DELETE` does not.

## The supply-chain boundary

The last set of decisions concerns code Tabularis downloads but does not write. The plugin registry never hosts binaries; it signs author-provided hashes of release assets with Ed25519. Tabularis verifies that registry signature with [ed25519-dalek](https://crates.io/crates/ed25519-dalek) before installing anything, and it rejects a valid signature whose plugin, version or registry does not match the requested release. CI actions are [pinned to commit SHAs](https://github.com/TabularisDB/tabularis/pull/540), not mutable tags.

:::star:::

## Would I choose them again?

Almost all of them, yes. Not because cost is virtuous, but because the expensive choices bought capabilities users actually need.

SQLx where uniformity helps, tokio-postgres where explicit type codecs help. rustls with platform trust, plus custom and standard verifier paths for familiar `sslmode` choices. Two SSH clients chosen by a three-line predicate. Argon2id that puts bounds on its own envelope. A 31-line wire module that let other people write database drivers in Go before we finished documenting it.

A dependency is not just code you do not have to write. It is a boundary you agree to operate, often before you have read the code on the other side. Choose the boundaries whose failure modes you are willing to understand, and budget for the invoices — they are not optional, only deferred.

The vendored OpenSSL, meanwhile, is still here. Nobody has had the heart to tell it.
