export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  MXN: { symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const config = CURRENCIES[currency]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCompactCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const config = CURRENCIES[currency]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount)
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency].symbol
}

export function getCurrencyOptions(): { value: CurrencyCode; label: string }[] {
  return Object.entries(CURRENCIES).map(([code, config]) => ({
    value: code as CurrencyCode,
    label: `${config.symbol} ${code} - ${config.name}`,
  }))
}
