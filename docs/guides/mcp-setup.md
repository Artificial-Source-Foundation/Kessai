# MCP Server Setup Guide

Subby includes an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that lets AI assistants manage your subscriptions through natural language.

## Prerequisites

- [Rust toolchain](https://rustup.rs/) (for building from source)
- An MCP-compatible client (Claude Desktop, Claude Code, etc.)

## Building

```bash
# From the repository root
cargo build --release -p subby-mcp

# The binary is at:
# ./target/release/subby-mcp
```

## Claude Desktop Configuration

Add to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "subby": {
      "command": "/absolute/path/to/subby-mcp",
      "args": []
    }
  }
}
```

## Claude Code Configuration

Add to your project's `.mcp.json` or global MCP settings:

```json
{
  "mcpServers": {
    "subby": {
      "command": "/absolute/path/to/subby-mcp",
      "args": []
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUBBY_DB_PATH` | Path to the SQLite database file | Platform-specific app data directory |
| `RUST_LOG` | Log level filter (e.g., `subby_mcp=debug`) | `subby_mcp=info` |

You can also pass `--db-path /path/to/subby.db` as a CLI argument.

### Database Location

The MCP server uses the same database as the desktop app:

| Platform | Default Path |
|----------|-------------|
| Linux | `~/.local/share/com.asf.subby/subby.db` |
| macOS | `~/Library/Application Support/com.asf.subby/subby.db` |
| Windows | `%APPDATA%\com.asf.subby\subby.db` |

## Available Tools

| Tool | Description |
|------|-------------|
| `add_subscription` | Add a new subscription with name, amount, cycle, and next payment date |
| `update_subscription` | Update any field of an existing subscription by ID |
| `remove_subscription` | Delete a subscription by ID |
| `toggle_subscription` | Pause or resume a subscription |
| `mark_payment_paid` | Record a specific payment as paid |
| `skip_payment` | Skip a specific payment |
| `add_category` | Create a new custom category with name, color, and icon |
| `get_upcoming_payments` | List subscriptions with payments due within N days |
| `get_spending_by_category` | Get monthly spending breakdown by category |
| `export_data` | Export all data as a JSON backup |
| `import_data` | Import data from a JSON backup string |

## Available Resources

| URI | Description |
|-----|-------------|
| `subby://subscriptions` | All tracked subscriptions |
| `subby://categories` | All categories (default + custom) |
| `subby://settings` | Current app settings (theme, currency, etc.) |
| `subby://cards` | All payment cards |
| `subby://stats/dashboard` | Dashboard statistics (monthly/yearly totals, counts) |
| `subby://subscriptions/{id}` | Single subscription by ID |
| `subby://payments/{year}/{month}` | Payment records for a specific month |

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `subscription_summary` | Comprehensive summary of all subscriptions grouped by category |
| `spending_analysis` | Analysis of spending patterns with optimization suggestions |
| `upcoming_payments` | Chronological breakdown of upcoming payments for 30 days |

## Troubleshooting

### Server won't start

1. Check the binary path is absolute and the file exists
2. Verify the database directory exists and is writable
3. Check logs: set `RUST_LOG=subby_mcp=debug` for verbose output

### Database permissions

The MCP server needs read/write access to the database file. If the desktop app and MCP server run as different users, ensure the database file has appropriate permissions.

### Database locked

If you see "database is locked" errors, it may be because both the desktop app and MCP server are writing simultaneously. SQLite supports concurrent reads but serializes writes. This should resolve automatically after a brief retry.
