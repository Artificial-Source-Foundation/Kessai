import { memo } from 'react'

interface StatCardProps {
  label: string
  value: string
  subtitle?: string
  subtitleColor?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

export const StatCard = memo(function StatCard({
  label,
  value,
  subtitle,
  subtitleColor,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="glass-card hover-lift group rounded-2xl p-5">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-foreground text-3xl font-bold tracking-tight">{value}</p>
      {subtitle && (
        <p className={`mt-1 text-xs font-medium ${subtitleColor || 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
})
