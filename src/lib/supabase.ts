import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    console.log("RAW_URL=", JSON.stringify(process.env.SUPABASE_URL));
    console.log("RAW_KEY_EXISTS=", !!process.env.SUPABASE_SERVICE_KEY);

    const rawUrl = process.env.SUPABASE_URL;
    const rawKey = process.env.SUPABASE_SERVICE_KEY;

    let url = (rawUrl || '').trim();
    const key = (rawKey || '').trim();

    if (!url) throw new Error('SUPABASE_URL environment variable is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');

    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const parsed = new URL(url);
    const normalizedUrl = parsed.origin;

    console.log("NORMALIZED=", normalizedUrl);

    client = createClient(normalizedUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
