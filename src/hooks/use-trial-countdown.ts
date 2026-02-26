import { useMemo } from 'react'
import dayjs from 'dayjs'

export function useTrialCountdown(trialEndDate: string | null | undefined) {
  return useMemo(() => {
    if (!trialEndDate) {
      return {
        daysRemaining: null,
        isExpiringSoon: false,
        isExpired: false,
        formattedCountdown: null,
      }
    }

    const endDate = dayjs(trialEndDate)
    const today = dayjs().startOf('day')
    const daysRemaining = endDate.diff(today, 'day')

    return {
      daysRemaining,
      isExpiringSoon: daysRemaining >= 0 && daysRemaining <= 3,
      isExpired: daysRemaining < 0,
      formattedCountdown:
        daysRemaining < 0
          ? 'Expired'
          : daysRemaining === 0
            ? 'Ends today'
            : daysRemaining === 1
              ? '1 day left'
              : `${daysRemaining} days left`,
    }
  }, [trialEndDate])
}
