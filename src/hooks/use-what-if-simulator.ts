import { useState, useMemo, useCallback } from 'react'
import { useSubscriptionStore } from '@/stores/subscription-store'
import {
  calculateUserYearlyAmount,
  calculateUserMonthlyAmount,
  isBillableStatus,
} from '@/types/subscription'

export function useWhatIfSimulator() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => isBillableStatus(s.status)),
    [subscriptions]
  )

  const currentAnnual = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, sub) =>
          sum + calculateUserYearlyAmount(sub.amount, sub.billing_cycle, sub.shared_count),
        0
      ),
    [activeSubscriptions]
  )

  const simulatedAnnual = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => !excludedIds.has(sub.id))
        .reduce(
          (sum, sub) =>
            sum + calculateUserYearlyAmount(sub.amount, sub.billing_cycle, sub.shared_count),
          0
        ),
    [activeSubscriptions, excludedIds]
  )

  const annualSavings = currentAnnual - simulatedAnnual
  const monthlySavings = annualSavings / 12

  const toggleExcluded = useCallback((id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setExcludedIds(new Set())
  }, [])

  const simulatedMonthly = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => !excludedIds.has(sub.id))
        .reduce(
          (sum, sub) =>
            sum + calculateUserMonthlyAmount(sub.amount, sub.billing_cycle, sub.shared_count),
          0
        ),
    [activeSubscriptions, excludedIds]
  )

  return {
    activeSubscriptions,
    excludedIds,
    currentAnnual,
    simulatedAnnual,
    simulatedMonthly,
    annualSavings,
    monthlySavings,
    toggleExcluded,
    reset,
  }
}
