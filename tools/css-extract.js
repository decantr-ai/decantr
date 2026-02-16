import { atomMap } from '../src/css/atoms.js';

/**
 * @param {string} source
 * @returns {Set<string>}
 */
export function extractClassNames(source) {
  const classes = new Set();

  // Match css('...') calls
  const cssCallRegex = /css\(\s*(['"`])([\s\S]*?)\1/g;
  let match;
  while ((match = cssCallRegex.exec(source)) !== null) {
    const classStr = match[2];
    classStr.split(/\s+/).forEach(c => { if (c) classes.add(c); });
  }

  // Match class: '...' or class: "..." in h() props
  const classPropRegex = /class:\s*(['"])([\s\S]*?)\1/g;
  while ((match = classPropRegex.exec(source)) !== null) {
    const classStr = match[2];
    classStr.split(/\s+/).forEach(c => { if (c) classes.add(c); });
  }

  return classes;
}

/**
 * @param {Set<string>} classNames
 * @returns {string}
 */
export function generateCSS(classNames) {
  const rules = [];
  for (const name of classNames) {
    const decl = atomMap.get(name);
    if (decl) {
      rules.push(`.${name}{${decl}}`);
    }
  }
  return rules.join('\n');
}
