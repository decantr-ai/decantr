/**
 * Global error handler — catches unhandled errors and returns 500.
 */

export function errorHandler() {
  return async (c, next) => {
    try {
      await next();
    } catch (err) {
      console.error('[ERROR]', err.message, err.stack);
      return c.json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
      }, 500);
    }
  };
}
