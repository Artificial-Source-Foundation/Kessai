import { formatCurrency, type CurrencyCode } from '@/lib/currency'

interface AreaChartProps {
  data: Array<{ month: string; amount: number; monthLabel?: string }>
  color?: string
  currency?: CurrencyCode
}

export function AreaChart({ data, color = '#8655f6', currency = 'USD' }: AreaChartProps) {
  if (data.length === 0) return null

  const chartData = data.slice(-6)
  const values = chartData.map((d) => d.amount)
  const maxValue = Math.max(...values, 1)

  // Chart dimensions
  const width = 100
  const height = 100
  const padding = { top: 10, right: 5, bottom: 5, left: 5 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate points with proper scaling
  const points = values.map((value, i) => {
    const x = padding.left + (i / (values.length - 1)) * chartWidth
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight
    return { x, y, value }
  })

  // Create smooth curve path using quadratic bezier curves
  let linePath = `M${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midX = (prev.x + curr.x) / 2
    linePath += ` Q${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${midX} ${(prev.y + curr.y) / 2}`
    linePath += ` T${curr.x} ${curr.y}`
  }

  // Area path (fill below line)
  const areaPath = `${linePath} L${points[points.length - 1].x} ${padding.top + chartHeight} L${padding.left} ${padding.top + chartHeight} Z`

  return (
    <div className="relative h-full w-full">
      {/* Y-axis label */}
      <div className="text-muted-foreground absolute top-0 left-0 text-[10px] font-medium">
        {formatCurrency(maxValue, currency)}
      </div>

      <svg
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id={`areaGradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="0.5"
        />
        <line
          x1={padding.left}
          y1={padding.top + chartHeight / 2}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight / 2}
          stroke="currentColor"
          strokeOpacity="0.05"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Area fill */}
        <path d={areaPath} fill={`url(#areaGradient-${color})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="var(--color-background)"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
