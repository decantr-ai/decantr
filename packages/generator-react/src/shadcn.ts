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
  // AUTO: card-grid pattern component mappings
  AspectRatio: {
    component: 'AspectRatio',
    importPath: '@/components/ui/aspect-ratio',
    imports: ['AspectRatio'],
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
  // AUTO: card-grid pattern templates for React + shadcn/ui emission
  'card-grid': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardHeader', 'CardContent', 'CardFooter', 'CardTitle']],
      ['@/components/ui/button', ['Button']],
      ['@/components/ui/badge', ['Badge']],
      ['@/components/ui/aspect-ratio', ['AspectRatio']],
    ]),
    body: (gap: string) => [
      `    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gap}">`,
      `      {[`,
      `        { name: "Wireless Headphones", price: "$79.99", rating: 4.5, reviews: 128, image: "/images/headphones.jpg" },`,
      `        { name: "Mechanical Keyboard", price: "$149.99", rating: 4.8, reviews: 256, image: "/images/keyboard.jpg" },`,
      `        { name: "USB-C Hub", price: "$49.99", rating: 4.2, reviews: 89, image: "/images/hub.jpg" },`,
      `        { name: "Webcam HD", price: "$69.99", rating: 4.6, reviews: 312, image: "/images/webcam.jpg" },`,
      `      ].map((product) => (`,
      `        <Card key={product.name} className="flex flex-col overflow-hidden">`,
      `          <AspectRatio ratio={4 / 3}>`,
      `            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />`,
      `          </AspectRatio>`,
      `          <CardContent className="flex flex-col gap-2 p-4">`,
      `            <p className="text-sm font-medium">{product.name}</p>`,
      `            <p className="text-xl font-bold">{product.price}</p>`,
      `            <div className="flex items-center gap-1">`,
      `              <Badge variant="secondary">{product.reviews} reviews</Badge>`,
      `            </div>`,
      `          </CardContent>`,
      `          <CardFooter className="p-4 pt-0">`,
      `            <Button size="sm" className="w-full">Add to Cart</Button>`,
      `          </CardFooter>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
  'card-grid:content': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardContent', 'CardHeader', 'CardTitle']],
      ['@/components/ui/badge', ['Badge']],
      ['@/components/ui/avatar', ['Avatar', 'AvatarImage', 'AvatarFallback']],
    ]),
    body: (gap: string) => [
      `    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap}">`,
      `      {[`,
      `        { title: "Getting Started with Decantr", excerpt: "Learn how to build your first app.", category: "Tutorial", author: "Jane Doe", date: "2025-03-15", image: "/images/post1.jpg" },`,
      `        { title: "Advanced Signal Patterns", excerpt: "Deep dive into reactive signal composition.", category: "Guide", author: "John Smith", date: "2025-03-12", image: "/images/post2.jpg" },`,
      `        { title: "Registry-Driven UI", excerpt: "How the content registry powers generation.", category: "Architecture", author: "Alex Chen", date: "2025-03-10", image: "/images/post3.jpg" },`,
      `      ].map((post) => (`,
      `        <Card key={post.title} className="flex flex-col overflow-hidden">`,
      `          <CardHeader className="p-0">`,
      `            <div className="aspect-video overflow-hidden">`,
      `              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />`,
      `            </div>`,
      `          </CardHeader>`,
      `          <CardContent className="flex flex-col gap-3 p-4">`,
      `            <Badge variant="outline" className="w-fit">{post.category}</Badge>`,
      `            <CardTitle className="text-lg">{post.title}</CardTitle>`,
      `            <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>`,
      `            <div className="flex items-center gap-2 text-sm text-muted-foreground">`,
      `              <Avatar className="h-6 w-6">`,
      `                <AvatarFallback>{post.author[0]}</AvatarFallback>`,
      `              </Avatar>`,
      `              <span>{post.author}</span>`,
      `              <span>&middot;</span>`,
      `              <time>{post.date}</time>`,
      `            </div>`,
      `          </CardContent>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
  'card-grid:collection': {
    imports: new Map([
      ['@/components/ui/card', ['Card']],
      ['@/components/ui/badge', ['Badge']],
    ]),
    body: (gap: string) => [
      `    <div className="grid grid-cols-2 lg:grid-cols-3 ${gap}">`,
      `      {[`,
      `        { name: "Electronics", count: 234, image: "/images/electronics.jpg" },`,
      `        { name: "Clothing", count: 567, image: "/images/clothing.jpg" },`,
      `        { name: "Home & Garden", count: 189, image: "/images/home.jpg" },`,
      `        { name: "Sports", count: 312, image: "/images/sports.jpg" },`,
      `        { name: "Books", count: 445, image: "/images/books.jpg" },`,
      `        { name: "Toys", count: 178, image: "/images/toys.jpg" },`,
      `      ].map((col) => (`,
      `        <Card key={col.name} className="relative aspect-[3/2] overflow-hidden cursor-pointer group">`,
      `          <img src={col.image} alt={col.name} className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-105" />`,
      `          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />`,
      `          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">`,
      `            <h3 className="text-lg font-semibold text-white">{col.name}</h3>`,
      `            <Badge variant="secondary">{col.count} items</Badge>`,
      `          </div>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
  'card-grid:icon': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardContent']],
    ]),
    body: (gap: string) => [
      `    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${gap}">`,
      `      {[`,
      `        { title: "Fast Build", description: "Lightning-fast compilation and HMR" },`,
      `        { title: "Type Safe", description: "Full TypeScript support out of the box" },`,
      `        { title: "Responsive", description: "Mobile-first responsive design system" },`,
      `        { title: "Accessible", description: "WCAG 2.1 AA compliant components" },`,
      `        { title: "Themeable", description: "Dark mode and custom theme support" },`,
      `        { title: "Extensible", description: "Plugin architecture for custom needs" },`,
      `        { title: "Tested", description: "Comprehensive test coverage built in" },`,
      `        { title: "Documented", description: "Detailed docs with live examples" },`,
      `      ].map((feature) => (`,
      `        <Card key={feature.title}>`,
      `          <CardContent className="flex flex-col items-center text-center gap-2 p-4">`,
      `            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted" />`,
      `            <h4 className="text-sm font-medium">{feature.title}</h4>`,
      `            <p className="text-xs text-muted-foreground">{feature.description}</p>`,
      `          </CardContent>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
  // AUTO: chart-grid pattern templates for React + shadcn/ui emission
  'chart-grid': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardContent', 'CardHeader', 'CardTitle']],
    ]),
    body: (gap: string) => [
      `    {/* AUTO: Replace with Recharts/Chart.js component */}`,
      `    {/* import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"; */}`,
      `    <div className="grid grid-cols-1 lg:grid-cols-2 ${gap}">`,
      `      {[`,
      `        { title: "Revenue Over Time", type: "line", legends: ["Revenue", "Expenses"] },`,
      `        { title: "Users by Region", type: "bar", legends: ["NA", "EU", "APAC"] },`,
      `        { title: "Traffic Sources", type: "pie", legends: ["Organic", "Paid", "Referral"] },`,
      `        { title: "Engagement Trend", type: "area", legends: ["Sessions", "Bounce Rate"] },`,
      `      ].map((chart) => (`,
      `        <Card key={chart.title}>`,
      `          <CardHeader>`,
      `            <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>`,
      `          </CardHeader>`,
      `          <CardContent>`,
      `            {/* AUTO: Replace with Recharts/Chart.js component */}`,
      `            <div className="min-h-[200px] rounded-md bg-muted/10 flex items-center justify-center" data-chart-type={chart.type}>`,
      `              <span className="text-sm text-muted-foreground">[{chart.type} chart placeholder]</span>`,
      `            </div>`,
      `            <div className="flex gap-2 mt-2">`,
      `              {chart.legends.map((legend) => (`,
      `                <div key={legend} className="flex items-center gap-1 text-xs text-muted-foreground">`,
      `                  <div className="w-2 h-2 rounded-full bg-primary" />`,
      `                  <span>{legend}</span>`,
      `                </div>`,
      `              ))}`,
      `            </div>`,
      `          </CardContent>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
  'chart-grid:wide': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardContent', 'CardHeader', 'CardTitle']],
    ]),
    body: (gap: string) => [
      `    {/* AUTO: Replace with Recharts/Chart.js component */}`,
      `    <div className="flex flex-row ${gap} overflow-auto">`,
      `      {[`,
      `        { title: "Revenue Over Time", type: "line" },`,
      `        { title: "Users by Region", type: "bar" },`,
      `        { title: "Traffic Sources", type: "pie" },`,
      `      ].map((chart) => (`,
      `        <Card key={chart.title} className="min-w-[300px] shrink-0">`,
      `          <CardHeader>`,
      `            <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>`,
      `          </CardHeader>`,
      `          <CardContent>`,
      `            <div className="min-h-[200px] rounded-md bg-muted/10 flex items-center justify-center" data-chart-type={chart.type}>`,
      `              <span className="text-sm text-muted-foreground">[{chart.type} chart placeholder]</span>`,
      `            </div>`,
      `          </CardContent>`,
      `        </Card>`,
      `      ))}`,
      `    </div>`,
    ].join('\n'),
  },
  'chart-grid:mixed': {
    imports: new Map([
      ['@/components/ui/card', ['Card', 'CardContent', 'CardHeader', 'CardTitle']],
    ]),
    body: (gap: string) => [
      `    {/* AUTO: Replace with Recharts/Chart.js component */}`,
      `    <div className="grid grid-cols-1 lg:grid-cols-2 ${gap}">`,
      `      <Card className="lg:col-span-2">`,
      `        <CardHeader>`,
      `          <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>`,
      `        </CardHeader>`,
      `        <CardContent>`,
      `          <div className="min-h-[300px] rounded-md bg-muted/10 flex items-center justify-center" data-chart-type="area">`,
      `            <span className="text-sm text-muted-foreground">[area chart placeholder]</span>`,
      `          </div>`,
      `        </CardContent>`,
      `      </Card>`,
      `      <Card>`,
      `        <CardHeader>`,
      `          <CardTitle className="text-sm font-medium">Users by Source</CardTitle>`,
      `        </CardHeader>`,
      `        <CardContent>`,
      `          <div className="min-h-[200px] rounded-md bg-muted/10 flex items-center justify-center" data-chart-type="pie">`,
      `            <span className="text-sm text-muted-foreground">[pie chart placeholder]</span>`,
      `          </div>`,
      `        </CardContent>`,
      `      </Card>`,
      `      <Card>`,
      `        <CardHeader>`,
      `          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>`,
      `        </CardHeader>`,
      `        <CardContent>`,
      `          <div className="min-h-[200px] rounded-md bg-muted/10 flex items-center justify-center" data-chart-type="bar">`,
      `            <span className="text-sm text-muted-foreground">[bar chart placeholder]</span>`,
      `          </div>`,
      `        </CardContent>`,
      `      </Card>`,
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
