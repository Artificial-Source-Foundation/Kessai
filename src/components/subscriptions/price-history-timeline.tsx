import { memo } from 'react'
import dayjs from 'dayjs'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { CurrencyCode } from '@/lib/currency'
import { getPriceChangeDisplay } from '@/lib/price-history-display'
import type { PriceChange } from '@/types/price-history'

interface PriceHistoryTimelineProps {
  changes: PriceChange[]
  currency: CurrencyCode
}

export const PriceHistoryTimeline = memo(function PriceHistoryTimeline({
  changes,
  currency,
}: PriceHistoryTimelineProps) {
  if (changes.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">No price changes recorded</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {changes.map((change) => {
        const display = getPriceChangeDisplay(change, currency)
        return (
          <div key={change.id} className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                display.isIncrease
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-success/15 text-success'
              }`}
            >
              {display.isIncrease ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs line-through">
                  {display.oldNative}
                </span>
                <span className="text-muted-foreground text-xs">&rarr;</span>
                <span className="text-foreground font-[family-name:var(--font-mono)] text-xs font-medium">
                  {display.newNative}
                </span>
              </div>
              <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px]">
                {dayjs(change.changed_at).format('MMM D, YYYY')}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
