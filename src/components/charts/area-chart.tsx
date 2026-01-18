interface AreaChartProps {
  data: Array<{ month: string; amount: number }>
  color?: string
}

export function AreaChart({ data, color = '#8655f6' }: AreaChartProps) {
  if (data.length === 0) return null

  const values = data.slice(-6).map((d) => d.amount)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const range = maxValue - minValue || 1

  const points = values.map((value, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 50 - ((value - minValue) / range) * 40
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L100 50 L0 50 Z`

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 100 50"
    >
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGradient)" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="animate-draw-line"
      />
    </svg>
  )
}
