import type { APIRoute } from 'astro';
import DodoPayments from 'dodopayments';
import { orderStore, formatProductTitle } from '../../../lib/orders';
import { sendOrderConfirmation } from '../../../lib/email';
import { signOrderAccessToken } from '../../../lib/order-access';

export const POST: APIRoute = async ({ request }) => {
  try {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('DODO_WEBHOOK_SECRET is not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), { status: 500 });
    }

    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    console.log('Webhook headers received:', JSON.stringify({
      'webhook-id': headers['webhook-id'] || '(missing)',
      'webhook-signature': headers['webhook-signature'] ? '(present, length=' + headers['webhook-signature'].length + ')' : '(missing)',
      'webhook-timestamp': headers['webhook-timestamp'] || '(missing)',
    }));

    let payload: any;
    try {
      const dodo = new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
        environment: (process.env.DODO_ENV === 'live' ? 'live_mode' : 'test_mode') as any,
        webhookKey: webhookSecret,
      });
      payload = dodo.webhooks.unwrap(body, { headers }) as any;
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err);
      if (err instanceof Error && err.stack) {
        console.error('Webhook verification stack:', err.stack);
      }
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const eventType = payload.type || payload.event_type;
    const data = payload.data || payload;

    switch (eventType) {
      case 'payment.succeeded': {
        const paymentId = data.payment_id;
        const customerEmail = data.customer?.email || '';
        const metadata = data.metadata || {};

        const order = (await orderStore.getByCheckoutSessionId(data.checkout_session_id || '')) || (await orderStore.getByPaymentId(paymentId));

        if (order) {
          if (order.status === 'completed') {
            console.log(`Duplicate payment.succeeded ignored: order ${order.id} already completed`);
            break;
          }
          const downloadUrl = `/api/orders/${order.id}/download`;
          await orderStore.updateStatus(order.id, 'completed', {
            dodoPaymentId: paymentId,
            downloadUrl,
          });
          console.log(`Order ${order.id} completed via webhook`);
          await sendOrderConfirmation({
            to: customerEmail || order.customerEmail,
            orderId: order.id,
            productTitle: formatProductTitle(order.items),
            downloadUrl: `${process.env.PUBLIC_SITE_URL || 'https://tooltails.com'}${downloadUrl}?token=${signOrderAccessToken(order.id)}`,
          });
        } else {
          const sessionId = data.checkout_session_id || metadata.sessionId || '';
          if (sessionId) {
            const foundOrder = (await orderStore.getByCheckoutSessionId(sessionId)) || (await orderStore.getByPaymentId(sessionId));
            if (foundOrder) {
              if (foundOrder.status === 'completed') {
                console.log(`Duplicate payment.succeeded ignored: order ${foundOrder.id} already completed (matched by session)`);
                break;
              }
              const downloadUrl = `/api/orders/${foundOrder.id}/download`;
              await orderStore.updateStatus(foundOrder.id, 'completed', {
                dodoPaymentId: paymentId,
                downloadUrl,
              });
              console.log(`Order ${foundOrder.id} completed via webhook (matched by session)`);
              await sendOrderConfirmation({
                to: customerEmail || foundOrder.customerEmail,
                orderId: foundOrder.id,
                productTitle: formatProductTitle(foundOrder.items),
                downloadUrl: `${process.env.PUBLIC_SITE_URL || 'https://tooltails.com'}${downloadUrl}?token=${signOrderAccessToken(foundOrder.id)}`,
              });
            }
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentId = data.payment_id;
        const order = (await orderStore.getByCheckoutSessionId(data.checkout_session_id || '')) || (await orderStore.getByPaymentId(paymentId));
        if (order) {
          await orderStore.updateStatus(order.id, 'failed');
          console.log(`Order ${order.id} failed via webhook`);
        }
        break;
      }

      case 'refund.succeeded': {
        const paymentId = data.payment_id;
        const order = await orderStore.getByPaymentId(paymentId);
        if (order) {
          await orderStore.updateStatus(order.id, 'refunded');
          console.log(`Order ${order.id} refunded via webhook`);
        }
        break;
      }

      case 'refund.failed':
        console.log('Refund failed for payment:', data.payment_id);
        break;

      case 'subscription.created':
      case 'subscription.active':
        console.log('Subscription event received:', eventType);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
