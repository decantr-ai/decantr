import type {
  IRPageNode, IRPatternNode, IRGridNode, IRNode,
  GeneratedFile,
} from '@decantr/generator-core';
import { gridClasses, spanClass, surfaceClasses, gapClass } from './tailwind.js';
import { collectShadcnImports } from './shadcn.js';
import { renderReactImports, basePageImports, wiringImports, mergeReactImports } from './imports.js';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function indent(code: string, level: number): string {
  const pad = '  '.repeat(level);
  return code.split('\n').map(l => l ? pad + l : l).join('\n');
}

function buildPatternComponent(node: IRPatternNode, densityGap: string): string {
  const funcName = pascalCase(node.pattern.alias);
  const hasWireProps = node.wireProps && Object.keys(node.wireProps).length > 0;

  // Build props interface
  let propsType = '';
  let propsParam = '';
  if (hasWireProps) {
    const entries = Object.keys(node.wireProps!).map(k => `${k}?: any`).join('; ');
    propsType = `{ ${entries} }`;
    propsParam = `{ ${Object.keys(node.wireProps!).join(', ')} }: ${propsType}`;
  }

  // Generate placeholder JSX based on the pattern
  const components = node.pattern.components;
  const hasCard = components.includes('Card');

  let body: string;
  if (hasCard) {
    body = [
      `    <div className="${gapClass(densityGap)} grid grid-cols-1 md:grid-cols-2">`,
      `      <Card>`,
      `        <CardHeader><CardTitle>Item 1</CardTitle></CardHeader>`,
      `        <CardContent><p className="text-2xl font-semibold">$24,500</p></CardContent>`,
      `      </Card>`,
      `      <Card>`,
      `        <CardHeader><CardTitle>Item 2</CardTitle></CardHeader>`,
      `        <CardContent><p className="text-2xl font-semibold">1,234</p></CardContent>`,
      `      </Card>`,
      `    </div>`,
    ].join('\n');
  } else {
    body = [
      `    <div className="flex flex-col ${gapClass(densityGap)} p-4">`,
      `      <h2 className="text-xl font-semibold">${node.pattern.patternId}</h2>`,
      `      <p className="text-sm text-muted-foreground">Pattern placeholder</p>`,
      `    </div>`,
    ].join('\n');
  }

  return [
    `function ${funcName}(${propsParam ? `props: ${propsType}` : ''}) {`,
    hasWireProps ? `  const { ${Object.keys(node.wireProps!).join(', ')} } = props;` : '',
    `  return (`,
    body,
    `  );`,
    `}`,
  ].filter(Boolean).join('\n');
}

function emitPatternCall(node: IRPatternNode): string {
  const funcName = pascalCase(node.pattern.alias);

  let propsStr = '';
  if (node.wireProps && Object.keys(node.wireProps).length > 0) {
    const entries = Object.entries(node.wireProps)
      .map(([k, v]) => `${k}={${v}}`)
      .join(' ');
    propsStr = ` ${entries}`;
  }

  const jsx = `<${funcName}${propsStr} />`;

  // Card wrapping
  if (node.card) {
    const bgClass = node.card.background ? ` ${node.card.background}` : '';
    return [
      `<Card${bgClass ? ` className="${bgClass.trim()}"` : ''}>`,
      `  <CardHeader><CardTitle>${node.card.headerLabel}</CardTitle></CardHeader>`,
      `  <CardContent>`,
      `    ${jsx}`,
      `  </CardContent>`,
      `</Card>`,
    ].join('\n');
  }

  return jsx;
}

function emitGridNode(node: IRGridNode, densityGap: string): string {
  const classes = gridClasses(node.cols, node.spans, node.breakpoint, densityGap);

  const children = node.children.map(child => {
    const patternNode = child as IRPatternNode;
    const call = emitPatternCall(patternNode);
    if (node.spans) {
      const weight = node.spans[patternNode.id] || 1;
      return `  <div className="${spanClass(weight)}">\n    ${call}\n  </div>`;
    }
    return `  ${call}`;
  });

  return [
    `<div className="${classes}">`,
    ...children,
    `</div>`,
  ].join('\n');
}

function emitNodeJsx(node: IRNode, densityGap: string): string {
  if (node.type === 'pattern') {
    return emitPatternCall(node as IRPatternNode);
  }
  if (node.type === 'grid') {
    return emitGridNode(node as IRGridNode, densityGap);
  }
  return `{/* Unknown node type: ${node.type} */}`;
}

/** Emit a single React page .tsx file from its IR tree */
export function emitPage(page: IRPageNode): GeneratedFile {
  const densityGap = page.children[0]?.spatial?.gap || '4';
  const surface = surfaceClasses(page.surface, densityGap);
  const pageName = pascalCase(page.pageId);

  // Collect imports
  let imports = basePageImports();

  // Collect all components from patterns
  const allComponents: string[] = [];
  const patternComponents: string[] = [];

  const collectFromNode = (node: IRNode) => {
    if (node.type === 'pattern') {
      const pn = node as IRPatternNode;
      allComponents.push(...pn.pattern.components);
      patternComponents.push(buildPatternComponent(pn, densityGap));
      if (pn.card) {
        allComponents.push('Card');
      }
    }
    for (const child of node.children) {
      collectFromNode(child);
    }
  };

  for (const child of page.children) {
    collectFromNode(child);
  }

  // Add shadcn imports
  const shadcnImports = collectShadcnImports([...new Set(allComponents)]);
  for (const [path, names] of shadcnImports) {
    imports = mergeReactImports(imports, new Map([[path, names]]));
  }

  // Add wiring imports
  if (page.wiring && page.wiring.signals.length > 0) {
    imports = mergeReactImports(imports, wiringImports());
  }

  // Build wiring hooks
  let wiringCode = '';
  if (page.wiring && page.wiring.signals.length > 0) {
    wiringCode = page.wiring.signals
      .map(s => {
        const init = s.init.replace(/'/g, "'");
        return `  const [${s.name}, ${s.setter}] = useState(${init});`;
      })
      .join('\n');
  }

  // Build body JSX
  const bodyJsx = page.children
    .map(child => indent(emitNodeJsx(child, densityGap), 3))
    .join('\n');

  const importBlock = renderReactImports(imports);

  const code = [
    importBlock,
    '',
    ...patternComponents,
    '',
    `export default function ${pageName}Page() {`,
    wiringCode,
    '',
    `  return (`,
    `    <div className="${surface}">`,
    bodyJsx,
    `    </div>`,
    `  );`,
    `}`,
    '',
  ].join('\n');

  return {
    path: `src/pages/${page.pageId}.tsx`,
    content: code,
  };
}
