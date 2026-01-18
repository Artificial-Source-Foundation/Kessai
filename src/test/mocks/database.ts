import { vi } from 'vitest'

// Type-safe mock data storage
interface MockDataStore {
  subscriptions: Array<Record<string, unknown>>
  categories: Array<Record<string, unknown>>
  settings: Array<Record<string, unknown>>
  payments: Array<Record<string, unknown>>
  payment_cards: Array<Record<string, unknown>>
}

let mockData: MockDataStore = {
  subscriptions: [],
  categories: [],
  settings: [],
  payments: [],
  payment_cards: [],
}

// Reset mock data between tests
export function resetMockDatabase() {
  mockData = {
    subscriptions: [],
    categories: [],
    settings: [],
    payments: [],
    payment_cards: [],
  }
}

// Seed subscriptions
export function seedSubscriptions(data: Array<Record<string, unknown>>) {
  mockData.subscriptions = data
}

// Seed categories
export function seedCategories(data: Array<Record<string, unknown>>) {
  mockData.categories = data
}

// Get current mock subscriptions
export function getMockSubscriptions() {
  return mockData.subscriptions
}

// Get current mock categories
export function getMockCategories() {
  return mockData.categories
}

// Mock query function
export const mockQuery = vi.fn(async <T>(sql: string, _params: unknown[] = []): Promise<T[]> => {
  const lowerSql = sql.toLowerCase()

  if (lowerSql.includes('from subscriptions')) {
    return mockData.subscriptions.map((s) => ({ ...s, is_active: Boolean(s.is_active) })) as T[]
  }
  if (lowerSql.includes('from categories')) {
    return mockData.categories as T[]
  }
  if (lowerSql.includes('from settings')) {
    return mockData.settings as T[]
  }
  if (lowerSql.includes('from payments')) {
    return mockData.payments as T[]
  }
  if (lowerSql.includes('from payment_cards')) {
    return mockData.payment_cards as T[]
  }

  return [] as T[]
})

// Mock execute function
export const mockExecute = vi.fn(async (sql: string, params: unknown[] = []): Promise<void> => {
  const lowerSql = sql.toLowerCase()

  if (lowerSql.startsWith('insert into subscriptions')) {
    const [
      id,
      name,
      amount,
      currency,
      billing_cycle,
      billing_day,
      category_id,
      color,
      logo_url,
      notes,
      is_active,
      next_payment_date,
      created_at,
      updated_at,
    ] = params
    mockData.subscriptions.push({
      id,
      name,
      amount,
      currency,
      billing_cycle,
      billing_day,
      category_id,
      color,
      logo_url,
      notes,
      is_active: is_active === 1,
      next_payment_date,
      created_at,
      updated_at,
    })
  } else if (lowerSql.startsWith('update subscriptions')) {
    const id = params[params.length - 1]
    const updateFields = sql.match(/SET\s+(.+?)\s+WHERE/i)?.[1] || ''
    const fieldNames = updateFields.split(',').map((f) => f.split('=')[0].trim())

    mockData.subscriptions = mockData.subscriptions.map((sub) => {
      if (sub.id === id) {
        const updated = { ...sub }
        fieldNames.forEach((field, index) => {
          if (field !== 'updated_at') {
            updated[field] = params[index]
          }
        })
        updated.updated_at = new Date().toISOString()
        return updated
      }
      return sub
    })
  } else if (lowerSql.startsWith('delete from subscriptions')) {
    const id = params[0]
    mockData.subscriptions = mockData.subscriptions.filter((s) => s.id !== id)
  } else if (lowerSql.startsWith('insert into categories')) {
    const [id, name, color, icon, is_default, created_at] = params
    mockData.categories.push({ id, name, color, icon, is_default, created_at })
  } else if (lowerSql.startsWith('delete from categories')) {
    const id = params[0]
    mockData.categories = mockData.categories.filter((c) => c.id !== id)
  }
})

// Setup database mocks - call this in test setup
export function setupDatabaseMocks() {
  vi.mock('@/lib/database', () => ({
    query: mockQuery,
    execute: mockExecute,
    getDatabase: vi.fn(),
    closeDatabase: vi.fn(),
  }))
}
