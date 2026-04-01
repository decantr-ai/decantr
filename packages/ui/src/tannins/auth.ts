/**
 * Decantr Auth Reference Tannin
 *
 * Provides token-based authentication with reactive signals,
 * persistent cross-tab token storage, auto-refresh on 401,
 * and a route guard helper.
 *
 * @module decantr/tannins/auth
 */

import { createSignal, createMemo, createEffect, batch } from '../state/index.js';
import { createPersisted } from '../data/persist.js';

export interface AuthConfig {
  loginEndpoint?: string;
  refreshEndpoint?: string;
  logoutEndpoint?: string;
  tokenKey?: string;
  storage?: 'localStorage' | 'sessionStorage';
  onAuthChange?: ((isAuthenticated: boolean) => void) | null;
}

export interface AuthInstance {
  user: () => any;
  token: () => string | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  error: () => any;
  login: (credentials: Record<string, any>) => Promise<any>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
  destroy: () => void;
}

/**
 * Create an auth instance with reactive signals, token persistence,
 * login/logout/refresh flows, and fetch middleware.
 *
 * @param {{
 *   loginEndpoint?: string,
 *   refreshEndpoint?: string,
 *   logoutEndpoint?: string,
 *   tokenKey?: string,
 *   storage?: 'localStorage' | 'sessionStorage',
 *   onAuthChange?: (isAuthenticated: boolean) => void
 * }} [config]
 * @returns {{
 *   user: () => any,
 *   token: () => string | null,
 *   isAuthenticated: () => boolean,
 *   isLoading: () => boolean,
 *   error: () => any,
 *   login: (credentials: Record<string, any>) => Promise<any>,
 *   logout: () => Promise<void>,
 *   refresh: () => Promise<void>,
 *   setUser: (user: any) => void,
 *   setToken: (token: string | null) => void,
 *   destroy: () => void
 * }}
 */
export function createAuth(config: AuthConfig = {}): AuthInstance {
  const {
    loginEndpoint = '/api/auth/login',
    refreshEndpoint = '/api/auth/refresh',
    logoutEndpoint = '/api/auth/logout',
    tokenKey = 'decantr_auth_token',
    storage = 'localStorage',
    onAuthChange = null
  } = config;

  // Persisted token signal — cross-tab sync via storage events
  const persistedStorage = storage === 'sessionStorage' ? 'session' : 'local';
  const [token, setTokenRaw] = createPersisted(tokenKey, null, { storage: persistedStorage });

  // User object signal (not persisted — re-fetched on refresh)
  const [user, setUser] = createSignal(null);

  // Loading state
  const [isLoading, setIsLoading] = createSignal(false);

  // Error state
  const [error, setError] = createSignal(null);

  // Derived: is authenticated when token exists
  const isAuthenticated = createMemo(() => token() !== null);

  // Track previous auth state for onAuthChange callback
  let prevAuth = isAuthenticated();
  let authChangeDispose = null;
  if (typeof onAuthChange === 'function') {
    authChangeDispose = createEffect(() => {
      const current = isAuthenticated();
      if (current !== prevAuth) {
        prevAuth = current;
        onAuthChange(current);
      }
    });
  }

  // Track whether a refresh is in progress (to avoid concurrent refreshes)
  let refreshPromise = null;

  // Store the original fetch so we can restore it on destroy
  const originalFetch = typeof globalThis !== 'undefined' ? globalThis.fetch : null;
  let middlewareInstalled = false;

  /**
   * Install fetch middleware that injects Bearer token and handles 401 auto-refresh.
   */
  function installMiddleware() {
    if (middlewareInstalled) return;
    if (typeof globalThis === 'undefined' || typeof globalThis.fetch !== 'function') return;

    const baseFetch = globalThis.fetch;
    middlewareInstalled = true;

    globalThis.fetch = async function authFetch(input, init) {
      const currentToken = token();
      const opts = { ...init };

      // Inject Bearer token if available
      if (currentToken) {
        opts.headers = new Headers(opts.headers || {});
        if (!opts.headers.has('Authorization')) {
          opts.headers.set('Authorization', `Bearer ${currentToken}`);
        }
      }

      let response;
      try {
        response = await baseFetch(input, opts);
      } catch (err) {
        throw err;
      }

      // On 401, attempt token refresh and retry once
      if (response.status === 401 && currentToken && refreshEndpoint) {
        try {
          await doRefresh(baseFetch);
          // Retry with new token
          const retryToken = token();
          if (retryToken) {
            const retryOpts = { ...init };
            retryOpts.headers = new Headers(retryOpts.headers || {});
            retryOpts.headers.set('Authorization', `Bearer ${retryToken}`);
            return baseFetch(input, retryOpts);
          }
        } catch (_) {
          // Refresh failed — return original 401 response
        }
      }

      return response;
    };
  }

  /**
   * Remove fetch middleware, restoring the original fetch.
   */
  function removeMiddleware() {
    if (!middlewareInstalled) return;
    if (typeof globalThis !== 'undefined' && originalFetch) {
      globalThis.fetch = originalFetch;
    }
    middlewareInstalled = false;
  }

  // Install middleware immediately
  installMiddleware();

  /**
   * Internal refresh using a specific fetch function (to avoid recursion through middleware).
   * @param {Function} fetchFn
   */
  async function doRefresh(fetchFn) {
    // Deduplicate concurrent refresh calls
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const currentToken = token();
      try {
        const res = await fetchFn(refreshEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
          }
        });
        if (!res.ok) {
          // Refresh failed — clear auth state
          batch(() => {
            setTokenRaw(null);
            setUser(null);
          });
          throw new Error(`Refresh failed: ${res.status}`);
        }
        const data = await res.json();
        batch(() => {
          if (data.token !== undefined) setTokenRaw(data.token);
          if (data.user !== undefined) setUser(data.user);
        });
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /**
   * Log in with credentials. POSTs to loginEndpoint.
   * Expects response JSON: { token: string, user?: any }
   * @param {Record<string, any>} credentials
   * @returns {Promise<any>} The response data
   */
  async function login(credentials) {
    setIsLoading(true);
    setError(null);
    try {
      // Use originalFetch (or the base fetch before middleware) to avoid injecting a stale token
      const fetchFn = originalFetch || globalThis.fetch;
      const res = await fetchFn(loginEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => `Login failed: ${res.status}`);
        let errData;
        try { errData = JSON.parse(errText); } catch (_) { errData = { message: errText }; }
        const loginError = new Error(errData.message || `Login failed: ${res.status}`);
        loginError.status = res.status;
        loginError.data = errData;
        setError(loginError);
        throw loginError;
      }
      const data = await res.json();
      batch(() => {
        if (data.token !== undefined) setTokenRaw(data.token);
        if (data.user !== undefined) setUser(data.user);
        setError(null);
      });
      return data;
    } catch (err) {
      if (!error()) setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Log out. Optionally POSTs to logoutEndpoint, then clears local state.
   * @returns {Promise<void>}
   */
  async function logout() {
    setIsLoading(true);
    setError(null);
    try {
      if (logoutEndpoint) {
        const currentToken = token();
        const fetchFn = originalFetch || globalThis.fetch;
        try {
          await fetchFn(logoutEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
            }
          });
        } catch (_) {
          // Best-effort — always clear local state even if server call fails
        }
      }
    } finally {
      batch(() => {
        setTokenRaw(null);
        setUser(null);
        setError(null);
      });
      setIsLoading(false);
    }
  }

  /**
   * Refresh the auth token. POSTs to refreshEndpoint.
   * Expects response JSON: { token: string, user?: any }
   * @returns {Promise<void>}
   */
  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const fetchFn = originalFetch || globalThis.fetch;
      await doRefresh(fetchFn);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Manually set the token (e.g., from an external auth provider).
   * @param {string | null} newToken
   */
  function setToken(newToken) {
    setTokenRaw(newToken);
  }

  /**
   * Clean up effects and remove fetch middleware.
   */
  function destroy() {
    removeMiddleware();
    if (typeof authChangeDispose === 'function') {
      authChangeDispose();
      authChangeDispose = null;
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refresh,
    setUser,
    setToken,
    destroy
  };
}

/**
 * Install a beforeEach route guard that redirects unauthenticated users.
 *
 * @param {Object} router — A Decantr router instance (from createRouter)
 * @param {{
 *   loginPath?: string,
 *   redirectParam?: string,
 *   isAuthenticated?: () => boolean
 * }} [options]
 */
export function requireAuth(router: any, options: { loginPath?: string; redirectParam?: string; isAuthenticated?: (() => boolean) | null } = {}): () => void {
  const {
    loginPath = '/login',
    redirectParam = 'redirect',
    isAuthenticated = null
  } = options;

  if (!router || typeof router.onNavigate !== 'function') {
    throw new Error('requireAuth expects a Decantr router instance');
  }

  // We use onNavigate + navigate pattern since the router's beforeEach
  // is set at construction time. This guard intercepts navigations by
  // hooking into the router's existing lifecycle.
  // However, if the router exposes a _beforeEach slot, we can use it.
  // Since createRouter accepts beforeEach in config, and we want to add
  // a guard post-construction, we store a reference and use onNavigate
  // to redirect after the fact.

  // The most reliable approach: override the navigate function to add a check
  const originalNavigate = router.navigate;
  const routerCurrent = router.current;

  router.navigate = function guardedNavigate(to, opts) {
    // Resolve the target path
    let targetPath;
    if (typeof to === 'object' && to.name) {
      // Named route — let the original resolve it; we need the path
      // For named routes, we can't easily pre-check, so navigate and check via onNavigate
      return originalNavigate(to, opts);
    }
    targetPath = typeof to === 'string' ? to : '/';

    // Skip guard for the login page itself
    if (targetPath === loginPath || targetPath.startsWith(loginPath + '?') || targetPath.startsWith(loginPath + '/')) {
      return originalNavigate(to, opts);
    }

    // Check authentication
    const authCheck = typeof isAuthenticated === 'function' ? isAuthenticated : null;
    if (authCheck && !authCheck()) {
      const redirectTo = loginPath + (redirectParam ? `?${redirectParam}=${encodeURIComponent(targetPath)}` : '');
      return originalNavigate(redirectTo, { replace: true });
    }

    return originalNavigate(to, opts);
  };

  // Also handle initial navigation and popstate-driven navigation via onNavigate
  const unsubscribe = router.onNavigate((to) => {
    const authCheck = typeof isAuthenticated === 'function' ? isAuthenticated : null;
    if (!authCheck) return;

    // Skip if already on login page
    if (to.path === loginPath || to.path.startsWith(loginPath + '/')) return;

    // If not authenticated, redirect to login
    if (!authCheck()) {
      const redirectTo = loginPath + (redirectParam ? `?${redirectParam}=${encodeURIComponent(to.path)}` : '');
      // Use setTimeout to avoid navigating during a navigation callback
      setTimeout(() => originalNavigate(redirectTo, { replace: true }), 0);
    }
  });

  // Return a cleanup function
  return function removeGuard() {
    router.navigate = originalNavigate;
    unsubscribe();
  };
}
