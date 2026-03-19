/**
 * Auth middleware — resolves Bearer token to user.
 *
 * Sets c.set('user', {...}) on authenticated requests.
 * Use requireAuth() for endpoints that must be authenticated.
 */

import { createHash } from 'node:crypto';
import { getDb } from '../db/index.js';

/**
 * Hash a raw token for database lookup.
 */
function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Optional auth — sets user if token present, continues either way.
 */
export function optionalAuth() {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const hash = hashToken(token);
      const db = getDb();

      const row = db.prepare(`
        SELECT u.id, u.github_id, u.login, u.email, u.avatar_url, u.role
        FROM auth_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = ? AND t.revoked_at IS NULL
      `).get(hash);

      if (row) {
        c.set('user', row);
      }
    }
    await next();
  };
}

/**
 * Required auth — returns 401 if no valid token.
 */
export function requireAuth() {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const token = authHeader.slice(7);
    const hash = hashToken(token);
    const db = getDb();

    const row = db.prepare(`
      SELECT u.id, u.github_id, u.login, u.email, u.avatar_url, u.role
      FROM auth_tokens t
      JOIN users u ON u.id = t.user_id
      WHERE t.token_hash = ? AND t.revoked_at IS NULL
    `).get(hash);

    if (!row) {
      return c.json({ error: 'Invalid or revoked token' }, 401);
    }

    if (row.role === 'banned') {
      return c.json({ error: 'Account suspended' }, 403);
    }

    c.set('user', row);
    await next();
  };
}
