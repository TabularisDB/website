---
title: "Command Line Interface"
order: 14.5
excerpt: "Launch Tabularis from the terminal with flags for Visual EXPLAIN files, MCP server mode, and verbose logging."
category: "Reference"
---

# Command Line Interface

Tabularis is primarily a desktop application, but its binary accepts a small set of command-line flags that extend how the app can be launched. You can open a saved EXPLAIN plan straight into the Visual EXPLAIN viewer, start Tabularis as an MCP server for AI clients, or enable verbose logging for troubleshooting.

The flags are parsed with [clap](https://docs.rs/clap), so `--help` and `--version` are always available.

## Invoking the Binary

The executable is named `tabularis` on all platforms. Where it lives depends on how Tabularis was installed:

| Platform | Typical path |
|----------|-------------|
| **Linux** (AppImage / tarball) | the extracted binary — e.g. `./tabularis` |
| **Linux** (distro package, AUR, Snap, Flatpak) | `tabularis` on your `PATH` |
| **macOS** | `/Applications/tabularis.app/Contents/MacOS/tabularis` |
| **Windows** | `%LOCALAPPDATA%\Programs\tabularis\tabularis.exe` |

All examples below use the short form `tabularis`. Substitute the full path if the binary is not on your `PATH`.

## `--explain <FILE>`

Opens Tabularis directly into a standalone **Visual EXPLAIN** window for a previously-saved execution plan file. The main application window is not opened — this flag turns Tabularis into a dedicated plan viewer.

```bash
tabularis --explain /path/to/plan.json
```

This is useful when you:

- Received an EXPLAIN plan from a colleague and want to inspect it without setting up a connection.
- Captured the output of `EXPLAIN (FORMAT JSON)` or `EXPLAIN` from `psql` and want to see the interactive graph, table view, cost heatmap, and estimate-gap warnings described in the [Visual EXPLAIN](visual-explain) page.
- Want to register Tabularis as the default application for `.json` or `.txt` files holding plan output.

### Supported formats

The file is auto-detected:

| Format | Source | How it is detected |
|--------|--------|-------------------|
| **Postgres JSON** | `EXPLAIN (FORMAT JSON [, ANALYZE, BUFFERS])` output | File starts with `[` or `{` |
| **Postgres text** | Default `EXPLAIN` output from `psql` | Lines contain the Postgres cost header (`cost=X..Y rows=N width=W`) |

Both estimated plans and `ANALYZE` plans are supported. When the file includes actual-row and actual-time data, the Visual EXPLAIN window enables the ANALYZE-only metrics (slowest step, estimate gap, buffer hits/reads) automatically.

If the file is not in one of the supported formats, Tabularis shows an error in the Visual EXPLAIN window and leaves the plan area empty. MySQL, MariaDB and SQLite plan files are not currently accepted through this flag — their formats are produced only when connected to a live server via the in-app **EXPLAIN** button.

### Behaviour notes

- The CLI-provided file path is consumed once. Navigating inside the Visual EXPLAIN window does not re-open the same file.
- The Visual EXPLAIN window inherits the same four views (Graph, Table, Raw, AI Analysis) available from the in-app EXPLAIN button. The AI tab still requires an AI provider to be configured in **Settings → AI**.
- The filename appears in the header (`-- loaded from plan.json`) so you can keep multiple plans straight when comparing them.

## `--mcp`

Starts Tabularis in **Model Context Protocol** mode instead of launching the GUI. In this mode the process speaks JSON-RPC 2.0 over `stdin`/`stdout` and is meant to be spawned as a child process by an MCP host like Claude Desktop, Claude Code, Cursor, Windsurf, or Antigravity.

```bash
tabularis --mcp
```

You will normally never run this command yourself — the one-click install in **Settings → MCP** writes the correct `mcpServers` entry into each client's config file. See the [MCP Server](mcp-server) page for the full integration.

## `--debug`

Enables verbose application logging, including `sqlx` query traces. DevTools are opened automatically when the main window appears.

```bash
tabularis --debug
```

The flag is independent from `--explain` and `--mcp`, so you can combine it with either when diagnosing a problem:

```bash
tabularis --debug --explain /path/to/plan.json
```

Logs are also captured in the in-app log buffer and can be viewed from **Settings → Logs** regardless of whether `--debug` is set.

## `--version` and `--help`

Standard clap-provided flags:

```bash
tabularis --version
tabularis --help
```

`--help` prints the full list of flags and their descriptions — useful after an update to confirm which options are available in the installed build.

## Flag Precedence

Some flags are mutually exclusive by behaviour:

- **`--mcp` wins over everything.** If `--mcp` is set, Tabularis runs the MCP server loop and never builds the Tauri GUI, so `--explain` and `--debug` are ignored.
- **`--explain` suppresses the main window.** Only the Visual EXPLAIN window opens; closing it exits the app.
- **`--debug`** applies in all GUI modes.

If the flags fail to parse for any reason (for instance, because the OS passes non-standard arguments at GUI launch time on certain platforms), Tabularis falls back to the default GUI launch rather than crashing.
