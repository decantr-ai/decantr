/**
 * Figma Token Export — DTCG & Figma REST API format generator.
 * Reads all style definitions, runs derive() for each style × mode,
 * classifies ~340 tokens into W3C DTCG types, and writes JSON files.
 *
 * @module figma-tokens
 */

import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stylesDir = resolve(__dirname, '..', 'src', 'css', 'styles');

// ============================================================
// Style Discovery
// ============================================================

/**
 * Dynamically import all style definitions from src/css/styles/.
 * Each file must export a default-shaped object with { id, name, seed, personality, ... }.
 * @returns {Promise<Object[]>} Array of style definitions
 */
async function loadStyles(filter) {
  const files = await readdir(stylesDir);
  const jsFiles = files.filter(f => f.endsWith('.js')).sort();
  const styles = [];

  for (const file of jsFiles) {
    const mod = await import(join(stylesDir, file));
    // Each style file exports a named const (e.g. `export const auradecantism = { ... }`)
    const style = Object.values(mod).find(v => v && typeof v === 'object' && v.id && v.seed);
    if (!style) continue;
    if (filter && filter !== 'all' && style.id !== filter) continue;
    styles.push(style);
  }

  return styles;
}

// ============================================================
// Token Type Classification (W3C DTCG)
// ============================================================

const VAR_REF_RE = /^var\(--d-([^)]+)\)$/;
const RGBA_RE = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const REM_RE = /^-?[\d.]+rem$/;
const PX_RE = /^-?[\d.]+px$/;
const PERCENT_RE = /^-?[\d.]+%$/;
const DURATION_RE = /^[\d.]+m?s$/;
const CUBIC_BEZIER_RE = /^cubic-bezier\(([\d.,-\s]+)\)$/;
const BOX_SHADOW_RE = /^(?:inset\s+)?-?[\d.]+(?:px)?\s+-?[\d.]+(?:px)?\s+[\d.]+(?:px)?/;
const LINEAR_GRADIENT_RE = /^linear-gradient\(/;
const BLUR_RE = /^blur\([\d.]+px\)$/;
const FONT_FAMILY_RE = /^(system-ui|ui-monospace|[A-Z"'])/;
const NUMBER_RE = /^[\d.]+$/;

/**
 * Classify a single token value into its DTCG $type.
 * @param {string} name - CSS custom property name (e.g. '--d-primary')
 * @param {string} value - Token value
 * @returns {{ type: string, value: any }} DTCG type and normalized value
 */
function classifyToken(name, value) {
  if (typeof value !== 'string') {
    return { type: 'string', value: String(value) };
  }

  // var() references → DTCG alias
  const varMatch = value.match(VAR_REF_RE);
  if (varMatch) {
    const refPath = tokenNameToPath(varMatch[1]);
    return { type: 'alias', value: `{${refPath}}` };
  }

  // Compound var() references (e.g. "var(--d-duration-normal) var(--d-easing-decelerate)")
  if (value.includes('var(--d-') && !varMatch) {
    return { type: 'string', value };
  }

  // Hex colors
  if (HEX_RE.test(value)) {
    return { type: 'color', value };
  }

  // rgba() colors
  const rgbaMatch = value.match(RGBA_RE);
  if (rgbaMatch) {
    const hex = rgbaToHex(
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      rgbaMatch[4] != null ? parseFloat(rgbaMatch[4]) : 1
    );
    return { type: 'color', value: hex };
  }

  // Box shadows (before dimension check — shadows contain px values)
  if (BOX_SHADOW_RE.test(value)) {
    return { type: 'shadow', value: parseShadow(value) };
  }

  // Linear gradients
  if (LINEAR_GRADIENT_RE.test(value)) {
    return { type: 'gradient', value: parseGradient(value) };
  }

  // Blur values
  if (BLUR_RE.test(value)) {
    return { type: 'string', value };
  }

  // Dimensions (rem/px/%)
  if (REM_RE.test(value) || PX_RE.test(value) || PERCENT_RE.test(value)) {
    return { type: 'dimension', value };
  }

  // Duration (ms/s)
  if (DURATION_RE.test(value)) {
    return { type: 'duration', value };
  }

  // Cubic bezier
  const bezierMatch = value.match(CUBIC_BEZIER_RE);
  if (bezierMatch) {
    const parts = bezierMatch[1].split(',').map(s => parseFloat(s.trim()));
    return { type: 'cubicBezier', value: parts };
  }

  // Font families (heuristic: starts with system-ui, ui-monospace, or quoted name)
  if (FONT_FAMILY_RE.test(value) && value.includes(',')) {
    return { type: 'fontFamily', value };
  }

  // Font weights / line heights / opacity / z-index (bare numbers)
  if (NUMBER_RE.test(value)) {
    if (name.includes('fw-') || name.includes('weight')) {
      return { type: 'fontWeight', value: parseFloat(value) };
    }
    if (name.includes('lh-')) {
      return { type: 'number', value: parseFloat(value) };
    }
    if (name.includes('opacity')) {
      return { type: 'number', value: parseFloat(value) };
    }
    if (name.includes('-z-')) {
      return { type: 'number', value: parseInt(value) };
    }
    return { type: 'number', value: parseFloat(value) };
  }

  // Letter spacing (e.g. '-0.025em')
  if (/^-?[\d.]+em$/.test(value)) {
    return { type: 'dimension', value };
  }

  // Line-height units like '75ch'
  if (/^[\d.]+ch$/.test(value)) {
    return { type: 'dimension', value };
  }

  // vh units
  if (/^[\d.]+vh$/.test(value)) {
    return { type: 'dimension', value };
  }

  // Everything else
  return { type: 'string', value };
}

// ============================================================
// Value Parsers
// ============================================================

function rgbaToHex(r, g, b, a) {
  const hex = '#' + [r, g, b].map(c =>
    Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')
  ).join('');
  if (a != null && a < 1) {
    return hex + Math.round(a * 255).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Parse a CSS box-shadow string into DTCG shadow object(s).
 * Handles comma-separated multiple shadows.
 */
function parseShadow(value) {
  // Split by comma but not within rgba()
  const shadows = splitShadows(value);
  if (shadows.length === 1) return parseSingleShadow(shadows[0]);
  return shadows.map(parseSingleShadow);
}

function splitShadows(value) {
  const result = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function parseSingleShadow(s) {
  // Format: [inset] offsetX offsetY blur [spread] color
  const inset = s.startsWith('inset');
  if (inset) s = s.replace('inset', '').trim();

  // Extract color — it's at the end, either hex or rgba()
  let color = 'rgba(0,0,0,0.1)';
  const rgbaIdx = s.indexOf('rgba(');
  const rgbIdx = s.indexOf('rgb(');
  if (rgbaIdx !== -1) {
    color = s.slice(rgbaIdx);
    s = s.slice(0, rgbaIdx).trim();
  } else if (rgbIdx !== -1) {
    color = s.slice(rgbIdx);
    s = s.slice(0, rgbIdx).trim();
  } else {
    // Try hex at end
    const parts = s.split(/\s+/);
    if (parts.length > 0 && HEX_RE.test(parts[parts.length - 1])) {
      color = parts.pop();
      s = parts.join(' ');
    }
  }

  const dims = s.split(/\s+/).filter(Boolean);
  return {
    offsetX: dims[0] || '0',
    offsetY: dims[1] || '0',
    blur: dims[2] || '0',
    spread: dims[3] || '0',
    color,
    ...(inset ? { inset: true } : {}),
  };
}

/**
 * Parse a CSS linear-gradient into DTCG gradient object.
 */
function parseGradient(value) {
  // Strip 'linear-gradient(' and trailing ')'
  const inner = value.slice('linear-gradient('.length, -1);
  const parts = splitShadows(inner); // reuse comma splitter

  let angle = '180deg';
  let stops = parts;

  // First part might be angle
  if (parts[0] && /^\d+deg$/.test(parts[0].trim())) {
    angle = parts[0].trim();
    stops = parts.slice(1);
  }

  return {
    type: 'linear',
    angle,
    stops: stops.map(stop => {
      const trimmed = stop.trim();
      const lastSpace = trimmed.lastIndexOf(' ');
      if (lastSpace === -1) return { color: trimmed };
      const maybePos = trimmed.slice(lastSpace + 1);
      if (PERCENT_RE.test(maybePos)) {
        return { color: trimmed.slice(0, lastSpace), position: maybePos };
      }
      return { color: trimmed };
    }),
  };
}

// ============================================================
// Token Path Helpers
// ============================================================

/**
 * Convert a CSS custom property suffix to a DTCG-style dot path.
 * e.g. 'primary-fg' → 'color.primary-fg'
 *      'sp-4' → 'spacing.sp-4'
 *      'duration-fast' → 'motion.duration-fast'
 */
function tokenNameToPath(suffix) {
  // This is used for alias resolution — keep it simple
  return suffix.replace(/-/g, '.');
}

/**
 * Convert a full CSS custom property name to a DTCG group path.
 * Groups tokens logically for the output JSON structure.
 */
function tokenToGroup(name) {
  // Strip --d- prefix
  const key = name.replace(/^--d-/, '');

  if (key.match(/^(primary|accent|tertiary|success|warning|error|info)(-|$)/)) return 'color';
  if (key.match(/^(bg|fg|muted|border|ring|overlay|chrome)/)) return 'color';
  if (key.match(/^surface-/)) return 'color';
  if (key.match(/^(item-|selected-|disabled-|icon-)/)) return 'color';
  if (key.match(/^(field-bg|field-border|field-ring|field-placeholder)/)) return 'color';
  if (key.match(/^(table-|chart-(?!legend))/)) return 'color';
  if (key.match(/^(text-helper|text-error)/)) return 'typography';
  if (key.match(/^(selection-bg|selection-fg|selection-shadow)/)) return 'color';
  if (key.match(/^(scrollbar-track|scrollbar-thumb|skeleton-bg|skeleton-shine)/)) return 'color';
  if (key.match(/^(overlay-)/)) return 'color';
  if (key.match(/^(gradient-)/)) return 'gradient';
  if (key.match(/^(glass-blur)/)) return 'effect';
  if (key.match(/^elevation-/)) return 'elevation';
  if (key.match(/^(hover-|active-|focus-)/)) return 'interaction';
  if (key.match(/^sp-/)) return 'spacing';
  if (key.match(/^(pad|compound-|offset-|panel-|tree-|field-h|field-py|field-px|field-gap|field-text)/)) return 'spacing';
  if (key.match(/^(switch-|checkbox-size|rate-|otp-|stepper-|avatar-|spinner-|progress-|slider-|badge-|carousel-|float-|backtop-|step-|timepicker-|datepicker-|colorpicker-|colorpalette-|timeline-|rangeslider-|slide-)/)) return 'spacing';
  if (key.match(/^duration-/)) return 'motion';
  if (key.match(/^easing-/)) return 'motion';
  if (key.match(/^motion-/)) return 'motion';
  if (key.match(/^radius/)) return 'radius';
  if (key.match(/^(checkbox-radius)/)) return 'radius';
  if (key.match(/^(field-radius)/)) return 'radius';
  if (key.match(/^border-/)) return 'border';
  if (key.match(/^(field-border-width)/)) return 'border';
  if (key.match(/^density-/)) return 'density';
  if (key.match(/^z-/)) return 'zIndex';
  if (key.match(/^(font|text-|lh-|fw-|ls-|prose-)/)) return 'typography';
  if (key.match(/^(content-width|sidebar-|drawer-)/)) return 'layout';
  if (key.match(/^(shadow|transition)/)) return 'legacy';
  if (key.match(/^(scrollbar-w)/)) return 'spacing';

  return 'misc';
}

// ============================================================
// DTCG Output Builder
// ============================================================

/**
 * Build a DTCG-formatted token file for a single style (both modes).
 * @param {Object} style - Style definition
 * @param {Function} deriveFn - The derive() function
 * @param {Function} getShapeTokensFn - The getShapeTokens() function
 * @returns {Object} DTCG JSON object
 */
function buildDTCG(style, deriveFn, getShapeTokensFn) {
  const lightTokens = deriveFn(
    style.seed, style.personality, 'light',
    style.typography, style.overrides?.light
  );
  const darkTokens = deriveFn(
    style.seed, style.personality, 'dark',
    style.typography, style.overrides?.dark
  );

  const output = {
    $name: `Decantr — ${style.name}`,
    $description: `Design tokens for the ${style.name} style, exported in W3C DTCG format.`,
  };

  // Collect all token names (union of both modes)
  const allNames = new Set([...Object.keys(lightTokens), ...Object.keys(darkTokens)]);
  const sorted = [...allNames].sort();

  for (const name of sorted) {
    const lightVal = lightTokens[name];
    const darkVal = darkTokens[name];
    const group = tokenToGroup(name);
    const key = name.replace(/^--d-/, '');

    if (!output[group]) output[group] = {};

    const lightClass = lightVal != null ? classifyToken(name, lightVal) : null;
    const darkClass = darkVal != null ? classifyToken(name, darkVal) : null;

    const type = lightClass?.type || darkClass?.type || 'string';
    const dtcgType = mapToDTCGType(type);

    // If both modes have the same value, set $value directly
    const sameValue = lightVal === darkVal;

    const token = { $type: dtcgType };

    if (sameValue && lightClass) {
      token.$value = lightClass.value;
    } else {
      // Use $extensions.mode for per-mode values
      token.$extensions = {
        mode: {}
      };
      if (lightClass) token.$extensions.mode.light = lightClass.value;
      if (darkClass) token.$extensions.mode.dark = darkClass.value;
    }

    output[group][key] = token;
  }

  return output;
}

/**
 * Build a DTCG token file for shape tokens.
 * @param {Function} getShapeTokensFn - The getShapeTokens() function
 * @returns {Object} DTCG JSON object
 */
function buildShapeDTCG(getShapeTokensFn) {
  const shapes = ['sharp', 'rounded', 'pill'];
  const output = {
    $name: 'Decantr — Shape Tokens',
    $description: 'Radius tokens for each shape preset (sharp, rounded, pill).',
    radius: {},
  };

  // Collect all token names from all shapes
  const allNames = new Set();
  const shapeData = {};
  for (const shape of shapes) {
    const tokens = getShapeTokensFn(shape);
    if (!tokens) continue;
    shapeData[shape] = tokens;
    for (const name of Object.keys(tokens)) allNames.add(name);
  }

  for (const name of [...allNames].sort()) {
    const key = name.replace(/^--d-/, '');
    const modes = {};
    for (const shape of shapes) {
      if (shapeData[shape]?.[name]) {
        modes[shape] = shapeData[shape][name];
      }
    }

    output.radius[key] = {
      $type: 'dimension',
      $extensions: { mode: modes },
    };
  }

  return output;
}

/**
 * Build Figma REST API payload format from DTCG tokens.
 * @param {Object} dtcg - DTCG token object
 * @param {string} styleId - Style identifier
 * @returns {Object} Figma Variables payload
 */
function buildFigmaPayload(dtcg, styleId) {
  const variables = [];
  const collection = {
    name: dtcg.$name || `Decantr — ${styleId}`,
    modes: ['Light', 'Dark'],
    variables: [],
  };

  for (const [group, tokens] of Object.entries(dtcg)) {
    if (group.startsWith('$')) continue;
    if (typeof tokens !== 'object') continue;

    for (const [key, token] of Object.entries(tokens)) {
      if (!token.$type) continue;

      const figmaType = dtcgToFigmaType(token.$type);
      const variable = {
        name: `${group}/${key}`,
        resolvedType: figmaType,
        valuesByMode: {},
      };

      if (token.$value != null) {
        // Same value both modes
        variable.valuesByMode.Light = toFigmaValue(token.$value, token.$type);
        variable.valuesByMode.Dark = toFigmaValue(token.$value, token.$type);
      } else if (token.$extensions?.mode) {
        if (token.$extensions.mode.light != null) {
          variable.valuesByMode.Light = toFigmaValue(token.$extensions.mode.light, token.$type);
        }
        if (token.$extensions.mode.dark != null) {
          variable.valuesByMode.Dark = toFigmaValue(token.$extensions.mode.dark, token.$type);
        }
      }

      collection.variables.push(variable);
    }
  }

  return collection;
}

// ============================================================
// Type Mapping
// ============================================================

function mapToDTCGType(internalType) {
  const map = {
    color: 'color',
    dimension: 'dimension',
    shadow: 'shadow',
    cubicBezier: 'cubicBezier',
    duration: 'duration',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    gradient: 'gradient',
    number: 'number',
    string: 'string',
    alias: 'string', // aliases take the type of their target
  };
  return map[internalType] || 'string';
}

function dtcgToFigmaType(dtcgType) {
  const map = {
    color: 'COLOR',
    dimension: 'FLOAT',
    number: 'FLOAT',
    fontWeight: 'FLOAT',
    duration: 'FLOAT',
    cubicBezier: 'STRING',
    fontFamily: 'STRING',
    shadow: 'STRING',
    gradient: 'STRING',
    string: 'STRING',
  };
  return map[dtcgType] || 'STRING';
}

/**
 * Convert a DTCG token value to Figma-compatible value.
 */
function toFigmaValue(value, type) {
  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) {
    return hexToFigmaColor(value);
  }
  if (type === 'dimension' && typeof value === 'string') {
    return parseDimensionToNumber(value);
  }
  if (type === 'number' || type === 'fontWeight') {
    return typeof value === 'number' ? value : parseFloat(value);
  }
  if (type === 'duration' && typeof value === 'string') {
    if (value.endsWith('ms')) return parseFloat(value);
    if (value.endsWith('s')) return parseFloat(value) * 1000;
  }
  // Everything else → string
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function hexToFigmaColor(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function parseDimensionToNumber(value) {
  // Convert rem to px (base 16px)
  if (value.endsWith('rem')) return parseFloat(value) * 16;
  if (value.endsWith('px')) return parseFloat(value);
  if (value.endsWith('em')) return parseFloat(value) * 16;
  if (value.endsWith('%')) return parseFloat(value);
  if (value.endsWith('ch')) return parseFloat(value) * 8; // approximate
  if (value.endsWith('vh')) return parseFloat(value);
  return parseFloat(value);
}

// ============================================================
// Combined Tokens (for Tokens Studio)
// ============================================================

function buildCombinedDTCG(allStyleDTCG, shapeDTCG) {
  const combined = {
    $name: 'Decantr — All Styles',
    $description: 'Combined token file for all Decantr styles. For use with Tokens Studio.',
  };

  for (const { id, dtcg } of allStyleDTCG) {
    combined[id] = dtcg;
  }

  combined.shapes = shapeDTCG;
  return combined;
}

// ============================================================
// Public API
// ============================================================

/**
 * Generate Figma token files in DTCG or Figma REST API format.
 * @param {Object} opts
 * @param {string} [opts.style='all'] - Style filter
 * @param {string} [opts.format='dtcg'] - Output format: 'dtcg' or 'figma'
 * @param {string} [opts.output] - Output directory (default: dist/figma/tokens/)
 * @param {boolean} [opts.dryRun=false] - Print stats without writing
 * @param {string} [opts.cwd] - Working directory (for output resolution)
 * @returns {Promise<{ styles: string[], tokenCount: number, files: string[] }>}
 */
export async function generateFigmaTokens(opts = {}) {
  const {
    style: styleFilter = 'all',
    format = 'dtcg',
    output: outputDir,
    'dry-run': dryRun = false,
    dryRun: dryRunAlt = false,
    cwd = process.cwd(),
  } = opts;

  const isDryRun = dryRun || dryRunAlt;
  const outDir = outputDir ? resolve(cwd, outputDir) : join(cwd, 'dist', 'figma', 'tokens');

  // Import derive engine
  const { derive, getShapeTokens } = await import(
    resolve(__dirname, '..', 'src', 'css', 'derive.js')
  );

  // Load styles
  const styles = await loadStyles(styleFilter);
  if (styles.length === 0) {
    throw new Error(
      styleFilter === 'all'
        ? 'No style definitions found in src/css/styles/'
        : `Style "${styleFilter}" not found`
    );
  }

  const allStyleDTCG = [];
  const files = [];
  let totalTokenCount = 0;

  for (const style of styles) {
    const dtcg = buildDTCG(style, derive, getShapeTokens);

    // Count tokens
    let count = 0;
    for (const [group, tokens] of Object.entries(dtcg)) {
      if (group.startsWith('$')) continue;
      if (typeof tokens === 'object') count += Object.keys(tokens).length;
    }
    totalTokenCount += count;

    if (format === 'figma') {
      const payload = buildFigmaPayload(dtcg, style.id);
      allStyleDTCG.push({ id: style.id, dtcg, payload });
    } else {
      allStyleDTCG.push({ id: style.id, dtcg });
    }
  }

  // Shape tokens
  const { getShapeTokens: getShapeTokensFn } = await import(
    resolve(__dirname, '..', 'src', 'css', 'derive.js')
  );
  const shapeDTCG = buildShapeDTCG(getShapeTokensFn);
  let shapeCount = 0;
  if (shapeDTCG.radius) shapeCount = Object.keys(shapeDTCG.radius).length;

  if (isDryRun) {
    return {
      styles: styles.map(s => s.id),
      tokenCount: totalTokenCount,
      shapeTokenCount: shapeCount,
      files: [
        ...styles.map(s => `${s.id}.tokens.json`),
        'shapes.tokens.json',
        'combined.tokens.json',
      ],
    };
  }

  // Write files
  await mkdir(outDir, { recursive: true });

  for (const { id, dtcg, payload } of allStyleDTCG) {
    if (format === 'figma') {
      const filePath = join(outDir, `${id}.figma.json`);
      await writeFile(filePath, JSON.stringify(payload, null, 2));
      files.push(filePath);
    }
    // Always write DTCG
    const dtcgPath = join(outDir, `${id}.tokens.json`);
    await writeFile(dtcgPath, JSON.stringify(dtcg, null, 2));
    files.push(dtcgPath);
  }

  // Write shape tokens
  const shapePath = join(outDir, 'shapes.tokens.json');
  await writeFile(shapePath, JSON.stringify(shapeDTCG, null, 2));
  files.push(shapePath);

  // Write combined file
  const combined = buildCombinedDTCG(allStyleDTCG, shapeDTCG);
  const combinedPath = join(outDir, 'combined.tokens.json');
  await writeFile(combinedPath, JSON.stringify(combined, null, 2));
  files.push(combinedPath);

  return {
    styles: styles.map(s => s.id),
    tokenCount: totalTokenCount,
    shapeTokenCount: shapeCount,
    files,
  };
}
