const { localCopy } = require('./local-copy.js');

export async function loadLazyWidget() {
  return import('./lazy-widget.jsx');
}

export function App() {
  return <main data-state="ready">{localCopy}</main>;
}
