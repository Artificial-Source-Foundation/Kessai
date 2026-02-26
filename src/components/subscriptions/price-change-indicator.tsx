import { memo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceChangeIndicatorProps {
  oldAmount: number
  newAmount: number
}

export const PriceChangeIndicator = memo(function PriceChangeIndicator({
  oldAmount,
  newAmount,
}: PriceChangeIndicatorProps) {
  const increased = newAmount > oldAmount
  const pctChange = Math.abs(((newAmount - oldAmount) / oldAmount) * 100)

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-medium ${
        increased ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'
      }`}
      title={`Price ${increased ? 'increased' : 'decreased'} by ${pctChange.toFixed(0)}%`}
    >
      {increased ? (
        <TrendingUp className="h-2.5 w-2.5" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5" />
      )}
      {pctChange.toFixed(0)}%
    </span>
  )
})
