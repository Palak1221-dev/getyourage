import type { APIRoute } from 'astro';
import { orderStore } from '../../../../lib/orders';
import {
  verifyOrderAccessToken,
  signOrderAccessToken,
  orderAccessCookieName,
} from '../../../../lib/order-access';

export const GET: APIRoute = async ({ params, request, cookies }) => {
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

    const cookieToken = cookies.get(orderAccessCookieName(order.id))?.value;
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const authorized = verifyOrderAccessToken(cookieToken, order.id) || verifyOrderAccessToken(queryToken, order.id);

    if (!authorized) {
      console.log(`Download rejected: order ${id} unauthorized`);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // A valid capability token in the URL (e.g. from an emailed link) is
    // promoted to an HttpOnly cookie so the download page itself is authorized.
    cookies.set(orderAccessCookieName(order.id), signOrderAccessToken(order.id), {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

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
