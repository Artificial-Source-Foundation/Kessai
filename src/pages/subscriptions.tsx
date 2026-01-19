import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { Plus, Pencil, Trash2, Search, LayoutGrid, List, Power, Grid3x3 } from 'lucide-react'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useCategoryStore } from '@/stores/category-store'
import { useUiStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { usePaymentStore } from '@/stores/payment-store'
import { formatCurrency } from '@/lib/currency'
import { formatPaymentDate, calculateNextPaymentDate } from '@/lib/date-utils'
import { BILLING_CYCLE_LABELS, BILLING_CYCLE_SHORT, CATEGORY_BADGE_VARIANTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import { SubscriptionBento } from '@/components/subscriptions/subscription-bento'
import { CategoryFilter } from '@/components/subscriptions/category-filter'
import type { BadgeVariant } from '@/components/ui/badge'
import type { CurrencyCode } from '@/lib/currency'
import type { Subscription } from '@/types/subscription'

dayjs.extend(isSameOrBefore)

// Lazy load dialogs for better initial load performance
const SubscriptionDialog = lazy(() =>
  import('@/components/subscriptions/subscription-dialog').then((m) => ({
    default: m.SubscriptionDialog,
  }))
)
const ConfirmDialog = lazy(() =>
  import('@/components/ui/confirm-dialog').then((m) => ({ default: m.ConfirmDialog }))
)

export function Subscriptions() {
  const { subscriptions, isLoading, remove, toggleActive, getCategory } = useSubscriptions()
  const categories = useCategoryStore((state) => state.categories)
  const { openSubscriptionDialog } = useUiStore()
  const { settings, fetch: fetchSettings } = useSettingsStore()
  const { markAsPaid } = usePaymentStore()
  const currency = (settings?.currency || 'USD') as CurrencyCode

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'bento'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Calculate subscription counts per category
  const subscriptionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    subscriptions.forEach((sub) => {
      if (sub.category_id) {
        counts[sub.category_id] = (counts[sub.category_id] || 0) + 1
      }
    })
    return counts
  }, [subscriptions])

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategories.length === 0 ||
      (sub.category_id && selectedCategories.includes(sub.category_id))
    return matchesSearch && matchesCategory
  })

  // Separate totals by billing cycle
  const monthlySubsTotal = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.is_active && sub.billing_cycle === 'monthly')
      .reduce((total, sub) => total + sub.amount, 0)
  }, [subscriptions])

  const yearlySubsTotal = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.is_active && sub.billing_cycle === 'yearly')
      .reduce((total, sub) => total + sub.amount, 0)
  }, [subscriptions])

  const handleMarkAsPaid = async (sub: Subscription) => {
    if (!sub.next_payment_date) return
    try {
      await markAsPaid(sub.id, sub.next_payment_date, sub.amount)
      const currentPaymentDate = dayjs(sub.next_payment_date).toDate()
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
    const paymentDate = dayjs(sub.next_payment_date).startOf('day')
    const today = dayjs().startOf('day')
    return paymentDate.isSameOrBefore(today)
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

  const getCategoryVariant = (categoryName?: string): BadgeVariant => {
    if (!categoryName) return 'secondary'
    return (CATEGORY_BADGE_VARIANTS[categoryName] as BadgeVariant) || 'secondary'
  }

  return (
    <>
      <div className="flex h-full flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">My Subscriptions</h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              {monthlySubsTotal > 0 && (
                <div className="flex items-center gap-1.5">
                  <span>Monthly:</span>
                  <span className="bg-primary/10 text-primary rounded px-2 py-0.5 font-semibold">
                    {formatCurrency(monthlySubsTotal, currency)}/mo
                  </span>
                </div>
              )}
              {yearlySubsTotal > 0 && (
                <div className="flex items-center gap-1.5">
                  <span>Yearly:</span>
                  <span className="bg-accent-cyan/10 text-accent-cyan rounded px-2 py-0.5 font-semibold">
                    {formatCurrency(yearlySubsTotal, currency)}/yr
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button variant="glow" onClick={() => openSubscriptionDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </header>

        {subscriptions.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border bg-card text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-10 w-full rounded-lg border pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
                />
              </div>
              <div className="border-border bg-card flex rounded-lg border p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-8 w-9 items-center justify-center rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-8 w-9 items-center justify-center rounded-md ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('bento')}
                  className={`flex h-8 w-9 items-center justify-center rounded-md ${
                    viewMode === 'bento'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Bento view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CategoryFilter
              categories={categories}
              selectedIds={selectedCategories}
              onChange={setSelectedCategories}
              subscriptionCounts={subscriptionCounts}
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
            <Search className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              No subscriptions match {searchQuery ? `"${searchQuery}"` : 'your filters'}
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-primary mt-2 text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'bento' ? (
          <SubscriptionBento
            subscriptions={filteredSubscriptions}
            categories={categories}
            currency={currency}
            onEdit={(sub) => openSubscriptionDialog(sub.id)}
          />
        ) : viewMode === 'grid' ? (
          <div className="stagger-children grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSubscriptions.map((sub) => {
              const category = getCategory(sub.category_id)
              return (
                <div
                  key={sub.id}
                  className={`glass-card hover-lift group relative overflow-hidden ${!sub.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="bg-card/80 absolute top-2 right-2 z-10 flex gap-1 rounded-lg p-1 opacity-0 backdrop-blur-sm group-hover:opacity-100">
                    <button
                      onClick={() => openSubscriptionDialog(sub.id)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(sub)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(sub)}
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
                        onClick={() => handleMarkAsPaid(sub)}
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
        ) : (
          <div className="glass-card flex flex-1 flex-col overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-border bg-muted/30 border-b">
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Service
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Cost
                    </th>
                    <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase md:table-cell">
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
                <tbody className="divide-border divide-y">
                  {filteredSubscriptions.map((sub) => {
                    const category = getCategory(sub.category_id)
                    return (
                      <tr
                        key={sub.id}
                        className={`group hover:bg-muted/30 ${!sub.is_active ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <SubscriptionLogo
                              logoUrl={sub.logo_url}
                              name={sub.name}
                              color={sub.color || category?.color}
                              size="md"
                              className="shrink-0 rounded-lg"
                            />
                            <div className="min-w-0">
                              <p className="text-foreground truncate font-medium">{sub.name}</p>
                              {category && (
                                <Badge variant={getCategoryVariant(category.name)} size="sm">
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-foreground font-semibold">
                            {formatCurrency(sub.amount, currency)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {BILLING_CYCLE_SHORT[sub.billing_cycle]}
                          </p>
                        </td>
                        <td className="hidden px-4 py-4 md:table-cell">
                          <p className="text-muted-foreground text-sm">
                            {sub.next_payment_date ? formatPaymentDate(sub.next_payment_date) : '-'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
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
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openSubscriptionDialog(sub.id)}
                              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(sub)}
                              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 opacity-0 group-hover:opacity-100"
                            >
                              <Power className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sub)}
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-2 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-border bg-muted/30 mt-auto border-t px-4 py-3">
              <p className="text-muted-foreground text-sm">
                {filteredSubscriptions.length} of {subscriptions.length} subscriptions
              </p>
            </div>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <SubscriptionDialog />
      </Suspense>

      <Suspense fallback={null}>
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
      </Suspense>
    </>
  )
}
