import { formatCurrency, type CurrencyCode } from '@/lib/currency'

interface DonutSegment {
  label: string
  value: number
  color: string
  percentage: number
}

interface DonutChartProps {
  segments: DonutSegment[]
  total: number
  currency: CurrencyCode
}

export function DonutChart({ segments, total, currency }: DonutChartProps) {
  const circumference = 2 * Math.PI * 40

  const segmentsWithOffset = segments.reduce<
    Array<DonutSegment & { strokeLength: number; offset: number }>
  >((acc, seg) => {
    const percentage = total > 0 ? seg.value / total : 0
    const strokeLength = circumference * percentage
    const offset =
      acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].strokeLength : 0
    acc.push({ ...seg, strokeLength, offset })
    return acc
  }, [])

  const chartDescription = segments.map((seg) => `${seg.label}: ${seg.percentage}%`).join(', ')

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg
          className="-rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Spending breakdown chart. ${chartDescription}`}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted"
          />
          {segmentsWithOffset.map((seg) => (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${seg.strokeLength} ${circumference - seg.strokeLength}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              className="animate-donut-segment"
              style={{ animationDelay: `${segmentsWithOffset.indexOf(seg) * 150}ms` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-xs">Total</span>
          <span className="text-foreground text-lg font-bold">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-3">
            <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">{seg.label}</span>
              <span className="text-foreground text-sm font-bold">{seg.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
