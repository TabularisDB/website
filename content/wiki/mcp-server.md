---
title: "MCP Server"
order: 9
excerpt: "Use Tabularis as an MCP server to let Claude Desktop, Claude Code, Cursor, Windsurf, Antigravity, and other AI agents query your local databases."
category: "AI & Integration"
---

# MCP Server

Tabularis includes a built-in **Model Context Protocol (MCP)** server. Once configured, external AI assistants — including **Claude Desktop**, **Claude Code**, **Cursor**, **Windsurf**, and **Antigravity** — can list your saved connections, inspect schemas, describe tables, and run SQL queries, all without leaving their chat interface.

![MCP Server Integration](/img/tabularis-mcp-server.png)

## How It Works

Tabularis exposes an MCP server by running its own executable in a special `--mcp` mode. The MCP host (e.g. Claude Desktop) spawns the Tabularis binary as a child process and communicates over `stdin`/`stdout` using **JSON-RPC 2.0**, following the [MCP specification](https://modelcontextprotocol.io).

Tabularis exposes:

- **Resources** — read-only data the AI can access passively.
- **Tools** — callable actions the AI can invoke on your behalf.

No network port is opened. All communication happens locally via the process's stdio pipe.

## Quick Setup (One-Click Install)

Starting with v0.9.9, Tabularis detects all supported AI clients automatically and lets you install the MCP configuration in a single click:

1. Open **Settings → MCP** (or click the plug icon in the sidebar).
2. The **MCP Server Integration** panel lists every detected AI client alongside the resolved path to its config file.
3. Click **Install Config** next to the client you want to connect. For file-based clients, Tabularis writes or patches the required `mcpServers` entry directly into the config file. For Claude Code, it runs `claude mcp add --scope user ...` instead.
4. Restart the target AI client. It will immediately see Tabularis as an available MCP server.

### Supported AI Clients

| Client | Config file (Linux) |
|--------|---------------------|
| **Claude Desktop** | `~/.config/Claude/claude_desktop_config.json` |
| **Claude Code** | `~/.claude.json` |
| **Cursor** | `~/.cursor/mcp.json` |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` |
| **Antigravity** | `~/.gemini/antigravity/mcp_config.json` |

On macOS and Windows the paths are resolved automatically to their platform equivalents.

## Manual Configuration

If you prefer to configure it manually, the **Manual Configuration** section at the bottom of the integration panel shows the exact JSON block to paste for file-based clients, with the correct binary path pre-filled for your system.

The block to add looks like:

```json
{
  "mcpServers": {
    "tabularis": {
      "command": "/path/to/tabularis",
      "args": ["--mcp"]
    }
  }
}
```

**Config file locations by platform:**

| Platform | Claude Desktop | Claude Code |
|----------|---------------|-------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` | `~/.claude.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` | `%USERPROFILE%\.claude.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` | `~/.claude.json` |

Replace `/path/to/tabularis` with the actual path to the Tabularis binary on your system. After saving the file, restart the AI client.

For Claude Code, the equivalent manual command is:

```bash
claude mcp add --scope user tabularis /path/to/tabularis -- --mcp
```

## Resources

Resources are read by the AI to understand your data environment without executing queries.

### `tabularis://connections`

Returns the list of all saved connections (id, name, driver, host, database). Passwords are never included.

**Example response:**
```json
[
  { "id": "abc123", "name": "Production PG", "driver": "postgres", "host": "db.example.com", "database": "myapp" },
  { "id": "def456", "name": "Local SQLite", "driver": "sqlite", "host": null, "database": "/home/user/dev.db" }
]
```

### `tabularis://{connection_id}/schema`

Returns the table list for a specific connection. The `{connection_id}` can be the connection UUID, the exact connection name (case-insensitive), or a partial name match.

**Example:**
```
tabularis://Production PG/schema
tabularis://abc123/schema
```

## Tools

Tools are actions the AI can call to retrieve or manipulate data.

### `list_connections`

Returns the same safe connection list exposed by `tabularis://connections`.

### `list_tables`

Lists tables for a connection.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `connection_id` | `string` | Connection UUID or exact name |
| `schema` | `string` | Optional schema name. Defaults to `public` for PostgreSQL. |

### `describe_table`

Returns columns, foreign keys, and indexes for one table.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `connection_id` | `string` | Connection UUID or exact name |
| `table_name` | `string` | Table to inspect |
| `schema` | `string` | Optional schema name. Defaults to `public` for PostgreSQL. |

### `run_query`

Executes a SQL query on a specific connection and returns the results.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `connection_id` | `string` | Connection UUID or exact name |
| `query` | `string` | The SQL query to execute |

**Returns:** query results as JSON. The MCP server currently caps query results to 100 rows per call.

**Example prompts:**

> "List all tables in my Production PG database."

> "Show me the last 10 orders placed today, joining `orders` with `customers`."

> "Which indexes are missing on the `events` table in my analytics database?"

Claude (or any connected AI) will call the appropriate tool with the resolved `connection_id`, then format the result into a readable answer.

## Security Considerations

- The MCP server runs with the **same OS permissions** as your Tabularis process — it can read any database you have credentials for.
- Only connections already saved in Tabularis (with credentials in the OS keychain) are accessible.
- Passwords and API keys are **never** exposed through MCP resources or tool outputs.
- The tool can execute **any SQL**, including `DELETE` or `DROP`. Use read-only database users if you want to restrict the AI to safe operations.
- Communication happens entirely **locally** — no data leaves your machine via the MCP channel.

## Troubleshooting

**The AI client doesn't see Tabularis as a server**
- Verify the path in the config file points to the correct Tabularis binary.
- Restart the AI client after editing the config file.
- Check that the binary is executable (`chmod +x tabularis` on Linux/macOS).
- Use the **Install Config** button in Tabularis to let it write the correct path automatically.

**`run_query` returns "Connection not found"**
- Tool calls match by UUID or exact connection name. Use `tabularis://connections` or `list_connections` to see the available identifiers.

**A schema resource works but shows only the `public` schema on PostgreSQL**
- That is expected for the `tabularis://{connection_id}/schema` resource. Use `list_tables` or `describe_table` with an explicit `schema` argument when you need a different PostgreSQL schema.

**No resources appear in the AI client**
- Tabularis reads connections from `connections.json` at the standard app data path. If you haven't saved any connections yet, the resource list will be empty.

**The Install Config button is greyed out**
- The config file for that client does not exist yet. Start the AI client at least once so it creates its config directory, then try again.
