import type { APIRoute } from 'astro';
import { Webhook } from 'standardwebhooks';
import { orderStore } from '../../../lib/orders';
import { sendOrderConfirmation } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('DODO_WEBHOOK_SECRET is not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), { status: 500 });
    }

    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const webhook = new Webhook(webhookSecret);

    let payload: any;
    try {
      payload = webhook.verify(body, headers);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const eventType = payload.type || payload.event_type;
    const data = payload.data || payload;

    switch (eventType) {
      case 'payment.succeeded':
      case 'payment.completed': {
        const paymentId = data.id || data.payment?.id;
        const customerEmail = data.customer?.email || '';
        const metadata = data.metadata || {};

        const order = orderStore.getByPaymentId(paymentId) || orderStore.getByPaymentId(data.checkout_session?.id || '');

        if (order) {
          const downloadUrl = `/api/orders/${order.id}/download`;
          orderStore.updateStatus(order.id, 'completed', {
            dodoPaymentId: paymentId,
            downloadUrl,
          });
          console.log(`Order ${order.id} completed via webhook`);
          sendOrderConfirmation({
            to: customerEmail || order.customerEmail,
            orderId: order.id,
            productTitle: order.productTitle || 'Personalized Planner',
            downloadUrl: `${process.env.PUBLIC_SITE_URL || 'https://tooltails.com'}${downloadUrl}`,
          });
        } else {
          const sessionId = data.checkout_session?.id || metadata.sessionId || '';
          if (sessionId) {
            const foundOrder = orderStore.getByPaymentId(sessionId);
            if (foundOrder) {
              const downloadUrl = `/api/orders/${foundOrder.id}/download`;
              orderStore.updateStatus(foundOrder.id, 'completed', {
                dodoPaymentId: paymentId,
                downloadUrl,
              });
              console.log(`Order ${foundOrder.id} completed via webhook (matched by session)`);
              sendOrderConfirmation({
                to: customerEmail || foundOrder.customerEmail,
                orderId: foundOrder.id,
                productTitle: foundOrder.productTitle || 'Personalized Planner',
                downloadUrl: `${process.env.PUBLIC_SITE_URL || 'https://tooltails.com'}${downloadUrl}`,
              });
            }
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentId = data.id || data.payment?.id;
        const order = orderStore.getByPaymentId(paymentId);
        if (order) {
          orderStore.updateStatus(order.id, 'failed');
          console.log(`Order ${order.id} failed via webhook`);
        }
        break;
      }

      case 'refund.created':
      case 'refund.succeeded': {
        const paymentId = data.payment?.id || data.id;
        const order = orderStore.getByPaymentId(paymentId);
        if (order) {
          orderStore.updateStatus(order.id, 'refunded');
          console.log(`Order ${order.id} refunded via webhook`);
        }
        break;
      }

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
