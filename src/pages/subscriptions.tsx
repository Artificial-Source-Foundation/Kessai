import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useUiStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { usePaymentStore } from '@/stores/payment-store'
import { formatCurrency } from '@/lib/currency'
import { formatPaymentDate, calculateNextPaymentDate } from '@/lib/date-utils'
import { parseISO, startOfDay } from 'date-fns'
import { BILLING_CYCLE_LABELS } from '@/types/subscription'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Check,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SubscriptionDialog } from '@/components/subscriptions/subscription-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { CurrencyCode } from '@/lib/currency'
import type { Subscription } from '@/types/subscription'

const CATEGORY_VARIANT_MAP: Record<
  string,
  | 'entertainment'
  | 'software'
  | 'music'
  | 'health'
  | 'shopping'
  | 'ai'
  | 'cloud'
  | 'productivity'
  | 'development'
  | 'security'
  | 'secondary'
> = {
  Entertainment: 'entertainment',
  Software: 'software',
  Music: 'music',
  Health: 'health',
  Shopping: 'shopping',
  AI: 'ai',
  Cloud: 'cloud',
  Productivity: 'productivity',
  Development: 'development',
  Security: 'security',
}

export function Subscriptions() {
  const { subscriptions, isLoading, remove, toggleActive, getCategory } = useSubscriptions()
  const { openSubscriptionDialog } = useUiStore()
  const { settings, fetch: fetchSettings } = useSettingsStore()
  const { markAsPaid } = usePaymentStore()
  const currency = (settings?.currency || 'USD') as CurrencyCode

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMarkAsPaid = async (sub: Subscription) => {
    if (!sub.next_payment_date) return
    try {
      await markAsPaid(sub.id, sub.next_payment_date, sub.amount)
      const currentPaymentDate = parseISO(sub.next_payment_date)
      const nextDate = calculateNextPaymentDate(
        currentPaymentDate,
        sub.billing_cycle,
        sub.billing_day || undefined
      )
      await useSubscriptionStore.getState().update(sub.id, {
        next_payment_date: nextDate.toISOString().split('T')[0],
      })
      toast.success('Payment recorded', {
        description: `${sub.name} marked as paid. Next payment: ${formatPaymentDate(nextDate)}`,
      })
    } catch {
      toast.error('Error', { description: 'Failed to record payment.' })
    }
  }

  const canMarkAsPaid = (sub: Subscription): boolean => {
    if (!sub.next_payment_date || !sub.is_active) return false
    const paymentDate = startOfDay(parseISO(sub.next_payment_date))
    const today = startOfDay(new Date())
    return paymentDate <= today
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await remove(deleteTarget.id)
      toast.success('Subscription deleted', {
        description: `${deleteTarget.name} has been removed.`,
      })
    } catch {
      toast.error('Error', { description: 'Failed to delete subscription.' })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleToggleActive = async (sub: Subscription) => {
    try {
      await toggleActive(sub.id)
      toast.success(sub.is_active ? 'Subscription paused' : 'Subscription activated', {
        description: `${sub.name} has been ${sub.is_active ? 'paused' : 'activated'}.`,
      })
    } catch {
      toast.error('Error', { description: 'Failed to update subscription status.' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  const getCategoryVariant = (categoryName?: string) => {
    if (!categoryName) return 'secondary'
    return CATEGORY_VARIANT_MAP[categoryName] || 'secondary'
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">
              {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <Button variant="glow" onClick={() => openSubscriptionDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {subscriptions.length > 0 && (
          <div className="glass-panel flex items-center gap-4 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input h-10 w-full pr-4 pl-10 text-sm"
              />
            </div>
            <SegmentedControl
              options={[
                { value: 'grid', label: '', icon: <LayoutGrid className="h-4 w-4" /> },
                { value: 'list', label: '', icon: <List className="h-4 w-4" /> },
              ]}
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'grid' | 'list')}
              size="md"
            />
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16">
            <div className="bg-primary/10 mb-4 rounded-full p-4">
              <Plus className="text-primary h-8 w-8" />
            </div>
            <h2 className="text-foreground mb-2 text-xl font-semibold">No subscriptions yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-center">
              Start tracking your recurring payments by adding your first subscription
            </p>
            <Button variant="glow" onClick={() => openSubscriptionDialog()}>
              Add your first subscription
            </Button>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16">
            <Search className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No subscriptions match "{searchQuery}"</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubscriptions.map((sub) => {
              const category = getCategory(sub.category_id)
              return (
                <div
                  key={sub.id}
                  className={`glass-card-interactive group p-5 ${!sub.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <SubscriptionLogo
                        logoUrl={sub.logo_url}
                        name={sub.name}
                        color={sub.color || category?.color}
                        size="lg"
                        className="rounded-xl"
                      />
                      <div>
                        <h3 className="text-foreground font-semibold">{sub.name}</h3>
                        {category && (
                          <Badge variant={getCategoryVariant(category.name)} size="sm">
                            {category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openSubscriptionDialog(sub.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(sub)}>
                          <Power className="mr-2 h-4 w-4" />
                          {sub.is_active ? 'Pause' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(sub)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-foreground text-2xl font-bold">
                        {formatCurrency(sub.amount, currency)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {BILLING_CYCLE_LABELS[sub.billing_cycle]}
                      </span>
                    </div>
                    {sub.next_payment_date && (
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">
                          Next: {formatPaymentDate(sub.next_payment_date)}
                        </p>
                        {canMarkAsPaid(sub) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(sub)}
                            className="border-success/30 bg-success/10 text-success hover:bg-success/20 h-7 gap-1 text-xs"
                          >
                            <Check className="h-3 w-3" />
                            Paid
                          </Button>
                        )}
                      </div>
                    )}
                    {!sub.is_active && (
                      <Badge variant="warning" size="sm">
                        Paused
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Service
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Category
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Amount
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Next Payment
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => {
                  const category = getCategory(sub.category_id)
                  return (
                    <tr
                      key={sub.id}
                      className={`group border-border/50 hover:bg-glass-surface-hover border-b transition-colors last:border-0 ${!sub.is_active ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <SubscriptionLogo
                            logoUrl={sub.logo_url}
                            name={sub.name}
                            color={sub.color || category?.color}
                            size="sm"
                          />
                          <span className="text-foreground font-medium">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {category && (
                          <Badge variant={getCategoryVariant(category.name)} size="sm">
                            {category.name}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground font-semibold">
                          {formatCurrency(sub.amount, currency)}
                        </span>
                        <span className="text-muted-foreground ml-1 text-xs">
                          /{sub.billing_cycle}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {sub.next_payment_date ? formatPaymentDate(sub.next_payment_date) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sub.is_active ? 'success' : 'warning'} size="sm" dot>
                          {sub.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {canMarkAsPaid(sub) && (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => handleMarkAsPaid(sub)}
                              className="text-success hover:bg-success/10"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openSubscriptionDialog(sub.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(sub)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SubscriptionDialog />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Subscription"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
