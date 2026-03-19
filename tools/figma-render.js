/**
 * Headless browser orchestration for component rendering.
 * Uses Playwright to mount Decantr components in a minimal page
 * and extract computed styles and DOM structure.
 *
 * @module figma-render
 */

import { resolve, dirname, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkSrc = resolve(__dirname, '..', 'src');

/**
 * Create a minimal HTML page with Decantr CSS injected.
 * @param {string} styleId - Style to apply
 * @param {string} mode - 'light' or 'dark'
 * @returns {string} HTML content
 */
const ADDON_STYLE_IMPORTS = {
  'clean': { varName: 'clean', file: 'clean.js' },
  'retro': { varName: 'retro', file: 'retro.js' },
  'glassmorphism': { varName: 'glassmorphism', file: 'glassmorphism.js' },
  'launchpad': { varName: 'launchpad', file: 'launchpad.js' },
  'liquid-glass': { varName: 'liquidGlass', file: 'liquid-glass.js' },
  'dopamine': { varName: 'dopamine', file: 'dopamine.js' },
  'prismatic': { varName: 'prismatic', file: 'prismatic.js' },
  'bioluminescent': { varName: 'bioluminescent', file: 'bioluminescent.js' },
  'editorial': { varName: 'editorial', file: 'editorial.js' },
};

export function createRenderPage(styleId, mode) {
  const addon = ADDON_STYLE_IMPORTS[styleId];
  const addonImport = addon
    ? `\n    import { ${addon.varName} } from './src/css/styles/addons/${addon.file}';`
    : '';
  const addonRegister = addon
    ? `\n    registerStyle(${addon.varName});`
    : '';
  const cssImports = addon
    ? `setStyle, setMode, registerStyle, css`
    : `setStyle, setMode, css`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { ${cssImports} } from './src/css/index.js';
    import * as components from './src/components/index.js';
    import { h, text, mount } from './src/core/index.js';
    import { tags } from './src/tags.js';${addonImport}
${addonRegister}
    setStyle('${styleId}');
    setMode('${mode}');

    // Expose globals for Playwright to call
    window.__DECANTR__ = { components, h, text, mount, tags, css };
    window.__READY__ = true;
  </script>
</body>
</html>`;
}

/**
 * Extract computed styles from a rendered component.
 * Runs inside the browser context via Playwright's evaluate().
 * @param {string} componentName - Component function name
 * @param {Object} props - Component props
 * @returns {Object} Computed style extraction script (for page.evaluate)
 */
export function extractionScript(componentName, props) {
  return {
    componentName,
    props,
    script: `
      async (args) => {
        const { componentName, props } = args;
        const { components, h, text, mount, tags } = window.__DECANTR__;
        const Component = components[componentName];
        if (!Component) return { error: 'Component not found: ' + componentName };

        const root = document.getElementById('root');
        root.innerHTML = '';

        let el;
        try {
          el = Component(props);
          root.appendChild(el);
        } catch (e) {
          return { error: e.message };
        }

        // Wait for any async rendering
        await new Promise(r => setTimeout(r, 50));

        // Extract computed styles
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        const styles = {
          width: rect.width,
          height: rect.height,
          paddingTop: parseFloat(cs.paddingTop) || 0,
          paddingRight: parseFloat(cs.paddingRight) || 0,
          paddingBottom: parseFloat(cs.paddingBottom) || 0,
          paddingLeft: parseFloat(cs.paddingLeft) || 0,
          marginTop: parseFloat(cs.marginTop) || 0,
          marginRight: parseFloat(cs.marginRight) || 0,
          marginBottom: parseFloat(cs.marginBottom) || 0,
          marginLeft: parseFloat(cs.marginLeft) || 0,
          borderRadius: cs.borderRadius,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          fontSize: parseFloat(cs.fontSize) || 14,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
          lineHeight: parseFloat(cs.lineHeight) || 0,
          display: cs.display,
          flexDirection: cs.flexDirection,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent,
          gap: parseFloat(cs.gap) || 0,
          borderWidth: parseFloat(cs.borderWidth) || 0,
          borderColor: cs.borderColor,
          borderStyle: cs.borderStyle,
          boxShadow: cs.boxShadow,
          opacity: parseFloat(cs.opacity) || 1,
        };

        // Extract DOM structure (1 level deep)
        const children = [];
        for (const child of el.children) {
          const ccs = window.getComputedStyle(child);
          const crect = child.getBoundingClientRect();
          children.push({
            tag: child.tagName.toLowerCase(),
            className: child.className,
            textContent: child.textContent?.slice(0, 100),
            width: crect.width,
            height: crect.height,
            display: ccs.display,
            fontSize: parseFloat(ccs.fontSize) || 0,
            color: ccs.color,
            backgroundColor: ccs.backgroundColor,
          });
        }

        // Clean up
        root.innerHTML = '';

        return {
          componentName,
          props,
          styles,
          children,
          childCount: children.length,
          tagName: el.tagName.toLowerCase(),
        };
      }
    `,
  };
}

/**
 * Convert extracted component data to Figma-compatible node spec.
 * @param {Object} data - Extracted component data from extractionScript
 * @returns {Object} Figma node specification
 */
export function toFigmaNodeSpec(data) {
  if (data.error) return { error: data.error };

  const { styles, children, componentName, props } = data;

  // Determine layout mode from display/flexDirection
  let layoutMode = 'NONE';
  if (styles.display === 'flex') {
    layoutMode = styles.flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';
  } else if (styles.display === 'grid') {
    layoutMode = 'HORIZONTAL'; // Figma approximation
  }

  // Map alignment
  const primaryAxisAlign = mapAlignment(styles.justifyContent);
  const counterAxisAlign = mapAlignment(styles.alignItems);

  const node = {
    type: 'FRAME',
    name: formatComponentName(componentName, props),
    layoutMode,
    primaryAxisAlignItems: primaryAxisAlign,
    counterAxisAlignItems: counterAxisAlign,
    primaryAxisSizingMode: 'AUTO',
    counterAxisSizingMode: 'AUTO',
    paddingTop: styles.paddingTop,
    paddingRight: styles.paddingRight,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    itemSpacing: styles.gap,
    cornerRadius: parseCornerRadius(styles.borderRadius),
    fills: styles.backgroundColor !== 'rgba(0, 0, 0, 0)'
      ? [{ type: 'SOLID', color: cssColorToFigma(styles.backgroundColor) }]
      : [],
    strokes: styles.borderWidth > 0
      ? [{ type: 'SOLID', color: cssColorToFigma(styles.borderColor) }]
      : [],
    strokeWeight: styles.borderWidth,
    effects: parseShadowEffects(styles.boxShadow),
    opacity: styles.opacity,
    // Size hints for absolute positioning
    absoluteRenderBounds: {
      width: styles.width,
      height: styles.height,
    },
    children: children.map(child => ({
      type: child.tag === 'span' || child.tag === 'p' || child.tag === 'h1' || child.tag === 'h2' || child.tag === 'h3' || child.tag === 'label'
        ? 'TEXT'
        : 'FRAME',
      name: child.className?.split(' ')[0] || child.tag,
      characters: child.textContent || '',
      fontSize: child.fontSize,
      fills: child.color && child.color !== 'rgba(0, 0, 0, 0)'
        ? [{ type: 'SOLID', color: cssColorToFigma(child.color) }]
        : [],
      absoluteRenderBounds: {
        width: child.width,
        height: child.height,
      },
    })),
  };

  return node;
}

// ============================================================
// Helpers
// ============================================================

function mapAlignment(css) {
  switch (css) {
    case 'center': return 'CENTER';
    case 'flex-end':
    case 'end': return 'MAX';
    case 'space-between': return 'SPACE_BETWEEN';
    case 'flex-start':
    case 'start':
    default: return 'MIN';
  }
}

function formatComponentName(name, props) {
  const parts = [name];
  if (props.variant) parts.push(props.variant);
  if (props.size) parts.push(props.size);
  return parts.join('/');
}

function parseCornerRadius(br) {
  if (!br || br === '0px') return 0;
  const val = parseFloat(br);
  return isNaN(val) ? 0 : val;
}

function cssColorToFigma(cssColor) {
  if (!cssColor) return { r: 0, g: 0, b: 0, a: 0 };
  const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) {
    return {
      r: parseInt(m[1]) / 255,
      g: parseInt(m[2]) / 255,
      b: parseInt(m[3]) / 255,
      a: m[4] != null ? parseFloat(m[4]) : 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function parseShadowEffects(boxShadow) {
  if (!boxShadow || boxShadow === 'none') return [];
  // Simplified — just flag that shadow exists
  return [{ type: 'DROP_SHADOW', visible: true }];
}
