import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useCategoryStore } from '@/stores/category-store'
import { calculateMonthlyAmount } from '@/types/subscription'
import type { Subscription } from '@/types/subscription'

export function useSubscriptions() {
  // Use selective subscriptions for better performance
  const { subscriptions, isLoading, error, fetch, add, update, remove, toggleActive } =
    useSubscriptionStore(
      useShallow((state) => ({
        subscriptions: state.subscriptions,
        isLoading: state.isLoading,
        error: state.error,
        fetch: state.fetch,
        add: state.add,
        update: state.update,
        remove: state.remove,
        toggleActive: state.toggleActive,
      }))
    )

  const { categories, fetch: fetchCategories } = useCategoryStore(
    useShallow((state) => ({
      categories: state.categories,
      fetch: state.fetch,
    }))
  )

  useEffect(() => {
    fetch()
    fetchCategories()
  }, [fetch, fetchCategories])

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.is_active),
    [subscriptions]
  )

  const totalMonthly = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, sub) => sum + calculateMonthlyAmount(sub.amount, sub.billing_cycle),
        0
      ),
    [activeSubscriptions]
  )

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly])

  const getCategory = (categoryId: string | null) => categories.find((c) => c.id === categoryId)

  const getSubscriptionWithCategory = (sub: Subscription) => ({
    ...sub,
    category: getCategory(sub.category_id),
  })

  return {
    subscriptions,
    activeSubscriptions,
    isLoading,
    error,
    totalMonthly,
    totalYearly,
    add,
    update,
    remove,
    toggleActive,
    getCategory,
    getSubscriptionWithCategory,
    refresh: fetch,
  }
}
