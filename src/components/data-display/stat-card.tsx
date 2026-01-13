import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  glowColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  glowColor = 'rgba(137, 90, 246, 0.4)',
  className,
}: StatCardProps) {
  return (
    <div className={cn('glass-card-interactive relative overflow-hidden p-5', className)}>
      <div className="glow-blob -top-8 -right-8 h-24 w-24" style={{ backgroundColor: glowColor }} />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">{title}</span>
          {icon && (
            <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              {icon}
            </span>
          )}
        </div>

        <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">{value}</div>

        {(trend || subtitle) && (
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  trend.isPositive ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && <span className="text-muted-foreground text-xs">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
