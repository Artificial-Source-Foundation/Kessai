import { useId } from 'react'
import { cn } from '@/lib/utils'

export interface AreaChartDataPoint {
  label: string
  value: number
}

export interface AreaChartProps {
  data: AreaChartDataPoint[]
  height?: number
  color?: string
  showLabels?: boolean
  showGrid?: boolean
  className?: string
}

export function AreaChart({
  data,
  height = 200,
  color = '#895af6',
  showLabels = true,
  showGrid = true,
  className,
}: AreaChartProps) {
  const gradientId = useId()

  if (data.length === 0) return null

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const range = maxValue - minValue || 1

  const padding = { top: 20, right: 10, bottom: showLabels ? 30 : 10, left: 10 }
  const chartWidth = 100
  const chartHeight = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x =
      padding.left + (i / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right)
    const y = padding.top + chartHeight - ((d.value - minValue) / range) * chartHeight
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${padding.top + chartHeight}
    L ${points[0].x} ${padding.top + chartHeight}
    Z
  `

  return (
    <div className={cn('w-full', className)}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid && (
          <g className="text-border">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + chartHeight * (1 - ratio)
              return (
                <line
                  key={ratio}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="2,2"
                />
              )
            })}
          </g>
        )}

        <path d={areaPath} fill={`url(#${gradientId})`} />

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={color}
            className="opacity-0 transition-opacity hover:opacity-100"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        ))}

        {showLabels && (
          <g className="text-muted-foreground">
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                opacity="0.6"
              >
                {p.label}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}
