import { memo } from 'react'
import { useTrialCountdown } from '@/hooks/use-trial-countdown'

interface TrialCountdownProps {
  trialEndDate: string | null | undefined
}

export const TrialCountdown = memo(function TrialCountdown({ trialEndDate }: TrialCountdownProps) {
  const { formattedCountdown, isExpiringSoon, isExpired } = useTrialCountdown(trialEndDate)

  if (!formattedCountdown) return null

  const colorClass = isExpired
    ? 'text-destructive bg-destructive/10'
    : isExpiringSoon
      ? 'text-warning bg-warning/10'
      : 'text-info bg-info/10'

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium ${colorClass}`}
    >
      {formattedCountdown}
    </span>
  )
})
