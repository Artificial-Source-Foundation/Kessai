import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrialBadge } from '../trial-badge'
import dayjs from 'dayjs'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(null),
}))

describe('TrialBadge', () => {
  it('renders "TRIAL" when trialEndDate is null', () => {
    render(<TrialBadge trialEndDate={null} />)
    expect(screen.getByText('TRIAL')).toBeInTheDocument()
  })

  it('renders "TRIAL ENDS TODAY" when trial ends today', () => {
    const today = dayjs().format('YYYY-MM-DD')
    render(<TrialBadge trialEndDate={today} />)
    expect(screen.getByText('TRIAL ENDS TODAY')).toBeInTheDocument()
  })

  it('renders "TRIAL EXPIRED" when trial date is in the past', () => {
    const pastDate = dayjs().subtract(5, 'day').format('YYYY-MM-DD')
    render(<TrialBadge trialEndDate={pastDate} />)
    expect(screen.getByText('TRIAL EXPIRED')).toBeInTheDocument()
  })

  it('renders days left when trial is in the future (1 day)', () => {
    const tomorrow = dayjs().startOf('day').add(1, 'day').format('YYYY-MM-DD')
    render(<TrialBadge trialEndDate={tomorrow} />)
    expect(screen.getByText('TRIAL · 1 DAY LEFT')).toBeInTheDocument()
  })

  it('renders days left when trial is in the future (multiple days)', () => {
    const futureDate = dayjs().startOf('day').add(10, 'day').format('YYYY-MM-DD')
    render(<TrialBadge trialEndDate={futureDate} />)
    expect(screen.getByText('TRIAL · 10D LEFT')).toBeInTheDocument()
  })

  it('applies expired styling (destructive border) when trial is expired', () => {
    const pastDate = dayjs().subtract(3, 'day').format('YYYY-MM-DD')
    const { container } = render(<TrialBadge trialEndDate={pastDate} />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('border-destructive')
  })

  it('applies urgent styling (amber border) when trial ends within 3 days', () => {
    const soonDate = dayjs().startOf('day').add(2, 'day').format('YYYY-MM-DD')
    const { container } = render(<TrialBadge trialEndDate={soonDate} />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('border-warning')
  })

  it('applies non-urgent styling when trial is far in the future', () => {
    const farDate = dayjs().startOf('day').add(30, 'day').format('YYYY-MM-DD')
    const { container } = render(<TrialBadge trialEndDate={farDate} />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('border-warning')
    // Non-urgent uses bg-warning/15 (not /20)
    expect(badge.className).toContain('bg-warning/15')
  })
})
