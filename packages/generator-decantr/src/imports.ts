/** Parse import statements into a map of module → named exports */
export function parseImports(importStr: string): Map<string, Set<string>> {
  const imports = new Map<string, Set<string>>();
  if (!importStr) return imports;

  const lines = importStr.split('\n').filter(l => l.trim().startsWith('import'));

  for (const line of lines) {
    // Match: import { X, Y } from 'module';
    const match = line.match(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/);
    if (match) {
      const names = match[1].split(',').map(s => s.trim()).filter(Boolean);
      const module = match[2];
      if (!imports.has(module)) imports.set(module, new Set());
      for (const name of names) {
        imports.get(module)!.add(name);
      }
    }
  }

  return imports;
}

/** Merge two import maps */
export function mergeImports(
  a: Map<string, Set<string>>,
  b: Map<string, Set<string>>,
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  for (const [mod, names] of a) {
    result.set(mod, new Set(names));
  }

  for (const [mod, names] of b) {
    if (!result.has(mod)) {
      result.set(mod, new Set(names));
    } else {
      for (const name of names) {
        result.get(mod)!.add(name);
      }
    }
  }

  return result;
}

// Import ordering priority
const MODULE_ORDER = [
  'decantr/tags',
  'decantr/core',
  'decantr/state',
  'decantr/data',
  'decantr/css',
  'decantr/router',
  'decantr/components',
  'decantr/chart',
];

/** Render import map to import statement strings */
export function renderImports(imports: Map<string, Set<string>>): string {
  const lines: string[] = [];

  // Ordered modules first
  for (const mod of MODULE_ORDER) {
    const names = imports.get(mod);
    if (names && names.size > 0) {
      lines.push(`import { ${[...names].sort().join(', ')} } from '${mod}';`);
    }
  }

  // Remaining modules
  for (const [mod, names] of imports) {
    if (MODULE_ORDER.includes(mod)) continue;
    if (names.size > 0) {
      lines.push(`import { ${[...names].sort().join(', ')} } from '${mod}';`);
    }
  }

  return lines.join('\n');
}
