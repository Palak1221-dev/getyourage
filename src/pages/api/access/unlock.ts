import type { APIRoute } from 'astro';
import { orderStore } from '../../../lib/orders';
import { signAccessToken, accessCookieName } from '../../../lib/access';

const VALID_SLUGS = new Set([
  'study-planner-pro',
  'master-your-day',
  'wellness-journal',
  'social-media-detox',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String((body as any)?.email || '').trim().toLowerCase();
    const slug = String((body as any)?.slug || '').trim();

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ unlocked: false, error: 'Please enter a valid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!VALID_SLUGS.has(slug)) {
      return new Response(JSON.stringify({ unlocked: false, error: 'Unknown product.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orders = await orderStore.getByEmail(email);

    const purchased = orders.some(
      (o) =>
        o.status === 'completed' &&
        Array.isArray(o.items) &&
        o.items.some((it) => it.productSlug === slug)
    );

    if (!purchased) {
      return new Response(
        JSON.stringify({ unlocked: false, error: 'No completed purchase found for this email.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = signAccessToken(email, slug);
    cookies.set(accessCookieName(slug), token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return new Response(JSON.stringify({ unlocked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Unlock error:', error);
    return new Response(JSON.stringify({ unlocked: false, error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
