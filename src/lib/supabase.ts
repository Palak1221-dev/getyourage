import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const rawUrl = process.env.SUPABASE_URL;
    const rawKey = process.env.SUPABASE_SERVICE_KEY;

    console.log("SUPABASE_SERVICE_KEY_EXISTS=", rawKey ? "YES" : "NO");
    if (rawKey) {
      console.log("SUPABASE_KEY_FIRST_8=", rawKey.trim().substring(0, 8));
      try {
        const payload = JSON.parse(atob(rawKey.trim().split('.')[1]));
        console.log("SUPABASE_KEY_ROLE=", payload.role);
      } catch { console.log("SUPABASE_KEY_ROLE=PARSE_FAILED"); }
    }

    let url = (rawUrl || '').trim();
    const key = (rawKey || '').trim();

    if (!url) throw new Error('SUPABASE_URL environment variable is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');

    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const parsed = new URL(url);
    const normalizedUrl = parsed.origin;

    console.log("KEY_BEING_PASSED_TO_CREATECLIENT__FIRST_8=", key.substring(0, 8));
    console.log("KEY_BEING_PASSED_TO_CREATECLIENT__ROLE=", (() => { try { return JSON.parse(atob(key.split('.')[1])).role; } catch { return "PARSE_FAILED"; } })());

    client = createClient(normalizedUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    console.log("SUPABASE_CLIENT_CREATED=", client ? "YES" : "NO");
    console.log("SUPABASE_CLIENT__supabaseKey_FIRST_8=", (client as any)?.supabaseKey?.substring(0, 8));
  }
  return client!;
}
