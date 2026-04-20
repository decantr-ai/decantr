import { createAdminClient } from '../db/client.js';
import type { Database } from '../db/types.js';

type UserRow = Database['public']['Tables']['users']['Row'];

interface AuthIdentity {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function normalizeUsername(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized.length >= 3 ? normalized.slice(0, 30) : `user-${Math.random().toString(36).slice(2, 8)}`;
}

async function findAvailableUsername(userId: string, desired: string): Promise<string> {
  const client = createAdminClient();
  const base = normalizeUsername(desired);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const candidate = `${base}${suffix}`.slice(0, 30);
    const { data: existing } = await client
      .from('users')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    if (!existing || existing.id === userId) {
      return candidate;
    }
  }

  return `user-${userId.slice(0, 8)}`;
}

export async function ensureUserProfile(identity: AuthIdentity): Promise<UserRow> {
  const client = createAdminClient();
  const { data: existing, error: existingError } = await client
    .from('users')
    .select('*')
    .eq('id', identity.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const metadata = identity.user_metadata ?? {};
  const email = getString(identity.email) ?? `${identity.id}@placeholder.invalid`;
  const displayName =
    getString(metadata.display_name) ??
    getString(metadata.full_name) ??
    getString(metadata.name);
  const usernameSeed =
    getString(metadata.username) ??
    getString(metadata.user_name) ??
    email.split('@')[0] ??
    identity.id.slice(0, 8);
  const username = await findAvailableUsername(identity.id, usernameSeed);

  const { data, error } = await client
    .from('users')
    .upsert(
      {
        id: identity.id,
        email,
        username,
        display_name: displayName,
        tier: 'free',
        trusted: false,
        reputation_score: 0,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to provision user profile');
  }

  return data;
}
