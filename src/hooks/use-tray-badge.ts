import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useSubscriptionStore } from '@/stores/subscription-store'

/**
 * Hook that refreshes the system tray badge count whenever
 * subscriptions change. Uses the subscription store internally.
 */
export function useTrayBadge() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions)

  useEffect(() => {
    invoke('update_tray_badge').catch(() => {
      // Tray may not be available (e.g., web mode)
    })
  }, [subscriptions])
}
