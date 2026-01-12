import { z } from 'zod'

export const themeSchema = z.enum(['dark', 'light', 'system'])

export const settingsSchema = z.object({
  id: z.string(),
  theme: themeSchema,
  currency: z.string().length(3),
  notification_enabled: z.boolean(),
  notification_days_before: z.array(z.number()),
})

export type Theme = z.infer<typeof themeSchema>
export type Settings = z.infer<typeof settingsSchema>

export const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  theme: 'dark',
  currency: 'USD',
  notification_enabled: true,
  notification_days_before: [1, 3, 7],
}
