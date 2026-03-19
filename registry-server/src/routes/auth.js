/**
 * GitHub OAuth routes.
 *
 * GET /auth/github?callback=... — start OAuth flow
 * GET /auth/github/callback?code=&state= — handle GitHub callback
 */

import { Hono } from 'hono';
import { createHash } from 'node:crypto';
import { getDb } from '../db/index.js';
import { config } from '../config.js';
import {
  generateState,
  verifyState,
  exchangeCode,
  fetchGitHubUser,
  generateToken,
} from '../services/github-oauth.js';

const app = new Hono();

/**
 * Start OAuth — redirects to GitHub.
 */
app.get('/github', (c) => {
  const callback = c.req.query('callback');

  if (!callback) {
    return c.json({ error: 'Missing callback parameter' }, 400);
  }

  // Validate callback is localhost-only
  try {
    const url = new URL(callback);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      return c.json({ error: 'Callback must be a localhost URL' }, 400);
    }
  } catch {
    return c.json({ error: 'Invalid callback URL' }, 400);
  }

  const state = generateState(callback);

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', config.github.clientId);
  githubUrl.searchParams.set('redirect_uri', `${config.baseUrl}/auth/github/callback`);
  githubUrl.searchParams.set('scope', 'read:user user:email');
  githubUrl.searchParams.set('state', state);

  return c.redirect(githubUrl.toString());
});

/**
 * GitHub callback — exchange code, upsert user, issue token.
 */
app.get('/github/callback', async (c) => {
  const code = c.req.query('code');
  const stateParam = c.req.query('state');
  const error = c.req.query('error');

  if (error) {
    return c.text(`Authentication failed: ${error}`, 400);
  }

  if (!code || !stateParam) {
    return c.text('Missing code or state parameter', 400);
  }

  // Verify state
  const stateResult = verifyState(stateParam);
  if (!stateResult.valid || !stateResult.callbackUrl) {
    return c.text('Invalid or expired state parameter', 400);
  }

  try {
    // Exchange code for GitHub token
    const githubToken = await exchangeCode(code);

    // Fetch user profile
    const ghUser = await fetchGitHubUser(githubToken);

    const db = getDb();

    // Determine role
    const isAdmin = config.adminGithubIds.includes(String(ghUser.id));

    // Upsert user
    const existingUser = db.prepare('SELECT id, role FROM users WHERE github_id = ?').get(String(ghUser.id));

    let userId;
    if (existingUser) {
      db.prepare(`
        UPDATE users SET login = ?, email = ?, avatar_url = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(ghUser.login, ghUser.email, ghUser.avatar_url, existingUser.id);
      userId = existingUser.id;

      // Promote to admin if in admin list
      if (isAdmin && existingUser.role !== 'admin') {
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', existingUser.id);
      }
    } else {
      const result = db.prepare(`
        INSERT INTO users (github_id, login, email, avatar_url, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(String(ghUser.id), ghUser.login, ghUser.email, ghUser.avatar_url, isAdmin ? 'admin' : 'publisher');
      userId = result.lastInsertRowid;
    }

    // Generate opaque token
    const rawToken = generateToken();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    db.prepare('INSERT INTO auth_tokens (user_id, token_hash) VALUES (?, ?)').run(userId, tokenHash);

    // Redirect to CLI callback
    const redirectUrl = new URL(stateResult.callbackUrl);
    redirectUrl.searchParams.set('token', rawToken);
    return c.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    const redirectUrl = new URL(stateResult.callbackUrl);
    redirectUrl.searchParams.set('error', err.message);
    return c.redirect(redirectUrl.toString());
  }
});

export default app;
