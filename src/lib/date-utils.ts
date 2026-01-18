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

/** Supported billing cycle frequencies */
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

/**
 * Calculates the next payment date based on billing cycle.
 * Advances from start date until finding a date in the future.
 * @param startDate - The initial payment/start date
 * @param cycle - Billing cycle frequency
 * @param billingDay - Optional specific day of month for monthly cycles (1-31)
 * @returns The next payment date in the future
 * @example
 * calculateNextPaymentDate(new Date('2024-01-15'), 'monthly') // Next month's 15th
 * calculateNextPaymentDate(new Date('2024-01-15'), 'monthly', 1) // 1st of next month
 */
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

/**
 * Gets the number of days in a month.
 * @param date - Date to check
 * @returns Number of days in the month (28-31)
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Formats a date as a full payment date string.
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 * @example
 * formatPaymentDate('2024-01-15') // "Jan 15, 2024"
 */
export function formatPaymentDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Formats a date as a short date string (no year).
 * @param date - Date object or ISO string
 * @returns Formatted short date string (e.g., "Jan 15")
 * @example
 * formatShortDate('2024-01-15') // "Jan 15"
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d')
}

/**
 * Calculates the number of days until a date.
 * @param date - Date object or ISO string
 * @returns Number of days until the date (negative if past)
 * @example
 * getDaysUntil('2024-01-20') // 5 (if today is Jan 15)
 */
export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  return differenceInDays(startOfDay(d), startOfDay(new Date()))
}

/**
 * Determines the urgency level of a date for UI styling.
 * @param date - Date object or ISO string
 * @returns Urgency level string for conditional styling
 * @example
 * getUrgencyLevel(new Date()) // 'today'
 * getUrgencyLevel(addDays(new Date(), 1)) // 'tomorrow'
 */
export function getUrgencyLevel(date: Date | string): 'today' | 'tomorrow' | 'this-week' | 'later' {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) return 'today'
  if (isTomorrow(d)) return 'tomorrow'
  if (isThisWeek(d)) return 'this-week'
  return 'later'
}

/**
 * Filters and sorts subscriptions by upcoming payment date.
 * @template T - Subscription type with next_payment_date
 * @param subscriptions - Array of subscriptions to filter
 * @param days - Number of days to look ahead
 * @returns Sorted array of subscriptions with payments within the window
 * @example
 * getUpcomingPayments(subscriptions, 7) // Payments in next 7 days
 */
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
