// ── Emissions KPIs ──
export const emissionsKpis = [
  { label: 'Total Emissions', value: '24,350', unit: 'tCO2e', change: '-8.2%', trend: 'down' as const },
  { label: 'Scope 1 (Direct)', value: '6,120', unit: 'tCO2e', change: '-12%', trend: 'down' as const },
  { label: 'Scope 2 (Energy)', value: '8,430', unit: 'tCO2e', change: '-6%', trend: 'down' as const },
  { label: 'Scope 3 (Supply)', value: '9,800', unit: 'tCO2e', change: '-4%', trend: 'down' as const },
  { label: 'Carbon Intensity', value: '0.42', unit: 'tCO2e/$M', change: '-11%', trend: 'down' as const },
  { label: 'Offset Credits', value: '3,200', unit: 'tCO2e', change: '+24%', trend: 'up' as const },
];

// ── Sankey Flow Data ──
export interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export const sankeyNodes: SankeyNode[] = [
  { id: 'fleet', label: 'Fleet Vehicles', value: 3200, color: '#92400E' },
  { id: 'facilities', label: 'Facilities', value: 2920, color: '#92400E' },
  { id: 'electricity', label: 'Electricity', value: 5100, color: '#B45309' },
  { id: 'heating', label: 'Heating', value: 3330, color: '#B45309' },
  { id: 'transport', label: 'Upstream Transport', value: 3800, color: '#78350F' },
  { id: 'materials', label: 'Purchased Goods', value: 4200, color: '#78350F' },
  { id: 'waste', label: 'Waste & Water', value: 1800, color: '#78350F' },
  { id: 'scope1', label: 'Scope 1', value: 6120, color: '#DC2626' },
  { id: 'scope2', label: 'Scope 2', value: 8430, color: '#D97706' },
  { id: 'scope3', label: 'Scope 3', value: 9800, color: '#65A30D' },
];

export const sankeyLinks: SankeyLink[] = [
  { source: 'fleet', target: 'scope1', value: 3200 },
  { source: 'facilities', target: 'scope1', value: 2920 },
  { source: 'electricity', target: 'scope2', value: 5100 },
  { source: 'heating', target: 'scope2', value: 3330 },
  { source: 'transport', target: 'scope3', value: 3800 },
  { source: 'materials', target: 'scope3', value: 4200 },
  { source: 'waste', target: 'scope3', value: 1800 },
];

// ── Target Progress ──
export interface Target {
  id: string;
  label: string;
  description: string;
  baseline: number;
  current: number;
  goal: number;
  year: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

export const targets: Target[] = [
  { id: 't1', label: 'Net Zero by 2040', description: 'Science-based target aligned with 1.5C pathway', baseline: 32000, current: 24350, goal: 0, year: 2040, unit: 'tCO2e', status: 'on-track' },
  { id: 't2', label: 'Scope 1 Reduction', description: 'Electrify fleet and improve facility efficiency', baseline: 9800, current: 6120, goal: 2000, year: 2030, unit: 'tCO2e', status: 'on-track' },
  { id: 't3', label: 'Scope 2 Reduction', description: '100% renewable electricity procurement', baseline: 12000, current: 8430, goal: 1200, year: 2030, unit: 'tCO2e', status: 'at-risk' },
  { id: 't4', label: 'Scope 3 Halving', description: 'Engage top 50 suppliers in SBTi commitment', baseline: 14500, current: 9800, goal: 7250, year: 2030, unit: 'tCO2e', status: 'behind' },
];

// ── Scope Detail Breakdowns ──
export interface ScopeCategory {
  name: string;
  emissions: number;
  percentage: number;
  trend: 'up' | 'down' | 'flat';
  change: string;
}

export const scopeBreakdowns: Record<string, { label: string; description: string; total: number; categories: ScopeCategory[] }> = {
  '1': {
    label: 'Scope 1 — Direct Emissions',
    description: 'Emissions from owned or controlled sources: fleet vehicles, on-site fuel combustion, refrigerants, and process emissions.',
    total: 6120,
    categories: [
      { name: 'Fleet Vehicles', emissions: 3200, percentage: 52.3, trend: 'down', change: '-14%' },
      { name: 'Stationary Combustion', emissions: 1820, percentage: 29.7, trend: 'down', change: '-8%' },
      { name: 'Refrigerants', emissions: 680, percentage: 11.1, trend: 'flat', change: '0%' },
      { name: 'Process Emissions', emissions: 420, percentage: 6.9, trend: 'down', change: '-3%' },
    ],
  },
  '2': {
    label: 'Scope 2 — Energy Indirect',
    description: 'Emissions from purchased electricity, steam, heating, and cooling consumed by the organization.',
    total: 8430,
    categories: [
      { name: 'Purchased Electricity', emissions: 5100, percentage: 60.5, trend: 'down', change: '-9%' },
      { name: 'District Heating', emissions: 2130, percentage: 25.3, trend: 'down', change: '-4%' },
      { name: 'Purchased Steam', emissions: 800, percentage: 9.5, trend: 'flat', change: '+1%' },
      { name: 'Purchased Cooling', emissions: 400, percentage: 4.7, trend: 'down', change: '-2%' },
    ],
  },
  '3': {
    label: 'Scope 3 — Value Chain',
    description: 'All other indirect emissions in the value chain: purchased goods, transportation, waste, employee commuting, investments.',
    total: 9800,
    categories: [
      { name: 'Purchased Goods & Services', emissions: 4200, percentage: 42.9, trend: 'down', change: '-3%' },
      { name: 'Upstream Transportation', emissions: 2100, percentage: 21.4, trend: 'down', change: '-6%' },
      { name: 'Waste Generated', emissions: 1200, percentage: 12.2, trend: 'down', change: '-8%' },
      { name: 'Employee Commuting', emissions: 900, percentage: 9.2, trend: 'down', change: '-12%' },
      { name: 'Business Travel', emissions: 800, percentage: 8.2, trend: 'up', change: '+5%' },
      { name: 'Downstream Transport', emissions: 600, percentage: 6.1, trend: 'flat', change: '-1%' },
    ],
  },
};

// ── Monthly Trend Data ──
export const monthlyEmissions = [
  { month: 'Jan', scope1: 540, scope2: 720, scope3: 850 },
  { month: 'Feb', scope1: 510, scope2: 700, scope3: 830 },
  { month: 'Mar', scope1: 530, scope2: 710, scope3: 840 },
  { month: 'Apr', scope1: 500, scope2: 690, scope3: 810 },
  { month: 'May', scope1: 480, scope2: 680, scope3: 800 },
  { month: 'Jun', scope1: 520, scope2: 720, scope3: 820 },
  { month: 'Jul', scope1: 550, scope2: 740, scope3: 860 },
  { month: 'Aug', scope1: 530, scope2: 730, scope3: 850 },
  { month: 'Sep', scope1: 490, scope2: 700, scope3: 810 },
  { month: 'Oct', scope1: 470, scope2: 680, scope3: 790 },
  { month: 'Nov', scope1: 500, scope2: 690, scope3: 770 },
  { month: 'Dec', scope1: 500, scope2: 670, scope3: 770 },
];

// ── Suppliers ──
export interface Supplier {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  country: string;
  region: string;
  emissions: number;
  category: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  sbtiCommitted: boolean;
  lat: number;
  lng: number;
}

export const suppliers: Supplier[] = [
  { id: 's1', name: 'Nordic Steel AB', tier: 1, country: 'Sweden', region: 'EU', emissions: 1240, category: 'Raw Materials', status: 'compliant', sbtiCommitted: true, lat: 59.3, lng: 18.1 },
  { id: 's2', name: 'Pacific Logistics', tier: 1, country: 'Japan', region: 'APAC', emissions: 890, category: 'Transportation', status: 'compliant', sbtiCommitted: true, lat: 35.7, lng: 139.7 },
  { id: 's3', name: 'Midwest Components', tier: 2, country: 'USA', region: 'NA', emissions: 2100, category: 'Manufacturing', status: 'at-risk', sbtiCommitted: false, lat: 41.9, lng: -87.6 },
  { id: 's4', name: 'Shenzhen Electronics', tier: 1, country: 'China', region: 'APAC', emissions: 3400, category: 'Electronics', status: 'non-compliant', sbtiCommitted: false, lat: 22.5, lng: 114.1 },
  { id: 's5', name: 'Rhine Chemical GmbH', tier: 2, country: 'Germany', region: 'EU', emissions: 780, category: 'Chemicals', status: 'compliant', sbtiCommitted: true, lat: 50.9, lng: 6.9 },
  { id: 's6', name: 'Santos Packaging', tier: 3, country: 'Brazil', region: 'LATAM', emissions: 560, category: 'Packaging', status: 'at-risk', sbtiCommitted: false, lat: -23.5, lng: -46.6 },
  { id: 's7', name: 'Anatolian Textiles', tier: 2, country: 'Turkey', region: 'EMEA', emissions: 920, category: 'Textiles', status: 'compliant', sbtiCommitted: true, lat: 39.9, lng: 32.9 },
  { id: 's8', name: 'Great Lakes Paper', tier: 3, country: 'Canada', region: 'NA', emissions: 340, category: 'Paper & Pulp', status: 'compliant', sbtiCommitted: false, lat: 43.7, lng: -79.4 },
];

// ── Offset Projects ──
export interface OffsetProject {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  available: number;
  vintage: string;
  standard: string;
  rating: number;
  description: string;
  image: string;
  co_benefits: string[];
}

export const offsetProjects: OffsetProject[] = [
  { id: 'o1', name: 'Amazon Rainforest Conservation', type: 'REDD+', location: 'Brazil', price: 18.5, available: 12000, vintage: '2025', standard: 'Verra VCS', rating: 4.8, description: 'Protecting 50,000 hectares of primary Amazon rainforest from deforestation through community-led conservation.', image: '', co_benefits: ['Biodiversity', 'Community Livelihood', 'Water Protection'] },
  { id: 'o2', name: 'Gujarat Wind Farm', type: 'Renewable Energy', location: 'India', price: 8.2, available: 45000, vintage: '2025', standard: 'Gold Standard', rating: 4.5, description: 'A 120 MW wind farm generating clean energy for 80,000 households in rural Gujarat.', image: '', co_benefits: ['Clean Energy Access', 'Job Creation'] },
  { id: 'o3', name: 'Kenya Cookstove Program', type: 'Energy Efficiency', location: 'Kenya', price: 12.0, available: 8000, vintage: '2025', standard: 'Gold Standard', rating: 4.9, description: 'Distributing fuel-efficient cookstoves to 25,000 households, reducing wood fuel use by 60%.', image: '', co_benefits: ['Health', 'Gender Equality', 'Deforestation Reduction'] },
  { id: 'o4', name: 'Pacific Northwest Reforestation', type: 'Afforestation', location: 'USA', price: 24.0, available: 5000, vintage: '2024', standard: 'ACR', rating: 4.3, description: 'Replanting native species on 3,000 acres of degraded timberland in Oregon and Washington.', image: '', co_benefits: ['Biodiversity', 'Watershed Restoration', 'Local Employment'] },
  { id: 'o5', name: 'North Sea Blue Carbon', type: 'Blue Carbon', location: 'Netherlands', price: 32.0, available: 2000, vintage: '2025', standard: 'Verra VCS', rating: 4.7, description: 'Restoring 800 hectares of coastal wetlands and seagrass meadows for long-term carbon sequestration.', image: '', co_benefits: ['Coastal Protection', 'Marine Biodiversity', 'Fisheries'] },
  { id: 'o6', name: 'Biochar Soil Amendment', type: 'Carbon Removal', location: 'Australia', price: 85.0, available: 500, vintage: '2025', standard: 'Puro.earth', rating: 4.6, description: 'Producing biochar from agricultural waste and applying to degraded soils for permanent carbon storage.', image: '', co_benefits: ['Soil Health', 'Agricultural Productivity', 'Waste Reduction'] },
];

// ── Cart ──
export interface CartItem {
  projectId: string;
  quantity: number;
}

// ── Reports ──
export interface Report {
  id: string;
  title: string;
  framework: string;
  status: 'draft' | 'in-review' | 'submitted' | 'approved';
  period: string;
  lastModified: string;
  completeness: number;
  assignee: string;
}

export const reports: Report[] = [
  { id: 'r1', title: 'CSRD Annual Disclosure 2025', framework: 'CSRD', status: 'in-review', period: 'FY 2025', lastModified: '2026-03-28', completeness: 87, assignee: 'Elena Vasquez' },
  { id: 'r2', title: 'SEC Climate Risk Filing', framework: 'SEC', status: 'draft', period: 'FY 2025', lastModified: '2026-04-01', completeness: 42, assignee: 'Marcus Chen' },
  { id: 'r3', title: 'CDP Climate Response', framework: 'CDP', status: 'submitted', period: 'FY 2025', lastModified: '2026-02-15', completeness: 100, assignee: 'Elena Vasquez' },
  { id: 'r4', title: 'TCFD Alignment Report', framework: 'TCFD', status: 'approved', period: 'FY 2024', lastModified: '2025-06-30', completeness: 100, assignee: 'Priya Sharma' },
  { id: 'r5', title: 'Scope 3 Supplier Disclosure', framework: 'GHG Protocol', status: 'draft', period: 'FY 2025', lastModified: '2026-03-20', completeness: 31, assignee: 'Marcus Chen' },
  { id: 'r6', title: 'Sustainability Report 2024', framework: 'GRI', status: 'approved', period: 'FY 2024', lastModified: '2025-04-15', completeness: 100, assignee: 'Priya Sharma' },
];

// ── CSRD Report Sections ──
export const csrdSections = [
  { id: 'e1', code: 'E1', title: 'Climate Change', description: 'GHG emissions, transition plans, energy consumption', completeness: 92 },
  { id: 'e2', code: 'E2', title: 'Pollution', description: 'Air, water, and soil pollution prevention', completeness: 78 },
  { id: 'e3', code: 'E3', title: 'Water & Marine', description: 'Water consumption, marine resource impact', completeness: 65 },
  { id: 'e4', code: 'E4', title: 'Biodiversity', description: 'Impact on ecosystems and biodiversity', completeness: 45 },
  { id: 'e5', code: 'E5', title: 'Resource Use', description: 'Circular economy, waste management', completeness: 71 },
  { id: 's1', code: 'S1', title: 'Own Workforce', description: 'Working conditions, equal treatment, health & safety', completeness: 88 },
  { id: 's2', code: 'S2', title: 'Value Chain Workers', description: 'Supply chain labor conditions', completeness: 52 },
  { id: 'g1', code: 'G1', title: 'Business Conduct', description: 'Governance, anti-corruption, lobbying', completeness: 95 },
];

// ── Feature Items (marketing) ──
export const marketingFeatures = [
  { title: 'Scope 1/2/3 Tracking', description: 'Comprehensive GHG Protocol-aligned emissions tracking across all three scopes with automated data collection.' },
  { title: 'Sankey Flow Diagrams', description: 'Interactive Sankey visualizations showing how emissions flow from sources through organizational boundaries.' },
  { title: 'Supply Chain Mapping', description: 'Geographic supplier mapping with tier rings showing Scope 3 complexity and SBTi commitment status.' },
  { title: 'Science-Based Targets', description: 'Track reduction targets against SBTi-validated pathways with animated progress rings.' },
  { title: 'Offset Marketplace', description: 'Browse and purchase verified carbon offsets from REDD+, renewables, and carbon removal projects.' },
  { title: 'CSRD Reporting', description: 'Built-in CSRD, SEC climate, and CDP reporting templates with guided completion workflows.' },
];

export const testimonials = [
  { name: 'Sarah Mitchell', role: 'VP Sustainability, Apex Manufacturing', quote: 'Climate Dashboard cut our CSRD reporting time by 60%. The Sankey diagrams finally made our board understand our emissions profile.' },
  { name: 'Dr. Raj Patel', role: 'Chief Sustainability Officer, TerraLogistics', quote: 'The supply chain mapping feature identified three high-risk tier-2 suppliers we had completely missed. Game-changing visibility.' },
  { name: 'Ingrid Svensson', role: 'ESG Analyst, Nordic Investment Fund', quote: 'The most intuitive carbon accounting tool we have evaluated. Our portfolio companies adopted it within weeks.' },
];
