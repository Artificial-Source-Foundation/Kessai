import { useEffect } from 'react'
import { apiInvoke } from '@/lib/api'
import { useSubscriptionStore } from '@/stores/subscription-store'

/**
 * Hook that refreshes the system tray badge count whenever
 * subscriptions change. Uses the subscription store internally.
 */
export function useTrayBadge() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions)

  useEffect(() => {
    // `update_tray_badge` is Tauri-only; avoid web-mode adapter errors.
    if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
      return
    }

    apiInvoke('update_tray_badge').catch(() => {
      // Tray may not be available (e.g., web mode)
    })
  }, [subscriptions])
}
