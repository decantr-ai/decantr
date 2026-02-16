export const historyStrategy = {
  current() {
    return window.location.pathname;
  },
  push(path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('popstate'));
  },
  replace(path) {
    window.history.replaceState(null, '', path);
    window.dispatchEvent(new Event('popstate'));
  },
  listen(callback) {
    const handler = () => callback(historyStrategy.current());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }
};
