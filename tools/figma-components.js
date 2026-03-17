/**
 * Figma Component Specification Export.
 * Reads the component registry, computes variant matrices,
 * renders each variant via Playwright, and outputs Figma-compatible
 * component specifications.
 *
 * @module figma-components
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRenderPage, extractionScript, toFigmaNodeSpec } from './figma-render.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryPath = resolve(__dirname, '..', 'src', 'registry', 'components.json');

// ============================================================
// Variant Matrix Computation
// ============================================================

/** Known variant props and their meaningful values */
const VARIANT_PROPS = {
  variant: null,  // Values come from registry showcase
  size: ['xs', 'sm', 'md', 'lg'],
  disabled: [false, true],
  loading: [false, true],
  checked: [false, true],
  open: [false, true],
  active: [false, true],
  orientation: ['horizontal', 'vertical'],
  placement: ['top', 'right', 'bottom', 'left'],
};

/**
 * Compute meaningful variant combinations for a component.
 * Uses showcase.sections to limit to meaningful combos, not full permutations.
 * @param {string} name - Component name
 * @param {Object} spec - Component spec from registry
 * @returns {Object[]} Array of prop combinations to render
 */
function computeVariantMatrix(name, spec) {
  const combos = [];
  const defaults = spec.showcase?.defaults || {};
  const props = spec.props || {};

  // Extract variant values from props
  const variantValues = {};
  for (const [propName, propDef] of Object.entries(props)) {
    if (VARIANT_PROPS[propName] !== undefined) {
      if (propDef.type?.includes('|')) {
        // Union type like "'primary' | 'secondary' | ..."
        const values = propDef.type
          .split('|')
          .map(s => s.trim().replace(/^'|'$/g, ''))
          .filter(s => s && s !== 'undefined');
        if (values.length > 0) variantValues[propName] = values;
      } else if (VARIANT_PROPS[propName]) {
        variantValues[propName] = VARIANT_PROPS[propName];
      }
    }
  }

  // Determine the primary variant axis (usually 'variant')
  const primaryAxis = variantValues.variant ? 'variant' : null;
  const sizeAxis = variantValues.size ? 'size' : null;

  // Generate combos: primary axis × size × states
  const baseProps = { ...defaults };

  if (primaryAxis) {
    for (const variant of variantValues[primaryAxis]) {
      if (sizeAxis) {
        for (const size of variantValues[sizeAxis]) {
          // Default state
          combos.push({ ...baseProps, [primaryAxis]: variant, size });
          // Disabled state
          if (props.disabled) {
            combos.push({ ...baseProps, [primaryAxis]: variant, size, disabled: true });
          }
          // Loading state
          if (props.loading) {
            combos.push({ ...baseProps, [primaryAxis]: variant, size, loading: true });
          }
        }
      } else {
        combos.push({ ...baseProps, [primaryAxis]: variant });
        if (props.disabled) {
          combos.push({ ...baseProps, [primaryAxis]: variant, disabled: true });
        }
      }
    }
  } else if (sizeAxis) {
    for (const size of variantValues[sizeAxis]) {
      combos.push({ ...baseProps, size });
    }
  } else {
    // No variant axes — just render with defaults
    combos.push({ ...baseProps });
  }

  // Cap at 100 combos to prevent explosion
  return combos.slice(0, 100);
}

/**
 * Build Figma Component Set specification from a component's variant matrix.
 * @param {string} name - Component name
 * @param {Object} spec - Component spec from registry
 * @param {Object[]} renderedVariants - Rendered variant data
 * @returns {Object} Figma Component Set specification
 */
function buildComponentSet(name, spec, renderedVariants) {
  // Identify variant properties from rendered combos
  const properties = {};
  for (const variant of renderedVariants) {
    if (!variant.props) continue;
    for (const [key, val] of Object.entries(variant.props)) {
      if (VARIANT_PROPS[key] !== undefined && val != null) {
        if (!properties[key]) properties[key] = new Set();
        properties[key].add(String(val));
      }
    }
  }

  // Convert Sets to arrays
  const propertyDefs = {};
  for (const [key, values] of Object.entries(properties)) {
    propertyDefs[key] = {
      type: values.size <= 2 && [...values].every(v => v === 'true' || v === 'false')
        ? 'BOOLEAN'
        : 'VARIANT',
      values: [...values],
    };
  }

  return {
    type: 'COMPONENT_SET',
    name,
    description: spec.description || '',
    properties: propertyDefs,
    variants: renderedVariants.map(v => ({
      type: 'COMPONENT',
      name: formatVariantName(v.props),
      node: v.node,
    })),
    subComponents: extractSubComponents(name, spec),
  };
}

function formatVariantName(props) {
  const parts = [];
  if (props.variant) parts.push(`variant=${props.variant}`);
  if (props.size) parts.push(`size=${props.size}`);
  if (props.disabled) parts.push('state=disabled');
  else if (props.loading) parts.push('state=loading');
  else parts.push('state=default');
  return parts.join(', ');
}

/**
 * Extract sub-component definitions (e.g. Card.Header, Card.Body).
 */
function extractSubComponents(name, spec) {
  const subs = [];
  if (spec.subComponents) {
    for (const [subName, subSpec] of Object.entries(spec.subComponents)) {
      subs.push({
        name: `${name}.${subName}`,
        description: subSpec.description || '',
        props: subSpec.props || {},
      });
    }
  }
  return subs;
}

// ============================================================
// Main Pipeline
// ============================================================

/**
 * Generate Figma component specifications.
 * @param {Object} opts
 * @param {string} [opts.style='auradecantism'] - Style for rendering
 * @param {string} [opts.mode='dark'] - Mode for rendering
 * @param {string} [opts.output] - Output path
 * @param {boolean} [opts.dryRun=false] - Print stats without rendering
 * @param {boolean} [opts.noRender=false] - Skip Playwright rendering (output specs only)
 * @param {string} [opts.cwd] - Working directory
 * @returns {Promise<{ components: number, variants: number, file: string }>}
 */
export async function generateFigmaComponents(opts = {}) {
  const {
    style = 'auradecantism',
    mode = 'dark',
    output: outputPath,
    'dry-run': dryRun = false,
    dryRun: dryRunAlt = false,
    'no-render': noRender = false,
    noRender: noRenderAlt = false,
    cwd = process.cwd(),
  } = opts;

  const isDryRun = dryRun || dryRunAlt;
  const skipRender = noRender || noRenderAlt;
  const outFile = outputPath
    ? resolve(cwd, outputPath)
    : join(cwd, 'dist', 'figma', 'components.json');

  // Load component registry
  const registry = JSON.parse(await readFile(registryPath, 'utf-8'));
  const components = registry.components || {};

  // Compute variant matrices
  const allSpecs = [];
  let totalVariants = 0;

  for (const [name, spec] of Object.entries(components)) {
    const matrix = computeVariantMatrix(name, spec);
    totalVariants += matrix.length;
    allSpecs.push({ name, spec, matrix });
  }

  if (isDryRun) {
    return {
      components: allSpecs.length,
      variants: totalVariants,
      breakdown: allSpecs.map(s => ({
        name: s.name,
        variantCount: s.matrix.length,
      })),
    };
  }

  // Render variants via Playwright (or generate specs only)
  const output = {
    $schema: 'https://decantr.ai/schemas/figma-components.v1.json',
    style,
    mode,
    generatedAt: new Date().toISOString(),
    componentSets: [],
  };

  if (skipRender) {
    // Specs-only mode — no Playwright needed
    for (const { name, spec, matrix } of allSpecs) {
      const renderedVariants = matrix.map(props => ({
        props,
        node: {
          type: 'FRAME',
          name: formatVariantName(props),
          layoutMode: 'HORIZONTAL',
          // Placeholder dimensions — would be filled by Playwright
          absoluteRenderBounds: { width: 0, height: 0 },
          children: [],
        },
      }));

      output.componentSets.push(buildComponentSet(name, spec, renderedVariants));
    }
  } else {
    // Full render pipeline
    let playwright;
    try {
      playwright = await import('playwright');
    } catch {
      throw new Error(
        'Playwright is required for component rendering.\n' +
        'Install it: npm install -D playwright\n' +
        'Or use --no-render to skip rendering and export specs only.'
      );
    }

    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    try {
      const page = await context.newPage();

      // Serve the framework source via a local file URL
      const htmlContent = createRenderPage(style, mode);
      // We need a proper server for ES module imports
      // Use a data URL approach or a local server
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });

      // Wait for framework to initialize
      await page.waitForFunction('window.__READY__', { timeout: 10000 }).catch(() => {
        throw new Error('Decantr framework failed to initialize in headless browser');
      });

      for (const { name, spec, matrix } of allSpecs) {
        const renderedVariants = [];

        for (const props of matrix) {
          const { script, componentName } = extractionScript(name, props);
          try {
            const data = await page.evaluate(
              new Function('return ' + script)(),
              { componentName, props }
            );
            const node = toFigmaNodeSpec(data);
            renderedVariants.push({ props, node });
          } catch (e) {
            // Component render failed — include placeholder
            renderedVariants.push({
              props,
              node: { type: 'FRAME', name: formatVariantName(props), error: e.message },
            });
          }
        }

        output.componentSets.push(buildComponentSet(name, spec, renderedVariants));
      }
    } finally {
      await browser.close();
    }
  }

  // Write output
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(output, null, 2));

  return {
    components: output.componentSets.length,
    variants: totalVariants,
    file: outFile,
  };
}
