import type { APIRoute } from 'astro';
import { createCheckoutSession } from '../../lib/dodo';
import { orderStore } from '../../lib/orders';
import { resolveDodoProductId } from '../../lib/product-ids';
import { products } from '../../data/products';
import { isCurrencyCode } from '../../data/pricing';
import type { CurrencyCode } from '../../data/pricing';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { productId, quantity = 1, customerEmail, customerName, metadata = {}, personalization = {} } = body;
    const currency: CurrencyCode = isCurrencyCode(body.currency) ? body.currency : 'USD';

    if (!productId) {
      return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
    }
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Missing customerEmail' }), { status: 400 });
    }

    const personalizationObj: Record<string, string> =
      personalization && typeof personalization === 'object' ? personalization : {};

    const product = products.find(p => p.id === productId || p.slug === productId);
    if (!product) {
      return new Response(JSON.stringify({ error: `Product not found: "${productId}"` }), { status: 400 });
    }

    let dodoProductId: string;
    try {
      dodoProductId = resolveDodoProductId(productId, currency);
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }

    const unitPrice = product.prices?.[currency] ?? product.price;
    const totalAmount = unitPrice * quantity;

    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4324';

    const result = await createCheckoutSession({
      productId: dodoProductId,
      quantity,
      customerEmail,
      customerName: customerName || '',
      metadata: {
        ...metadata,
        productTitle: product.title,
        productSlug: product.slug,
        price: String(unitPrice),
        currency,
        icon: product.icon,
      },
      returnUrl: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&product_slug=${encodeURIComponent(product.slug)}`,
      cancelUrl: `${siteUrl}/payment-cancelled`,
    });

    await orderStore.create(
      result.sessionId,
      customerEmail,
      customerName || '',
      [{
        productId: product.id,
        productSlug: product.slug,
        productTitle: product.title,
        price: unitPrice,
        icon: product.icon,
        quantity,
        personalization: personalizationObj,
      }],
      totalAmount,
      currency
    );

    return new Response(JSON.stringify({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create checkout session',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
