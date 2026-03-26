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
  // AUTO: filter-bar pattern component mappings
  Select: {
    component: 'Select',
    importPath: '@/components/ui/select',
    imports: ['Select', 'SelectTrigger', 'SelectContent', 'SelectItem', 'SelectValue'],
  },
  Chip: {
    component: 'Badge',
    importPath: '@/components/ui/badge',
    imports: ['Badge'],
    notes: 'Decantr Chip maps to shadcn Badge with variant',
  },
  // AUTO: data-table pattern component mappings
  Table: {
    component: 'Table',
    importPath: '@/components/ui/table',
    imports: ['Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell'],
  },
  Checkbox: {
    component: 'Checkbox',
    importPath: '@/components/ui/checkbox',
    imports: ['Checkbox'],
  },
  Pagination: {
    component: 'Pagination',
    importPath: '@/components/ui/pagination',
    imports: ['Pagination', 'PaginationContent', 'PaginationItem', 'PaginationPrevious', 'PaginationNext'],
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
  // AUTO: data-table pattern template for React + shadcn/ui emission
  'data-table': {
    imports: new Map([
      ['@/components/ui/table', ['Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell']],
      ['@/components/ui/checkbox', ['Checkbox']],
      ['@/components/ui/button', ['Button']],
      ['@/components/ui/input', ['Input']],
      ['@/components/ui/badge', ['Badge']],
      ['@/components/ui/dropdown-menu', ['DropdownMenu', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuTrigger']],
    ]),
    body: (gap: string) => [
      `    <div className="flex flex-col ${gap} w-full overflow-auto">`,
      `      <div className="flex items-center justify-between ${gap}">`,
      `        <Input placeholder="Search..." className="max-w-sm" />`,
      `        <div className="flex gap-2">`,
      `          <DropdownMenu>`,
      `            <DropdownMenuTrigger asChild>`,
      `              <Button variant="outline" size="sm">Columns</Button>`,
      `            </DropdownMenuTrigger>`,
      `            <DropdownMenuContent align="end">`,
      `              {["Name", "Status", "Email", "Amount"].map((col) => (`,
      `                <DropdownMenuItem key={col}>{col}</DropdownMenuItem>`,
      `              ))}`,
      `            </DropdownMenuContent>`,
      `          </DropdownMenu>`,
      `          <Button variant="outline" size="sm">Export</Button>`,
      `        </div>`,
      `      </div>`,
      `      <div className="rounded-md border">`,
      `        <Table>`,
      `          <TableHeader>`,
      `            <TableRow>`,
      `              <TableHead className="w-12"><Checkbox /></TableHead>`,
      `              <TableHead>Name</TableHead>`,
      `              <TableHead>Status</TableHead>`,
      `              <TableHead>Email</TableHead>`,
      `              <TableHead className="text-right">Amount</TableHead>`,
      `            </TableRow>`,
      `          </TableHeader>`,
      `          <TableBody>`,
      `            {[`,
      `              { name: "Alice Johnson", status: "active", email: "alice@example.com", amount: "$1,200" },`,
      `              { name: "Bob Smith", status: "inactive", email: "bob@example.com", amount: "$890" },`,
      `              { name: "Carol White", status: "active", email: "carol@example.com", amount: "$2,100" },`,
      `            ].map((row) => (`,
      `              <TableRow key={row.email}>`,
      `                <TableCell><Checkbox /></TableCell>`,
      `                <TableCell className="font-medium">{row.name}</TableCell>`,
      `                <TableCell><Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge></TableCell>`,
      `                <TableCell>{row.email}</TableCell>`,
      `                <TableCell className="text-right">{row.amount}</TableCell>`,
      `              </TableRow>`,
      `            ))}`,
      `          </TableBody>`,
      `        </Table>`,
      `      </div>`,
      `      <div className="flex items-center justify-between py-2">`,
      `        <p className="text-sm text-muted-foreground">3 row(s)</p>`,
      `        <div className="flex gap-2">`,
      `          <Button variant="outline" size="sm" disabled>Previous</Button>`,
      `          <Button variant="outline" size="sm">Next</Button>`,
      `        </div>`,
      `      </div>`,
      `    </div>`,
    ].join('\n'),
  },
  // AUTO: filter-bar pattern template for React + shadcn/ui emission
  'filter-bar': {
    imports: new Map([
      ['@/components/ui/input', ['Input']],
      ['@/components/ui/select', ['Select', 'SelectTrigger', 'SelectContent', 'SelectItem', 'SelectValue']],
      ['@/components/ui/button', ['Button']],
      ['@/components/ui/badge', ['Badge']],
      ['@/components/ui/popover', ['Popover', 'PopoverContent', 'PopoverTrigger']],
    ]),
    body: (gap: string) => [
      `    <div className="flex flex-row items-center ${gap} w-full py-2">`,
      `      <Input placeholder="Search..." className="max-w-sm flex-1" />`,
      `      <Select>`,
      `        <SelectTrigger className="w-[160px]">`,
      `          <SelectValue placeholder="Category" />`,
      `        </SelectTrigger>`,
      `        <SelectContent>`,
      `          {["All Categories", "Active", "Archived"].map((opt) => (`,
      `            <SelectItem key={opt} value={opt.toLowerCase().replace(/ /g, "-")}>{opt}</SelectItem>`,
      `          ))}`,
      `        </SelectContent>`,
      `      </Select>`,
      `      <Select>`,
      `        <SelectTrigger className="w-[140px]">`,
      `          <SelectValue placeholder="Status" />`,
      `        </SelectTrigger>`,
      `        <SelectContent>`,
      `          {["All", "Published", "Draft"].map((opt) => (`,
      `            <SelectItem key={opt} value={opt.toLowerCase()}>{opt}</SelectItem>`,
      `          ))}`,
      `        </SelectContent>`,
      `      </Select>`,
      `      <div className="flex gap-2 ml-auto">`,
      `        <Button variant="outline" size="sm">Clear</Button>`,
      `        <Button size="sm">Apply</Button>`,
      `      </div>`,
      `    </div>`,
    ].join('\n'),
  },
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
