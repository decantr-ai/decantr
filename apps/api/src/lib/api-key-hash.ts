import { createHmac } from 'crypto';

let cachedApiKeyHashSecret: string | null = null;

function getApiKeyHashSecret(): string {
  if (cachedApiKeyHashSecret) return cachedApiKeyHashSecret;

  const secret =
    process.env.DECANTR_API_KEY_HASH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret && process.env.NODE_ENV === 'test') {
    cachedApiKeyHashSecret = 'decantr-test-api-key-hash-secret';
    return cachedApiKeyHashSecret;
  }

  if (!secret) {
    throw new Error('Missing DECANTR_API_KEY_HASH_SECRET or Supabase key for API key hashing');
  }

  cachedApiKeyHashSecret = secret;
  return secret;
}

export function hashApiKey(key: string): string {
  return createHmac('sha256', getApiKeyHashSecret()).update(key).digest('hex');
}
