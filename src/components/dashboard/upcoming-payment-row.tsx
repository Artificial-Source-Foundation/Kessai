import { memo } from 'react'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import { convertCurrencyCached } from '@/lib/exchange-rates'
import { formatShortDate, getDaysUntil } from '@/lib/date-utils'

interface UpcomingPaymentRowProps {
  subscription: {
    id: string
    name: string
    amount: number
    currency?: string
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
    <div className="border-border group flex w-full cursor-pointer items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SubscriptionLogo
          logoUrl={subscription.logo_url}
          name={subscription.name}
          color={subscription.color}
          size="lg"
          className="shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate font-[family-name:var(--font-heading)] font-semibold">
            {subscription.name}
          </p>
          <p className="text-muted-foreground truncate font-[family-name:var(--font-mono)] text-[11px]">
            {subscription.next_payment_date && formatShortDate(subscription.next_payment_date)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        {(() => {
          const subCurrency = (subscription.currency || currency) as CurrencyCode
          const isDifferent = subCurrency !== currency
          const converted = isDifferent
            ? convertCurrencyCached(subscription.amount, subCurrency, currency)
            : null
          return (
            <>
              <div className="flex items-baseline gap-1">
                <p className="text-foreground font-[family-name:var(--font-heading)] font-bold">
                  {formatCurrency(subscription.amount, subCurrency)}
                </p>
                <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px]">
                  {subCurrency}
                </span>
              </div>
              {isDifferent && converted !== null && (
                <p className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px]">
                  ≈ {formatCurrency(converted, currency)} {currency}
                </p>
              )}
            </>
          )
        })()}
        {daysUntil !== null && daysUntil <= 1 ? (
          <div className="border-ghost bg-surface-highest/50 text-primary rounded-full border px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase">
            {daysUntil === 0 ? 'Today' : 'Tomorrow'}
          </div>
        ) : (
          <p className="text-muted-foreground font-[family-name:var(--font-mono)] text-[11px]">
            In {daysUntil} days
          </p>
        )}
      </div>
    </div>
  )
})
