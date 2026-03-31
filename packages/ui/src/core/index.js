// Re-export from runtime — core/ is an alias for runtime/
export {
  h, text, cond, list, mount, unmount,
  onMount, onDestroy, onCleanup,
  component, disposeNode,
  Show, For,
  setErrorHandler, _getErrorHandler,
  ErrorBoundary, Portal, Suspense, Transition,
  forwardRef, _pendingQueries, _getBoundaryHandler,
} from '../runtime/index.js';
