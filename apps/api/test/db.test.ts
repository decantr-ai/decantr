import { describe, it, expect, beforeAll } from 'vitest';
import { createAdminClient } from '../src/db/client.js';

describe('Database Connection', () => {
  beforeAll(() => {
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL not set. Run with: dotenv -e .env.local -- vitest');
    }
  });

  it('should connect to Supabase', async () => {
    const client = createAdminClient();
    const { data, error } = await client.from('users').select('count').limit(0);
    expect(error).toBeNull();
  });

  it('should have users table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('users').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('should have content table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('content').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('should have organizations table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('organizations').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('should have api_keys table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('api_keys').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('should have moderation_queue table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('moderation_queue').select('id').limit(1);
    expect(error).toBeNull();
  });
});
