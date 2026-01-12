use tauri_plugin_sql::{Migration, MigrationKind};

fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    color TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    is_default INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS subscriptions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'USD',
                    billing_cycle TEXT NOT NULL,
                    billing_day INTEGER,
                    category_id TEXT REFERENCES categories(id),
                    color TEXT,
                    logo_url TEXT,
                    notes TEXT,
                    is_active INTEGER NOT NULL DEFAULT 1,
                    next_payment_date TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS settings (
                    id TEXT PRIMARY KEY DEFAULT 'singleton',
                    theme TEXT NOT NULL DEFAULT 'dark',
                    currency TEXT NOT NULL DEFAULT 'USD',
                    notification_enabled INTEGER NOT NULL DEFAULT 1,
                    notification_days_before TEXT NOT NULL DEFAULT '[1,3,7]'
                );

                CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category_id);
                CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON subscriptions(next_payment_date);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed_default_data",
            sql: r#"
                INSERT OR IGNORE INTO categories (id, name, color, icon, is_default) VALUES
                    ('cat-streaming', 'Streaming', '#8b5cf6', 'play-circle', 1),
                    ('cat-software', 'Software', '#3b82f6', 'code', 1),
                    ('cat-gaming', 'Gaming', '#10b981', 'gamepad-2', 1),
                    ('cat-music', 'Music', '#f59e0b', 'music', 1),
                    ('cat-cloud', 'Cloud Storage', '#06b6d4', 'cloud', 1),
                    ('cat-productivity', 'Productivity', '#ec4899', 'briefcase', 1),
                    ('cat-health', 'Health & Fitness', '#14b8a6', 'heart-pulse', 1),
                    ('cat-news', 'News & Reading', '#f97316', 'newspaper', 1),
                    ('cat-other', 'Other', '#6b7280', 'box', 1);

                INSERT OR IGNORE INTO settings (id) VALUES ('singleton');
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_payments_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS payments (
                    id TEXT PRIMARY KEY,
                    subscription_id TEXT NOT NULL,
                    amount REAL NOT NULL,
                    paid_at TEXT NOT NULL,
                    due_date TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'paid',
                    notes TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
                CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
                CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_notification_settings",
            sql: r#"
                ALTER TABLE settings ADD COLUMN email TEXT;
                ALTER TABLE settings ADD COLUMN notification_email_enabled INTEGER NOT NULL DEFAULT 0;
                ALTER TABLE settings ADD COLUMN notification_desktop_enabled INTEGER NOT NULL DEFAULT 1;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_payment_cards_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS payment_cards (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    card_type TEXT NOT NULL DEFAULT 'debit',
                    last_four TEXT,
                    color TEXT NOT NULL DEFAULT '#6b7280',
                    credit_limit REAL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                ALTER TABLE subscriptions ADD COLUMN card_id TEXT REFERENCES payment_cards(id);
            "#,
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:subby.db", get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
