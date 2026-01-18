import Database from '@tauri-apps/plugin-sql'

/** Singleton database connection instance */
let db: Database | null = null

/**
 * Gets or creates the SQLite database connection.
 * Uses a singleton pattern to ensure only one connection exists.
 * @returns Promise resolving to the Database instance
 * @example
 * const db = await getDatabase()
 */
export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:subby.db')
  }
  return db
}

/**
 * Executes a SELECT query and returns typed results.
 * @template T - The expected row type
 * @param sql - SQL query string with optional parameter placeholders (?)
 * @param params - Array of parameter values to bind to placeholders
 * @returns Promise resolving to an array of typed results
 * @example
 * const subs = await query<Subscription>('SELECT * FROM subscriptions WHERE id = ?', ['abc'])
 */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getDatabase()
  return database.select<T[]>(sql, params)
}

/**
 * Executes a write operation (INSERT, UPDATE, DELETE).
 * @param sql - SQL statement with optional parameter placeholders (?)
 * @param params - Array of parameter values to bind to placeholders
 * @returns Promise that resolves when the operation completes
 * @example
 * await execute('UPDATE subscriptions SET name = ? WHERE id = ?', ['Netflix', 'abc'])
 */
export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  const database = await getDatabase()
  await database.execute(sql, params)
}
