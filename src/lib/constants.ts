import type { BillingCycle } from '@/types/subscription'

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
}

export const BILLING_CYCLE_SHORT: Record<BillingCycle, string> = {
  weekly: '/wk',
  monthly: '/mo',
  quarterly: '/qtr',
  yearly: '/yr',
  custom: '',
}

export const CATEGORY_BADGE_VARIANTS: Record<string, string> = {
  Entertainment: 'entertainment',
  Software: 'software',
  Music: 'music',
  Health: 'health',
  Shopping: 'shopping',
  AI: 'ai',
  Cloud: 'cloud',
  Productivity: 'productivity',
  Development: 'development',
  Security: 'security',
}
