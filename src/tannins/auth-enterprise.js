/**
 * Decantr Enterprise Auth Tannin
 *
 * Extends createAuth() with OIDC/PKCE, RBAC, session management,
 * and JWT inspection — all built from native APIs (crypto.subtle,
 * sessionStorage, PerformanceObserver-style listeners).
 *
 * Zero third-party dependencies.
 *
 * @module decantr/tannins/auth-enterprise
 */

import { createSignal, createMemo, createEffect, batch } from '../state/index.js';
import { createAuth } from './auth.js';

// ─── Provider Endpoint Presets ───────────────────────────────

const PROVIDER_ENDPOINTS = {
  okta: {
    authorize: '/v1/authorize',
    token: '/v1/token',
    logout: '/v1/logout'
  },
  auth0: {
    authorize: '/authorize',
    token: '/oauth/token',
    logout: '/v2/logout'
  },
  azure: {
    authorize: '/oauth2/v2.0/authorize',
    token: '/oauth2/v2.0/token',
    logout: '/oauth2/v2.0/logout'
  },
  keycloak: {
    authorize: '/protocol/openid-connect/auth',
    token: '/protocol/openid-connect/token',
    logout: '/protocol/openid-connect/logout'
  },
  generic: {
    authorize: '/authorize',
    token: '/token',
    logout: '/logout'
  }
};

// ─── PKCE Utilities ──────────────────────────────────────────

/**
 * Base64url-encode a Uint8Array.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function base64urlEncode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a cryptographically random code verifier (43-128 chars).
 * @returns {string}
 */
function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

/**
 * Generate the PKCE code challenge from a verifier (S256 method).
 * @param {string} verifier
 * @returns {Promise<string>}
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(new Uint8Array(digest));
}

/**
 * Generate a random state parameter.
 * @returns {string}
 */
function generateState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

// ─── JWT Decoding ────────────────────────────────────────────

/**
 * Decode a JWT payload (client-side only, no verification).
 * Server-side verification is the server's responsibility.
 * @param {string} token
 * @returns {Object|null}
 */
function decodeJWT(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url decode the payload
    let payload = parts[1];
    // Restore base64 padding
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4 !== 0) payload += '=';

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}

/**
 * Read a nested property from an object using dot notation.
 * @param {Object} obj
 * @param {string} path
 * @returns {*}
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

// ─── Session Management ──────────────────────────────────────

function createSessionManager(config, onIdle, onExpired) {
  const {
    idleTimeout = 30 * 60 * 1000,
    maxDuration = 8 * 60 * 60 * 1000,
    keepAliveInterval = 60 * 1000,
    onIdle: onIdleCb = null,
    onExpired: onExpiredCb = null
  } = config;

  let idleTimer = null;
  let maxDurationTimer = null;
  let lastActivity = Date.now();
  let sessionStart = null;
  let isIdle = false;
  let throttleTimer = null;
  const listeners = [];

  function handleActivity() {
    const now = Date.now();
    // Throttle activity detection
    if (now - lastActivity < keepAliveInterval) return;
    lastActivity = now;

    if (isIdle) {
      isIdle = false;
      onIdle(false);
    }

    // Reset idle timer
    resetIdleTimer();
  }

  function resetIdleTimer() {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      isIdle = true;
      onIdle(true);
      if (typeof onIdleCb === 'function') {
        try { onIdleCb(); } catch (_) {}
      }
    }, idleTimeout);
  }

  function start() {
    sessionStart = Date.now();
    lastActivity = Date.now();
    isIdle = false;

    // Start idle timer
    resetIdleTimer();

    // Start max duration timer
    if (maxDuration > 0) {
      if (maxDurationTimer !== null) clearTimeout(maxDurationTimer);
      maxDurationTimer = setTimeout(() => {
        onExpired();
        if (typeof onExpiredCb === 'function') {
          try { onExpiredCb(); } catch (_) {}
        }
      }, maxDuration);
    }

    // Activity listeners
    if (typeof document !== 'undefined') {
      const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
      for (const event of events) {
        document.addEventListener(event, handleActivity, { passive: true });
        listeners.push({ event, handler: handleActivity });
      }
    }
  }

  function stop() {
    if (idleTimer !== null) { clearTimeout(idleTimer); idleTimer = null; }
    if (maxDurationTimer !== null) { clearTimeout(maxDurationTimer); maxDurationTimer = null; }
    if (throttleTimer !== null) { clearTimeout(throttleTimer); throttleTimer = null; }

    if (typeof document !== 'undefined') {
      for (const { event, handler } of listeners) {
        document.removeEventListener(event, handler);
      }
    }
    listeners.length = 0;
    sessionStart = null;
  }

  function getExpiresAt() {
    if (sessionStart === null) return null;
    return sessionStart + maxDuration;
  }

  function isSessionExpired() {
    if (sessionStart === null) return false;
    return Date.now() >= sessionStart + maxDuration;
  }

  function isSessionIdle() {
    return isIdle;
  }

  function manualResetIdle() {
    lastActivity = Date.now();
    isIdle = false;
    onIdle(false);
    resetIdleTimer();
  }

  return {
    start,
    stop,
    getExpiresAt,
    isSessionExpired,
    isSessionIdle,
    resetIdleTimer: manualResetIdle,
    destroy: stop
  };
}

// ─── Token Refresh Scheduler ─────────────────────────────────

function createRefreshScheduler(config, getToken, doRefresh) {
  const { refreshStrategy = 'sliding', refreshBuffer = 60 * 1000 } = config;
  let refreshTimer = null;

  function scheduleRefresh() {
    if (refreshTimer !== null) { clearTimeout(refreshTimer); refreshTimer = null; }

    const token = getToken();
    if (!token) return;

    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return;

    const expiresAt = decoded.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry <= 0) {
      // Already expired — refresh now
      doRefresh().then(scheduleRefresh).catch(() => {});
      return;
    }

    const refreshIn = Math.max(0, timeUntilExpiry - refreshBuffer);
    refreshTimer = setTimeout(() => {
      doRefresh().then(() => {
        if (refreshStrategy === 'sliding') scheduleRefresh();
      }).catch(() => {});
    }, refreshIn);
  }

  function stop() {
    if (refreshTimer !== null) { clearTimeout(refreshTimer); refreshTimer = null; }
  }

  return { scheduleRefresh, stop };
}

// ─── createEnterpriseAuth ────────────────────────────────────

/**
 * Create an enterprise auth instance with OIDC/PKCE, RBAC,
 * session management, and JWT inspection.
 *
 * Wraps createAuth() — all base auth properties are included.
 *
 * @param {{
 *   loginEndpoint?: string,
 *   refreshEndpoint?: string,
 *   logoutEndpoint?: string,
 *   tokenKey?: string,
 *   storage?: 'localStorage' | 'sessionStorage',
 *   onAuthChange?: (isAuthenticated: boolean) => void,
 *   oidc?: {
 *     provider: 'okta' | 'auth0' | 'azure' | 'keycloak' | 'generic',
 *     clientId: string,
 *     authority: string,
 *     redirectUri: string,
 *     scopes?: string[],
 *     postLogoutRedirectUri?: string,
 *   },
 *   roles?: {
 *     claimPath?: string,
 *     superRole?: string,
 *   },
 *   session?: {
 *     idleTimeout?: number,
 *     maxDuration?: number,
 *     keepAliveInterval?: number,
 *     onIdle?: () => void,
 *     onExpired?: () => void,
 *   },
 *   refreshStrategy?: 'sliding' | 'fixed',
 *   refreshBuffer?: number,
 * }} [config]
 * @returns {Object}
 */
export function createEnterpriseAuth(config = {}) {
  const {
    oidc: oidcConfig = null,
    roles: rolesConfig = {},
    session: sessionConfig = null,
    refreshStrategy = 'sliding',
    refreshBuffer = 60 * 1000,
    ...baseConfig
  } = config;

  // Create base auth
  const baseAuth = createAuth(baseConfig);

  // ── RBAC Signals ──
  const claimPath = rolesConfig.claimPath || 'roles';
  const superRole = rolesConfig.superRole || null;

  const decodedToken = createMemo(() => {
    const t = baseAuth.token();
    return decodeJWT(t);
  });

  const tokenExpiresAt = createMemo(() => {
    const decoded = decodedToken();
    if (!decoded || !decoded.exp) return null;
    return decoded.exp * 1000;
  });

  const isTokenExpired = createMemo(() => {
    const exp = tokenExpiresAt();
    if (exp === null) return false;
    return Date.now() >= exp;
  });

  const roles = createMemo(() => {
    const decoded = decodedToken();
    if (!decoded) return [];
    const value = getNestedValue(decoded, claimPath);
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  });

  function hasRole(role) {
    const r = roles();
    if (superRole && r.indexOf(superRole) !== -1) return true;
    return r.indexOf(role) !== -1;
  }

  function hasAnyRole(roleList) {
    if (!Array.isArray(roleList) || roleList.length === 0) return true;
    for (const role of roleList) {
      if (hasRole(role)) return true;
    }
    return false;
  }

  function hasAllRoles(roleList) {
    if (!Array.isArray(roleList) || roleList.length === 0) return true;
    for (const role of roleList) {
      if (!hasRole(role)) return false;
    }
    return true;
  }

  // ── Session Management ──
  const [sessionExpiresAt, setSessionExpiresAt] = createSignal(null);
  const [isSessionIdle, setIsSessionIdle] = createSignal(false);
  const [isSessionExpired, setIsSessionExpired] = createSignal(false);

  let sessionManager = null;
  if (sessionConfig) {
    sessionManager = createSessionManager(
      sessionConfig,
      (idle) => setIsSessionIdle(idle),
      () => {
        setIsSessionExpired(true);
        // Auto-logout on session expiry
        baseAuth.logout().catch(() => {});
      }
    );
  }

  // Start session when authenticated
  let sessionEffectDispose = null;
  if (sessionManager) {
    sessionEffectDispose = createEffect(() => {
      if (baseAuth.isAuthenticated()) {
        sessionManager.start();
        setSessionExpiresAt(sessionManager.getExpiresAt());
        setIsSessionExpired(false);
        setIsSessionIdle(false);
      } else {
        sessionManager.stop();
        setSessionExpiresAt(null);
        setIsSessionIdle(false);
      }
    });
  }

  // ── Token Refresh Scheduler ──
  const refreshScheduler = createRefreshScheduler(
    { refreshStrategy, refreshBuffer },
    baseAuth.token,
    baseAuth.refresh
  );

  // Schedule refresh when token changes
  let refreshEffectDispose = null;
  refreshEffectDispose = createEffect(() => {
    const t = baseAuth.token();
    if (t) {
      refreshScheduler.scheduleRefresh();
    } else {
      refreshScheduler.stop();
    }
  });

  // ── OIDC ──
  async function loginWithOIDC(providerOverride) {
    if (!oidcConfig) {
      throw new Error('OIDC not configured. Pass oidc config to createEnterpriseAuth().');
    }

    const provider = providerOverride || oidcConfig.provider || 'generic';
    const endpoints = PROVIDER_ENDPOINTS[provider] || PROVIDER_ENDPOINTS.generic;
    const authority = oidcConfig.authority.replace(/\/+$/, '');
    const scopes = oidcConfig.scopes || ['openid', 'profile', 'email'];

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store PKCE state in sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('decantr_oidc_verifier', codeVerifier);
      sessionStorage.setItem('decantr_oidc_state', state);
      sessionStorage.setItem('decantr_oidc_provider', provider);
    }

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oidcConfig.clientId,
      redirect_uri: oidcConfig.redirectUri,
      scope: scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authorizeUrl = `${authority}${endpoints.authorize}?${params.toString()}`;

    // Redirect to IdP
    if (typeof window !== 'undefined') {
      window.location.href = authorizeUrl;
    }
  }

  async function handleCallback() {
    if (!oidcConfig) {
      throw new Error('OIDC not configured.');
    }

    if (typeof window === 'undefined') {
      throw new Error('handleCallback requires a browser environment.');
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const returnedState = params.get('state');
    const error = params.get('error');

    if (error) {
      const description = params.get('error_description') || error;
      throw new Error(`OIDC error: ${description}`);
    }

    if (!code) {
      throw new Error('No authorization code found in callback URL.');
    }

    // Verify state
    const storedState = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('decantr_oidc_state')
      : null;
    if (storedState && returnedState !== storedState) {
      throw new Error('OIDC state mismatch — possible CSRF attack.');
    }

    // Retrieve PKCE verifier
    const codeVerifier = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('decantr_oidc_verifier')
      : null;
    const provider = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('decantr_oidc_provider')
      : 'generic';

    if (!codeVerifier) {
      throw new Error('Missing PKCE code verifier. Session may have been cleared.');
    }

    // Exchange code for tokens
    const endpoints = PROVIDER_ENDPOINTS[provider] || PROVIDER_ENDPOINTS.generic;
    const authority = oidcConfig.authority.replace(/\/+$/, '');
    const tokenUrl = `${authority}${endpoints.token}`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: oidcConfig.redirectUri,
      client_id: oidcConfig.clientId,
      code_verifier: codeVerifier
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => `Token exchange failed: ${res.status}`);
      throw new Error(`Token exchange failed: ${errText}`);
    }

    const data = await res.json();

    // Store tokens
    batch(() => {
      if (data.access_token) baseAuth.setToken(data.access_token);
      if (data.id_token) {
        const decoded = decodeJWT(data.id_token);
        if (decoded) baseAuth.setUser(decoded);
      }
    });

    // Clean up sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('decantr_oidc_verifier');
      sessionStorage.removeItem('decantr_oidc_state');
      sessionStorage.removeItem('decantr_oidc_provider');
    }

    // Clean up URL
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
  }

  // ── Destroy ──
  function destroy() {
    refreshScheduler.stop();
    if (sessionManager) sessionManager.destroy();
    if (typeof sessionEffectDispose === 'function') sessionEffectDispose();
    if (typeof refreshEffectDispose === 'function') refreshEffectDispose();
    baseAuth.destroy();
  }

  return {
    // Spread all base auth properties
    ...baseAuth,

    // OIDC
    loginWithOIDC,
    handleCallback,

    // RBAC
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Session
    sessionExpiresAt,
    isSessionExpired,
    isSessionIdle,
    resetIdleTimer: sessionManager ? sessionManager.resetIdleTimer : () => {},

    // Token inspection
    decodedToken,
    tokenExpiresAt,
    isTokenExpired,

    // Override destroy
    destroy
  };
}

// ─── requireRoles Route Guard ────────────────────────────────

/**
 * Create a route guard that checks for required roles.
 *
 * Usage:
 * ```js
 * const { guard } = requireRoles(auth, { forbiddenPath: '/403' });
 * const router = createRouter({ beforeEach: guard, routes: [...] });
 * ```
 *
 * Routes declare required roles via `meta.roles`:
 * ```js
 * { path: '/admin', component: Admin, meta: { roles: ['admin'] } }
 * ```
 *
 * @param {Object} auth — Enterprise auth instance (from createEnterpriseAuth)
 * @param {{ loginPath?: string, forbiddenPath?: string }} [options]
 * @returns {{ guard: (to: Object, from: Object) => string|void }}
 */
export function requireRoles(auth, options = {}) {
  const {
    loginPath = '/login',
    forbiddenPath = '/403'
  } = options;

  function guard(to, from) {
    const requiredRoles = to.meta && to.meta.roles;
    if (!requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return; // No role requirement
    }

    // Must be authenticated
    if (!auth.isAuthenticated()) {
      return loginPath;
    }

    // Must have at least one required role
    if (!auth.hasAnyRole(requiredRoles)) {
      return forbiddenPath;
    }
  }

  return { guard };
}
