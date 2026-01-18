import { useMemo, useEffect, useState } from 'react'
import { useSubscriptions } from './use-subscriptions'
import { usePaymentStore } from '@/stores/payment-store'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import type { Subscription } from '@/types/subscription'
import type { Payment } from '@/types/payment'

dayjs.extend(isSameOrBefore)

/**
 * Payment data for a specific day.
 */
export interface DayPayment {
  /** The subscription associated with this payment */
  subscription: Subscription
  /** Amount due for this payment */
  amount: number
  /** Whether the payment has been marked as paid */
  isPaid: boolean
  /** Whether the payment has been skipped */
  isSkipped: boolean
  /** Due date in yyyy-MM-dd format */
  dueDate: string
}

/**
 * Calendar day data with payment information.
 */
interface CalendarDay {
  /** JavaScript Date object */
  date: Date
  /** Day number (1-31) */
  dayOfMonth: number
  /** Whether this day is in the current displayed month */
  isCurrentMonth: boolean
  /** Whether this day is today */
  isToday: boolean
  /** Array of payments due on this day */
  payments: DayPayment[]
  /** Sum of all payment amounts for this day */
  totalAmount: number
}

/**
 * Monthly statistics for the calendar header.
 */
interface MonthStats {
  /** Total expected spending for the month */
  totalAmount: number
  /** Amount already paid */
  paidAmount: number
  /** Amount still upcoming (not paid or skipped) */
  upcomingAmount: number
  /** Total number of payments this month */
  paymentCount: number
  /** Number of payments marked as paid */
  paidCount: number
  /** Percentage change compared to previous month */
  comparisonToPrevMonth: number
}

/**
 * Helper function to generate an array of dates in a range.
 */
function eachDayOfInterval(start: dayjs.Dayjs, end: dayjs.Dayjs): dayjs.Dayjs[] {
  const days: dayjs.Dayjs[] = []
  let current = start
  while (current.isSameOrBefore(end, 'day')) {
    days.push(current)
    current = current.add(1, 'day')
  }
  return days
}

/**
 * Hook for computing calendar data and payment statistics.
 * Builds the calendar grid with payment data for each day.
 *
 * @param currentDate - The month to display (any date in the target month)
 * @returns Calendar days array, month stats, and payment lookup functions
 * @example
 * const { calendarDays, monthStats } = useCalendarStats(selectedMonth)
 */
export function useCalendarStats(currentDate: Date) {
  const { subscriptions } = useSubscriptions()
  const fetchPaymentsByMonth = usePaymentStore((s) => s.fetchPaymentsByMonth)
  const [payments, setPayments] = useState<Payment[]>([])
  const [prevMonthPayments, setPrevMonthPayments] = useState<Payment[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  useEffect(() => {
    fetchPaymentsByMonth(year, month).then(setPayments)
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    fetchPaymentsByMonth(prevYear, prevMonth).then(setPrevMonthPayments)
  }, [year, month, fetchPaymentsByMonth])

  const subscriptionsForMonth = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((s) => s.is_active)
    const currentDayjs = dayjs(currentDate)

    return activeSubscriptions.filter((sub) => {
      if (sub.billing_cycle === 'yearly' && sub.next_payment_date) {
        const nextPayment = dayjs(sub.next_payment_date)
        return nextPayment.isSame(currentDayjs, 'month')
      }
      return true
    })
  }, [subscriptions, currentDate])

  const getPaymentsForDay = useMemo(() => {
    return (dayOfMonth: number): DayPayment[] => {
      const dateStr = dayjs(new Date(year, month - 1, dayOfMonth)).format('YYYY-MM-DD')
      const currentDayjs = dayjs(currentDate)

      return subscriptionsForMonth
        .filter((sub) => {
          if (sub.next_payment_date) {
            const nextPayment = dayjs(sub.next_payment_date)
            if (nextPayment.isSame(currentDayjs, 'month')) {
              return nextPayment.date() === dayOfMonth
            }
          }

          if (
            sub.billing_day &&
            (sub.billing_cycle === 'monthly' || sub.billing_cycle === 'quarterly')
          ) {
            return sub.billing_day === dayOfMonth
          }

          if (sub.billing_cycle === 'weekly' && sub.next_payment_date) {
            const nextPayment = dayjs(sub.next_payment_date)
            const checkDate = dayjs(new Date(year, month - 1, dayOfMonth))
            return nextPayment.day() === checkDate.day()
          }

          return false
        })
        .map((sub) => {
          const payment = payments.find(
            (p) => p.subscription_id === sub.id && p.due_date === dateStr
          )

          return {
            subscription: sub,
            amount: sub.amount,
            isPaid: payment?.status === 'paid',
            isSkipped: payment?.status === 'skipped',
            dueDate: dateStr,
          }
        })
    }
  }, [subscriptionsForMonth, payments, year, month, currentDate])

  const calendarDays = useMemo((): CalendarDay[] => {
    const currentDayjs = dayjs(currentDate)
    const monthStart = currentDayjs.startOf('month')
    const monthEnd = currentDayjs.endOf('month')
    const today = dayjs()

    return eachDayOfInterval(monthStart, monthEnd).map((d) => {
      const dayOfMonth = d.date()
      const dayPayments = getPaymentsForDay(dayOfMonth)

      return {
        date: d.toDate(),
        dayOfMonth,
        isCurrentMonth: true,
        isToday: d.isSame(today, 'day'),
        payments: dayPayments,
        totalAmount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
      }
    })
  }, [currentDate, getPaymentsForDay])

  const monthStats = useMemo((): MonthStats => {
    const allPaymentsThisMonth = calendarDays.flatMap((day) => day.payments)

    const totalAmount = allPaymentsThisMonth.reduce((sum, p) => sum + p.amount, 0)
    const paidAmount = allPaymentsThisMonth
      .filter((p) => p.isPaid)
      .reduce((sum, p) => sum + p.amount, 0)
    const upcomingAmount = allPaymentsThisMonth
      .filter((p) => !p.isPaid && !p.isSkipped)
      .reduce((sum, p) => sum + p.amount, 0)

    const prevMonthTotal = prevMonthPayments.reduce((sum, p) => sum + p.amount, 0)
    const comparisonToPrevMonth =
      prevMonthTotal > 0 ? ((totalAmount - prevMonthTotal) / prevMonthTotal) * 100 : 0

    return {
      totalAmount,
      paidAmount,
      upcomingAmount,
      paymentCount: allPaymentsThisMonth.length,
      paidCount: allPaymentsThisMonth.filter((p) => p.isPaid).length,
      comparisonToPrevMonth,
    }
  }, [calendarDays, prevMonthPayments])

  const getPaymentsForDate = (date: Date): DayPayment[] => {
    const targetDate = dayjs(date)
    const day = calendarDays.find((d) => dayjs(d.date).isSame(targetDate, 'day'))
    return day?.payments || []
  }

  return {
    calendarDays,
    monthStats,
    getPaymentsForDate,
    getPaymentsForDay,
    refetchPayments: () => fetchPaymentsByMonth(year, month).then(setPayments),
  }
}
