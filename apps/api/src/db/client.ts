import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Client for authenticated user requests (uses RLS)
export function createUserClient(accessToken?: string) {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      fetch: globalThis.fetch,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

// Singleton admin client — reuse across requests to avoid connection churn
let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (_adminClient) return _adminClient;
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  _adminClient = createClient<Database>(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: globalThis.fetch,
    },
  });
  return _adminClient;
}

// Default client for public operations
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  global: { fetch: globalThis.fetch },
});
