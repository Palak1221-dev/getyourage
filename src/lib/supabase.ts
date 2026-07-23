import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const rawUrl = process.env.SUPABASE_URL;
    const rawKey = process.env.SUPABASE_SERVICE_KEY;

    console.log('[supabase] SUPABASE_URL exists:', !!rawUrl);
    console.log('[supabase] SUPABASE_SERVICE_KEY exists:', !!rawKey);

    let url = (rawUrl || '').trim();
    const key = (rawKey || '').trim();

    if (!url) throw new Error('SUPABASE_URL environment variable is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');

    const hadProtocol = /^https?:\/\//i.test(url);
    if (!hadProtocol) url = 'https://' + url;
    url = url.replace(/\/+$/, '');

    let hostname = '(invalid)';
    try { hostname = new URL(url).hostname; } catch {}
    console.log('[supabase] URL hostname:', hostname);
    console.log('[supabase] Protocol auto-added:', !hadProtocol);
    console.log('[supabase] Final REST URL:', url + '/rest/v1');

    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
