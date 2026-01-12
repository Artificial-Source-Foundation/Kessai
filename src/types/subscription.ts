import { z } from 'zod'

export const billingCycleSchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom'])

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3),
  billing_cycle: billingCycleSchema,
  billing_day: z.number().min(1).max(31).nullable(),
  category_id: z.string().nullable(),
  card_id: z.string().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .nullable(),
  logo_url: z.string().url().nullable().or(z.literal('')).optional(),
  notes: z.string().max(500).nullable(),
  is_active: z.boolean(),
  next_payment_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newSubscriptionSchema = subscriptionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3),
  billing_cycle: billingCycleSchema,
  billing_day: z.number().min(1).max(31).nullable(),
  category_id: z.string().nullable(),
  card_id: z.string().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color')
    .nullable(),
  logo_url: z.string().url().or(z.literal('')).nullable().optional(),
  notes: z.string().max(500).nullable(),
  next_payment_date: z.string().min(1, 'Payment date is required'),
})

export type Subscription = z.infer<typeof subscriptionSchema>
export type BillingCycle = z.infer<typeof billingCycleSchema>
export type NewSubscription = z.infer<typeof newSubscriptionSchema>
export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
}

export const BILLING_CYCLE_MULTIPLIERS: Record<BillingCycle, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
  custom: 12,
}

export const SUBSCRIPTION_COLORS = [
  '#8b5cf6',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#6b7280',
] as const

export function calculateYearlyAmount(amount: number, cycle: BillingCycle): number {
  return amount * BILLING_CYCLE_MULTIPLIERS[cycle]
}

export function calculateMonthlyAmount(amount: number, cycle: BillingCycle): number {
  return calculateYearlyAmount(amount, cycle) / 12
}
