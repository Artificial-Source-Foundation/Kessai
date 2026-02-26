import { z } from 'zod'

const themeSchema = z.enum(['dark', 'light', 'system'])

const _settingsSchema = z.object({
  id: z.string(),
  theme: themeSchema,
  currency: z.string().length(3),
  notification_enabled: z.boolean(),
  notification_days_before: z.array(z.number()),
  monthly_budget: z.number().nullable().optional(),
})

export type Theme = z.infer<typeof themeSchema>
export type Settings = z.infer<typeof _settingsSchema>

export const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  theme: 'dark',
  currency: 'USD',
  notification_enabled: true,
  notification_days_before: [1, 3, 7],
  monthly_budget: null,
}
