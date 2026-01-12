import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:subby.db')
  }
  return db
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getDatabase()
  return database.select<T[]>(sql, params)
}

export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  const database = await getDatabase()
  await database.execute(sql, params)
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
  }
}
