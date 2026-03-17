/**
 * Shared path prefix for workbench navigation.
 * When embedded in the docs site at /workbench, call setPathPrefix('/workbench').
 * Default is '' (empty string) for standalone workbench use.
 */
let _prefix = '';

export function setPathPrefix(prefix) {
  _prefix = prefix;
}

export function getPathPrefix() {
  return _prefix;
}

/**
 * Prepend the current path prefix to a path.
 * e.g. wbPath('/components') → '/workbench/components' when prefix is '/workbench'
 */
export function wbPath(path) {
  return _prefix + path;
}
