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
        increased ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
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
