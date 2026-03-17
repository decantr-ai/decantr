/**
 * Path prefix for explorer navigation within the docs site.
 * All explorer routes live under /explorer.
 */
let _prefix = '/explorer';

export function setPathPrefix(prefix) {
  _prefix = prefix;
}

export function getPathPrefix() {
  return _prefix;
}

export function wbPath(path) {
  return _prefix + path;
}
