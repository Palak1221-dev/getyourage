import type { APIRoute } from 'astro';
import { orderStore } from '../../../lib/orders';
import { verifyOrderAccessToken, orderAccessCookieName } from '../../../lib/order-access';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing order ID' }), { status: 400 });
    }

    const order = await orderStore.get(id);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    const cookieToken = cookies.get(orderAccessCookieName(order.id))?.value;
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const authorized = verifyOrderAccessToken(cookieToken, id) || verifyOrderAccessToken(queryToken, id);

    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
