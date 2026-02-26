import { useState, useEffect, useCallback } from 'react'
import { usePriceHistoryStore } from '@/stores/price-history-store'
import type { PriceChange } from '@/types/price-history'

export function usePriceHistory(subscriptionId?: string) {
  const [changes, setChanges] = useState<PriceChange[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fetchBySubscription = usePriceHistoryStore((s) => s.fetchBySubscription)

  const fetch = useCallback(async () => {
    if (!subscriptionId) return
    setIsLoading(true)
    try {
      const result = await fetchBySubscription(subscriptionId)
      setChanges(result)
    } finally {
      setIsLoading(false)
    }
  }, [subscriptionId, fetchBySubscription])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { changes, isLoading, refetch: fetch }
}
