import { CURRENCY_STORAGE_KEY, CURRENCY_EVENT, isCurrencyCode, formatPrice } from '../data/pricing';
import type { CurrencyCode } from '../data/pricing';

export { CURRENCY_STORAGE_KEY, CURRENCY_EVENT };

function detectCurrency(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata') return 'INR';
    const lang = (navigator.language || '').toLowerCase();
    if (/^(en-in|hi|bn|ta|te|mr|gu|kn|ml|pa|ur)\b/.test(lang)) return 'INR';
  } catch {}
  return 'USD';
}

export function getCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (isCurrencyCode(stored)) return stored;
  } catch {}
  const detected = detectCurrency();
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, detected);
  } catch {}
  return detected;
}

export function setCurrency(code: CurrencyCode): void {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: code }));
  } catch {}
}

export function formatAmount(amount: number, currency: CurrencyCode): string {
  return formatPrice(amount, currency);
}

export function applyCurrency(): void {
  const currency = getCurrency();
  document.documentElement.setAttribute('data-currency', currency);

  document.querySelectorAll<HTMLElement>('[data-price]').forEach(el => {
    const attr = currency === 'INR' ? 'data-inr' : 'data-usd';
    const raw = el.getAttribute(attr);
    if (raw !== null && raw !== '') {
      el.textContent = formatPrice(Number(raw), currency);
    }
  });

  document.querySelectorAll<HTMLElement>('[data-original-price]').forEach(el => {
    el.style.display = currency === 'USD' ? '' : 'none';
  });
}

export function setupCurrencyEngine(): void {
  if ((window as any).TooltailsCurrency) return;
  (window as any).TooltailsCurrency = {
    getCurrency,
    setCurrency,
    formatAmount,
    applyCurrency,
    CURRENCIES: { USD: { code: 'USD', symbol: '$', label: 'USD' }, INR: { code: 'INR', symbol: '₹', label: 'INR' } },
  };
  window.addEventListener(CURRENCY_EVENT, () => applyCurrency());
  applyCurrency();
}
