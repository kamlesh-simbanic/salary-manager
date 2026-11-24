const LOCALE = 'en-US'

/** Formats integer minor units (cents/paise) in the employee's own currency. */
export function formatMoney(minor: number, currency: string, options: { cents?: boolean } = {}): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: options.cents ? 2 : 0,
    maximumFractionDigits: options.cents ? 2 : 0,
  }).format(minor / 100)
}

/** Formats a YYYY-MM-DD string without timezone drift (always read as UTC). */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`))
}
