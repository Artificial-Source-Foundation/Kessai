import { useState, useEffect, useMemo } from 'react'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import { getLogoDataUrl } from '@/lib/logo-storage'
import { calculateMonthlyAmount, type Subscription } from '@/types/subscription'
import type { Category } from '@/types/category'

interface SubscriptionBentoProps {
  subscriptions: Subscription[]
  categories: Category[]
  currency: CurrencyCode
  onEdit: (subscription: Subscription) => void
}

// Vibrant color palette
const BENTO_COLORS = [
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#22c55e', // Green
]

function BentoTile({
  subscription,
  category,
  colorIndex,
  total,
  currency,
  isLarge,
  onClick,
}: {
  subscription: Subscription
  category?: Category
  colorIndex: number
  total: number
  currency: CurrencyCode
  isLarge: boolean
  onClick: () => void
}) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const monthlyAmount = calculateMonthlyAmount(subscription.amount, subscription.billing_cycle)
  const percentage = total > 0 ? (monthlyAmount / total) * 100 : 0
  // Always use vibrant bento colors for visual appeal
  const bgColor = BENTO_COLORS[colorIndex % BENTO_COLORS.length]

  useEffect(() => {
    if (subscription.logo_url) {
      getLogoDataUrl(subscription.logo_url).then(setLogoSrc)
    }
  }, [subscription.logo_url])

  return (
    <button
      onClick={onClick}
      className="group relative h-full w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      style={{ backgroundColor: bgColor, borderRadius: '3px' }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? 'p-5' : 'p-3'}`}
      >
        {/* Top: Logo + Name */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4
              className={`leading-tight font-bold text-white ${isLarge ? 'text-lg' : 'text-sm'}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: isLarge ? 2 : 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {subscription.name}
            </h4>
            {isLarge && category && (
              <p className="mt-0.5 truncate text-xs text-white/50">{category.name}</p>
            )}
          </div>

          {logoSrc && (
            <img
              src={logoSrc}
              alt=""
              className={`flex-shrink-0 bg-white/10 object-contain ${
                isLarge ? 'h-10 w-10 p-1.5' : 'h-8 w-8 p-1.5'
              }`}
              style={{ borderRadius: '3px' }}
            />
          )}
        </div>

        {/* Bottom: Amount + Percentage */}
        <div className="flex items-end justify-between gap-1">
          <span className={`font-bold text-white ${isLarge ? 'text-2xl' : 'text-base'}`}>
            {formatCurrency(monthlyAmount, currency)}
          </span>
          <span
            className={`bg-black/25 font-medium text-white/90 ${
              isLarge ? 'px-1.5 py-0.5 text-xs' : 'px-1 py-0.5 text-[10px]'
            }`}
            style={{ borderRadius: '2px' }}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Inactive overlay */}
      {!subscription.is_active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span
            className="bg-black/60 px-2 py-0.5 text-xs font-medium text-white"
            style={{ borderRadius: '2px' }}
          >
            Paused
          </span>
        </div>
      )}
    </button>
  )
}

const COLUMNS = 4
const GAP = 3 // minimal gap

export function SubscriptionBento({
  subscriptions,
  categories,
  currency,
  onEdit,
}: SubscriptionBentoProps) {
  // Sort by monthly amount descending
  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const amountA = calculateMonthlyAmount(a.amount, a.billing_cycle)
      const amountB = calculateMonthlyAmount(b.amount, b.billing_cycle)
      return amountB - amountA
    })
  }, [subscriptions])

  // Calculate total monthly spending
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce(
      (sum, sub) => sum + calculateMonthlyAmount(sub.amount, sub.billing_cycle),
      0
    )
  }, [subscriptions])

  // Determine tile sizes PURELY based on spending percentage
  // Higher % = larger tile, no exceptions
  const getTileSize = useMemo(() => {
    type TileSize = { cols: number; rows: number }
    const sizeMap = new Map<string, TileSize>()

    sortedSubscriptions.forEach((sub) => {
      const amount = calculateMonthlyAmount(sub.amount, sub.billing_cycle)
      const percentage = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0

      let size: TileSize
      if (percentage >= 25) {
        size = { cols: 2, rows: 2 } // 25%+ = big square
      } else if (percentage >= 15) {
        size = { cols: 2, rows: 2 } // 15-25% = also big
      } else if (percentage >= 8) {
        size = { cols: 2, rows: 1 } // 8-15% = wide
      } else {
        size = { cols: 1, rows: 1 } // <8% = small square
      }

      sizeMap.set(sub.id, size)
    })

    // NO fill logic - sizes are strictly by percentage
    // CSS grid dense flow will handle packing

    return sizeMap
  }, [sortedSubscriptions, totalMonthly])

  const getCategory = (categoryId: string | null) => {
    if (!categoryId) return undefined
    return categories.find((c) => c.id === categoryId)
  }

  if (subscriptions.length === 0) {
    return (
      <div
        className="flex h-[400px] items-center justify-center border border-dashed border-white/10"
        style={{ borderRadius: '3px' }}
      >
        <p className="text-muted-foreground">No subscriptions to display</p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
        gridAutoRows: '110px',
        gap: `${GAP}px`,
        gridAutoFlow: 'dense',
      }}
    >
      {sortedSubscriptions.map((subscription, index) => {
        const size = getTileSize.get(subscription.id) || { cols: 1, rows: 1 }
        const isLarger = size.cols > 1 || size.rows > 1

        return (
          <div
            key={subscription.id}
            style={{
              gridColumn: `span ${size.cols}`,
              gridRow: `span ${size.rows}`,
            }}
          >
            <BentoTile
              subscription={subscription}
              category={getCategory(subscription.category_id)}
              colorIndex={index}
              total={totalMonthly}
              currency={currency}
              isLarge={isLarger}
              onClick={() => onEdit(subscription)}
            />
          </div>
        )
      })}
    </div>
  )
}
