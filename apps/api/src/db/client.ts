import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

function getPublicDbEnv() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getServiceDbEnv() {
  const { supabaseUrl } = getPublicDbEnv();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return { supabaseUrl, supabaseServiceKey };
}

// Client for authenticated user requests (uses RLS)
export function createUserClient(accessToken?: string) {
  const { supabaseUrl, supabaseAnonKey } = getPublicDbEnv();
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
  const { supabaseUrl, supabaseServiceKey } = getServiceDbEnv();
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

let _publicClient: ReturnType<typeof createClient<Database>> | null = null;

function getPublicClient() {
  if (_publicClient) return _publicClient;

  const { supabaseUrl, supabaseAnonKey } = getPublicDbEnv();
  _publicClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: { fetch: globalThis.fetch },
  });
  return _publicClient;
}

// Default client for public operations, lazily resolved so imports do not explode in env-less CI.
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getPublicClient() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === 'function' ? (value as Function).bind(client) : value;
  },
});
