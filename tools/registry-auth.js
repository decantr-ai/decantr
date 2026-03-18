/**
 * Registry Auth — GitHub OAuth flow for publishing to the
 * Decantr community registry.
 *
 * Token cached at ~/.decantr/auth.json.
 *
 * @module tools/registry-auth
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { URL } from 'node:url';

const AUTH_DIR = join(homedir(), '.decantr');
const AUTH_FILE = join(AUTH_DIR, 'auth.json');
const DEFAULT_REGISTRY = 'https://registry.decantr.dev';
const CALLBACK_PORT = 9847;

// ── Token storage ────────────────────────────────────────────────

/**
 * Read cached auth token.
 * @returns {Promise<string|null>} Token or null
 */
export async function readToken() {
  try {
    const raw = await readFile(AUTH_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (data.token && typeof data.token === 'string') {
      return data.token;
    }
  } catch { /* no cached token */ }
  return null;
}

/**
 * Save auth token to disk.
 * @param {string} token
 */
export async function saveToken(token) {
  await mkdir(AUTH_DIR, { recursive: true });
  await writeFile(AUTH_FILE, JSON.stringify({ token, savedAt: new Date().toISOString() }, null, 2) + '\n', { mode: 0o600 });
}

/**
 * Remove cached auth token.
 */
export async function clearToken() {
  try {
    await writeFile(AUTH_FILE, '{}');
  } catch { /* already gone */ }
}

// ── OAuth flow ───────────────────────────────────────────────────

/**
 * Open a URL in the user's default browser.
 * @param {string} url
 */
async function openBrowser(url) {
  const { exec } = await import('node:child_process');
  const { platform } = await import('node:os');
  const cmd = platform() === 'darwin' ? 'open'
    : platform() === 'win32' ? 'start'
    : 'xdg-open';
  exec(`${cmd} "${url}"`);
}

/**
 * Run the GitHub OAuth flow:
 * 1. Start local callback server
 * 2. Open browser to registry auth page
 * 3. Receive token via callback
 * 4. Cache token
 *
 * @param {Object} [opts]
 * @param {string} [opts.registry] - Registry base URL
 * @returns {Promise<string>} Auth token
 */
export async function authenticate(opts = {}) {
  const registry = opts.registry || DEFAULT_REGISTRY;

  // Check for cached token first
  const cached = await readToken();
  if (cached) return cached;

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);

      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body><h2>Authentication failed</h2><p>You can close this tab.</p></body></html>');
          server.close();
          reject(new Error(`Authentication failed: ${error}`));
          return;
        }

        if (token) {
          await saveToken(token);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body><h2>Authenticated!</h2><p>You can close this tab and return to the terminal.</p></body></html>');
          server.close();
          resolve(token);
          return;
        }

        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing token parameter');
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    server.listen(CALLBACK_PORT, () => {
      const authUrl = `${registry}/auth/github?callback=http://localhost:${CALLBACK_PORT}/callback`;
      console.log(`\n  Opening browser for authentication...`);
      console.log(`  If the browser doesn't open, visit:\n  ${authUrl}\n`);
      openBrowser(authUrl);
    });

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error('Authentication timed out after 5 minutes'));
    }, 5 * 60 * 1000);

    server.on('close', () => clearTimeout(timeout));
  });
}
