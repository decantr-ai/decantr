import type {
  IRPageNode, IRPatternNode, IRGridNode, IRNode,
  GeneratedFile,
} from '@decantr/generator-core';
import { gridAtoms, spanAtom, surfaceAtoms, gapAtom } from './atoms.js';
import { parseImports, mergeImports, renderImports } from './imports.js';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function indent(code: string, level: number): string {
  const pad = '  '.repeat(level);
  return code.split('\n').map(l => l ? pad + l : l).join('\n');
}

function emitPatternCall(node: IRPatternNode, densityGap: string): string {
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
    return [
      `Card({ class: css('_flex _col${bgClass}') },`,
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

function emitGridNode(node: IRGridNode, densityGap: string): string {
  const atoms = gridAtoms(node.cols, node.spans, node.breakpoint, densityGap);

  const children = node.children.map((child, i) => {
    const patternNode = child as IRPatternNode;
    const call = emitPatternCall(patternNode, densityGap);
    if (node.spans) {
      const weight = node.spans[patternNode.id] || 1;
      return `div({ class: css('${spanAtom(weight)}') },\n  ${call}\n)`;
    }
    return call;
  });

  return [
    `div({ class: css('${atoms}') },`,
    ...children.map(c => indent(c, 1)),
    `)`,
  ].join('\n');
}

function emitNodeCode(node: IRNode, densityGap: string): string {
  if (node.type === 'pattern') {
    return emitPatternCall(node as IRPatternNode, densityGap);
  }
  if (node.type === 'grid') {
    return emitGridNode(node as IRGridNode, densityGap);
  }
  return `// Unknown node type: ${node.type}`;
}

/** Emit a single page .js file from its IR tree */
export function emitPage(page: IRPageNode): GeneratedFile {
  const densityGap = page.children[0]?.spatial?.gap || '4';
  const surface = surfaceAtoms(page.surface, densityGap);
  const pageName = pascalCase(page.pageId);

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
    .map(child => indent(emitNodeCode(child, densityGap), 2))
    .join(',\n');

  const importBlock = renderImports(allImports);

  const code = [
    importBlock,
    '',
    ...patternFunctions,
    '',
    `export default component('${pageName}Page', () => {`,
    `  const { div } = tags;`,
    wiringCode,
    '',
    `  return div({ class: css('${surface} d-page-enter') },`,
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
