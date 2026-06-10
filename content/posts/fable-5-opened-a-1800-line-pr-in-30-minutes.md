---
title: "Fable 5 Opened a 1,800-Line PR on Tabularis in 30 Minutes"
date: "2026-06-10T10:00:00"
tags: ["ai", "fable", "rust", "cli", "experiment", "open-source"]
excerpt: "A Tabularis dev experiment: we asked Fable 5 to add a CLI to the app and went to make coffee. We came back to a draft PR — 1,800 lines of Rust, 37 tests, a refactor we'd have done ourselves, and two pre-existing bugs quietly fixed."
og:
  title: "Fable 5 opened a 1,800-line PR"
  accent: "in 30 minutes."
  claim: "We asked Fable 5 to add a CLI to Tabularis. It found the refactor, fixed two bugs we didn't know about, and tested itself against a live database."
  image: "/img/og/cli-experiment-fable5.png"
  cover: "/img/og/cli-experiment-fable5.png"
---

# Fable 5 Opened a 1,800-Line PR on Tabularis in 30 Minutes

> _**Daily Dev Experiment** — a short series where we hand a real task to an AI on the Tabularis codebase and report exactly what happened. No staged demos. Today's run got a little out of hand._

We asked **Fable 5** (Anthropic's new model) to add a command-line interface to the app. That's less trivial than it sounds: this is a Tauri app — Rust backend, React frontend — so "a CLI" means reaching every saved connection (keychain passwords, SSH/K8s tunnels, plugin drivers) **without** booting the GUI or starting the Tauri runtime at all.

One prompt. A coffee break. A draft PR waiting at the end of it.

Here's what was in it.

## The numbers

| | |
|---|---|
| Lines added | **1,810** |
| Lines removed | 319 |
| Files touched | 16 |
| New unit tests | **37** (full suite: 692 passing) |
| Pre-existing bugs fixed | **2** — we didn't ask for either |
| Wall-clock time | **~30 minutes** |

We've spent longer naming a variable.

<video class="video-compact" src="/videos/posts/tabularis-cli-fable.mp4" poster="/videos/posts/tabularis-cli-fable.jpg" controls autoplay loop muted playsinline></video>

## What we expected

A coherent set of `clap` subcommands, addressed by connection id **or** name:

| Command | What it does |
|---|---|
| `tabularis connections` (`ls`) | List saved connections — table or `--json` |
| `tabularis databases <conn>` | List databases on the server |
| `tabularis schemas <conn>` | List schemas |
| `tabularis tables <conn>` | List tables (`-d`, `--schema`, `--json`) |
| `tabularis describe <conn> <table>` | Columns, indexes, foreign keys |
| `tabularis query <conn> [SQL]` (`q`) | One-shot query, stdin pipe, or interactive shell |
| `tabularis install-cli` | Symlink the binary into a `PATH` directory |

The detail we like most: `query` picks its mode from the invocation. SQL argument → one-shot. Piped stdin → executes the piped statement. Interactive TTY with no SQL → drops into a proper SQL shell.

```bash
# one-shot query, pipe-friendly
tabularis query my-db "select id, name from customers" --format csv > out.csv

# pipe a statement in
echo "select count(*) from orders" | tabularis q my-db

# no SQL on a TTY → drop into a proper SQL shell
tabularis query my-db
```

The interactive shell is backed by `rustyline`: line editing, persistent history (`cli_history.txt` in the app config dir), multi-line statements that fire on a terminating `;`, `Ctrl-C` drops the current buffer, `Ctrl-D` exits. Plus psql-style meta commands:

```
\l    list databases        \f table|json|csv   output format
\dn   list schemas          \limit N            row limit (0 = unlimited)
\dt   list tables           \schema NAME        set schema
\d T  describe table        \use DB             switch database
\q    quit                  \?                  help
```

Result data goes to **stdout**, logs go to **stderr** — so piping stays clean, and you get a non-zero exit code on failure. Exactly the kind of detail a human means to remember and usually forgets.

It even kept the GUI-launch fallback intact: macOS still passes junk like `-psn_*` to the binary on launch, and that must keep booting the GUI — while a *misspelled subcommand* should surface clap's error instead of silently opening a window. It threaded that needle, and wrote tests asserting the exact `clap` error kinds that fall through to the GUI versus the ones that don't.

## What we did NOT expect

**1. It found the refactor before writing a single feature.**

The app already ships an [MCP server](/wiki/mcp-server), and that server already knew how to resolve a saved connection — decrypt the keychain password, open the SSH/K8s tunnel, register the right plugin driver. Instead of duplicating all of that for the CLI, Fable 5 dug through the codebase, realized the logic was buried inside `mcp/mod.rs`, and **pulled it out into a shared `headless.rs` module** that both the MCP server and the new CLI consume. The MCP server now just wraps the shared helpers with its JSON-RPC error type — zero behavior change on that side.

That's 242 lines deleted from `mcp/mod.rs` and a 214-line module born. It's the refactor _we_ would have done — unprompted, because it understood why duplicating connection resolution was the wrong move.

It also didn't dump everything into one file. The old 52-line `cli.rs` became a real module:

```
src-tauri/src/cli/
├── mod.rs       clap definitions, GUI-fallback logic     (182 lines)
├── run.rs       command dispatch + execution             (338 lines)
├── repl.rs      the interactive shell                    (282 lines)
├── output.rs    table / JSON / CSV rendering             (138 lines)
├── install.rs   install-cli symlink logic                 (97 lines)
└── *_tests.rs   args, output, run, install               (442 lines)
```

**2. It fixed two real bugs that were already there.**

- `keychain_utils` was logging with `println!`, dumping straight to **stdout**. Harmless in a GUI — silently corrupting any piped CSV/JSON the moment a CLI exists. And it was bypassing the in-app log buffer too. It rerouted everything through the `log` crate.
- Headless processes never called `sqlx::any::install_default_drivers()`, so the default connection-test path **panicked**. It installed the drivers in the shared `headless::register_drivers()` — which also quietly fixed the existing `--mcp` mode.

Neither was in the prompt. It found them because it actually traced the execution path from "user pipes a query" to "bytes hit the terminal" and noticed what would break along the way.

**3. It handled multi-database connections properly.**

Multi-db connections used to resolve to their first database, which made the others unreachable outside the GUI. Every db-scoped command now takes `-d/--database`, and the shell's `\use <db>` doesn't just flip a variable — it **validates the switch with a connection test** before applying it, and the prompt shows where you are (`Demo · MySQL:blog_demo>`). Under the hood it reuses the GUI's per-call database-override semantics (`DatabaseSelection::Single`) instead of inventing a parallel mechanism.

**4. It tested its own work against a live database.**

The 37 unit tests aren't padding: clap parsing (including the GUI-fallback error kinds), table/CSV/JSON rendering (column alignment, control-character escaping, CSV quoting), limit and database-override semantics, and the `install-cli` symlink logic — idempotency, refusal to clobber a foreign file, `--force`.

Then it went further: it ran the new shell against a real MySQL connection, switched across the three demo databases with `\use`, eyeballed the table/CSV/JSON output, and fixed the formatting it didn't like — before handing over the PR.

:::star:::

## So... do we trust it?

No. It's a **draft** PR and we're reviewing every line before anything ships. There are real limitations — which, to its credit, it flagged itself in the PR description:

- On Windows release builds the binary has no attached console (`windows_subsystem = "windows"`), so CLI output is invisible there. Same constraint the `--mcp` mode always had.
- Each shell statement runs on its own pooled connection, so session state — `SET`, transactions, temp tables — doesn't persist between statements. It even documents that caveat inside `\?`.

But here's the part that stuck with us: the review is genuinely _worth doing_. This isn't autocomplete spitting out a function body. It's an agent that read the architecture, found the seam we'd have found, refactored toward it, and cleaned up two messes on the way out — then wrote 37 tests and a PR description more thorough than most humans bother with.

Two years ago this was Tab-complete. Today it's a coworker whose work we have to code-review.

👉 **Read the full PR — every line, the real description:** [#313](https://github.com/TabularisDB/tabularis/pull/313)

## Where this is going

This experiment isn't a side quest — it's the direction. We're building a database client that's native to this new workflow: a built-in [MCP server](/wiki/mcp-server) so agents like the one in this post can work against your databases, with [approval gates](/wiki/mcp-approval-gates), a [read-only mode](/wiki/mcp-readonly-mode), and a full [audit log](/wiki/ai-audit-log) so they do it on your terms. An [AI assistant](/wiki/ai-assistant) that also runs on open-source models — locally via Ollama, with zero schema data leaving your machine. And now a CLI, born from that same headless core.

An agent wrote today's feature. The point is that tomorrow, your agents get a first-class, safe way to use it.

:::newsletter:::
