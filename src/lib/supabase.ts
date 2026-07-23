import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    let url = (process.env.SUPABASE_URL || '').trim();
    const key = (process.env.SUPABASE_SERVICE_KEY || '').trim();

    if (!url) throw new Error('SUPABASE_URL environment variable is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');

    // Normalize: add https:// if missing, strip trailing slash
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    url = url.replace(/\/+$/, '');

    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
