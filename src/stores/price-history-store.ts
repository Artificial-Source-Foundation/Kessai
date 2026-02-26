import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { PriceChange } from '@/types/price-history'

type PriceHistoryState = {
  recentChanges: PriceChange[]
  isLoading: boolean

  fetchRecent: (days?: number) => Promise<void>
  fetchBySubscription: (subscriptionId: string) => Promise<PriceChange[]>
}

export const usePriceHistoryStore = create<PriceHistoryState>((set) => ({
  recentChanges: [],
  isLoading: false,

  fetchRecent: async (days = 90) => {
    set({ isLoading: true })
    try {
      const changes = await invoke<PriceChange[]>('get_recent_price_changes', { days })
      set({ recentChanges: changes, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchBySubscription: async (subscriptionId: string) => {
    const changes = await invoke<PriceChange[]>('list_price_history', { subscriptionId })
    return changes
  },
}))
