import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the Tauri SQL plugin
const mockSelect = vi.fn()
const mockExecute = vi.fn()
const mockLoad = vi.fn()

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: (...args: unknown[]) => mockLoad(...args),
  },
}))

// Dynamic imports are used in tests to reset the singleton

describe('database', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset the singleton by re-importing the module
    vi.resetModules()

    // Setup default mock implementations
    mockLoad.mockResolvedValue({
      select: mockSelect,
      execute: mockExecute,
    })
    mockSelect.mockResolvedValue([])
    mockExecute.mockResolvedValue(undefined)
  })

  describe('getDatabase', () => {
    it('loads database on first call', async () => {
      // Re-import to get fresh module state
      const { getDatabase: freshGetDatabase } = await import('../database')

      await freshGetDatabase()

      expect(mockLoad).toHaveBeenCalledWith('sqlite:subby.db')
    })

    it('returns the same instance on subsequent calls (singleton)', async () => {
      const { getDatabase: freshGetDatabase } = await import('../database')

      const db1 = await freshGetDatabase()
      const db2 = await freshGetDatabase()

      expect(db1).toBe(db2)
      expect(mockLoad).toHaveBeenCalledTimes(1)
    })

    it('returns database instance with select and execute methods', async () => {
      const { getDatabase: freshGetDatabase } = await import('../database')

      const db = await freshGetDatabase()

      expect(db).toHaveProperty('select')
      expect(db).toHaveProperty('execute')
    })
  })

  describe('query', () => {
    it('executes SELECT query with parameters', async () => {
      const mockData = [{ id: '1', name: 'Test' }]
      mockSelect.mockResolvedValue(mockData)

      const { query: freshQuery } = await import('../database')
      const result = await freshQuery<{ id: string; name: string }>(
        'SELECT * FROM test WHERE id = ?',
        ['1']
      )

      expect(mockSelect).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', ['1'])
      expect(result).toEqual(mockData)
    })

    it('uses empty array as default params', async () => {
      const { query: freshQuery } = await import('../database')

      await freshQuery('SELECT * FROM test')

      expect(mockSelect).toHaveBeenCalledWith('SELECT * FROM test', [])
    })

    it('returns typed results', async () => {
      interface TestType {
        id: string
        value: number
      }
      const mockData: TestType[] = [
        { id: '1', value: 100 },
        { id: '2', value: 200 },
      ]
      mockSelect.mockResolvedValue(mockData)

      const { query: freshQuery } = await import('../database')
      const result = await freshQuery<TestType>('SELECT * FROM test')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].value).toBe(100)
    })

    it('returns empty array when no results', async () => {
      mockSelect.mockResolvedValue([])

      const { query: freshQuery } = await import('../database')
      const result = await freshQuery('SELECT * FROM test WHERE id = ?', ['nonexistent'])

      expect(result).toEqual([])
    })
  })

  describe('execute', () => {
    it('executes INSERT statement with parameters', async () => {
      const { execute: freshExecute } = await import('../database')

      await freshExecute('INSERT INTO test (id, name) VALUES (?, ?)', ['1', 'Test'])

      expect(mockExecute).toHaveBeenCalledWith('INSERT INTO test (id, name) VALUES (?, ?)', [
        '1',
        'Test',
      ])
    })

    it('executes UPDATE statement with parameters', async () => {
      const { execute: freshExecute } = await import('../database')

      await freshExecute('UPDATE test SET name = ? WHERE id = ?', ['Updated', '1'])

      expect(mockExecute).toHaveBeenCalledWith('UPDATE test SET name = ? WHERE id = ?', [
        'Updated',
        '1',
      ])
    })

    it('executes DELETE statement with parameters', async () => {
      const { execute: freshExecute } = await import('../database')

      await freshExecute('DELETE FROM test WHERE id = ?', ['1'])

      expect(mockExecute).toHaveBeenCalledWith('DELETE FROM test WHERE id = ?', ['1'])
    })

    it('uses empty array as default params', async () => {
      const { execute: freshExecute } = await import('../database')

      await freshExecute('DELETE FROM test')

      expect(mockExecute).toHaveBeenCalledWith('DELETE FROM test', [])
    })

    it('resolves when operation completes', async () => {
      const { execute: freshExecute } = await import('../database')

      await expect(freshExecute('INSERT INTO test (id) VALUES (?)', ['1'])).resolves.toBeUndefined()
    })
  })
})
