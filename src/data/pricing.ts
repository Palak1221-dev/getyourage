export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', label: 'USD' },
  INR: { code: 'INR', symbol: '₹', label: 'INR' },
};

export type CurrencyCode = keyof typeof CURRENCIES;

export const CURRENCY_STORAGE_KEY = 'tt_currency';

export const CURRENCY_EVENT = 'tooltails:currency';

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === 'USD' || value === 'INR';
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  if (currency === 'INR') {
    return '₹' + String(Math.round(amount));
  }
  return '$' + amount.toFixed(2);
}
