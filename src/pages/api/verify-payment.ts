import type { APIRoute } from 'astro';
import { verifyPayment, getCheckoutSession } from '../../lib/dodo';
import { orderStore } from '../../lib/orders';
import { setOrderAccessCookie } from '../../lib/order-access';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { paymentId, sessionId } = body;

    if (!paymentId && !sessionId) {
      return new Response(JSON.stringify({ error: 'Missing paymentId or sessionId' }), { status: 400 });
    }

    let resolvedPaymentId = paymentId;

    if (!resolvedPaymentId && sessionId) {
      try {
        const session = await getCheckoutSession(sessionId);
        if (!session.payment_id) {
          return new Response(JSON.stringify({
            verified: false,
            paymentId: '',
            status: 'pending',
            customerEmail: '',
            amount: 0,
            currency: 'USD',
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        resolvedPaymentId = session.payment_id;
      } catch {
        return new Response(JSON.stringify({
          verified: false,
          error: 'Invalid checkout session',
          paymentId: '',
          status: 'unknown',
          customerEmail: '',
          amount: 0,
          currency: 'USD',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const result = await verifyPayment(resolvedPaymentId);

    let orderId = '';
    if (result.verified) {
      const order = (await orderStore.getByCheckoutSessionId(sessionId)) || (await orderStore.getByPaymentId(resolvedPaymentId));
      if (order) {
        await orderStore.updateStatus(order.id, 'completed', {
          dodoPaymentId: resolvedPaymentId,
          downloadUrl: `/api/orders/${order.id}/download`,
        });
        setOrderAccessCookie(cookies, order.id);
        orderId = order.id;
      }
    }

    return new Response(JSON.stringify({ ...result, orderId }), {
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
