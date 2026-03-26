/**
 * Map Decantr component names to shadcn/ui component imports.
 */

export interface ShadcnMapping {
  /** shadcn component name */
  component: string;
  /** Import path (e.g. "@/components/ui/button") */
  importPath: string;
  /** Named exports to import */
  imports: string[];
  /** Additional notes */
  notes?: string;
}

export const COMPONENT_MAP: Record<string, ShadcnMapping> = {
  Button: {
    component: 'Button',
    importPath: '@/components/ui/button',
    imports: ['Button'],
  },
  Card: {
    component: 'Card',
    importPath: '@/components/ui/card',
    imports: ['Card', 'CardHeader', 'CardTitle', 'CardContent'],
    notes: 'Card.Header → CardHeader+CardTitle, Card.Body → CardContent',
  },
  Input: {
    component: 'Input',
    importPath: '@/components/ui/input',
    imports: ['Input'],
  },
  Tabs: {
    component: 'Tabs',
    importPath: '@/components/ui/tabs',
    imports: ['Tabs', 'TabsList', 'TabsTrigger', 'TabsContent'],
  },
  Modal: {
    component: 'Dialog',
    importPath: '@/components/ui/dialog',
    imports: ['Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogTrigger'],
    notes: 'Modal → Dialog',
  },
  Dropdown: {
    component: 'DropdownMenu',
    importPath: '@/components/ui/dropdown-menu',
    imports: ['DropdownMenu', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuTrigger', 'DropdownMenuSeparator'],
  },
  Badge: {
    component: 'Badge',
    importPath: '@/components/ui/badge',
    imports: ['Badge'],
  },
  Avatar: {
    component: 'Avatar',
    importPath: '@/components/ui/avatar',
    imports: ['Avatar', 'AvatarImage', 'AvatarFallback'],
  },
  Popover: {
    component: 'Popover',
    importPath: '@/components/ui/popover',
    imports: ['Popover', 'PopoverContent', 'PopoverTrigger'],
  },
  Command: {
    component: 'Command',
    importPath: '@/components/ui/command',
    imports: ['CommandDialog', 'CommandInput', 'CommandList', 'CommandItem', 'CommandGroup'],
    notes: 'Decantr Command palette → shadcn CommandDialog',
  },
  Breadcrumb: {
    component: 'Breadcrumb',
    importPath: '@/components/ui/breadcrumb',
    imports: ['Breadcrumb', 'BreadcrumbList', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbSeparator'],
  },
  Chip: {
    component: 'Badge',
    importPath: '@/components/ui/badge',
    imports: ['Badge'],
    notes: 'Decantr Chip maps to shadcn Badge with variant',
  },
};

/** Resolve the shadcn import for a Decantr component name */
export function resolveShadcnComponent(decantrComponent: string): ShadcnMapping | null {
  return COMPONENT_MAP[decantrComponent] || null;
}

/** Collect all shadcn imports needed for a set of Decantr component names */
export function collectShadcnImports(components: string[]): Map<string, string[]> {
  const imports = new Map<string, string[]>();
  for (const comp of components) {
    const mapping = COMPONENT_MAP[comp];
    if (mapping) {
      const existing = imports.get(mapping.importPath) || [];
      imports.set(mapping.importPath, [...new Set([...existing, ...mapping.imports])]);
    }
  }
  return imports;
}
