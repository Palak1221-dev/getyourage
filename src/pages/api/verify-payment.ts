import type { APIRoute } from 'astro';
import { verifyPayment } from '../../lib/dodo';
import { orderStore } from '../../lib/orders';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { paymentId, sessionId } = body;

    if (!paymentId && !sessionId) {
      return new Response(JSON.stringify({ error: 'Missing paymentId or sessionId' }), { status: 400 });
    }

    const result = await verifyPayment(paymentId);

    if (result.verified) {
      const order = orderStore.getByPaymentId(paymentId);
      if (order) {
        orderStore.updateStatus(order.id, 'completed', {
          downloadUrl: `/api/orders/${order.id}/download`,
        });
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return new Response(JSON.stringify({
      verified: false,
      error: error.message || 'Failed to verify payment',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
