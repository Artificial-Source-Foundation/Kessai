# Backend API Reference

This document describes the Rust backend commands and database schema for Subby.

## Tauri Commands

### `process_logo`

Processes and saves a subscription logo image.

**Signature:**

```rust
#[tauri::command]
async fn process_logo(
    app: AppHandle,
    image_data: Vec<u8>,
    filename: String
) -> Result<String, String>
```

**Parameters:**

- `image_data`: Raw image bytes (PNG, JPG, or WebP)
- `filename`: Desired filename (validated for safety)

**Returns:**

- Success: Path to saved WebP image
- Error: Description of what went wrong

**Validation Rules:**

- Filename must match: `^[a-zA-Z0-9_-]+\.webp$`
- No path traversal characters (`..`, `/`, `\`)
- No leading dots
- Must end with `.webp`

**Processing:**

1. Decodes image from bytes
2. Resizes to 256x256 (prevents DoS from huge images)
3. Converts to WebP format
4. Saves to app data directory

**Example (Frontend):**

```typescript
import { invoke } from '@tauri-apps/api/core'

const logoPath = await invoke<string>('process_logo', {
  imageData: Array.from(new Uint8Array(buffer)),
  filename: 'netflix-logo.webp',
})
```

---

## Database Schema

### Tables Overview

| Table           | Purpose                 | Key Fields                                         |
| --------------- | ----------------------- | -------------------------------------------------- |
| `subscriptions` | User subscriptions      | id, name, amount, billing_cycle, next_payment_date |
| `categories`    | Subscription categories | id, name, color, icon, is_default                  |
| `payments`      | Payment history         | id, subscription_id, amount, status, paid_at       |
| `settings`      | User preferences        | id (singleton), theme, currency                    |

### `subscriptions`

```sql
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    billing_cycle TEXT NOT NULL,  -- 'weekly'|'monthly'|'quarterly'|'yearly'|'custom'
    billing_day INTEGER,          -- 1-31 for specific day of month
    next_payment_date TEXT,       -- ISO date: '2024-02-15'
    category_id TEXT,             -- FK to categories
    card_id TEXT,                 -- FK to payment_cards (optional)
    color TEXT,                   -- Hex: '#8b5cf6'
    logo_url TEXT,                -- Path to logo file
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indices for common queries
CREATE INDEX idx_subscriptions_category ON subscriptions(category_id);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_date);
```

### `categories`

```sql
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,          -- Hex: '#8b5cf6'
    icon TEXT NOT NULL,           -- Lucide icon name: 'play-circle'
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);
```

**Default Categories (seeded on first run):**

| Name             | Color   | Icon        |
| ---------------- | ------- | ----------- |
| Streaming        | #8b5cf6 | play-circle |
| Software         | #3b82f6 | code        |
| Gaming           | #10b981 | gamepad-2   |
| Music            | #f59e0b | music       |
| Cloud Storage    | #06b6d4 | cloud       |
| Productivity     | #ec4899 | briefcase   |
| Health & Fitness | #14b8a6 | heart-pulse |
| News & Reading   | #f97316 | newspaper   |
| Other            | #6b7280 | box         |

### `payments`

```sql
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    amount REAL NOT NULL,
    paid_at TEXT NOT NULL,        -- ISO datetime
    due_date TEXT NOT NULL,       -- ISO date
    status TEXT NOT NULL,         -- 'paid'|'skipped'|'pending'
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Indices
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_status ON payments(status);
```

### `settings`

```sql
CREATE TABLE settings (
    id TEXT PRIMARY KEY,          -- Always 'singleton'
    theme TEXT NOT NULL DEFAULT 'dark',
    currency TEXT NOT NULL DEFAULT 'USD',
    notification_enabled INTEGER NOT NULL DEFAULT 1,
    notification_days_before TEXT NOT NULL DEFAULT '[1,3,7]',  -- JSON array
    email TEXT,
    notification_email_enabled INTEGER NOT NULL DEFAULT 0,
    notification_desktop_enabled INTEGER NOT NULL DEFAULT 1
);
```

---

## Database Migrations

Migrations are embedded in the Rust binary and run automatically on app start.

**Location:** `src-tauri/migrations/`

**Migration Order:**

1. `001_initial.sql` - Create base tables
2. `002_add_card_id.sql` - Add payment card support
3. `003_add_payments.sql` - Add payment tracking
4. `004_add_notifications.sql` - Add notification settings

**Adding a New Migration:**

1. Create `src-tauri/migrations/00X_description.sql`
2. Add migration to `src-tauri/src/lib.rs`:
   ```rust
   .add_migrations(
       "sqlite",
       vec![
           Migration { /* ... */ },
           // Add new migration here
       ]
   )
   ```

---

## SQL Plugin Usage

The frontend accesses the database via `tauri-plugin-sql`:

```typescript
import Database from '@tauri-apps/plugin-sql'

// Get database instance (singleton)
const db = await Database.load('sqlite:subby.db')

// Query
const rows = await db.select<Subscription[]>('SELECT * FROM subscriptions WHERE is_active = ?', [1])

// Execute
await db.execute('INSERT INTO subscriptions (id, name, amount) VALUES (?, ?, ?)', [
  id,
  name,
  amount,
])
```

**Important:** Always use parameterized queries to prevent SQL injection.

---

## File Storage

### Logo Storage

Logos are stored in the app data directory:

| Platform | Path                                         |
| -------- | -------------------------------------------- |
| Linux    | `~/.local/share/subby/logos/`                |
| macOS    | `~/Library/Application Support/subby/logos/` |
| Windows  | `%APPDATA%/subby/logos/`                     |

**File Format:** WebP (converted from any input format)
**Max Size:** 256x256 pixels

### Database Location

| Platform | Path                                           |
| -------- | ---------------------------------------------- |
| Linux    | `~/.local/share/subby/subby.db`                |
| macOS    | `~/Library/Application Support/subby/subby.db` |
| Windows  | `%APPDATA%/subby/subby.db`                     |

---

## Content Security Policy

Defined in `src-tauri/capabilities/default.json`:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
```

This restricts:

- Scripts to same origin only
- Styles allow inline (required for Tailwind)
- Images allow data URLs and blobs (for logo previews)
- No external resources

---

## Error Handling

Backend errors are returned as strings and should be caught on the frontend:

```typescript
try {
  await invoke('process_logo', { imageData, filename })
} catch (error) {
  // error is a string describing what went wrong
  console.error('Logo processing failed:', error)
  toast.error('Failed to upload logo')
}
```

Common error messages:

- `"Invalid filename"` - Filename validation failed
- `"Failed to decode image"` - Image data is corrupt
- `"Failed to save image"` - File system error
