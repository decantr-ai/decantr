/**
 * CSS class name audit — validates consistency across component source,
 * _base.js (structural CSS), and components.js (visual CSS).
 *
 * Prevents class name mismatches where CSS rules exist but target the wrong
 * selector, causing panels to render without background/border/shadow.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '..', 'src');

function readSrc(relPath) {
  return readFileSync(join(src, relPath), 'utf-8');
}

/**
 * Extract CSS class names from a CSS-in-JS string array file.
 * Matches patterns like '.d-foo-bar{...' inside string literals.
 */
function extractCSSClasses(source) {
  const classes = new Set();
  const re = /'\.(d-[\w-]+)\{/g;
  let m;
  while ((m = re.exec(source)) !== null) classes.add(m[1]);
  return classes;
}

/**
 * Extract floating panel classes from _base.js — rules with position:absolute
 * AND z-index using a panel-level token (dropdown, popover, tooltip, modal, toast).
 * This excludes positioned elements like badges and watermarks that use raw z-index.
 */
function extractFloatingPanels(baseSource) {
  const panels = new Set();
  const re = /'\.(d-[\w-]+)\{([^']*)'/g;
  let m;
  while ((m = re.exec(baseSource)) !== null) {
    const props = m[2];
    if (props.includes('position:absolute') &&
        /z-index:var\(--d-z-(dropdown|popover|tooltip|modal|toast)/.test(props)) {
      panels.add(m[1]);
    }
  }
  return panels;
}

/**
 * Extract classes from components.js that define visual panel properties
 * (background + border or box-shadow).
 */
function extractVisualPanelClasses(vizSource) {
  const panels = new Set();
  const re = /'\.(d-[\w-]+)\{([^']*)'/g;
  let m;
  while ((m = re.exec(vizSource)) !== null) {
    const props = m[2];
    if (props.includes('background') && (props.includes('border') || props.includes('box-shadow'))) {
      panels.add(m[1]);
    }
  }
  return panels;
}

/**
 * Extract d-* class names used in component source files (the ground truth).
 * Matches: class: 'd-foo', class: cx('d-foo', ...), class: 'd-foo d-bar'
 */
function extractComponentClasses() {
  const classes = new Set();
  const compDir = join(src, 'components');
  const skip = new Set(['_base.js', '_behaviors.js', 'index.js']);
  const files = readdirSync(compDir).filter(f => f.endsWith('.js') && !skip.has(f));

  for (const file of files) {
    const source = readFileSync(join(compDir, file), 'utf-8');
    // Match class: 'd-*' patterns (single-quoted or in cx())
    const re = /(?:class:\s*(?:cx\()?['"])(d-[\w-]+)/g;
    let m;
    while ((m = re.exec(source)) !== null) classes.add(m[1]);
  }
  return classes;
}

describe('CSS class name audit', () => {
  const baseSource = readSrc('components/_base.js');
  const vizSource = readSrc('css/components.js');

  const floatingPanels = extractFloatingPanels(baseSource);
  const vizPanelClasses = extractVisualPanelClasses(vizSource);
  const componentClasses = extractComponentClasses();

  // Known exceptions — structural elements that intentionally lack full visual CSS
  // (e.g., they inherit from parent, or are styled differently by design)
  const visualExceptions = new Set([
    'd-datatable-filter-popup', // visual CSS in components.js uses different property combo
  ]);

  it('every floating panel in _base.js has visual CSS in components.js', () => {
    const missing = [];
    for (const cls of floatingPanels) {
      if (visualExceptions.has(cls)) continue;
      if (!vizPanelClasses.has(cls)) {
        missing.push(cls);
      }
    }
    assert.deepStrictEqual(
      missing, [],
      `Floating panels in _base.js missing visual CSS in components.js:\n` +
      missing.map(c => `  .${c} — has structural CSS but no visual (background/border/shadow) in components.js`).join('\n')
    );
  });

  it('every floating panel class in _base.js is used by a component source file', () => {
    const orphans = [];
    for (const cls of floatingPanels) {
      if (!componentClasses.has(cls)) {
        orphans.push(cls);
      }
    }
    assert.deepStrictEqual(
      orphans, [],
      `Floating panel classes in _base.js not found in any component source:\n` +
      orphans.map(c => `  .${c} — CSS rule exists but no component renders this class`).join('\n')
    );
  });

  it('no themed visual CSS on floating panels duplicated between _base.js and components.js', () => {
    // Only check floating panels for visual CSS duplication.
    // _base.js legitimately uses background:none/border:none resets on non-panel elements.
    // The real bug is when a floating panel has themed visual CSS (var() tokens) in _base.js
    // that should only exist in components.js.
    const dupes = [];
    const re = /'\.(d-[\w-]+)\{([^']*)'/g;
    let m;
    while ((m = re.exec(baseSource)) !== null) {
      const cls = m[1];
      const props = m[2];
      // Only flag floating panels that have themed background + border/shadow in _base.js
      if (floatingPanels.has(cls) &&
          props.includes('background:var(') &&
          (props.includes('box-shadow:var(') || props.includes('border:') && props.includes('var('))) {
        dupes.push(cls);
      }
    }
    assert.deepStrictEqual(
      dupes, [],
      `Floating panels with themed visual CSS in _base.js (should be in components.js only):\n` +
      dupes.map(c => `  .${c} — has background/border/shadow with var() tokens in _base.js`).join('\n')
    );
  });
});
