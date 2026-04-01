import type { NavigationStrategy } from './hash.js';

export const historyStrategy: NavigationStrategy = {
  current() {
    return window.location.pathname;
  },
  push(path: string) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('popstate'));
  },
  replace(path: string) {
    window.history.replaceState(null, '', path);
    window.dispatchEvent(new Event('popstate'));
  },
  listen(callback: (path: string) => void) {
    const handler = () => callback(historyStrategy.current());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }
};
