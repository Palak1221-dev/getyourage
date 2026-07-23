import type { APIRoute } from 'astro';
import { createCheckoutSession } from '../../lib/dodo';
import { orderStore } from '../../lib/orders';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { productId, productTitle, productSlug, price, icon, quantity = 1, customerEmail, customerName, metadata = {} } = body;

    if (!productId) {
      return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
    }
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Missing customerEmail' }), { status: 400 });
    }

    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4324';

    const result = await createCheckoutSession({
      productId,
      quantity,
      customerEmail,
      customerName: customerName || '',
      metadata: {
        ...metadata,
        productTitle: productTitle || '',
        productSlug: productSlug || '',
        price: String(price || 0),
        icon: icon || '',
      },
      returnUrl: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&product_slug=${encodeURIComponent(productSlug || '')}`,
      cancelUrl: `${siteUrl}/payment-cancelled`,
    });

    orderStore.create(
      result.sessionId,
      customerEmail,
      customerName || '',
      [{
        productId,
        productSlug: productSlug || '',
        productTitle: productTitle || '',
        price: Number(price) || 0,
        icon: icon || '',
        quantity,
      }],
      Number(price) * quantity || 0,
      'USD'
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
