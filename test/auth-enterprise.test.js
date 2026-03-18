import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createEnterpriseAuth, requireRoles } from '../src/tannins/auth-enterprise.js';

// ─── Helpers ──────────────────────────────────────────────────

let dom;
let prevLocalStorage;
let prevSessionStorage;

function createMockStorage() {
  const store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null
  };
}

function mockFetch(routes = {}) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, init });
    const route = routes[url];
    if (!route) {
      return { ok: false, status: 404, json: async () => ({}), text: async () => 'Not found' };
    }
    if (route.fail) throw new Error(route.failMessage || 'Network error');
    const status = route.status || 200;
    const body = route.body || {};
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body)
    };
  };
  fn.calls = calls;
  return fn;
}

/**
 * Create a fake JWT token with the given payload.
 * Does NOT produce a real signature — only for testing client-side decode.
 */
function fakeJWT(payload) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.fake-signature`;
}

let originalFetch;

beforeEach(() => {
  dom = createDOM();
  prevLocalStorage = globalThis.localStorage;
  prevSessionStorage = globalThis.sessionStorage;
  globalThis.localStorage = createMockStorage();
  globalThis.sessionStorage = createMockStorage();
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  if (dom && dom.destroy) dom.destroy();
  globalThis.localStorage = prevLocalStorage;
  globalThis.sessionStorage = prevSessionStorage;
  if (originalFetch) globalThis.fetch = originalFetch;
});

// ─── Base Auth Compatibility ──────────────────────────────────

describe('createEnterpriseAuth — base auth compatibility', () => {
  it('includes all base auth properties', () => {
    const auth = createEnterpriseAuth();
    // Base auth properties
    assert.equal(typeof auth.user, 'function');
    assert.equal(typeof auth.token, 'function');
    assert.equal(typeof auth.isAuthenticated, 'function');
    assert.equal(typeof auth.isLoading, 'function');
    assert.equal(typeof auth.error, 'function');
    assert.equal(typeof auth.login, 'function');
    assert.equal(typeof auth.logout, 'function');
    assert.equal(typeof auth.refresh, 'function');
    assert.equal(typeof auth.setUser, 'function');
    assert.equal(typeof auth.setToken, 'function');
    assert.equal(typeof auth.destroy, 'function');
    auth.destroy();
  });

  it('includes enterprise-only properties', () => {
    const auth = createEnterpriseAuth();
    // Enterprise properties
    assert.equal(typeof auth.loginWithOIDC, 'function');
    assert.equal(typeof auth.handleCallback, 'function');
    assert.equal(typeof auth.roles, 'function');
    assert.equal(typeof auth.hasRole, 'function');
    assert.equal(typeof auth.hasAnyRole, 'function');
    assert.equal(typeof auth.hasAllRoles, 'function');
    assert.equal(typeof auth.sessionExpiresAt, 'function');
    assert.equal(typeof auth.isSessionExpired, 'function');
    assert.equal(typeof auth.isSessionIdle, 'function');
    assert.equal(typeof auth.resetIdleTimer, 'function');
    assert.equal(typeof auth.decodedToken, 'function');
    assert.equal(typeof auth.tokenExpiresAt, 'function');
    assert.equal(typeof auth.isTokenExpired, 'function');
    auth.destroy();
  });
});

// ─── JWT Decoding ─────────────────────────────────────────────

describe('createEnterpriseAuth — JWT decoding', () => {
  it('decodes a valid JWT token', () => {
    const payload = { sub: 'user123', name: 'Alice', roles: ['admin', 'user'], exp: Math.floor(Date.now() / 1000) + 3600 };
    const token = fakeJWT(payload);

    const auth = createEnterpriseAuth();
    auth.setToken(token);

    const decoded = auth.decodedToken();
    assert.equal(decoded.sub, 'user123');
    assert.equal(decoded.name, 'Alice');
    assert.deepEqual(decoded.roles, ['admin', 'user']);
    auth.destroy();
  });

  it('returns null for no token', () => {
    const auth = createEnterpriseAuth();
    assert.equal(auth.decodedToken(), null);
    auth.destroy();
  });

  it('returns null for invalid token', () => {
    const auth = createEnterpriseAuth();
    auth.setToken('not-a-jwt');
    assert.equal(auth.decodedToken(), null);
    auth.destroy();
  });

  it('computes token expiry', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ exp }));

    assert.equal(auth.tokenExpiresAt(), exp * 1000);
    assert.equal(auth.isTokenExpired(), false);
    auth.destroy();
  });

  it('detects expired token', () => {
    const exp = Math.floor(Date.now() / 1000) - 60; // expired 60s ago
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ exp }));

    assert.equal(auth.isTokenExpired(), true);
    auth.destroy();
  });

  it('handles token without exp claim', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ sub: 'user1' }));

    assert.equal(auth.tokenExpiresAt(), null);
    assert.equal(auth.isTokenExpired(), false);
    auth.destroy();
  });
});

// ─── RBAC ─────────────────────────────────────────────────────

describe('createEnterpriseAuth — RBAC', () => {
  it('extracts roles from default claim path', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['admin', 'editor'] }));

    assert.deepEqual(auth.roles(), ['admin', 'editor']);
    auth.destroy();
  });

  it('extracts roles from custom dot-notation path', () => {
    const auth = createEnterpriseAuth({
      roles: { claimPath: 'realm_access.roles' }
    });
    auth.setToken(fakeJWT({ realm_access: { roles: ['manager', 'viewer'] } }));

    assert.deepEqual(auth.roles(), ['manager', 'viewer']);
    auth.destroy();
  });

  it('returns empty array when no roles claim', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ sub: 'user1' }));

    assert.deepEqual(auth.roles(), []);
    auth.destroy();
  });

  it('handles single string role claim', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: 'admin' }));

    assert.deepEqual(auth.roles(), ['admin']);
    auth.destroy();
  });

  it('hasRole checks correctly', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['admin', 'user'] }));

    assert.equal(auth.hasRole('admin'), true);
    assert.equal(auth.hasRole('user'), true);
    assert.equal(auth.hasRole('superadmin'), false);
    auth.destroy();
  });

  it('superRole bypasses all checks', () => {
    const auth = createEnterpriseAuth({
      roles: { superRole: 'superadmin' }
    });
    auth.setToken(fakeJWT({ roles: ['superadmin'] }));

    assert.equal(auth.hasRole('admin'), true);
    assert.equal(auth.hasRole('anything'), true);
    assert.equal(auth.hasRole('nonexistent'), true);
    auth.destroy();
  });

  it('hasAnyRole matches at least one', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['editor'] }));

    assert.equal(auth.hasAnyRole(['admin', 'editor']), true);
    assert.equal(auth.hasAnyRole(['admin', 'superadmin']), false);
    auth.destroy();
  });

  it('hasAnyRole with empty array returns true', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: [] }));

    assert.equal(auth.hasAnyRole([]), true);
    auth.destroy();
  });

  it('hasAllRoles checks all required', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['admin', 'editor', 'viewer'] }));

    assert.equal(auth.hasAllRoles(['admin', 'editor']), true);
    assert.equal(auth.hasAllRoles(['admin', 'superadmin']), false);
    auth.destroy();
  });

  it('hasAllRoles with empty array returns true', () => {
    const auth = createEnterpriseAuth();
    assert.equal(auth.hasAllRoles([]), true);
    auth.destroy();
  });
});

// ─── requireRoles Route Guard ─────────────────────────────────

describe('requireRoles', () => {
  it('allows access when no roles required', () => {
    const auth = createEnterpriseAuth();
    const { guard } = requireRoles(auth);

    const result = guard({ path: '/public', meta: {} }, {});
    assert.equal(result, undefined);
    auth.destroy();
  });

  it('redirects to login when not authenticated', () => {
    const auth = createEnterpriseAuth();
    const { guard } = requireRoles(auth);

    const result = guard({ path: '/admin', meta: { roles: ['admin'] } }, {});
    assert.equal(result, '/login');
    auth.destroy();
  });

  it('redirects to forbidden when lacking roles', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['user'] }));

    const { guard } = requireRoles(auth, { forbiddenPath: '/403' });
    const result = guard({ path: '/admin', meta: { roles: ['admin'] } }, {});
    assert.equal(result, '/403');
    auth.destroy();
  });

  it('allows access when user has required role', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['admin', 'user'] }));

    const { guard } = requireRoles(auth);
    const result = guard({ path: '/admin', meta: { roles: ['admin'] } }, {});
    assert.equal(result, undefined);
    auth.destroy();
  });

  it('allows access with any matching role', () => {
    const auth = createEnterpriseAuth();
    auth.setToken(fakeJWT({ roles: ['editor'] }));

    const { guard } = requireRoles(auth);
    const result = guard({ path: '/content', meta: { roles: ['admin', 'editor'] } }, {});
    assert.equal(result, undefined);
    auth.destroy();
  });

  it('uses custom login path', () => {
    const auth = createEnterpriseAuth();
    const { guard } = requireRoles(auth, { loginPath: '/signin' });

    const result = guard({ path: '/admin', meta: { roles: ['admin'] } }, {});
    assert.equal(result, '/signin');
    auth.destroy();
  });

  it('skips guard when meta.roles is empty array', () => {
    const auth = createEnterpriseAuth();
    const { guard } = requireRoles(auth);

    const result = guard({ path: '/page', meta: { roles: [] } }, {});
    assert.equal(result, undefined);
    auth.destroy();
  });

  it('skips guard when meta has no roles key', () => {
    const auth = createEnterpriseAuth();
    const { guard } = requireRoles(auth);

    const result = guard({ path: '/page', meta: { title: 'Page' } }, {});
    assert.equal(result, undefined);
    auth.destroy();
  });
});

// ─── OIDC ─────────────────────────────────────────────────────

describe('createEnterpriseAuth — OIDC', () => {
  it('throws if OIDC not configured', async () => {
    const auth = createEnterpriseAuth();
    await assert.rejects(() => auth.loginWithOIDC(), /OIDC not configured/);
    auth.destroy();
  });

  it('handleCallback throws if OIDC not configured', async () => {
    const auth = createEnterpriseAuth();
    await assert.rejects(() => auth.handleCallback(), /OIDC not configured/);
    auth.destroy();
  });

  it('handleCallback throws if no code in URL', async () => {
    // Mock window.location
    const prevWindow = globalThis.window;
    globalThis.window = {
      location: { search: '', pathname: '/callback', hash: '' },
      history: { replaceState: () => {} }
    };

    const auth = createEnterpriseAuth({
      oidc: {
        provider: 'generic',
        clientId: 'test',
        authority: 'https://auth.example.com',
        redirectUri: 'http://localhost/callback'
      }
    });

    await assert.rejects(() => auth.handleCallback(), /No authorization code/);
    auth.destroy();
    globalThis.window = prevWindow;
  });

  it('handleCallback detects state mismatch', async () => {
    globalThis.sessionStorage.setItem('decantr_oidc_state', 'stored-state');
    globalThis.sessionStorage.setItem('decantr_oidc_verifier', 'test-verifier');

    const prevWindow = globalThis.window;
    globalThis.window = {
      location: { search: '?code=abc&state=wrong-state', pathname: '/callback', hash: '' },
      history: { replaceState: () => {} }
    };

    const auth = createEnterpriseAuth({
      oidc: {
        provider: 'generic',
        clientId: 'test',
        authority: 'https://auth.example.com',
        redirectUri: 'http://localhost/callback'
      }
    });

    await assert.rejects(() => auth.handleCallback(), /state mismatch/);
    auth.destroy();
    globalThis.window = prevWindow;
  });

  it('handleCallback detects OIDC error in URL', async () => {
    const prevWindow = globalThis.window;
    globalThis.window = {
      location: { search: '?error=access_denied&error_description=User+denied', pathname: '/callback', hash: '' },
      history: { replaceState: () => {} }
    };

    const auth = createEnterpriseAuth({
      oidc: {
        provider: 'generic',
        clientId: 'test',
        authority: 'https://auth.example.com',
        redirectUri: 'http://localhost/callback'
      }
    });

    await assert.rejects(() => auth.handleCallback(), /OIDC error: User denied/);
    auth.destroy();
    globalThis.window = prevWindow;
  });

  it('handleCallback exchanges code for tokens', async () => {
    const tokenPayload = { sub: 'user1', name: 'Alice', roles: ['admin'] };
    const accessToken = fakeJWT({ sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 });
    const idToken = fakeJWT(tokenPayload);

    globalThis.sessionStorage.setItem('decantr_oidc_state', 'correct-state');
    globalThis.sessionStorage.setItem('decantr_oidc_verifier', 'test-verifier');
    globalThis.sessionStorage.setItem('decantr_oidc_provider', 'generic');

    globalThis.fetch = mockFetch({
      'https://auth.example.com/token': {
        body: { access_token: accessToken, id_token: idToken }
      }
    });

    const prevWindow = globalThis.window;
    globalThis.window = {
      location: { search: '?code=auth-code&state=correct-state', pathname: '/callback', hash: '' },
      history: { replaceState: () => {} }
    };

    const auth = createEnterpriseAuth({
      oidc: {
        provider: 'generic',
        clientId: 'test',
        authority: 'https://auth.example.com',
        redirectUri: 'http://localhost/callback'
      }
    });

    await auth.handleCallback();

    assert.equal(auth.token(), accessToken);
    assert.equal(auth.user().sub, 'user1');
    assert.equal(auth.isAuthenticated(), true);

    // PKCE state cleaned up
    assert.equal(globalThis.sessionStorage.getItem('decantr_oidc_verifier'), null);
    assert.equal(globalThis.sessionStorage.getItem('decantr_oidc_state'), null);

    auth.destroy();
    globalThis.window = prevWindow;
  });
});

// ─── Session Management ───────────────────────────────────────

describe('createEnterpriseAuth — session management', () => {
  it('session is null when not configured', () => {
    const auth = createEnterpriseAuth();
    assert.equal(auth.sessionExpiresAt(), null);
    assert.equal(auth.isSessionExpired(), false);
    assert.equal(auth.isSessionIdle(), false);
    auth.destroy();
  });

  it('session starts when authenticated', () => {
    const auth = createEnterpriseAuth({
      session: { idleTimeout: 60000, maxDuration: 3600000 }
    });

    const token = fakeJWT({ sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 });
    auth.setToken(token);

    // Session should be active now
    assert.ok(auth.sessionExpiresAt() !== null);
    assert.equal(auth.isSessionExpired(), false);
    auth.destroy();
  });

  it('session clears when logged out', () => {
    const auth = createEnterpriseAuth({
      session: { idleTimeout: 60000, maxDuration: 3600000 }
    });

    auth.setToken(fakeJWT({ sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 }));
    assert.ok(auth.sessionExpiresAt() !== null);

    auth.setToken(null);
    assert.equal(auth.sessionExpiresAt(), null);
    auth.destroy();
  });

  it('resetIdleTimer is callable', () => {
    const auth = createEnterpriseAuth({
      session: { idleTimeout: 60000, maxDuration: 3600000 }
    });
    // Should not throw even when not authenticated
    auth.resetIdleTimer();
    auth.destroy();
  });

  it('resetIdleTimer is no-op when session not configured', () => {
    const auth = createEnterpriseAuth();
    auth.resetIdleTimer(); // Should not throw
    auth.destroy();
  });
});

// ─── Destroy ──────────────────────────────────────────────────

describe('createEnterpriseAuth — destroy', () => {
  it('cleans up everything on destroy', () => {
    const auth = createEnterpriseAuth({
      session: { idleTimeout: 60000, maxDuration: 3600000 }
    });

    auth.setToken(fakeJWT({ sub: 'user1', roles: ['admin'], exp: Math.floor(Date.now() / 1000) + 3600 }));

    // Should not throw
    auth.destroy();
  });

  it('can be called multiple times', () => {
    const auth = createEnterpriseAuth();
    auth.destroy();
    auth.destroy(); // Should not throw
  });
});

// ─── Provider Presets ─────────────────────────────────────────

describe('createEnterpriseAuth — provider presets', () => {
  it('loginWithOIDC stores PKCE state in sessionStorage', async () => {
    // Mock window.location (prevent actual redirect)
    const prevWindow = globalThis.window;
    let redirectUrl = null;
    globalThis.window = {
      location: {
        get href() { return 'http://localhost'; },
        set href(val) { redirectUrl = val; }
      }
    };

    // Mock crypto for PKCE
    if (typeof globalThis.crypto === 'undefined') {
      globalThis.crypto = {
        getRandomValues: (arr) => { for (let i = 0; i < arr.length; i++) arr[i] = i; return arr; },
        subtle: {
          digest: async (algo, data) => new ArrayBuffer(32)
        }
      };
    }

    const auth = createEnterpriseAuth({
      oidc: {
        provider: 'okta',
        clientId: 'my-client',
        authority: 'https://dev-123.okta.com',
        redirectUri: 'http://localhost/callback',
        scopes: ['openid', 'profile']
      }
    });

    await auth.loginWithOIDC();

    // Verify PKCE state was stored
    assert.ok(globalThis.sessionStorage.getItem('decantr_oidc_verifier'));
    assert.ok(globalThis.sessionStorage.getItem('decantr_oidc_state'));
    assert.equal(globalThis.sessionStorage.getItem('decantr_oidc_provider'), 'okta');

    // Verify redirect URL contains expected params
    if (redirectUrl) {
      assert.ok(redirectUrl.includes('dev-123.okta.com'));
      assert.ok(redirectUrl.includes('/v1/authorize'));
      assert.ok(redirectUrl.includes('client_id=my-client'));
      assert.ok(redirectUrl.includes('response_type=code'));
      assert.ok(redirectUrl.includes('code_challenge_method=S256'));
    }

    auth.destroy();
    globalThis.window = prevWindow;
  });
});
