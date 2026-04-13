import { memo, useMemo } from 'react'
import dayjs from 'dayjs'

interface TrialBadgeProps {
  trialEndDate: string | null
}

export const TrialBadge = memo(function TrialBadge({ trialEndDate }: TrialBadgeProps) {
  const { label, isExpired, daysLeft } = useMemo(() => {
    if (!trialEndDate) {
      return { label: 'TRIAL', isExpired: false, daysLeft: null }
    }

    const endDate = dayjs(trialEndDate)
    const today = dayjs().startOf('day')
    const diff = endDate.diff(today, 'day')

    if (diff < 0) {
      return { label: 'TRIAL EXPIRED', isExpired: true, daysLeft: diff }
    }

    if (diff === 0) {
      return { label: 'TRIAL ENDS TODAY', isExpired: false, daysLeft: 0 }
    }

    if (diff === 1) {
      return { label: 'TRIAL · 1 DAY LEFT', isExpired: false, daysLeft: 1 }
    }

    return { label: `TRIAL · ${diff}D LEFT`, isExpired: false, daysLeft: diff }
  }, [trialEndDate])

  const isUrgent = daysLeft !== null && daysLeft <= 3 && !isExpired

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wider uppercase ${
        isExpired
          ? 'border-destructive/30 bg-destructive/20 text-destructive border'
          : isUrgent
            ? 'border-warning/30 bg-warning/20 text-warning border'
            : 'border-warning/30 bg-warning/15 text-warning border'
      }`}
    >
      {label}
    </span>
  )
})
