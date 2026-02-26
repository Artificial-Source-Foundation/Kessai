import { useMemo } from 'react'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useCategoryStore } from '@/stores/category-store'
import {
  calculateUserMonthlyAmount,
  isBillableStatus,
  calculateMonthlyAmount,
} from '@/types/subscription'
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
 * All amounts are share-aware (divided by shared_count).
 *
 * @returns Dashboard statistics object
 */
export function useDashboardStats() {
  // Use selective subscriptions for better performance
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const categories = useCategoryStore((state) => state.categories)

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => isBillableStatus(s.status)),
    [subscriptions]
  )

  const categorySpending = useMemo((): CategorySpending[] => {
    const spending: Record<string, { amount: number; name: string; color: string }> = {}

    activeSubscriptions.forEach((sub) => {
      const monthlyAmount = calculateUserMonthlyAmount(
        sub.amount,
        sub.billing_cycle,
        sub.shared_count
      )
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

    // Calculate current monthly total from active subscriptions (share-aware)
    const currentMonthlyTotal = activeSubscriptions.reduce(
      (sum, sub) =>
        sum + calculateUserMonthlyAmount(sub.amount, sub.billing_cycle, sub.shared_count),
      0
    )

    for (let i = 5; i >= 0; i--) {
      const monthDate = now.subtract(i, 'month')

      months.push({
        month: monthDate.format('YYYY-MM'),
        monthLabel: monthDate.format('MMM'),
        amount: Math.round(currentMonthlyTotal * 100) / 100,
      })
    }

    return months
  }, [activeSubscriptions])

  // Total of ALL active subscriptions normalized to monthly (share-aware)
  const totalMonthly = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, sub) =>
          sum + calculateUserMonthlyAmount(sub.amount, sub.billing_cycle, sub.shared_count),
        0
      ),
    [activeSubscriptions]
  )

  // Total before splitting (full amounts)
  const totalMonthlyBeforeSplitting = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, sub) => sum + calculateMonthlyAmount(sub.amount, sub.billing_cycle),
        0
      ),
    [activeSubscriptions]
  )

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly])

  // Separate totals by billing cycle (actual amounts, not normalized, share-aware)
  const monthlySubsTotal = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => sub.billing_cycle === 'monthly')
        .reduce((sum, sub) => sum + sub.amount / Math.max(sub.shared_count, 1), 0),
    [activeSubscriptions]
  )

  const yearlySubsTotal = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => sub.billing_cycle === 'yearly')
        .reduce((sum, sub) => sum + sub.amount / Math.max(sub.shared_count, 1), 0),
    [activeSubscriptions]
  )

  const weeklySubsTotal = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => sub.billing_cycle === 'weekly')
        .reduce((sum, sub) => sum + sub.amount / Math.max(sub.shared_count, 1), 0),
    [activeSubscriptions]
  )

  const quarterlySubsTotal = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => sub.billing_cycle === 'quarterly')
        .reduce((sum, sub) => sum + sub.amount / Math.max(sub.shared_count, 1), 0),
    [activeSubscriptions]
  )

  // Counts by billing cycle
  const monthlySubsCount = useMemo(
    () => activeSubscriptions.filter((sub) => sub.billing_cycle === 'monthly').length,
    [activeSubscriptions]
  )

  const yearlySubsCount = useMemo(
    () => activeSubscriptions.filter((sub) => sub.billing_cycle === 'yearly').length,
    [activeSubscriptions]
  )

  const averagePerSubscription = useMemo(
    () => (activeSubscriptions.length > 0 ? totalMonthly / activeSubscriptions.length : 0),
    [totalMonthly, activeSubscriptions.length]
  )

  // Trial stats
  const trialCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'trial').length,
    [subscriptions]
  )

  const expiringTrials = useMemo(
    () =>
      subscriptions.filter((s) => {
        if (s.status !== 'trial' || !s.trial_end_date) return false
        const daysLeft = dayjs(s.trial_end_date).diff(dayjs(), 'day')
        return daysLeft >= 0 && daysLeft <= 7
      }),
    [subscriptions]
  )

  // Shared subscription stats
  const sharedSubscriptionCount = useMemo(
    () => activeSubscriptions.filter((s) => s.shared_count > 1).length,
    [activeSubscriptions]
  )

  const sharingSavingsMonthly = useMemo(
    () => totalMonthlyBeforeSplitting - totalMonthly,
    [totalMonthlyBeforeSplitting, totalMonthly]
  )

  return {
    categorySpending,
    monthlySpending,
    totalMonthly,
    totalMonthlyBeforeSplitting,
    totalYearly,
    averagePerSubscription,
    activeCount: activeSubscriptions.length,
    totalCount: subscriptions.length,
    // Separate by billing cycle
    monthlySubsTotal,
    yearlySubsTotal,
    weeklySubsTotal,
    quarterlySubsTotal,
    monthlySubsCount,
    yearlySubsCount,
    // Trials
    trialCount,
    expiringTrials,
    // Sharing
    sharedSubscriptionCount,
    sharingSavingsMonthly,
  }
}
