import { vi } from 'vitest'

// Mock data storage for simulating database
let mockData: Record<string, unknown[]> = {
  subscriptions: [],
  categories: [],
  settings: [],
  payments: [],
  payment_cards: [],
}

// Reset mock data between tests
export function resetMockData() {
  mockData = {
    subscriptions: [],
    categories: [],
    settings: [],
    payments: [],
    payment_cards: [],
  }
}

// Seed mock data
export function seedMockData(table: string, data: unknown[]) {
  mockData[table] = data
}

// Get mock data
export function getMockData(table: string) {
  return mockData[table] || []
}

// Mock Database class
class MockDatabase {
  async select<T>(sql: string, _params: unknown[] = []): Promise<T[]> {
    // Parse table name from SQL
    const tableMatch = sql.match(/FROM\s+(\w+)/i)
    const table = tableMatch?.[1]
    if (table && mockData[table]) {
      return mockData[table] as T[]
    }
    return [] as T[]
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    // Handle INSERT
    if (sql.toUpperCase().startsWith('INSERT')) {
      const tableMatch = sql.match(/INTO\s+(\w+)/i)
      const table = tableMatch?.[1]
      if (table) {
        // Simple mock: add the params as an object (would need more sophisticated parsing in real use)
        const columns =
          sql
            .match(/\(([^)]+)\)\s+VALUES/i)?.[1]
            ?.split(',')
            .map((c) => c.trim()) || []
        const values = params.slice(0, columns.length)
        const obj: Record<string, unknown> = {}
        columns.forEach((col, i) => {
          obj[col] = values[i]
        })
        mockData[table] = [...(mockData[table] || []), obj]
      }
    }
    // Handle UPDATE
    else if (sql.toUpperCase().startsWith('UPDATE')) {
      const tableMatch = sql.match(/UPDATE\s+(\w+)/i)
      const table = tableMatch?.[1]
      if (table && mockData[table]) {
        // Get the ID from params (last param is typically the WHERE id)
        const id = params[params.length - 1]
        mockData[table] = mockData[table].map((item: unknown) => {
          const record = item as Record<string, unknown>
          if (record.id === id) {
            // Simple update - would need more sophisticated parsing
            return { ...record, updated_at: new Date().toISOString() }
          }
          return item
        })
      }
    }
    // Handle DELETE
    else if (sql.toUpperCase().startsWith('DELETE')) {
      const tableMatch = sql.match(/FROM\s+(\w+)/i)
      const table = tableMatch?.[1]
      if (table && mockData[table]) {
        const id = params[0]
        mockData[table] = mockData[table].filter((item: unknown) => {
          const record = item as Record<string, unknown>
          return record.id !== id
        })
      }
    }
  }

  async close(): Promise<void> {
    // No-op for mock
  }
}

// Create mock Database module
export const mockDatabase = {
  load: vi.fn().mockResolvedValue(new MockDatabase()),
}

// Export for direct mock injection
export { MockDatabase }
