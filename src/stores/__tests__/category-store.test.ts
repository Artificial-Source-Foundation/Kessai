import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCategoryStore } from '../category-store'

// Mock data
const mockCategories = [
  {
    id: 'cat-streaming',
    name: 'Streaming',
    color: '#8b5cf6',
    icon: 'play-circle',
    is_default: 1,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-music',
    name: 'Music',
    color: '#f59e0b',
    icon: 'music',
    is_default: 1,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-custom',
    name: 'Custom Category',
    color: '#10b981',
    icon: 'box',
    is_default: 0,
    created_at: '2024-01-15T00:00:00.000Z',
  },
]

const mockQuery = vi.fn()
const mockExecute = vi.fn()

vi.mock('@/lib/database', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  execute: (...args: unknown[]) => mockExecute(...args),
}))

describe('useCategoryStore', () => {
  beforeEach(() => {
    // Reset store state
    useCategoryStore.setState({
      categories: [],
      isLoading: false,
      error: null,
    })

    // Reset mocks
    vi.clearAllMocks()
    mockQuery.mockResolvedValue(mockCategories)
    mockExecute.mockResolvedValue(undefined)
  })

  describe('fetch', () => {
    it('fetches categories and updates state', async () => {
      await useCategoryStore.getState().fetch()

      const state = useCategoryStore.getState()
      expect(state.categories).toHaveLength(3)
      expect(state.categories[0].name).toBe('Streaming')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('converts is_default to boolean', async () => {
      await useCategoryStore.getState().fetch()

      const state = useCategoryStore.getState()
      expect(typeof state.categories[0].is_default).toBe('boolean')
      expect(state.categories[0].is_default).toBe(true)
      expect(state.categories[2].is_default).toBe(false)
    })

    it('sets loading state during fetch', async () => {
      const fetchPromise = useCategoryStore.getState().fetch()
      expect(useCategoryStore.getState().isLoading).toBe(true)

      await fetchPromise
      expect(useCategoryStore.getState().isLoading).toBe(false)
    })

    it('handles fetch errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'))

      await useCategoryStore.getState().fetch()

      const state = useCategoryStore.getState()
      expect(state.error).toBe('Error: Database error')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('add', () => {
    it('adds a new category optimistically', async () => {
      const newCategory = {
        name: 'New Category',
        color: '#ef4444',
        icon: 'star',
      }

      await useCategoryStore.getState().add(newCategory)

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO categories'),
        expect.arrayContaining([expect.any(String), 'New Category', '#ef4444', 'star'])
      )
      // State should be updated optimistically
      const state = useCategoryStore.getState()
      expect(state.categories.some((c) => c.name === 'New Category')).toBe(true)
    })

    it('rolls back on add failure', async () => {
      mockExecute.mockRejectedValue(new Error('Insert failed'))

      const newCategory = {
        name: 'Failed Category',
        color: '#ef4444',
        icon: 'star',
      }

      await expect(useCategoryStore.getState().add(newCategory)).rejects.toThrow('Insert failed')
      // State should be rolled back
      const state = useCategoryStore.getState()
      expect(state.categories.some((c) => c.name === 'Failed Category')).toBe(false)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      // Set initial state with categories for update tests
      useCategoryStore.setState({
        categories: mockCategories.map((c) => ({
          ...c,
          is_default: Boolean(c.is_default),
        })),
        isLoading: false,
        error: null,
      })
    })

    it('updates an existing category optimistically', async () => {
      await useCategoryStore.getState().update('cat-custom', { name: 'Updated Category' })

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE categories'),
        expect.arrayContaining(['Updated Category', 'cat-custom'])
      )
      // State should be updated optimistically
      const state = useCategoryStore.getState()
      expect(state.categories.find((c) => c.id === 'cat-custom')?.name).toBe('Updated Category')
    })

    it('ignores protected fields', async () => {
      await useCategoryStore.getState().update('cat-custom', {
        name: 'Updated',
        is_default: true, // Should be ignored
      } as Record<string, unknown>)

      // The execute call should not contain is_default
      const executeCall = mockExecute.mock.calls[0]
      expect(executeCall[0]).not.toContain('is_default')
    })

    it('rolls back on update failure', async () => {
      mockExecute.mockRejectedValue(new Error('Update failed'))

      await expect(
        useCategoryStore.getState().update('cat-custom', { name: 'Failed Update' })
      ).rejects.toThrow('Update failed')
      // State should be rolled back
      const state = useCategoryStore.getState()
      expect(state.categories.find((c) => c.id === 'cat-custom')?.name).toBe('Custom Category')
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      // Set initial state with categories
      useCategoryStore.setState({
        categories: mockCategories.map((c) => ({
          ...c,
          is_default: Boolean(c.is_default),
        })),
        isLoading: false,
        error: null,
      })
    })

    it('removes a custom category optimistically', async () => {
      await useCategoryStore.getState().remove('cat-custom')

      // Should update subscriptions first
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE subscriptions SET category_id = NULL'),
        ['cat-custom']
      )
      // Then delete the category
      expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM categories'), [
        'cat-custom',
      ])
      // State should be updated optimistically
      const state = useCategoryStore.getState()
      expect(state.categories.some((c) => c.id === 'cat-custom')).toBe(false)
    })

    it('throws error when trying to remove default category', async () => {
      await expect(useCategoryStore.getState().remove('cat-streaming')).rejects.toThrow(
        'Cannot delete default category'
      )
    })

    it('rolls back on remove failure', async () => {
      mockExecute.mockRejectedValue(new Error('Delete failed'))

      await expect(useCategoryStore.getState().remove('cat-custom')).rejects.toThrow(
        'Delete failed'
      )
      // State should be rolled back
      const state = useCategoryStore.getState()
      expect(state.categories.some((c) => c.id === 'cat-custom')).toBe(true)
    })
  })

  describe('getById', () => {
    beforeEach(async () => {
      useCategoryStore.setState({
        categories: mockCategories.map((c) => ({
          ...c,
          is_default: Boolean(c.is_default),
        })),
        isLoading: false,
        error: null,
      })
    })

    it('returns category by id', () => {
      const category = useCategoryStore.getState().getById('cat-streaming')
      expect(category).toBeDefined()
      expect(category?.name).toBe('Streaming')
    })

    it('returns undefined for non-existent id', () => {
      const category = useCategoryStore.getState().getById('non-existent')
      expect(category).toBeUndefined()
    })
  })
})
