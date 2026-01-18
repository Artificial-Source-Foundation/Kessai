import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSubscriptionStore } from '../subscription-store'

// Mock the database module
const mockSubscriptions = [
  {
    id: 'sub-1',
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    billing_cycle: 'monthly' as const,
    billing_day: null,
    category_id: 'cat-streaming',
    color: '#e50914',
    logo_url: null,
    notes: null,
    is_active: 1,
    next_payment_date: '2024-02-15',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'sub-2',
    name: 'Spotify',
    amount: 9.99,
    currency: 'USD',
    billing_cycle: 'monthly' as const,
    billing_day: null,
    category_id: 'cat-music',
    color: '#1db954',
    logo_url: null,
    notes: null,
    is_active: 1,
    next_payment_date: '2024-02-20',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
]

const mockQuery = vi.fn()
const mockExecute = vi.fn()

vi.mock('@/lib/database', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  execute: (...args: unknown[]) => mockExecute(...args),
}))

describe('useSubscriptionStore', () => {
  beforeEach(() => {
    // Reset store state
    useSubscriptionStore.setState({
      subscriptions: [],
      isLoading: false,
      error: null,
    })

    // Reset mocks
    vi.clearAllMocks()
    mockQuery.mockResolvedValue(mockSubscriptions)
    mockExecute.mockResolvedValue(undefined)
  })

  describe('fetch', () => {
    it('fetches subscriptions and updates state', async () => {
      await useSubscriptionStore.getState().fetch()

      const state = useSubscriptionStore.getState()
      expect(state.subscriptions).toHaveLength(2)
      expect(state.subscriptions[0].name).toBe('Netflix')
      expect(state.subscriptions[1].name).toBe('Spotify')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('converts is_active to boolean', async () => {
      await useSubscriptionStore.getState().fetch()

      const state = useSubscriptionStore.getState()
      expect(typeof state.subscriptions[0].is_active).toBe('boolean')
      expect(state.subscriptions[0].is_active).toBe(true)
    })

    it('sets loading state during fetch', async () => {
      const fetchPromise = useSubscriptionStore.getState().fetch()

      // Check loading state is true during fetch
      expect(useSubscriptionStore.getState().isLoading).toBe(true)

      await fetchPromise

      expect(useSubscriptionStore.getState().isLoading).toBe(false)
    })

    it('handles fetch errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'))

      await useSubscriptionStore.getState().fetch()

      const state = useSubscriptionStore.getState()
      expect(state.error).toBe('Error: Database error')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('add', () => {
    it('adds a new subscription optimistically', async () => {
      const newSub = {
        name: 'Disney+',
        amount: 7.99,
        currency: 'USD',
        billing_cycle: 'monthly' as const,
        billing_day: null,
        category_id: 'cat-streaming',
        color: '#113ccf',
        logo_url: null,
        notes: null,
        is_active: true,
        next_payment_date: '2024-02-25',
      }

      await useSubscriptionStore.getState().add(newSub)

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO subscriptions'),
        expect.arrayContaining([expect.any(String), 'Disney+', 7.99])
      )
      // Should update state optimistically (no refetch)
      const state = useSubscriptionStore.getState()
      expect(state.subscriptions.some((s) => s.name === 'Disney+')).toBe(true)
    })

    it('rolls back on add failure', async () => {
      mockExecute.mockRejectedValue(new Error('Insert failed'))

      const newSub = {
        name: 'Test',
        amount: 9.99,
        currency: 'USD',
        billing_cycle: 'monthly' as const,
        billing_day: null,
        category_id: null,
        color: null,
        logo_url: null,
        notes: null,
        is_active: true,
        next_payment_date: '2024-02-25',
      }

      await expect(useSubscriptionStore.getState().add(newSub)).rejects.toThrow('Insert failed')
      // Should rollback state on error
      const state = useSubscriptionStore.getState()
      expect(state.subscriptions.some((s) => s.name === 'Test')).toBe(false)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      // Set initial state with subscriptions for update tests
      useSubscriptionStore.setState({
        subscriptions: [
          { ...mockSubscriptions[0], is_active: true },
          { ...mockSubscriptions[1], is_active: true },
        ],
        isLoading: false,
        error: null,
      })
    })

    it('updates an existing subscription optimistically', async () => {
      await useSubscriptionStore.getState().update('sub-1', { name: 'Netflix Premium' })

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE subscriptions'),
        expect.arrayContaining(['Netflix Premium'])
      )
      // State should be updated optimistically
      const state = useSubscriptionStore.getState()
      expect(state.subscriptions.find((s) => s.id === 'sub-1')?.name).toBe('Netflix Premium')
    })

    it('updates multiple fields at once', async () => {
      await useSubscriptionStore.getState().update('sub-1', {
        name: 'Netflix Premium',
        amount: 22.99,
        billing_cycle: 'monthly',
      })

      expect(mockExecute).toHaveBeenCalled()
      // State should reflect all updates
      const state = useSubscriptionStore.getState()
      const sub = state.subscriptions.find((s) => s.id === 'sub-1')
      expect(sub?.name).toBe('Netflix Premium')
      expect(sub?.amount).toBe(22.99)
    })

    it('rolls back on update failure', async () => {
      mockExecute.mockRejectedValue(new Error('Update failed'))

      await expect(
        useSubscriptionStore.getState().update('sub-1', { name: 'Failed Update' })
      ).rejects.toThrow('Update failed')
      // State should be rolled back
      const state = useSubscriptionStore.getState()
      expect(state.subscriptions.find((s) => s.id === 'sub-1')?.name).toBe('Netflix')
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      // Set initial state with subscriptions
      useSubscriptionStore.setState({
        subscriptions: [
          { ...mockSubscriptions[0], is_active: true },
          { ...mockSubscriptions[1], is_active: true },
        ],
        isLoading: false,
        error: null,
      })
    })

    it('removes a subscription optimistically', async () => {
      await useSubscriptionStore.getState().remove('sub-1')

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM subscriptions'),
        ['sub-1']
      )

      const state = useSubscriptionStore.getState()
      expect(state.subscriptions).toHaveLength(1)
      expect(state.subscriptions[0].id).toBe('sub-2')
    })

    it('rolls back on remove failure', async () => {
      mockExecute.mockRejectedValue(new Error('Delete failed'))

      await expect(useSubscriptionStore.getState().remove('sub-1')).rejects.toThrow('Delete failed')
      // State should be rolled back
      const state = useSubscriptionStore.getState()
      expect(state.subscriptions).toHaveLength(2)
      expect(state.subscriptions.some((s) => s.id === 'sub-1')).toBe(true)
    })
  })

  describe('toggleActive', () => {
    beforeEach(async () => {
      useSubscriptionStore.setState({
        subscriptions: [
          { ...mockSubscriptions[0], is_active: true },
          { ...mockSubscriptions[1], is_active: true },
        ],
        isLoading: false,
        error: null,
      })
    })

    it('toggles subscription active state', async () => {
      await useSubscriptionStore.getState().toggleActive('sub-1')

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE subscriptions'),
        expect.arrayContaining([0]) // is_active toggled to false (0)
      )
    })
  })
})
