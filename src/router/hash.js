export const hashStrategy = {
  current() {
    return window.location.hash.slice(1) || '/';
  },
  push(path) {
    window.location.hash = '#' + path;
  },
  replace(path) {
    const url = window.location.pathname + window.location.search + '#' + path;
    window.history.replaceState(null, '', url);
  },
  listen(callback) {
    const handler = () => callback(hashStrategy.current());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }
};
