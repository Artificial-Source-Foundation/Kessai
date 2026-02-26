import { memo } from 'react'
import { Pencil, Trash2, Power, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { BILLING_CYCLE_LABELS, CATEGORY_BADGE_VARIANTS } from '@/lib/constants'
import { isBillableStatus } from '@/types/subscription'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import { StatusBadge } from '@/components/subscriptions/status-badge'
import { TrialCountdown } from '@/components/subscriptions/trial-countdown'
import type { BadgeVariant } from '@/components/ui/badge'
import type { CurrencyCode } from '@/lib/currency'
import type { Subscription } from '@/types/subscription'
import type { Category } from '@/types/category'

interface SubscriptionsGridViewProps {
  subscriptions: Subscription[]
  currency: CurrencyCode
  getCategory: (categoryId: string | null) => Category | undefined
  onEdit: (sub: Subscription) => void
  onDelete: (sub: Subscription) => void
  onToggleActive: (sub: Subscription) => void
  onMarkAsPaid: (sub: Subscription) => void
  canMarkAsPaid: (sub: Subscription) => boolean
}

function getCategoryVariant(categoryName?: string): BadgeVariant {
  if (!categoryName) return 'secondary'
  return (CATEGORY_BADGE_VARIANTS[categoryName] as BadgeVariant) || 'secondary'
}

export const SubscriptionsGridView = memo(function SubscriptionsGridView({
  subscriptions,
  currency,
  getCategory,
  onEdit,
  onDelete,
  onToggleActive,
  onMarkAsPaid,
  canMarkAsPaid,
}: SubscriptionsGridViewProps) {
  return (
    <div className="stagger-children grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {subscriptions.map((sub) => {
        const category = getCategory(sub.category_id)
        const billable = isBillableStatus(sub.status)
        const userAmount = sub.shared_count > 1 ? sub.amount / sub.shared_count : sub.amount
        return (
          <div
            key={sub.id}
            className={`glass-card hover-lift group relative overflow-hidden ${!billable ? 'opacity-60' : ''}`}
          >
            <div className="bg-card/90 absolute top-2 right-2 z-10 flex gap-1 rounded-lg p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                onClick={() => onEdit(sub)}
                aria-label={`Edit ${sub.name}`}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onToggleActive(sub)}
                aria-label={billable ? `Pause ${sub.name}` : `Activate ${sub.name}`}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
              >
                <Power className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(sub)}
                aria-label={`Delete ${sub.name}`}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <SubscriptionLogo
                  logoUrl={sub.logo_url}
                  name={sub.name}
                  color={sub.color || category?.color}
                  size="lg"
                  className="rounded-xl"
                />
                <div className="flex flex-col items-end gap-1">
                  {category && (
                    <Badge variant={getCategoryVariant(category.name)} size="sm">
                      {category.name}
                    </Badge>
                  )}
                  {sub.status === 'trial' && <TrialCountdown trialEndDate={sub.trial_end_date} />}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h3
                  className="text-foreground max-w-full truncate font-[family-name:var(--font-heading)] text-xl font-bold"
                  title={sub.name}
                >
                  {sub.name}
                </h3>
                <p className="text-muted-foreground font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
                  {BILLING_CYCLE_LABELS[sub.billing_cycle]}
                </p>
              </div>

              <div className="mt-auto flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <p className="text-foreground font-[family-name:var(--font-heading)] text-[28px] leading-none font-bold">
                      {formatCurrency(sub.shared_count > 1 ? userAmount : sub.amount, currency)}
                    </p>
                    <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs">
                      /{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                    </span>
                  </div>
                  {sub.shared_count > 1 && (
                    <span className="text-muted-foreground mt-0.5 flex items-center gap-1 font-[family-name:var(--font-mono)] text-[10px]">
                      <Users className="h-3 w-3" />
                      {sub.shared_count} people · {formatCurrency(sub.amount, currency)} total
                    </span>
                  )}
                </div>
                <StatusBadge status={sub.status} />
              </div>

              {canMarkAsPaid(sub) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkAsPaid(sub)}
                  className="w-full border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                >
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})
