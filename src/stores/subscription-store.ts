import { create } from 'zustand'
import { query, execute } from '@/lib/database'
import type { Subscription, NewSubscription } from '@/types/subscription'

type SubscriptionState = {
  subscriptions: Subscription[]
  isLoading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (sub: NewSubscription) => Promise<void>
  update: (id: string, data: Partial<Subscription>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const subs = await query<Subscription>(
        'SELECT * FROM subscriptions ORDER BY next_payment_date ASC'
      )
      set({
        subscriptions: subs.map((s) => ({ ...s, is_active: Boolean(s.is_active) })),
        isLoading: false,
      })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  add: async (sub) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    // Create optimistic subscription object
    const newSubscription: Subscription = {
      id,
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      billing_cycle: sub.billing_cycle,
      billing_day: sub.billing_day || null,
      category_id: sub.category_id || null,
      color: sub.color || null,
      logo_url: sub.logo_url || null,
      notes: sub.notes || null,
      is_active: sub.is_active ?? true,
      next_payment_date: sub.next_payment_date,
      card_id: sub.card_id || null,
      created_at: now,
      updated_at: now,
    }

    // Optimistically add to state (sort by payment date, nulls at end)
    set((state) => ({
      subscriptions: [...state.subscriptions, newSubscription].sort((a, b) => {
        if (!a.next_payment_date && !b.next_payment_date) return 0
        if (!a.next_payment_date) return 1
        if (!b.next_payment_date) return -1
        return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime()
      }),
    }))

    try {
      await execute(
        `INSERT INTO subscriptions
         (id, name, amount, currency, billing_cycle, billing_day, category_id, color, logo_url, notes, is_active, next_payment_date, card_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          sub.name,
          sub.amount,
          sub.currency,
          sub.billing_cycle,
          sub.billing_day || null,
          sub.category_id || null,
          sub.color || null,
          sub.logo_url || null,
          sub.notes || null,
          sub.is_active ? 1 : 0,
          sub.next_payment_date,
          sub.card_id || null,
          now,
          now,
        ]
      )
    } catch (error) {
      // Rollback on error
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
      }))
      console.error('Failed to add subscription:', error)
      throw error
    }
  },

  update: async (id, data) => {
    // Store previous state for rollback
    const previousSubscriptions = get().subscriptions
    const subscription = previousSubscriptions.find((s) => s.id === id)
    if (!subscription) return

    const now = new Date().toISOString()
    const updatedData = { ...data, updated_at: now }

    // Optimistically update state (sort by payment date, nulls at end)
    set((state) => ({
      subscriptions: state.subscriptions
        .map((s) => (s.id === id ? { ...s, ...updatedData } : s))
        .sort((a, b) => {
          if (!a.next_payment_date && !b.next_payment_date) return 0
          if (!a.next_payment_date) return 1
          if (!b.next_payment_date) return -1
          return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime()
        }),
    }))

    const fields: string[] = []
    const values: unknown[] = []

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`)
        values.push(key === 'is_active' ? (value ? 1 : 0) : value)
      }
    })

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    try {
      await execute(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`, values)
    } catch (error) {
      // Rollback on error
      set({ subscriptions: previousSubscriptions })
      console.error('Failed to update subscription:', error)
      throw error
    }
  },

  remove: async (id) => {
    // Store previous state for rollback
    const previousSubscriptions = get().subscriptions

    // Optimistically remove from state
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    }))

    try {
      await execute('DELETE FROM subscriptions WHERE id = ?', [id])
    } catch (error) {
      // Rollback on error
      set({ subscriptions: previousSubscriptions })
      console.error('Failed to remove subscription:', error)
      throw error
    }
  },

  toggleActive: async (id) => {
    const sub = get().subscriptions.find((s) => s.id === id)
    if (sub) {
      await get().update(id, { is_active: !sub.is_active })
    }
  },
}))
