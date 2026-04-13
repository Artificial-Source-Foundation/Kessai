import { useState, useEffect, useRef, memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import dayjs from 'dayjs'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { usePriceHistoryStore } from '@/stores/price-history-store'
import type { CurrencyCode } from '@/lib/currency'
import { getPriceChangeDisplay } from '@/lib/price-history-display'
import type { PriceChange } from '@/types/price-history'

interface PriceHistoryBadgeProps {
  subscriptionId: string
  currency: CurrencyCode
  latestChange?: PriceChange | null
  disableFallbackFetch?: boolean
}

export const PriceHistoryBadge = memo(function PriceHistoryBadge({
  subscriptionId,
  currency,
  latestChange,
  disableFallbackFetch = false,
}: PriceHistoryBadgeProps) {
  const [latest, setLatest] = useState<PriceChange | null>(latestChange ?? null)
  const [history, setHistory] = useState<PriceChange[]>([])
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLButtonElement>(null)
  const { getLatest, fetchBySubscription } = usePriceHistoryStore(
    useShallow((s) => ({ getLatest: s.getLatest, fetchBySubscription: s.fetchBySubscription }))
  )

  useEffect(() => {
    if (latestChange !== undefined) {
      setLatest(latestChange)
      return
    }

    if (disableFallbackFetch) {
      setLatest(null)
      return
    }

    getLatest(subscriptionId).then(setLatest)
  }, [subscriptionId, getLatest, latestChange, disableFallbackFetch])

  useEffect(() => {
    if (showPopover) {
      fetchBySubscription(subscriptionId).then(setHistory)
    }
  }, [showPopover, subscriptionId, fetchBySubscription])

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return

    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        badgeRef.current &&
        !badgeRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPopover])

  if (!latest) return null

  const latestDisplay = getPriceChangeDisplay(latest, currency)

  return (
    <div className="relative inline-block">
      <button
        ref={badgeRef}
        onClick={() => setShowPopover(!showPopover)}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wider uppercase transition-colors ${
          latestDisplay.isIncrease
            ? 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 border'
            : 'border-success/30 bg-success/10 text-success hover:bg-success/20 border'
        }`}
      >
        {latestDisplay.isIncrease ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {latestDisplay.canCompare ? (
          <>
            {latestDisplay.isIncrease ? '+' : '-'}
            {latestDisplay.diffDisplay} ({latestDisplay.percentage.toFixed(0)}%)
          </>
        ) : latestDisplay.currenciesChanged ? (
          'Currency changed'
        ) : (
          latestDisplay.newNative
        )}
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 w-72 rounded-xl border p-4 shadow-xl"
        >
          <h4 className="text-foreground mb-3 font-[family-name:var(--font-heading)] text-sm font-bold">
            Price History
          </h4>

          {history.length === 0 ? (
            <p className="text-muted-foreground text-xs">No price changes recorded.</p>
          ) : (
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
              {history.map((entry) => {
                const entryDisplay = getPriceChangeDisplay(entry, currency)

                return (
                  <div
                    key={entry.id}
                    className="border-border flex items-center justify-between rounded-lg border bg-[var(--color-subtle-overlay)] px-3 py-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] line-through">
                          {entryDisplay.oldNative}
                        </span>
                        <span className="text-muted-foreground text-[10px]">&rarr;</span>
                        <span className="text-foreground font-[family-name:var(--font-mono)] text-xs font-semibold">
                          {entryDisplay.newNative}
                        </span>
                      </div>
                      {entryDisplay.convertedRangeLabel && (
                        <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[9px]">
                          {entryDisplay.convertedRangeLabel}
                        </span>
                      )}
                      <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[9px]">
                        {dayjs(entry.changed_at).format('MMM D, YYYY')}
                      </span>
                    </div>
                    <span
                      className={`font-[family-name:var(--font-mono)] text-[10px] font-semibold ${
                        entryDisplay.isIncrease ? 'text-warning' : 'text-success'
                      }`}
                    >
                      {entryDisplay.canCompare
                        ? `${entryDisplay.isIncrease ? '+' : '-'}${entryDisplay.diffDisplay}`
                        : entryDisplay.currenciesChanged
                          ? 'Currency changed'
                          : entryDisplay.newNative}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
})
