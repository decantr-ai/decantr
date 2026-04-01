export interface NavigationStrategy {
  current(): string;
  push(path: string): void;
  replace(path: string): void;
  listen(callback: (path: string) => void): () => void;
}

export const hashStrategy: NavigationStrategy = {
  current() {
    return window.location.hash.slice(1) || '/';
  },
  push(path: string) {
    window.location.hash = '#' + path;
  },
  replace(path: string) {
    const url = window.location.pathname + window.location.search + '#' + path;
    window.history.replaceState(null, '', url);
  },
  listen(callback: (path: string) => void) {
    const handler = () => callback(hashStrategy.current());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }
};
