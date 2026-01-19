use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};
use std::fs;
use std::path::PathBuf;
use image::ImageReader;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

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

fn get_logos_dir(app_handle: &tauri::AppHandle) -> PathBuf {
    let resource_dir = app_handle.path().resource_dir().unwrap_or_else(|_| PathBuf::from("."));
    let logos_dir = resource_dir.join("data").join("logos");
    fs::create_dir_all(&logos_dir).ok();
    logos_dir
}

/// Validates that a filename is safe (no path traversal)
fn is_valid_logo_filename(filename: &str) -> bool {
    // Only allow: alphanumeric, dash, underscore, dot, and must end with .webp
    let valid_chars = filename.chars().all(|c| {
        c.is_alphanumeric() || c == '-' || c == '_' || c == '.'
    });

    valid_chars
        && filename.ends_with(".webp")
        && !filename.contains("..")
        && !filename.contains('/')
        && !filename.contains('\\')
        && !filename.starts_with('.')
}

#[tauri::command]
fn save_logo(app_handle: tauri::AppHandle, source_path: String, subscription_id: String) -> Result<String, String> {
    let logos_dir = get_logos_dir(&app_handle);
    let filename = format!("{}.webp", subscription_id);
    let dest_path = logos_dir.join(&filename);

    let img = ImageReader::open(&source_path)
        .map_err(|e| format!("Failed to open image: {}", e))?
        .decode()
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    let resized = img.thumbnail(256, 256);
    
    resized.save_with_format(&dest_path, image::ImageFormat::WebP)
        .map_err(|e| format!("Failed to save WebP: {}", e))?;

    Ok(filename)
}

#[tauri::command]
fn get_logo_base64(app_handle: tauri::AppHandle, filename: String) -> Result<String, String> {
    if !is_valid_logo_filename(&filename) {
        return Err("Invalid filename".to_string());
    }

    let logos_dir = get_logos_dir(&app_handle);
    let file_path = logos_dir.join(&filename);

    let data = fs::read(&file_path)
        .map_err(|e| format!("Failed to read logo: {}", e))?;

    let base64_data = BASE64.encode(&data);
    Ok(format!("data:image/webp;base64,{}", base64_data))
}

#[tauri::command]
fn delete_logo(app_handle: tauri::AppHandle, filename: String) -> Result<(), String> {
    if !is_valid_logo_filename(&filename) {
        return Err("Invalid filename".to_string());
    }

    let logos_dir = get_logos_dir(&app_handle);
    let file_path = logos_dir.join(&filename);
    fs::remove_file(&file_path).ok();
    Ok(())
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
        .invoke_handler(tauri::generate_handler![save_logo, get_logo_base64, delete_logo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
