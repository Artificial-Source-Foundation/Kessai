import { memo } from 'react'
import { Layers } from 'lucide-react'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { CategorySpend } from '@/types/analytics'

// Fixed palette for categories so colors are consistent
const CATEGORY_COLORS = [
  '#bf5af2',
  '#30d158',
  '#ff9f0a',
  '#64d2ff',
  '#ff453a',
  '#ffd60a',
  '#ac8e68',
  '#5e5ce6',
  '#ff6482',
  '#98989d',
]

interface CategoryBreakdownChartProps {
  data: CategorySpend[]
  currency: CurrencyCode
}

export const CategoryBreakdownChart = memo(function CategoryBreakdownChart({
  data,
  currency,
}: CategoryBreakdownChartProps) {
  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-accent-orange/15 text-accent-orange flex h-8 w-8 items-center justify-center rounded-lg">
          <Layers className="h-4 w-4" />
        </div>
        <h3 className="text-foreground font-[family-name:var(--font-heading)] text-lg font-bold">
          Category Breakdown
        </h3>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">No spending data yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
            return (
              <div key={cat.category_id ?? 'uncategorized'} className="flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-foreground min-w-[120px] font-[family-name:var(--font-mono)] text-xs">
                  {cat.category_name}
                </span>
                <ProgressBar
                  value={cat.percentage}
                  colorStyle={color}
                  height="sm"
                  rounded="sm"
                  className="flex-1"
                />
                <span className="text-muted-foreground min-w-[80px] text-right font-[family-name:var(--font-mono)] text-xs">
                  {formatCurrency(cat.total, currency)}
                </span>
                <span className="text-muted-foreground w-12 text-right font-[family-name:var(--font-mono)] text-[10px]">
                  {cat.percentage.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})
