import { memo } from 'react'
import dayjs from 'dayjs'
import { CalendarDays } from 'lucide-react'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import type { YearSummary } from '@/types/analytics'

interface YearSummaryCardProps {
  summary: YearSummary
  currency: CurrencyCode
}

export const YearSummaryCard = memo(function YearSummaryCard({
  summary,
  currency,
}: YearSummaryCardProps) {
  const highestMonthLabel = summary.highest_month
    ? dayjs(summary.highest_month + '-01').format('MMMM')
    : 'N/A'

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-accent-cyan/15 text-accent-cyan flex h-8 w-8 items-center justify-center rounded-lg">
          <CalendarDays className="h-4 w-4" />
        </div>
        <h3 className="text-foreground font-[family-name:var(--font-heading)] text-lg font-bold">
          {summary.year} Summary
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs tracking-wider uppercase">
            Total Spent
          </span>
          <span className="text-foreground font-[family-name:var(--font-heading)] text-lg font-bold">
            {formatCurrency(summary.total_spent, currency)}
          </span>
        </div>

        <div className="border-border border-t" />

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs tracking-wider uppercase">
            Avg Monthly
          </span>
          <span className="text-foreground font-[family-name:var(--font-mono)] text-sm font-bold">
            {formatCurrency(summary.avg_monthly, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs tracking-wider uppercase">
            Highest Month
          </span>
          <div className="flex flex-col items-end">
            <span className="text-foreground font-[family-name:var(--font-mono)] text-sm font-bold">
              {formatCurrency(summary.highest_amount, currency)}
            </span>
            <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px]">
              {highestMonthLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})
