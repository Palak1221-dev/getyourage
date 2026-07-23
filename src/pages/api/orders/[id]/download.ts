import type { APIRoute } from 'astro';
import { orderStore } from '../../../../lib/orders';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing order ID' }), { status: 400 });
    }

    const order = await orderStore.get(id);
    if (!order) {
      console.log(`Download rejected: order ${id} not found`);
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    if (order.status !== 'completed') {
      console.log(`Download rejected: order ${id} has status ${order.status}`);
      return new Response(JSON.stringify({
        error: order.status === 'refunded'
          ? 'This order has been refunded'
          : 'Payment is not yet confirmed for this order',
      }), { status: 403 });
    }

    console.log(`Download initiated: order ${order.id}`);

    return new Response(null, {
      status: 302,
      headers: { Location: `/download/${encodeURIComponent(order.id)}` },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
