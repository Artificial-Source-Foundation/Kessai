import { useEffect } from 'react'
import { DollarSign, TrendingUp, CreditCard, Calendar, Sparkles } from 'lucide-react'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useCategoryStore } from '@/stores/category-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { formatCurrency } from '@/lib/currency'
import { getUpcomingPayments, formatShortDate, getDaysUntil } from '@/lib/date-utils'
import { StatCard } from '@/components/data-display/stat-card'
import { DonutChart, DonutChartLegend } from '@/components/data-display/donut-chart'
import { AreaChart } from '@/components/data-display/area-chart'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import type { CurrencyCode } from '@/lib/currency'

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#a855f7',
  Software: '#3b82f6',
  Music: '#22c55e',
  Health: '#ef4444',
  Shopping: '#f59e0b',
  AI: '#14b8a6',
  Cloud: '#0ea5e9',
  Productivity: '#6b7280',
  Development: '#f97316',
  Security: '#eab308',
  Other: '#64748b',
}

export function Dashboard() {
  const { subscriptions, isLoading, fetch: fetchSubscriptions } = useSubscriptionStore()
  const { fetch: fetchCategories } = useCategoryStore()
  const { settings, fetch: fetchSettings } = useSettingsStore()
  const { categorySpending, monthlySpending, totalMonthly, totalYearly, activeCount } =
    useDashboardStats()

  const currency = (settings?.currency || 'USD') as CurrencyCode
  const upcomingPayments = getUpcomingPayments(subscriptions, 7)

  useEffect(() => {
    fetchSubscriptions()
    fetchCategories()
    fetchSettings()
  }, [fetchSubscriptions, fetchCategories, fetchSettings])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  const donutSegments = categorySpending.map((cat) => ({
    value: cat.amount,
    color: CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.Other,
    label: cat.name,
  }))

  const areaChartData = monthlySpending.map((item) => ({
    label: item.month.slice(0, 3),
    value: item.amount,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your subscription overview at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Monthly Spend"
          value={formatCurrency(totalMonthly, currency)}
          icon={<DollarSign className="h-5 w-5" />}
          glowColor="rgba(137, 90, 246, 0.4)"
        />
        <StatCard
          title="Yearly Projection"
          value={formatCurrency(totalYearly, currency)}
          icon={<TrendingUp className="h-5 w-5" />}
          glowColor="rgba(6, 182, 212, 0.4)"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeCount.toString()}
          icon={<CreditCard className="h-5 w-5" />}
          subtitle={`${subscriptions.length - activeCount} paused`}
          glowColor="rgba(34, 197, 94, 0.4)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="text-foreground mb-6 text-lg font-semibold">Spending by Category</h2>
          {donutSegments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="text-muted-foreground/50 mb-3 h-12 w-12" />
              <p className="text-muted-foreground">No spending data yet</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
              <DonutChart
                segments={donutSegments}
                centerValue={formatCurrency(totalMonthly, currency)}
                centerLabel="monthly"
                size={180}
              />
              <DonutChartLegend segments={donutSegments} className="min-w-[140px]" />
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-foreground mb-6 text-lg font-semibold">Monthly Trend</h2>
          {areaChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="text-muted-foreground/50 mb-3 h-12 w-12" />
              <p className="text-muted-foreground">No trend data yet</p>
            </div>
          ) : (
            <AreaChart data={areaChartData} height={200} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">Upcoming Payments</h2>
            <span className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
              <Calendar className="h-3 w-3" />
              Next 7 days
            </span>
          </div>
          {upcomingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="mb-2 text-4xl">🎉</span>
              <p className="text-muted-foreground">No payments in the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingPayments.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="group bg-glass-surface hover:bg-glass-surface-hover flex items-center justify-between rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SubscriptionLogo
                      logoUrl={sub.logo_url}
                      name={sub.name}
                      color={sub.color}
                      size="md"
                    />
                    <div>
                      <p className="text-foreground font-medium">{sub.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {sub.next_payment_date && formatShortDate(sub.next_payment_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-semibold">
                      {formatCurrency(sub.amount, currency)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {sub.next_payment_date && `in ${getDaysUntil(sub.next_payment_date)} days`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Quick Insights</h2>
          <div className="space-y-4">
            {[
              {
                label: 'Average per subscription',
                value:
                  activeCount > 0
                    ? formatCurrency(totalMonthly / activeCount, currency)
                    : formatCurrency(0, currency),
              },
              { label: 'Total subscriptions', value: subscriptions.length.toString() },
              {
                label: 'Inactive subscriptions',
                value: (subscriptions.length - activeCount).toString(),
              },
              { label: 'Categories used', value: categorySpending.length.toString() },
              { label: 'Daily average', value: formatCurrency(totalMonthly / 30, currency) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-border/50 flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="text-foreground font-medium">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
