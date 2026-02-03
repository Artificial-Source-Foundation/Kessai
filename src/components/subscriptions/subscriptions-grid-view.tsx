import { memo } from 'react'
import { Pencil, Trash2, Power } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { formatPaymentDate } from '@/lib/date-utils'
import { BILLING_CYCLE_LABELS, CATEGORY_BADGE_VARIANTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
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
        return (
          <div
            key={sub.id}
            className={`glass-card hover-lift group relative overflow-hidden ${!sub.is_active ? 'opacity-60' : ''}`}
          >
            <div className="bg-card/80 absolute top-2 right-2 z-10 flex gap-1 rounded-lg p-1 opacity-0 backdrop-blur-sm group-hover:opacity-100">
              <button
                onClick={() => onEdit(sub)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onToggleActive(sub)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
              >
                <Power className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(sub)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col items-center p-6 pb-4">
              <SubscriptionLogo
                logoUrl={sub.logo_url}
                name={sub.name}
                color={sub.color || category?.color}
                size="xl"
                className="mb-4 rounded-2xl shadow-lg"
              />
              <h3 className="text-foreground text-lg font-bold">{sub.name}</h3>
              {category && (
                <Badge variant={getCategoryVariant(category.name)} size="sm" className="mt-1">
                  {category.name}
                </Badge>
              )}
            </div>

            <div className="border-border bg-muted/30 border-t px-6 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-foreground text-2xl font-bold">
                    {formatCurrency(sub.amount, currency)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {BILLING_CYCLE_LABELS[sub.billing_cycle]}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        sub.is_active ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        sub.is_active ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {sub.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {sub.next_payment_date ? formatPaymentDate(sub.next_payment_date) : '-'}
                  </p>
                </div>
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
