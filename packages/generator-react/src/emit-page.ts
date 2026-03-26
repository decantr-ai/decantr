import type {
  IRPageNode, IRPatternNode, IRGridNode, IRNode, IRHookType,
  GeneratedFile,
} from '@decantr/generator-core';
import { gridClasses, spanClass, surfaceClasses, gapClass } from './tailwind.js';
import { collectShadcnImports, resolvePatternTemplate } from './shadcn.js';
import { renderReactImports, basePageImports, mergeReactImports } from './imports.js';
import { HOOK_REGISTRY } from './emit-hooks.js';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function indent(code: string, level: number): string {
  const pad = '  '.repeat(level);
  return code.split('\n').map(l => l ? pad + l : l).join('\n');
}

// AUTO: Determine if this page uses hook-based wiring (has hooks array)
function useHookWiring(page: IRPageNode): boolean {
  return !!(page.wiring && page.wiring.hooks && page.wiring.hooks.length > 0);
}

// AUTO: Build typed props interface for a pattern using hook types
function buildHookPropsInterface(
  funcName: string,
  hookPropEntries: Record<string, string>,
): string {
  const fields = Object.entries(hookPropEntries)
    .map(([propName, hookVar]) => {
      // Find the hook type from the variable name
      const meta = Object.values(HOOK_REGISTRY).find(m => m.variableName === hookVar);
      if (meta) {
        return `  ${propName}?: ${meta.typeName};`;
      }
      return `  ${propName}?: any;`;
    })
    .join('\n');
  return `interface ${funcName}Props {\n${fields}\n}`;
}

function buildPatternComponent(
  node: IRPatternNode,
  densityGap: string,
  hookPropEntries: Record<string, string> | null,
): string {
  const funcName = pascalCase(node.pattern.alias);
  const hasHookProps = hookPropEntries && Object.keys(hookPropEntries).length > 0;
  const hasWireProps = !hasHookProps && node.wireProps && Object.keys(node.wireProps).length > 0;

  // AUTO: Build typed props for hook-based wiring
  let propsInterface = '';
  let propsParam = '';
  if (hasHookProps) {
    propsInterface = buildHookPropsInterface(funcName, hookPropEntries!);
    const destructured = Object.keys(hookPropEntries!).join(', ');
    propsParam = `{ ${destructured} }: ${funcName}Props`;
  } else if (hasWireProps) {
    const entries = Object.keys(node.wireProps!).map(k => `${k}?: any`).join('; ');
    const propsType = `{ ${entries} }`;
    propsParam = `props: ${propsType}`;
  }

  // AUTO: Check for pattern-specific shadcn template first
  const patternTemplate = resolvePatternTemplate(node.pattern.patternId);
  const components = node.pattern.components;
  const hasCard = components.includes('Card');

  let body: string;
  if (patternTemplate) {
    body = patternTemplate.body(gapClass(densityGap));
  } else if (hasCard) {
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

  const lines: string[] = [];
  if (propsInterface) {
    lines.push(propsInterface);
    lines.push('');
  }
  lines.push(
    `function ${funcName}(${propsParam}) {`,
    ...(hasWireProps && !hasHookProps
      ? [`  const { ${Object.keys(node.wireProps!).join(', ')} } = props;`]
      : []),
    `  return (`,
    body,
    `  );`,
    `}`,
  );

  return lines.join('\n');
}

function emitPatternCall(
  node: IRPatternNode,
  hookPropEntries: Record<string, string> | null,
): string {
  const funcName = pascalCase(node.pattern.alias);
  const hasHookProps = hookPropEntries && Object.keys(hookPropEntries).length > 0;

  let propsStr = '';
  if (hasHookProps) {
    // AUTO: Pass hook variables as props
    const entries = Object.entries(hookPropEntries!)
      .map(([propName, hookVar]) => `${propName}={${hookVar}}`)
      .join(' ');
    propsStr = ` ${entries}`;
  } else if (node.wireProps && Object.keys(node.wireProps).length > 0) {
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

function emitGridNode(
  node: IRGridNode,
  densityGap: string,
  hookPropsMap: Record<string, Record<string, string>> | null,
): string {
  const classes = gridClasses(node.cols, node.spans, node.breakpoint, densityGap);

  const children = node.children.map(child => {
    const patternNode = child as IRPatternNode;
    const patternHookProps = hookPropsMap
      ? (hookPropsMap[patternNode.pattern.alias] || hookPropsMap[patternNode.pattern.patternId] || null)
      : null;
    const call = emitPatternCall(patternNode, patternHookProps);
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

function emitNodeJsx(
  node: IRNode,
  densityGap: string,
  hookPropsMap: Record<string, Record<string, string>> | null,
): string {
  if (node.type === 'pattern') {
    const pn = node as IRPatternNode;
    const patternHookProps = hookPropsMap
      ? (hookPropsMap[pn.pattern.alias] || hookPropsMap[pn.pattern.patternId] || null)
      : null;
    return emitPatternCall(pn, patternHookProps);
  }
  if (node.type === 'grid') {
    return emitGridNode(node as IRGridNode, densityGap, hookPropsMap);
  }
  return `{/* Unknown node type: ${node.type} */}`;
}

// AUTO: Generate page-level state interface from active hooks
function buildPageStateInterface(pageName: string, hooks: IRHookType[]): string {
  const fields: string[] = [];
  for (const hookType of hooks) {
    const meta = HOOK_REGISTRY[hookType];
    switch (hookType) {
      case 'search':
        fields.push('  search: string;', '  debouncedSearch: string;');
        break;
      case 'filter':
        fields.push('  filters: Record<string, string>;', '  activeFilterCount: number;');
        break;
      case 'selection':
        fields.push('  selected: string[];');
        break;
      case 'sort':
        fields.push('  sortColumn: string | null;', '  sortDirection: \'asc\' | \'desc\';');
        break;
    }
  }
  return `interface ${pageName}PageState {\n${fields.join('\n')}\n}`;
}

/** Emit a single React page .tsx file from its IR tree */
export function emitPage(page: IRPageNode): GeneratedFile {
  const densityGap = page.children[0]?.spatial?.gap || '4';
  const surface = surfaceClasses(page.surface, densityGap);
  const pageName = pascalCase(page.pageId);
  const isHookWired = useHookWiring(page);

  // Collect imports
  let imports = basePageImports();

  // AUTO: Determine hook props map for this page
  const hookPropsMap = isHookWired ? page.wiring!.hookProps : null;

  // Collect all components from patterns
  const allComponents: string[] = [];
  const patternComponents: string[] = [];

  const collectFromNode = (node: IRNode) => {
    if (node.type === 'pattern') {
      const pn = node as IRPatternNode;
      allComponents.push(...pn.pattern.components);
      const patternHookProps = hookPropsMap
        ? (hookPropsMap[pn.pattern.alias] || hookPropsMap[pn.pattern.patternId] || null)
        : null;
      patternComponents.push(buildPatternComponent(pn, densityGap, patternHookProps));
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

  // AUTO: Add pattern-specific template imports
  const addPatternTemplateImports = (node: IRNode) => {
    if (node.type === 'pattern') {
      const pn = node as IRPatternNode;
      const tmpl = resolvePatternTemplate(pn.pattern.patternId);
      if (tmpl) {
        for (const [path, names] of tmpl.imports) {
          imports = mergeReactImports(imports, new Map([[path, names]]));
        }
      }
    }
    for (const child of node.children) {
      addPatternTemplateImports(child);
    }
  };
  for (const child of page.children) {
    addPatternTemplateImports(child);
  }

  // AUTO: Hook-based wiring — import hooks and compose at page level
  let wiringCode = '';
  let pageStateInterface = '';

  if (isHookWired) {
    const hooks = page.wiring!.hooks;

    // Add hook imports
    for (const hookType of hooks) {
      const meta = HOOK_REGISTRY[hookType];
      imports = mergeReactImports(
        imports,
        new Map([[`@/hooks/${meta.fileName}`, [meta.hookName]]]),
      );
    }

    // Generate page state interface
    pageStateInterface = buildPageStateInterface(pageName, hooks);

    // Generate hook calls
    wiringCode = hooks
      .map(hookType => {
        const meta = HOOK_REGISTRY[hookType];
        return `  const ${meta.variableName} = ${meta.hookName}();`;
      })
      .join('\n');
  } else if (page.wiring && page.wiring.signals.length > 0) {
    // Legacy: raw useState wiring for pages without hook types
    imports = mergeReactImports(imports, new Map([['react', ['useState']]]));
    wiringCode = page.wiring.signals
      .map(s => {
        const init = s.init.replace(/'/g, "'");
        return `  const [${s.name}, ${s.setter}] = useState(${init});`;
      })
      .join('\n');
  }

  // Build body JSX
  const bodyJsx = page.children
    .map(child => indent(emitNodeJsx(child, densityGap, hookPropsMap), 3))
    .join('\n');

  const importBlock = renderReactImports(imports);

  const blocks: string[] = [importBlock, ''];

  // AUTO: Add page state interface before pattern components
  if (pageStateInterface) {
    blocks.push(pageStateInterface, '');
  }

  blocks.push(
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
  );

  const code = blocks.join('\n');

  return {
    path: `src/pages/${page.pageId}.tsx`,
    content: code,
  };
}
