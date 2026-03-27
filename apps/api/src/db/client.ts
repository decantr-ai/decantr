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
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

// Admin client that bypasses RLS (for server-side operations)
export function createAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createClient<Database>(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Default client for public operations
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
