import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInDays,
  startOfDay,
  isToday,
  isTomorrow,
  isThisWeek,
  parseISO,
} from 'date-fns'

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export function calculateNextPaymentDate(
  startDate: Date,
  cycle: BillingCycle,
  billingDay?: number
): Date {
  const today = startOfDay(new Date())
  let nextDate = startOfDay(startDate)

  while (nextDate <= today) {
    switch (cycle) {
      case 'weekly':
        nextDate = addWeeks(nextDate, 1)
        break
      case 'monthly':
        nextDate = addMonths(nextDate, 1)
        if (billingDay) {
          nextDate.setDate(Math.min(billingDay, getDaysInMonth(nextDate)))
        }
        break
      case 'quarterly':
        nextDate = addMonths(nextDate, 3)
        break
      case 'yearly':
        nextDate = addYears(nextDate, 1)
        break
      case 'custom':
        nextDate = addMonths(nextDate, 1)
        break
    }
  }

  return nextDate
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function formatPaymentDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d')
}

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  return differenceInDays(startOfDay(d), startOfDay(new Date()))
}

export function getUrgencyLevel(date: Date | string): 'today' | 'tomorrow' | 'this-week' | 'later' {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) return 'today'
  if (isTomorrow(d)) return 'tomorrow'
  if (isThisWeek(d)) return 'this-week'
  return 'later'
}

export function getUpcomingPayments<T extends { next_payment_date: string | null }>(
  subscriptions: T[],
  days: number
): T[] {
  const cutoff = addDays(new Date(), days)

  return subscriptions
    .filter((sub) => {
      if (!sub.next_payment_date) return false
      const date = parseISO(sub.next_payment_date)
      return date <= cutoff && date >= new Date()
    })
    .sort((a, b) => {
      const dateA = parseISO(a.next_payment_date!)
      const dateB = parseISO(b.next_payment_date!)
      return dateA.getTime() - dateB.getTime()
    })
}
