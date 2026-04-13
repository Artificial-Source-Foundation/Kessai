import { convertCurrencyCached } from '@/lib/exchange-rates'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import type { PriceChange } from '@/types/price-history'

export function getPriceChangeDisplay(change: PriceChange, displayCurrency: CurrencyCode) {
  const oldCurrency = (change.old_currency || displayCurrency) as CurrencyCode
  const newCurrency = (change.new_currency || displayCurrency) as CurrencyCode

  const oldNative = formatCurrency(change.old_amount, oldCurrency)
  const newNative = formatCurrency(change.new_amount, newCurrency)

  const oldConverted = convertCurrencyCached(change.old_amount, oldCurrency, displayCurrency)
  const newConverted = convertCurrencyCached(change.new_amount, newCurrency, displayCurrency)

  const canCompare = oldConverted !== null && newConverted !== null
  const comparableOld = canCompare ? oldConverted : change.old_amount
  const comparableNew = canCompare ? newConverted : change.new_amount
  const diff = comparableNew - comparableOld
  const isIncrease = diff > 0
  const percentage = comparableOld > 0 ? Math.abs((diff / comparableOld) * 100) : 0
  const currenciesChanged = oldCurrency !== newCurrency

  return {
    oldCurrency,
    newCurrency,
    oldNative,
    newNative,
    oldConverted,
    newConverted,
    canCompare,
    currenciesChanged,
    diff,
    isIncrease,
    percentage,
    diffDisplay: canCompare ? formatCurrency(Math.abs(diff), displayCurrency) : null,
    convertedRangeLabel:
      canCompare && currenciesChanged
        ? `${formatCurrency(comparableOld, displayCurrency)} -> ${formatCurrency(comparableNew, displayCurrency)} ${displayCurrency}`
        : null,
  }
}
