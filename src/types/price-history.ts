import { z } from 'zod'

export const priceChangeSchema = z.object({
  id: z.string(),
  subscription_id: z.string(),
  old_amount: z.number(),
  new_amount: z.number(),
  old_currency: z.string(),
  new_currency: z.string(),
  changed_at: z.string(),
})

export type PriceChange = z.infer<typeof priceChangeSchema>
