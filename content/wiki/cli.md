---
title: "Command Line Interface"
order: 14.5
excerpt: "Launch Tabularis from the terminal with flags for Visual EXPLAIN files, MCP server mode, and debugging."
category: "Reference"
---

Tabularis is primarily a desktop application, but its binary accepts a small set of command-line flags that extend how the app can be launched. You can open a saved EXPLAIN plan straight into the Visual EXPLAIN viewer, start Tabularis as an MCP server for AI clients, or open the developer tools for troubleshooting.

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
- The Visual EXPLAIN window offers the same views as the in-app EXPLAIN button: Graph, Diagram, Table, Stats, Raw and AI. The AI tab only appears when AI is enabled in **Settings → AI**.
- The file name appears in the window header (hover it for the full path), so you can keep multiple plans straight when comparing them.
- **Open file** loads another plan (the picker filters `.json` and `.txt`), and **Reload** re-reads the current file from disk.
- Opening a `.json` or `.txt` file from your file manager does not open it in Tabularis: the app registers no file associations, so pass the file with `--explain` instead.
- If Tabularis is already running, a second `tabularis --explain FILE` only brings the existing window to the front and the flag is ignored. Quit Tabularis first.

## `--mcp`

Starts Tabularis in **Model Context Protocol** mode instead of launching the GUI. In this mode the process speaks JSON-RPC 2.0 over `stdin`/`stdout` and is meant to be spawned as a child process by an MCP host like Claude Desktop, Claude Code, Codex, Cursor, Windsurf, or Antigravity.

```bash
tabularis --mcp
```

You will normally never run this command yourself — the one-click install on the **MCP** page (sidebar) configures each client, either by writing its config file or by running its CLI (Codex). See the [MCP Server](mcp-server) page for the full integration.

## `--debug`

Opens the WebView DevTools automatically when the main window appears, and re-enables the native right-click menu that Tabularis normally suppresses. It does not change the log level: logging stays at Info with or without the flag.

```bash
tabularis --debug
```

Logs are captured in the in-app log buffer and can be viewed from **Settings → Logs** regardless of whether `--debug` is set. See [Configuration → Application Logs](/wiki/configuration#application-logs).

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
- **`--debug`** opens DevTools on the main window only. Combined with `--explain`, the main window is closed, so the Visual EXPLAIN window gets no DevTools.
- **A running instance takes over.** If Tabularis is already open, launching it again (with or without `--explain` or `--debug`) only focuses the existing main window. `--mcp` is not affected, because it never starts the GUI.

If the flags fail to parse for any reason (for instance, because the OS passes non-standard arguments at GUI launch time on certain platforms, or a bare file path is passed without `--explain`), Tabularis ignores all of them and falls back to the default GUI launch rather than crashing.
