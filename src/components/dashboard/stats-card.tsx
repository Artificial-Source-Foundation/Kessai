import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type StatsCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  animate?: boolean
}

export function StatsCard({
  title,
  value,
  icon,
  color = 'text-aurora-purple',
  trend,
  animate = true,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? '0' : String(value))

  useEffect(() => {
    if (!animate || typeof value !== 'string') {
      setDisplayValue(String(value))
      return
    }

    const numericMatch = value.match(/[\d,.]+/)
    if (!numericMatch) {
      setDisplayValue(value)
      return
    }

    const targetNum = parseFloat(numericMatch[0].replace(/,/g, ''))
    const prefix = value.slice(0, value.indexOf(numericMatch[0]))
    const suffix = value.slice(value.indexOf(numericMatch[0]) + numericMatch[0].length)

    let current = 0
    const duration = 1000
    const steps = 30
    const increment = targetNum / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= targetNum) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        const formatted = current.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        setDisplayValue(`${prefix}${formatted}${suffix}`)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animate])

  return (
    <div className="glass-card p-6 transition-transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{displayValue}</p>
          {trend && (
            <p
              className={cn(
                'text-xs',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn('rounded-lg bg-white/5 p-3', color)}>{icon}</div>
      </div>
    </div>
  )
}
