import { useMemo } from 'react'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useCategoryStore } from '@/stores/category-store'
import { calculateMonthlyAmount } from '@/types/subscription'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

/**
 * Spending data aggregated by category.
 * Used for the donut chart breakdown.
 */
export type CategorySpending = {
  /** Category ID or 'uncategorized' */
  id: string
  /** Display name of the category */
  name: string
  /** Hex color for the category */
  color: string
  /** Total monthly amount for this category */
  amount: number
  /** Percentage of total spending (0-100) */
  percentage: number
}

/**
 * Monthly spending data point for trend charts.
 */
export type MonthlySpending = {
  /** Month identifier in yyyy-MM format */
  month: string
  /** Short month label (e.g., "Jan", "Feb") */
  monthLabel: string
  /** Total spending for the month */
  amount: number
}

/**
 * Hook for computing dashboard statistics from subscriptions.
 * Calculates category breakdowns, monthly trends, and totals.
 *
 * All calculations are memoized for performance.
 *
 * @returns Dashboard statistics object
 * @example
 * const { totalMonthly, categorySpending } = useDashboardStats()
 */
export function useDashboardStats() {
  // Use selective subscriptions for better performance
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const categories = useCategoryStore((state) => state.categories)

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.is_active),
    [subscriptions]
  )

  const categorySpending = useMemo((): CategorySpending[] => {
    const spending: Record<string, { amount: number; name: string; color: string }> = {}

    activeSubscriptions.forEach((sub) => {
      const monthlyAmount = calculateMonthlyAmount(sub.amount, sub.billing_cycle)
      const category = categories.find((c) => c.id === sub.category_id)

      const key = sub.category_id || 'uncategorized'
      const name = category?.name || 'Uncategorized'
      const color = category?.color || '#6b7280'

      if (!spending[key]) {
        spending[key] = { amount: 0, name, color }
      }
      spending[key].amount += monthlyAmount
    })

    const total = Object.values(spending).reduce((sum, s) => sum + s.amount, 0)

    return Object.entries(spending)
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [activeSubscriptions, categories])

  const monthlySpending = useMemo((): MonthlySpending[] => {
    const now = dayjs()
    const months: MonthlySpending[] = []

    for (let i = 5; i >= 0; i--) {
      const monthDate = now.subtract(i, 'month')
      const monthStart = monthDate.startOf('month')
      const monthEnd = monthDate.endOf('month')

      let total = 0

      activeSubscriptions.forEach((sub) => {
        if (!sub.next_payment_date) return

        const paymentDate = dayjs(sub.next_payment_date)
        const monthlyAmount = calculateMonthlyAmount(sub.amount, sub.billing_cycle)

        if (
          paymentDate.isBetween(monthStart, monthEnd, 'day', '[]') ||
          paymentDate.isBefore(monthStart)
        ) {
          total += monthlyAmount
        }
      })

      months.push({
        month: monthDate.format('YYYY-MM'),
        monthLabel: monthDate.format('MMM'),
        amount: Math.round(total * 100) / 100,
      })
    }

    return months
  }, [activeSubscriptions])

  const totalMonthly = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, sub) => sum + calculateMonthlyAmount(sub.amount, sub.billing_cycle),
        0
      ),
    [activeSubscriptions]
  )

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly])

  const averagePerSubscription = useMemo(
    () => (activeSubscriptions.length > 0 ? totalMonthly / activeSubscriptions.length : 0),
    [totalMonthly, activeSubscriptions.length]
  )

  return {
    categorySpending,
    monthlySpending,
    totalMonthly,
    totalYearly,
    averagePerSubscription,
    activeCount: activeSubscriptions.length,
    totalCount: subscriptions.length,
  }
}
