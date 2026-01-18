import { memo } from 'react'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import { formatShortDate, getDaysUntil } from '@/lib/date-utils'

interface UpcomingPaymentRowProps {
  subscription: {
    id: string
    name: string
    amount: number
    next_payment_date?: string | null
    logo_url?: string | null
    color?: string | null
  }
  currency: CurrencyCode
}

export const UpcomingPaymentRow = memo(function UpcomingPaymentRow({
  subscription,
  currency,
}: UpcomingPaymentRowProps) {
  const daysUntil = subscription.next_payment_date
    ? getDaysUntil(subscription.next_payment_date)
    : null

  return (
    <div className="group hover:border-border hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-3">
      <div className="flex items-center gap-4">
        <SubscriptionLogo
          logoUrl={subscription.logo_url}
          name={subscription.name}
          color={subscription.color}
          size="lg"
          className="rounded-lg shadow-lg"
        />
        <div>
          <p className="text-foreground font-semibold">{subscription.name}</p>
          <p className="text-muted-foreground text-xs">
            {subscription.next_payment_date && formatShortDate(subscription.next_payment_date)}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-foreground font-bold">{formatCurrency(subscription.amount, currency)}</p>
        {daysUntil !== null && daysUntil <= 1 ? (
          <div className="border-accent-orange/20 bg-accent-orange/20 text-accent-orange rounded-full border px-2 py-0.5 text-[10px] font-bold">
            {daysUntil === 0 ? 'Today' : 'Tomorrow'}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">In {daysUntil} days</p>
        )}
      </div>
    </div>
  )
})
