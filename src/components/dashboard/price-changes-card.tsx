import { useEffect, memo, useCallback } from 'react'
import dayjs from 'dayjs'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { usePriceHistoryStore } from '@/stores/price-history-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import type { CurrencyCode } from '@/lib/currency'
import { getPriceChangeDisplay } from '@/lib/price-history-display'

interface PriceChangesCardProps {
  currency: CurrencyCode
}

export const PriceChangesCard = memo(function PriceChangesCard({
  currency,
}: PriceChangesCardProps) {
  const { recentChanges, isLoading, fetchRecent } = usePriceHistoryStore()
  const subscriptions = useSubscriptionStore((s) => s.subscriptions)

  useEffect(() => {
    fetchRecent(90)
  }, [fetchRecent])

  const getSubName = useCallback(
    (subId: string) => subscriptions.find((s) => s.id === subId)?.name ?? 'Unknown',
    [subscriptions]
  )

  if (isLoading || recentChanges.length === 0) return null

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-foreground font-[family-name:var(--font-heading)] text-lg font-bold">
          Recent Price Changes
        </h3>
        <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
          Last 90 days
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {recentChanges.slice(0, 5).map((change) => {
          const display = getPriceChangeDisplay(change, currency)

          return (
            <div
              key={change.id}
              className="border-border flex items-center justify-between rounded-lg border bg-[var(--color-subtle-overlay)] px-4 py-3"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-foreground truncate text-sm font-medium">
                  {getSubName(change.subscription_id)}
                </span>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs">
                    {display.oldNative}
                  </span>
                  <span className="text-muted-foreground text-xs">&rarr;</span>
                  <span className="text-foreground font-[family-name:var(--font-mono)] text-xs font-semibold">
                    {display.newNative}
                  </span>
                </div>
                {display.convertedRangeLabel && (
                  <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px]">
                    {display.convertedRangeLabel}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                {display.canCompare ? (
                  <div
                    className={`inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-xs font-semibold ${
                      display.isIncrease ? 'text-warning' : 'text-success'
                    }`}
                  >
                    {display.isIncrease ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {display.isIncrease ? '+' : '-'}
                    {display.percentage.toFixed(0)}%
                  </div>
                ) : display.currenciesChanged ? (
                  <div className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase">
                    Currency changed
                  </div>
                ) : null}
                <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px]">
                  {dayjs(change.changed_at).format('MMM D, YYYY')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
