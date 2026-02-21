export function formatCurrency(amount: number | string, options?: { locale?: string; currency?: string }) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
  const { locale = 'en-ZA', currency = 'ZAR' } = options ?? {};
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}
