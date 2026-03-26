/**
 * CORS middleware for CLI + browser access.
 */

export function corsMiddleware() {
  return async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent');
    c.header('Access-Control-Max-Age', '86400');

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  };
}
