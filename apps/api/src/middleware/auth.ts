import type { Context, Next } from 'hono';
import { createUserClient, createAdminClient } from '../db/client.js';
import { createHash } from 'crypto';

export interface AuthUser {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  trusted: boolean;
  reputation_score: number;
}

export interface AuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function getAuthContext(c: Context): Promise<AuthContext> {
  const authHeader = c.req.header('Authorization');
  const apiKeyHeader = c.req.header('X-API-Key');

  // Try JWT auth first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const client = createUserClient(token);

    const { data: { user: authUser }, error: authError } = await client.auth.getUser();

    if (!authError && authUser) {
      const { data: profile } = await client
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        return {
          user: {
            id: profile.id,
            email: profile.email,
            tier: profile.tier,
            trusted: profile.trusted,
            reputation_score: profile.reputation_score,
          },
          isAuthenticated: true,
          isAdmin: false,
        };
      }
    }
  }

  // Try API key auth
  if (apiKeyHeader) {
    const keyHash = hashApiKey(apiKeyHeader);
    const adminClient = createAdminClient();

    const { data: apiKey } = await adminClient
      .from('api_keys')
      .select('*, users(*)')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .single();

    if (apiKey && apiKey.users) {
      // Update last_used_at
      await adminClient
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKey.id);

      const profile = apiKey.users as unknown as AuthUser;
      return {
        user: {
          id: profile.id,
          email: profile.email,
          tier: profile.tier,
          trusted: profile.trusted,
          reputation_score: profile.reputation_score,
        },
        isAuthenticated: true,
        isAdmin: false,
      };
    }
  }

  return {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  };
}

export function requireAuth() {
  return async (c: Context, next: Next) => {
    const auth = await getAuthContext(c);

    if (!auth.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('auth', auth);
    await next();
  };
}

export function optionalAuth() {
  return async (c: Context, next: Next) => {
    try {
      const auth = await getAuthContext(c);
      c.set('auth', auth);
    } catch {
      // Auth failed (Supabase unavailable, etc.) — continue as unauthenticated
      c.set('auth', { user: null, isAuthenticated: false, isAdmin: false });
    }
    await next();
  };
}

export function requireTier(...tiers: Array<'free' | 'pro' | 'team' | 'enterprise'>) {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth') as AuthContext | undefined;

    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!tiers.includes(auth.user.tier)) {
      return c.json({ error: 'Insufficient tier. Upgrade required.' }, 403);
    }

    await next();
  };
}
