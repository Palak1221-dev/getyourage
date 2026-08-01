import { products } from '../data/products';
import { isCurrencyCode } from '../data/pricing';

const knownNames: Record<string, string> = {
  'study-planner-pro': 'p1',
  'master-your-day': 'p7',
  'social-media-detox': 'p10',
  'wellness-journal': 'p12',
  'study-planner': 'p1',
  'revision-tracker': 'p1',
  'habit-tracker': 'p12',
  'budget-planner': 'p10',
  'resume-optimizer-kit': 'p10',
};

export function resolveDodoProductId(internalId: string, currency = 'USD'): string {
  const normalized = knownNames[internalId] || internalId;
  const product = products.find(p => p.id === normalized || p.slug === normalized);
  if (!product) {
    throw new Error(`Unknown product: "${internalId}". No Dodo Product ID mapped.`);
  }
  const code = isCurrencyCode(currency) ? currency : 'USD';
  const dodoId = product.dodoProductIds?.[code];
  if (!dodoId) {
    throw new Error(
      `No Dodo Product ID mapped for "${product.slug}" in currency "${code}". Add dodoProductIds["${code}"] in src/data/products.ts.`
    );
  }
  return dodoId;
}
