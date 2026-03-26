import { describe, it, expect } from 'vitest';
import { COMPONENT_MAP, resolveShadcnComponent, collectShadcnImports } from '../src/shadcn.js';

// AUTO: Full list of shadcn/ui components that must be present in COMPONENT_MAP.
// Aliases (Modal, Dropdown, Chip) are tested separately.
const REQUIRED_SHADCN_COMPONENTS = [
  'Accordion',
  'Alert',
  'AlertDialog',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Calendar',
  'Card',
  'Checkbox',
  'Collapsible',
  'Command',
  'ContextMenu',
  'Dialog',
  'Drawer',
  'DropdownMenu',
  'HoverCard',
  'Input',
  'Label',
  'Menubar',
  'NavigationMenu',
  'Popover',
  'Progress',
  'RadioGroup',
  'ScrollArea',
  'Select',
  'Separator',
  'Sheet',
  'Skeleton',
  'Slider',
  'Switch',
  'Table',
  'Tabs',
  'Textarea',
  'Toast',
  'Toggle',
  'Tooltip',
] as const;

describe('COMPONENT_MAP completeness', () => {
  it.each(REQUIRED_SHADCN_COMPONENTS)('%s is present in COMPONENT_MAP', (name) => {
    expect(COMPONENT_MAP[name]).toBeDefined();
  });

  it('every entry has a valid importPath starting with @/components/ui/', () => {
    for (const [key, mapping] of Object.entries(COMPONENT_MAP)) {
      expect(mapping.importPath, `${key}.importPath`).toMatch(/^@\/components\/ui\//);
    }
  });

  it('every entry has at least one component in imports', () => {
    for (const [key, mapping] of Object.entries(COMPONENT_MAP)) {
      expect(mapping.imports.length, `${key}.imports`).toBeGreaterThanOrEqual(1);
    }
  });

  it('has no duplicate component names across non-alias entries', () => {
    // AUTO: Aliases (Modal→Dialog, Dropdown→DropdownMenu, Chip→Badge) intentionally
    // share imports with their targets, so we exclude them from the uniqueness check.
    const ALIAS_KEYS = new Set(['Modal', 'Dropdown', 'Chip']);
    const seen = new Map<string, string>();
    for (const [key, mapping] of Object.entries(COMPONENT_MAP)) {
      if (ALIAS_KEYS.has(key)) continue;
      for (const imp of mapping.imports) {
        const existing = seen.get(imp);
        if (existing) {
          // Allow the same import to appear in only one canonical entry
          expect.fail(`Duplicate import "${imp}" found in both "${existing}" and "${key}"`);
        }
        seen.set(imp, key);
      }
    }
  });

  it('import paths follow shadcn kebab-case conventions', () => {
    for (const [key, mapping] of Object.entries(COMPONENT_MAP)) {
      const segment = mapping.importPath.replace('@/components/ui/', '');
      expect(segment, `${key} import path segment`).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it('maps at least 36 components (30 shadcn + aliases + extras)', () => {
    expect(Object.keys(COMPONENT_MAP).length).toBeGreaterThanOrEqual(36);
  });
});

describe('resolveShadcnComponent', () => {
  it('maps Button to shadcn Button', () => {
    const result = resolveShadcnComponent('Button');
    expect(result).not.toBeNull();
    expect(result!.component).toBe('Button');
    expect(result!.importPath).toBe('@/components/ui/button');
  });

  it('maps Modal to shadcn Dialog', () => {
    const result = resolveShadcnComponent('Modal');
    expect(result).not.toBeNull();
    expect(result!.component).toBe('Dialog');
    expect(result!.importPath).toBe('@/components/ui/dialog');
  });

  it('maps Chip to shadcn Badge', () => {
    const result = resolveShadcnComponent('Chip');
    expect(result).not.toBeNull();
    expect(result!.component).toBe('Badge');
  });

  it('returns null for unknown components', () => {
    expect(resolveShadcnComponent('UnknownWidget')).toBeNull();
  });
});

describe('collectShadcnImports', () => {
  it('deduplicates imports from the same path', () => {
    const imports = collectShadcnImports(['Card', 'Card']);
    expect(imports.size).toBe(1);
    const cardImports = imports.get('@/components/ui/card')!;
    expect(cardImports).toContain('Card');
    expect(cardImports).toContain('CardHeader');
  });

  it('collects imports across multiple components', () => {
    const imports = collectShadcnImports(['Button', 'Card', 'Badge']);
    expect(imports.size).toBe(3);
    expect(imports.has('@/components/ui/button')).toBe(true);
    expect(imports.has('@/components/ui/card')).toBe(true);
    expect(imports.has('@/components/ui/badge')).toBe(true);
  });

  it('merges duplicate mappings (Chip + Badge share same path)', () => {
    const imports = collectShadcnImports(['Chip', 'Badge']);
    expect(imports.size).toBe(1);
    expect(imports.get('@/components/ui/badge')).toContain('Badge');
  });
});
