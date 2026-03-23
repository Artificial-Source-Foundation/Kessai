import { z } from 'zod'

export const monthlySpendSchema = z.object({
  month: z.string(),
  total: z.number(),
  count: z.number(),
})

export const categorySpendSchema = z.object({
  category_id: z.string().nullable(),
  category_name: z.string(),
  total: z.number(),
  percentage: z.number(),
})

export const yearSummarySchema = z.object({
  year: z.number(),
  total_spent: z.number(),
  avg_monthly: z.number(),
  highest_month: z.string(),
  highest_amount: z.number(),
  category_breakdown: z.array(categorySpendSchema),
})

export const spendingVelocitySchema = z.object({
  current_month: z.number(),
  previous_month: z.number(),
  change_percent: z.number(),
  projected_annual: z.number(),
})

export type MonthlySpend = z.infer<typeof monthlySpendSchema>
export type CategorySpend = z.infer<typeof categorySpendSchema>
export type YearSummary = z.infer<typeof yearSummarySchema>
export type SpendingVelocity = z.infer<typeof spendingVelocitySchema>
