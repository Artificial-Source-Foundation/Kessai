import { cn } from '@/lib/utils'

export interface DonutChartSegment {
  value: number
  color: string
  label: string
}

export interface DonutChartProps {
  segments: DonutChartSegment[]
  centerValue?: string
  centerLabel?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 180,
  strokeWidth = 24,
  className,
}: DonutChartProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const segmentsWithOffsets = segments.reduce<
    Array<{ segment: DonutChartSegment; offset: number; strokeLength: number }>
  >((acc, segment) => {
    const percentage = total > 0 ? segment.value / total : 0
    const strokeLength = circumference * percentage
    const prevOffset =
      acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].strokeLength : 0
    acc.push({ segment, offset: prevOffset, strokeLength })
    return acc
  }, [])

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {segmentsWithOffsets.map(({ segment, offset, strokeLength }, index) => {
          const gapSize = segments.length > 1 ? 4 : 0
          const adjustedLength = Math.max(0, strokeLength - gapSize)

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${adjustedLength} ${circumference - adjustedLength}`}
              strokeDashoffset={-offset + circumference / 4}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: `drop-shadow(0 0 6px ${segment.color}40)`,
              }}
            />
          )
        })}
      </svg>

      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-foreground text-2xl font-bold">{centerValue}</span>}
          {centerLabel && <span className="text-muted-foreground text-xs">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}

export interface DonutChartLegendProps {
  segments: DonutChartSegment[]
  className?: string
}

export function DonutChartLegend({ segments, className }: DonutChartLegendProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)

  return (
    <div className={cn('space-y-2', className)}>
      {segments.map((segment, index) => {
        const percentage = total > 0 ? ((segment.value / total) * 100).toFixed(0) : 0

        return (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-muted-foreground">{segment.label}</span>
            </div>
            <span className="text-foreground font-medium">{percentage}%</span>
          </div>
        )
      })}
    </div>
  )
}
