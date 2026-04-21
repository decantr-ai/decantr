import { describe, it, expect } from 'vitest';
import { createAdminClient } from '../src/db/client.js';

const hasDbEnv = Boolean(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const describeDatabase = hasDbEnv ? describe : describe.skip;

describeDatabase('Database Connection', () => {

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
