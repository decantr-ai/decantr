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

// AUTO: Pattern-level shadcn templates for patterns that need specific React layouts
// beyond the generic Card-based template in buildPatternComponent
export interface PatternShadcnTemplate {
  /** Additional shadcn component imports needed */
  imports: Map<string, string[]>;
  /** Function that generates the JSX body for the pattern */
  body: (gapClass: string) => string;
}

export const PATTERN_TEMPLATE_MAP: Record<string, PatternShadcnTemplate> = {
  'kpi-grid': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardContent', 'CardHeader', 'CardTitle']],
      ['@/components/ui/badge', ['Badge']],
    ]),
    body: (gap: string) => [
      `    <div className="grid grid-cols-2 lg:grid-cols-4 ${gap} p-4">`,
      `      {[`,
      `        { label: "Total Revenue", value: "$45,231", change: "+20.1%", trend: "up" },`,
      `        { label: "Subscriptions", value: "2,350", change: "+180", trend: "up" },`,
      `        { label: "Active Now", value: "573", change: "+19", trend: "up" },`,
      `        { label: "Bounce Rate", value: "24.5%", change: "-4.3%", trend: "down" },`,
      `      ].map((kpi) => (`,
      `        <Card key={kpi.label}>`,
      `          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">`,
      `            <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>`,
      `          </CardHeader>`,
      `          <CardContent>`,
      `            <p className="text-2xl font-bold">{kpi.value}</p>`,
      `            <Badge variant={kpi.trend === "up" ? "default" : "secondary"}>`,
      `              {kpi.change}`,
      `            </Badge>`,
      `          </CardContent>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
};

/** Resolve the pattern-specific shadcn template if one exists */
export function resolvePatternTemplate(patternId: string): PatternShadcnTemplate | null {
  return PATTERN_TEMPLATE_MAP[patternId] || null;
}

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
