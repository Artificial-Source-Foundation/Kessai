import dayjs from 'dayjs'
import type { BackupReader, Subscription, BackupData } from './backup-reader.js'

export interface UpcomingPayment {
  subscription: Subscription
  daysUntil: number
  dueDate: string
}

export class ReminderService {
  private backupReader: BackupReader
  private notificationDays: number[]

  constructor(backupReader: BackupReader, notificationDays: number[] = [1, 3, 7]) {
    this.backupReader = backupReader
    this.notificationDays = notificationDays
  }

  async getUpcomingPayments(withinDays: number = 7): Promise<UpcomingPayment[]> {
    const data = await this.backupReader.read()
    if (!data) return []

    const today = dayjs().startOf('day')
    const endDate = today.add(withinDays, 'day')

    const activeSubscriptions = this.backupReader.getActiveSubscriptions(data)

    const upcoming: UpcomingPayment[] = []

    for (const sub of activeSubscriptions) {
      if (!sub.next_payment_date) continue

      const paymentDate = dayjs(sub.next_payment_date).startOf('day')

      if (paymentDate.isBefore(today)) continue
      if (paymentDate.isAfter(endDate)) continue

      const daysUntil = paymentDate.diff(today, 'day')

      upcoming.push({
        subscription: sub,
        daysUntil,
        dueDate: sub.next_payment_date,
      })
    }

    // Sort by due date (earliest first)
    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  async getPaymentsDueToday(): Promise<UpcomingPayment[]> {
    const upcoming = await this.getUpcomingPayments(0)
    return upcoming.filter((p) => p.daysUntil === 0)
  }

  async getPaymentsForReminder(): Promise<UpcomingPayment[]> {
    const data = await this.backupReader.read()
    if (!data) return []

    // Use notification days from settings or default
    const days = data.settings.notification_days_before || this.notificationDays
    const maxDays = Math.max(...days)

    const upcoming = await this.getUpcomingPayments(maxDays)

    // Filter to only include payments that match notification days
    return upcoming.filter((p) => days.includes(p.daysUntil))
  }

  async getMonthlySummary(): Promise<{
    total: number
    currency: string
    subscriptions: Subscription[]
  }> {
    const data = await this.backupReader.read()
    if (!data) {
      return { total: 0, currency: 'USD', subscriptions: [] }
    }

    const activeSubscriptions = this.backupReader.getActiveSubscriptions(data)

    // Calculate monthly equivalent for all subscriptions
    let monthlyTotal = 0
    for (const sub of activeSubscriptions) {
      switch (sub.billing_cycle) {
        case 'weekly':
          monthlyTotal += sub.amount * 4.33 // Average weeks per month
          break
        case 'monthly':
          monthlyTotal += sub.amount
          break
        case 'quarterly':
          monthlyTotal += sub.amount / 3
          break
        case 'yearly':
          monthlyTotal += sub.amount / 12
          break
        default:
          monthlyTotal += sub.amount // Assume monthly for custom
      }
    }

    return {
      total: Math.round(monthlyTotal * 100) / 100,
      currency: data.settings.currency || 'USD',
      subscriptions: activeSubscriptions,
    }
  }

  async getBackupData(): Promise<BackupData | null> {
    return this.backupReader.read()
  }
}
