import type { BillingCycle } from '@/types/subscription'

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#8655f6',
  Software: '#06b6d4',
  Music: '#22c55e',
  Health: '#ef4444',
  Shopping: '#f97316',
  AI: '#14b8a6',
  Cloud: '#0ea5e9',
  Productivity: '#64748b',
  Development: '#f97316',
  Security: '#eab308',
  Other: '#64748b',
}

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

export const APP_VERSION = '0.1.0'
export const APP_AUTHOR = 'Andres Godina'
