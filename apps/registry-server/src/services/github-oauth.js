/**
 * GitHub OAuth helpers — token exchange and user profile fetch.
 */

import { createHmac, randomBytes } from 'node:crypto';
import { config } from '../config.js';

/**
 * Generate a signed OAuth state parameter.
 * Encodes the callback URL + timestamp, signed with HMAC-SHA256.
 * @param {string} callbackUrl
 * @returns {string} Base64url-encoded state
 */
export function generateState(callbackUrl) {
  const payload = JSON.stringify({
    cb: callbackUrl,
    ts: Date.now(),
    nonce: randomBytes(8).toString('hex'),
  });
  const sig = createHmac('sha256', config.stateSecret)
    .update(payload)
    .digest('hex');
  const stateObj = { p: payload, s: sig };
  return Buffer.from(JSON.stringify(stateObj)).toString('base64url');
}

/**
 * Verify and decode an OAuth state parameter.
 * Checks HMAC signature and 5-minute expiry.
 * @param {string} state - Base64url-encoded state
 * @returns {{valid: boolean, callbackUrl: string|null}}
 */
export function verifyState(state) {
  try {
    const stateObj = JSON.parse(Buffer.from(state, 'base64url').toString());
    const expectedSig = createHmac('sha256', config.stateSecret)
      .update(stateObj.p)
      .digest('hex');

    if (expectedSig !== stateObj.s) {
      return { valid: false, callbackUrl: null };
    }

    const payload = JSON.parse(stateObj.p);
    const age = Date.now() - payload.ts;
    if (age > 5 * 60 * 1000) {
      return { valid: false, callbackUrl: null };
    }

    return { valid: true, callbackUrl: payload.cb };
  } catch {
    return { valid: false, callbackUrl: null };
  }
}

/**
 * Exchange authorization code for GitHub access token.
 * @param {string} code - Authorization code from callback
 * @returns {Promise<string>} GitHub access token
 */
export async function exchangeCode(code) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

/**
 * Fetch GitHub user profile.
 * @param {string} accessToken - GitHub access token
 * @returns {Promise<{id: number, login: string, email: string|null, avatar_url: string}>}
 */
export async function fetchGitHubUser(accessToken) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'decantr-registry',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const user = await res.json();
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    avatar_url: user.avatar_url,
  };
}

/**
 * Generate a random opaque auth token.
 * @returns {string} 32-byte hex token
 */
export function generateToken() {
  return randomBytes(32).toString('hex');
}
