/**
 * Supported currency configurations with symbol, name, and locale.
 * Used for formatting amounts in the user's preferred currency.
 */
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

/** Valid currency code string (e.g., 'USD', 'EUR', 'GBP') */
export type CurrencyCode = keyof typeof CURRENCIES

/**
 * Formats a number as currency with full precision.
 * @param amount - The numeric amount to format
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted currency string (e.g., "$15.99")
 * @example
 * formatCurrency(15.99, 'USD') // "$15.99"
 * formatCurrency(1234.5, 'EUR') // "1.234,50 €"
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const config = CURRENCIES[currency]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a number as compact currency for large values.
 * @param amount - The numeric amount to format
 * @param currency - Currency code (defaults to USD)
 * @returns Compact formatted currency string (e.g., "$1.2K")
 * @example
 * formatCompactCurrency(1500, 'USD') // "$1.5K"
 * formatCompactCurrency(1000000, 'EUR') // "1 Mio. €"
 */
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

/**
 * Gets the symbol for a currency code.
 * @param currency - Currency code
 * @returns Currency symbol (e.g., "$", "€", "£")
 * @example
 * getCurrencySymbol('USD') // "$"
 * getCurrencySymbol('EUR') // "€"
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency].symbol
}

/**
 * Gets currency options for select dropdowns.
 * @returns Array of currency options with value and label
 * @example
 * getCurrencyOptions() // [{ value: 'USD', label: '$ USD - US Dollar' }, ...]
 */
export function getCurrencyOptions(): { value: CurrencyCode; label: string }[] {
  return Object.entries(CURRENCIES).map(([code, config]) => ({
    value: code as CurrencyCode,
    label: `${config.symbol} ${code} - ${config.name}`,
  }))
}
