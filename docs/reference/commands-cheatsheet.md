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

## Unified Command

- `kessai` — Open the desktop app
- `kessai app` — Open the desktop app explicitly
- `kessai list` — List all subscriptions
- `kessai add <name> <amount> <cycle> <next-date>` — Add a subscription
- `kessai update <id> [--name X] [--amount X] ...` — Update a subscription
- `kessai remove <id>` — Remove a subscription
- `kessai toggle <id>` — Pause/resume a subscription
- `kessai pay <sub-id> <due-date> <amount>` — Record a payment
- `kessai skip <sub-id> <due-date> <amount>` — Skip a payment
- `kessai categories` — List all categories
- `kessai add-category <name> <color> <icon>` — Add a category
- `kessai upcoming [--days 7]` — Show upcoming payments
- `kessai stats` — Show dashboard statistics
- `kessai export [--output file.json]` — Export data
- `kessai import <file.json> [--clear]` — Import data
- `kessai mcp` — Start MCP server (default MCP mode)
- `kessai web --port 3000` — Start the web server

## Specialist Binaries

- `kessai-desktop` — Desktop app executable
- `kessai-mcp` — Raw CLI + MCP binary
- `kessai-web` — Raw web server binary
