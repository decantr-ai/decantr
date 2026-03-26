import type {
  IRPageNode, IRPatternNode, IRGridNode, IRNode,
  GeneratedFile,
} from '@decantr/generator-core';
import { gridAtoms, spanAtom, surfaceAtoms, gapAtom } from './atoms.js';
import { parseImports, mergeImports, renderImports } from './imports.js';
import type { VisualEffectsConfig } from './recipe-decorator.js';
import { emitRecipeDecorationHelper } from './recipe-decorator.js';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function indent(code: string, level: number): string {
  const pad = '  '.repeat(level);
  return code.split('\n').map(l => l ? pad + l : l).join('\n');
}

// AUTO: Resolved animation settings with defaults applied
interface ResolvedAnimation {
  enabled: boolean;        // false when page_enter is "none"
  pageEnterClass: string;  // e.g. "d-page-enter" or "d-page-enter-slide-left"
  stagger: boolean;
  staggerDelay: number;
  cardEnter: boolean;
}

function resolveAnimation(config?: AnimationConfig | null): ResolvedAnimation {
  if (config?.page_enter === 'none') {
    return { enabled: false, pageEnterClass: '', stagger: false, staggerDelay: 50, cardEnter: false };
  }
  // AUTO: Map page_enter type to CSS class. "fade" is the default (d-page-enter).
  const pageEnterType = config?.page_enter || 'fade';
  const pageEnterClass = pageEnterType === 'fade'
    ? 'd-page-enter'
    : `d-page-enter-${pageEnterType}`;
  return {
    enabled: true,
    pageEnterClass,
    stagger: config?.stagger !== false,
    staggerDelay: config?.stagger_delay ?? 50,
    cardEnter: config?.card_enter !== false,
  };
}

function emitPatternCall(node: IRPatternNode, densityGap: string, anim: ResolvedAnimation): string {
  const funcName = pascalCase(node.pattern.alias);

  // Build wire props argument
  let propsArg = '';
  if (node.wireProps && Object.keys(node.wireProps).length > 0) {
    const entries = Object.entries(node.wireProps)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    propsArg = `{ ${entries} }`;
  }

  const call = propsArg ? `${funcName}(${propsArg})` : `${funcName}()`;

  // Card wrapping
  if (node.card) {
    const bgClass = node.card.background ? ` ${node.card.background}` : '';
    // AUTO: Apply visual effect decorator classes (d-glass, d-gradient-hint-*, d-glow-*)
    // from recipe visual_effects when present on the pattern node
    const veClasses = node.visualEffects?.decorators?.length
      ? ' ' + node.visualEffects.decorators.join(' ')
      : '';
    // AUTO: Add d-card-enter class for card entrance animation when enabled
    const cardEnterClass = anim.cardEnter ? ' d-card-enter' : '';
    // AUTO: Emit intensity CSS variables as inline style when recipe specifies them
    const veStyle = node.visualEffects?.intensity && Object.keys(node.visualEffects.intensity).length > 0
      ? `, style: '${Object.entries(node.visualEffects.intensity).map(([k, v]) => `${k}:${v}`).join(';')}'`
      : '';
    return [
      `Card({ class: css('_flex _col${bgClass}${veClasses}${cardEnterClass}')${veStyle} },`,
      `  Card.Header({}, '${node.card.headerLabel}'),`,
      `  Card.Body({},`,
      `    ${call}`,
      `  )`,
      `)`,
    ].join('\n');
  }

  return call;
}

function emitPatternFunction(node: IRPatternNode, densityGap: string): string {
  const funcName = pascalCase(node.pattern.alias);

  if (node.pattern.code?.example) {
    // Use the pattern's example code, replacing _gap4 with density gap
    let code = node.pattern.code.example;
    code = code.replace(/_gap4/g, `_gap${densityGap}`);
    return code;
  }

  // Generate placeholder function
  const propsType = node.wireProps
    ? `{ ${Object.keys(node.wireProps).map(k => `${k}`).join(', ')} } = {}`
    : '';

  return [
    `function ${funcName}(${propsType}) {`,
    `  const { div, h2, p } = tags;`,
    `  return div({ class: css('_flex _col _gap${densityGap} _p4') },`,
    `    h2({ class: css('_heading4') }, '${node.pattern.patternId}'),`,
    `    p({ class: css('_bodysm _fgmuted') }, 'Pattern placeholder')`,
    `  );`,
    `}`,
  ].join('\n');
}

function emitGridNode(node: IRGridNode, densityGap: string, anim: ResolvedAnimation): string {
  const atoms = gridAtoms(node.cols, node.spans, node.breakpoint, densityGap);
  // AUTO: Add d-stagger class to grid container for sequential animation delays
  const staggerClass = anim.stagger ? ' d-stagger' : '';

  const children = node.children.map((child, i) => {
    const patternNode = child as IRPatternNode;
    const call = emitPatternCall(patternNode, densityGap, anim);
    // AUTO: Stagger items get d-stagger-item class and --stagger-index CSS variable
    const staggerAttrs = anim.stagger
      ? `class: css('d-stagger-item'), style: '--stagger-index: ${i}; --stagger-delay: ${anim.staggerDelay}ms', `
      : '';
    if (node.spans) {
      const weight = node.spans[patternNode.id] || 1;
      return `div({ ${staggerAttrs}class: css('${spanAtom(weight)}${anim.stagger ? ' d-stagger-item' : ''}')${anim.stagger ? `, style: '--stagger-index: ${i}; --stagger-delay: ${anim.staggerDelay}ms'` : ''} },\n  ${call}\n)`;
    }
    if (anim.stagger) {
      return `div({ class: css('d-stagger-item'), style: '--stagger-index: ${i}; --stagger-delay: ${anim.staggerDelay}ms' },\n  ${call}\n)`;
    }
    return call;
  });

  return [
    `div({ class: css('${atoms}${staggerClass}') },`,
    ...children.map(c => indent(c, 1)),
    `)`,
  ].join('\n');
}

function emitNodeCode(node: IRNode, densityGap: string, anim: ResolvedAnimation): string {
  if (node.type === 'pattern') {
    return emitPatternCall(node as IRPatternNode, densityGap, anim);
  }
  if (node.type === 'grid') {
    return emitGridNode(node as IRGridNode, densityGap, anim);
  }
  return `// Unknown node type: ${node.type}`;
}

// AUTO: Animation config for recipe-driven entrance animations.
// Controls page entrance, card entrance, and stagger effects on grids/lists.
export interface AnimationConfig {
  /** Page entrance animation type. "none" disables all animation classes. */
  page_enter?: 'fade' | 'slide-up' | 'slide-left' | 'none';
  /** Enable stagger delay on grid/list children (default: true) */
  stagger?: boolean;
  /** Delay per stagger item in ms (default: 50) */
  stagger_delay?: number;
  /** Enable card entrance animation (default: true) */
  card_enter?: boolean;
}

/** Options for recipe-driven visual decorations on a page */
export interface EmitPageOptions {
  visualEffects?: VisualEffectsConfig | null;
  patternOverrides?: Record<string, { background?: string[] }> | null;
  animation?: AnimationConfig | null;
}

/** Emit a single page .js file from its IR tree */
export function emitPage(page: IRPageNode, options?: EmitPageOptions): GeneratedFile {
  const densityGap = page.children[0]?.spatial?.gap || '4';
  const surface = surfaceAtoms(page.surface, densityGap);
  const pageName = pascalCase(page.pageId);
  const anim = resolveAnimation(options?.animation);

  // Collect all imports from patterns
  let allImports = new Map<string, Set<string>>();

  // Base imports every page needs
  allImports.set('decantr/tags', new Set(['tags']));
  allImports.set('decantr/css', new Set(['css']));
  allImports.set('decantr/core', new Set(['component']));

  // Collect pattern imports and functions
  const patternFunctions: string[] = [];
  const collectPatterns = (node: IRNode) => {
    if (node.type === 'pattern') {
      const pn = node as IRPatternNode;
      if (pn.pattern.code?.imports) {
        allImports = mergeImports(allImports, parseImports(pn.pattern.code.imports));
      }
      patternFunctions.push(emitPatternFunction(pn, densityGap));
      // If card wrapping, need Card component
      if (pn.card) {
        if (!allImports.has('decantr/components')) {
          allImports.set('decantr/components', new Set());
        }
        allImports.get('decantr/components')!.add('Card');
      }
    }
    for (const child of node.children) {
      collectPatterns(child);
    }
  };
  for (const child of page.children) {
    collectPatterns(child);
  }

  // Wiring signals
  let wiringCode = '';
  if (page.wiring && page.wiring.signals.length > 0) {
    allImports.get('decantr/state')
      ? allImports.get('decantr/state')!.add('createSignal')
      : allImports.set('decantr/state', new Set(['createSignal']));

    wiringCode = page.wiring.signals
      .map(s => `  const [${s.name}, ${s.setter}] = createSignal(${s.init});`)
      .join('\n');
  }

  // Build page body
  const bodyChildren = page.children
    .map(child => indent(emitNodeCode(child, densityGap, anim), 2))
    .join(',\n');

  const importBlock = renderImports(allImports);

  // AUTO: Emit runtime getRecipeDecoration() helper when recipe visual_effects are active
  const decorationHelper = emitRecipeDecorationHelper(
    options?.visualEffects,
    options?.patternOverrides,
  );

  // AUTO: Page entrance class from animation config (default: d-page-enter)
  const pageEnterSuffix = anim.pageEnterClass ? ` ${anim.pageEnterClass}` : '';

  const code = [
    importBlock,
    '',
    ...(decorationHelper ? [decorationHelper, ''] : []),
    ...patternFunctions,
    '',
    `export default component('${pageName}Page', () => {`,
    `  const { div } = tags;`,
    wiringCode,
    '',
    `  return div({ class: css('${surface}${pageEnterSuffix}') },`,
    bodyChildren,
    `  );`,
    `});`,
    '',
  ].join('\n');

  return {
    path: `src/pages/${page.pageId}.js`,
    content: code,
  };
}
