import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';

// Secret used to sign order access tokens. Prefer a dedicated secret; fall back
// to the existing access/Dodo secrets so no extra env config is required.
const SECRET: string =
  process.env.ORDER_ACCESS_SECRET ||
  process.env.PLANNER_ACCESS_SECRET ||
  process.env.DODO_WEBHOOK_SECRET ||
  'tooltails-order-access';

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function orderAccessCookieName(orderId: string): string {
  return `tt_order_access_${orderId}`;
}

export function setOrderAccessCookie(cookies: any, orderId: string): void {
  cookies.set(orderAccessCookieName(orderId), signOrderAccessToken(orderId), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function generateOrderId(): string {
  return 'ORD-' + randomUUID();
}

function b64url(s: string): string {
  return Buffer.from(s).toString('base64url');
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function signOrderAccessToken(orderId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = b64url(JSON.stringify({ oid: orderId, exp }));
  return `${payload}.${sign(payload)}`;
}

export function verifyOrderAccessToken(token: string | null | undefined, orderId: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || data.oid !== orderId) return false;
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
