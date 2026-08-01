import type { APIRoute } from 'astro';
import { orderStore } from '../../../../lib/orders';
import { setOrderAccessCookie } from '../../../../lib/order-access';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing order ID' }), { status: 400 });
    }

    const order = await orderStore.get(id);
    if (!order || order.status !== 'completed') {
      return new Response(JSON.stringify({ error: 'Order not available for download.' }), { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String((body as any)?.email || '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orderEmail = (order.customerEmail || '').trim().toLowerCase();
    if (!orderEmail || orderEmail !== email) {
      return new Response(
        JSON.stringify({ error: 'No completed purchase found for this email.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    setOrderAccessCookie(cookies, order.id);

    return new Response(JSON.stringify({ unlocked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Order unlock error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
