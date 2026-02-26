# Commands Cheatsheet

## App Development

- `pnpm tauri dev`
- `pnpm tauri build`
- `pnpm start`

## Quality

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`
- `pnpm check`

## Testing

- `pnpm test`
- `pnpm test:run`
- `pnpm test:e2e`
- `pnpm test:coverage`
- `cargo test --workspace`

## Release

- `pnpm release:dry`
- `pnpm release`
- `pnpm sync-versions` (normally run by `release-it` hook)

## Discord Bot

- `pnpm bot:dev`
- `pnpm bot:build`
- `pnpm bot:start`

## CLI (subby-mcp)

- `subby-mcp list` — List all subscriptions
- `subby-mcp add <name> <amount> <cycle> <next-date>` — Add a subscription
- `subby-mcp update <id> [--name X] [--amount X] ...` — Update a subscription
- `subby-mcp remove <id>` — Remove a subscription
- `subby-mcp toggle <id>` — Pause/resume a subscription
- `subby-mcp pay <sub-id> <due-date> <amount>` — Record a payment
- `subby-mcp skip <sub-id> <due-date> <amount>` — Skip a payment
- `subby-mcp categories` — List all categories
- `subby-mcp add-category <name> <color> <icon>` — Add a category
- `subby-mcp upcoming [--days 7]` — Show upcoming payments
- `subby-mcp stats` — Show dashboard statistics
- `subby-mcp export [--output file.json]` — Export data
- `subby-mcp import <file.json> [--clear]` — Import data
- `subby-mcp serve` — Start MCP server explicitly
- `subby-mcp` — Start MCP server (default)
