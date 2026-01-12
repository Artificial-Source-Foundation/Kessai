import { create } from 'zustand'
import { query, execute } from '@/lib/database'
import type { Settings, Theme } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

type SettingsState = {
  settings: Settings | null
  isLoading: boolean
  error: string | null

  fetch: () => Promise<void>
  update: (data: Partial<Settings>) => Promise<void>
  setTheme: (theme: Theme) => Promise<void>
  setCurrency: (currency: string) => Promise<void>
  setNotifications: (enabled: boolean, daysBefore?: number[]) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const rows = await query<{
        id: string
        theme: Theme
        currency: string
        notification_enabled: number
        notification_days_before: string
      }>('SELECT * FROM settings WHERE id = ?', ['singleton'])

      if (rows.length > 0) {
        const row = rows[0]
        set({
          settings: {
            id: row.id,
            theme: row.theme,
            currency: row.currency,
            notification_enabled: Boolean(row.notification_enabled),
            notification_days_before: JSON.parse(row.notification_days_before),
          },
          isLoading: false,
        })
      } else {
        set({
          settings: { id: 'singleton', ...DEFAULT_SETTINGS },
          isLoading: false,
        })
      }
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  update: async (data) => {
    const current = get().settings
    if (!current) return

    const updates: string[] = []
    const values: unknown[] = []

    if (data.theme !== undefined) {
      updates.push('theme = ?')
      values.push(data.theme)
    }
    if (data.currency !== undefined) {
      updates.push('currency = ?')
      values.push(data.currency)
    }
    if (data.notification_enabled !== undefined) {
      updates.push('notification_enabled = ?')
      values.push(data.notification_enabled ? 1 : 0)
    }
    if (data.notification_days_before !== undefined) {
      updates.push('notification_days_before = ?')
      values.push(JSON.stringify(data.notification_days_before))
    }

    if (updates.length > 0) {
      values.push('singleton')
      await execute(`UPDATE settings SET ${updates.join(', ')} WHERE id = ?`, values)
      set({ settings: { ...current, ...data } })
    }
  },

  setTheme: async (theme) => {
    await get().update({ theme })
  },

  setCurrency: async (currency) => {
    await get().update({ currency })
  },

  setNotifications: async (enabled, daysBefore) => {
    await get().update({
      notification_enabled: enabled,
      ...(daysBefore && { notification_days_before: daysBefore }),
    })
  },
}))
