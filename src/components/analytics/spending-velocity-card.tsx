import { memo } from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import type { SpendingVelocity } from '@/types/analytics'

interface SpendingVelocityCardProps {
  velocity: SpendingVelocity
  currency: CurrencyCode
}

export const SpendingVelocityCard = memo(function SpendingVelocityCard({
  velocity,
  currency,
}: SpendingVelocityCardProps) {
  const isDown = velocity.change_percent < 0
  const isFlat = velocity.change_percent === 0
  const changeColor = isFlat
    ? 'text-muted-foreground'
    : isDown
      ? 'text-emerald-400'
      : 'text-red-400'

  return (
    <div className="glass-card p-6">
      <h3 className="text-foreground mb-5 font-[family-name:var(--font-heading)] text-lg font-bold">
        Spending Velocity
      </h3>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {/* Current month */}
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
            This Month
          </span>
          <span className="text-foreground font-[family-name:var(--font-heading)] text-2xl font-bold">
            {formatCurrency(velocity.current_month, currency)}
          </span>
        </div>

        {/* Previous month */}
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
            Last Month
          </span>
          <span className="text-foreground font-[family-name:var(--font-heading)] text-2xl font-bold">
            {formatCurrency(velocity.previous_month, currency)}
          </span>
        </div>

        {/* Change */}
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
            Change
          </span>
          <div className={`flex items-center gap-1.5 ${changeColor}`}>
            {isFlat ? (
              <Minus className="h-4 w-4" />
            ) : isDown ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span className="font-[family-name:var(--font-heading)] text-2xl font-bold">
              {isFlat ? '0' : Math.abs(velocity.change_percent).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Projected annual */}
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
            Projected Annual
          </span>
          <span className="text-foreground font-[family-name:var(--font-heading)] text-2xl font-bold">
            {formatCurrency(velocity.projected_annual, currency)}
          </span>
        </div>
      </div>
    </div>
  )
})
