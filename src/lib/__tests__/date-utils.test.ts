import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  calculateNextPaymentDate,
  formatPaymentDate,
  formatShortDate,
  getDaysUntil,
  getUrgencyLevel,
  getUpcomingPayments,
} from '../date-utils'

describe('calculateNextPaymentDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates next weekly payment', () => {
    const startDate = new Date(2025, 0, 1)
    const nextDate = calculateNextPaymentDate(startDate, 'weekly')
    expect(nextDate.getTime()).toBeGreaterThan(new Date(2025, 0, 15).getTime())
  })

  it('calculates next monthly payment', () => {
    const startDate = new Date(2024, 11, 20)
    const nextDate = calculateNextPaymentDate(startDate, 'monthly')
    expect(nextDate.getDate()).toBe(20)
    expect(nextDate.getMonth()).toBe(0)
  })

  it('calculates next quarterly payment', () => {
    const startDate = new Date(2024, 9, 1)
    const nextDate = calculateNextPaymentDate(startDate, 'quarterly')
    expect(nextDate >= new Date(2025, 0, 15)).toBe(true)
  })

  it('calculates next yearly payment', () => {
    const startDate = new Date(2024, 5, 1)
    const nextDate = calculateNextPaymentDate(startDate, 'yearly')
    expect(nextDate.getFullYear()).toBe(2025)
  })

  it('handles billing day for monthly cycle', () => {
    const startDate = new Date(2024, 11, 15)
    const nextDate = calculateNextPaymentDate(startDate, 'monthly', 25)
    expect(nextDate.getDate()).toBe(25)
  })
})

describe('formatPaymentDate', () => {
  it('formats Date object correctly', () => {
    const date = new Date(2025, 2, 15)
    expect(formatPaymentDate(date)).toBe('Mar 15, 2025')
  })

  it('formats ISO string correctly', () => {
    expect(formatPaymentDate('2025-12-25')).toBe('Dec 25, 2025')
  })
})

describe('formatShortDate', () => {
  it('formats Date object to short format', () => {
    const date = new Date(2025, 6, 4)
    expect(formatShortDate(date)).toBe('Jul 4')
  })

  it('formats ISO string to short format', () => {
    expect(formatShortDate('2025-01-01')).toBe('Jan 1')
  })
})

describe('getDaysUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for today', () => {
    expect(getDaysUntil('2025-01-15')).toBe(0)
  })

  it('returns positive number for future date', () => {
    expect(getDaysUntil('2025-01-20')).toBe(5)
  })

  it('returns negative number for past date', () => {
    expect(getDaysUntil('2025-01-10')).toBe(-5)
  })
})

describe('getUrgencyLevel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "today" for current date', () => {
    expect(getUrgencyLevel('2025-01-15')).toBe('today')
  })

  it('returns "tomorrow" for next day', () => {
    expect(getUrgencyLevel('2025-01-16')).toBe('tomorrow')
  })

  it('returns "later" for far future dates', () => {
    expect(getUrgencyLevel('2025-02-15')).toBe('later')
  })
})

describe('getUpcomingPayments', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockSubscriptions = [
    { id: '1', name: 'Netflix', next_payment_date: '2025-01-20' },
    { id: '2', name: 'Spotify', next_payment_date: '2025-01-16' },
    { id: '3', name: 'AWS', next_payment_date: '2025-02-01' },
    { id: '4', name: 'Inactive', next_payment_date: null },
    { id: '5', name: 'Past', next_payment_date: '2025-01-10' },
  ]

  it('filters payments within the specified days', () => {
    const upcoming = getUpcomingPayments(mockSubscriptions, 7)
    expect(upcoming).toHaveLength(2)
  })

  it('sorts by payment date ascending', () => {
    const upcoming = getUpcomingPayments(mockSubscriptions, 7)
    expect(upcoming[0].name).toBe('Spotify')
    expect(upcoming[1].name).toBe('Netflix')
  })

  it('excludes subscriptions with null payment date', () => {
    const upcoming = getUpcomingPayments(mockSubscriptions, 30)
    expect(upcoming.find((s) => s.name === 'Inactive')).toBeUndefined()
  })

  it('excludes past payment dates', () => {
    const upcoming = getUpcomingPayments(mockSubscriptions, 30)
    expect(upcoming.find((s) => s.name === 'Past')).toBeUndefined()
  })

  it('returns empty array when no upcoming payments', () => {
    const upcoming = getUpcomingPayments([], 7)
    expect(upcoming).toHaveLength(0)
  })
})
