import { useMemo } from 'react'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useCategoryStore } from '@/stores/category-store'
import { calculateMonthlyAmount } from '@/types/subscription'
import { subMonths, format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'

export type CategorySpending = {
  id: string
  name: string
  color: string
  amount: number
  percentage: number
}

export type MonthlySpending = {
  month: string
  monthLabel: string
  amount: number
}

export function useDashboardStats() {
  const { subscriptions } = useSubscriptionStore()
  const { categories } = useCategoryStore()

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
    const now = new Date()
    const months: MonthlySpending[] = []

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      let total = 0

      activeSubscriptions.forEach((sub) => {
        if (!sub.next_payment_date) return

        const paymentDate = parseISO(sub.next_payment_date)
        const monthlyAmount = calculateMonthlyAmount(sub.amount, sub.billing_cycle)

        if (
          isWithinInterval(paymentDate, { start: monthStart, end: monthEnd }) ||
          paymentDate < monthStart
        ) {
          total += monthlyAmount
        }
      })

      months.push({
        month: format(monthDate, 'yyyy-MM'),
        monthLabel: format(monthDate, 'MMM'),
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
