import { create } from 'zustand'
import { apiInvoke as invoke } from '@/lib/api'
import type { PriceChange } from '@/types/price-history'

type PriceHistoryState = {
  recentChanges: PriceChange[]
  latestBySubscription: Record<string, PriceChange | null>
  isLoading: boolean
  error: string | null

  fetchRecent: (days?: number) => Promise<void>
  fetchBySubscription: (subscriptionId: string) => Promise<PriceChange[]>
  getLatest: (subscriptionId: string) => Promise<PriceChange | null>
  fetchLatestForSubscriptions: (subscriptionIds: string[]) => Promise<void>
  invalidateLatest: (subscriptionIds?: string[]) => void
}

export const usePriceHistoryStore = create<PriceHistoryState>((set, get) => ({
  recentChanges: [],
  latestBySubscription: {},
  isLoading: false,
  error: null,

  fetchRecent: async (days = 90) => {
    set({ isLoading: true, error: null })
    try {
      const changes = await invoke<PriceChange[]>('get_recent_price_changes', { days })
      set({ recentChanges: changes, isLoading: false })
    } catch (e) {
      console.error('Failed to fetch recent price changes:', e)
      set({ error: String(e), isLoading: false })
    }
  },

  fetchBySubscription: async (subscriptionId: string) => {
    try {
      const changes = await invoke<PriceChange[]>('list_price_history', { subscriptionId })
      const latest = changes.length > 0 ? changes[0] : null
      set((state) => ({
        latestBySubscription: {
          ...state.latestBySubscription,
          [subscriptionId]: latest,
        },
      }))
      return changes
    } catch (e) {
      console.error('Failed to fetch price history for subscription:', e)
      return []
    }
  },

  getLatest: async (subscriptionId: string) => {
    const cached = get().latestBySubscription[subscriptionId]
    if (cached !== undefined) return cached

    try {
      const changes = await invoke<PriceChange[]>('list_price_history', { subscriptionId })
      const latest = changes.length > 0 ? changes[0] : null
      set((state) => ({
        latestBySubscription: {
          ...state.latestBySubscription,
          [subscriptionId]: latest,
        },
      }))
      return latest
    } catch (e) {
      console.error('Failed to get latest price change:', e)
      return null
    }
  },

  fetchLatestForSubscriptions: async (subscriptionIds: string[]) => {
    const uniqueIds = [...new Set(subscriptionIds)].filter(Boolean)
    if (uniqueIds.length === 0) return

    try {
      const latestChanges = await invoke<PriceChange[]>('list_latest_price_history', {
        subscriptionIds: uniqueIds,
      })

      const latestBySubscription: Record<string, PriceChange | null> = {}
      for (const id of uniqueIds) {
        latestBySubscription[id] = null
      }
      for (const change of latestChanges) {
        latestBySubscription[change.subscription_id] = change
      }

      set((state) => ({
        latestBySubscription: {
          ...state.latestBySubscription,
          ...latestBySubscription,
        },
      }))
    } catch (e) {
      console.error('Failed to fetch latest price changes:', e)
    }
  },

  invalidateLatest: (subscriptionIds) => {
    if (!subscriptionIds || subscriptionIds.length === 0) {
      set({ latestBySubscription: {} })
      return
    }

    const ids = new Set(subscriptionIds)
    set((state) => {
      const next = { ...state.latestBySubscription }
      for (const id of ids) {
        delete next[id]
      }
      return { latestBySubscription: next }
    })
  },
}))
