/** Render React import lines from collected imports map */
export function renderReactImports(imports: Map<string, string[]>): string {
  const lines: string[] = [];

  // Order: react first, then react-router-dom, then @/ paths, then rest
  const order = ['react', 'react-router-dom', 'lucide-react'];

  for (const mod of order) {
    const names = imports.get(mod);
    if (names && names.length > 0) {
      lines.push(`import { ${[...new Set(names)].sort().join(', ')} } from '${mod}';`);
    }
  }

  // shadcn/ui and other @/ imports
  const atImports = [...imports.entries()]
    .filter(([mod]) => mod.startsWith('@/'))
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [mod, names] of atImports) {
    if (names.length > 0) {
      lines.push(`import { ${[...new Set(names)].sort().join(', ')} } from '${mod}';`);
    }
  }

  // Remaining
  for (const [mod, names] of imports) {
    if (order.includes(mod) || mod.startsWith('@/')) continue;
    if (names.length > 0) {
      lines.push(`import { ${[...new Set(names)].sort().join(', ')} } from '${mod}';`);
    }
  }

  return lines.join('\n');
}

/** Standard React page imports */
export function basePageImports(): Map<string, string[]> {
  return new Map([
    ['react', ['React']],
  ]);
}

/** Merge wiring-related imports (useState) */
export function wiringImports(): Map<string, string[]> {
  return new Map([
    ['react', ['useState']],
  ]);
}

/** Merge two import maps */
export function mergeReactImports(
  a: Map<string, string[]>,
  b: Map<string, string[]>,
): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const [mod, names] of a) {
    result.set(mod, [...names]);
  }

  for (const [mod, names] of b) {
    const existing = result.get(mod) || [];
    result.set(mod, [...new Set([...existing, ...names])]);
  }

  return result;
}
