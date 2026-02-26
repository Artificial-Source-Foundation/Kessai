import { memo } from 'react'
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/types/subscription'
import type { SubscriptionStatus } from '@/types/subscription'

interface StatusBadgeProps {
  status: SubscriptionStatus
}

export const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
      <span
        className={`font-[family-name:var(--font-mono)] text-[10px] font-medium ${STATUS_COLORS[status]}`}
      >
        {STATUS_LABELS[status]}
      </span>
    </div>
  )
})
