/**
 * Environment configuration — reads from env vars with sensible defaults.
 * Loads .env file if present (Node 22+ native support).
 */

try { process.loadEnvFile(); } catch { /* .env is optional */ }

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  dbPath: process.env.DB_PATH || './data/registry.db',

  // GitHub OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  },

  // HMAC key for OAuth state signing
  stateSecret: process.env.STATE_SECRET || 'dev-state-secret-change-me',

  // Comma-separated GitHub user IDs that get admin role
  adminGithubIds: (process.env.ADMIN_GITHUB_IDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),

  isDev: process.env.NODE_ENV !== 'production',
};

/**
 * Validate critical config in production. Call during startup.
 * Logs warnings for non-critical issues, throws for fatal ones.
 */
export function validateProductionConfig() {
  if (config.isDev) return;

  const fatal = [];
  const warn = [];

  if (!config.github.clientId || !config.github.clientSecret) {
    fatal.push('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required in production');
  }

  if (config.stateSecret === 'dev-state-secret-change-me') {
    fatal.push('STATE_SECRET is still the dev default — generate one: openssl rand -hex 32');
  }

  if (/^https?:\/\/localhost(:|\/|$)/.test(config.baseUrl)) {
    warn.push(`BASE_URL is "${config.baseUrl}" — should be the public production URL`);
  }

  for (const msg of warn) {
    console.warn(`[config] WARNING: ${msg}`);
  }

  if (fatal.length) {
    for (const msg of fatal) {
      console.error(`[config] FATAL: ${msg}`);
    }
    process.exit(1);
  }
}
