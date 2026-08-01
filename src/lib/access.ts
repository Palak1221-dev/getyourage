import { createHmac, timingSafeEqual } from 'node:crypto';

// Secret used to sign planner access tokens. Prefer a dedicated secret; fall back
// to the existing Dodo webhook secret so no extra env config is required.
const SECRET: string = process.env.PLANNER_ACCESS_SECRET || process.env.DODO_WEBHOOK_SECRET || 'tooltails-planner-access';

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function accessCookieName(slug: string): string {
  return `tt_access_${slug}`;
}

function b64url(s: string): string {
  return Buffer.from(s).toString('base64url');
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function signAccessToken(email: string, slug: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = b64url(JSON.stringify({ email, slug, exp }));
  return `${payload}.${sign(payload)}`;
}

export function verifyAccessToken(token: string, slug: string): boolean {
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
    if (!data || data.slug !== slug) return false;
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
