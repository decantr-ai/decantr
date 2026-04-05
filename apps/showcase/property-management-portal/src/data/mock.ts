/* ── Mock Data: Cornerstone Property Management ── */

export interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export type PropertyStatus = 'fully-occupied' | 'partial-vacancy' | 'maintenance' | 'renovation';
export type UnitStatus = 'occupied' | 'vacant' | 'maintenance' | 'turning';

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'Multifamily' | 'Single Family' | 'Commercial' | 'Condo';
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  status: PropertyStatus;
  image: string;
  yearBuilt: number;
  sqft: number;
  acquired: string;
  manager: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  number: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  status: UnitStatus;
  tenantId?: string;
  leaseEnd?: string;
  lastTurn?: string;
}

export type LeaseStatus = 'active' | 'expiring' | 'month-to-month' | 'notice-given' | 'expired';

export interface Tenant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  status: LeaseStatus;
  balance: number;
  moveInDate: string;
  tags: string[];
}

export type TicketStatus = 'new' | 'assigned' | 'in-progress' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceTicket {
  id: string;
  number: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  tenantName: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Appliance' | 'Structural' | 'Other';
  assignee?: string;
  submitted: string;
  updated: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'late' | 'partial' | 'failed';

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  method: 'ACH' | 'Card' | 'Check' | 'Wire';
  status: PaymentStatus;
  reference: string;
}

export interface ChartSeries {
  label: string;
  values: number[];
  color: string;
}

export interface ChartDef {
  title: string;
  type: 'area' | 'line' | 'bar';
  series: ChartSeries[];
  labels: string[];
}

export interface ActivityEvent {
  id: string;
  actor: string;
  actorAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'lease' | 'payment' | 'maintenance' | 'property' | 'tenant' | 'system';
}

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

/* ── Dashboard KPIs ── */

export const ownerKpis: Kpi[] = [
  { label: 'Portfolio Value', value: '$18.4M', change: 6.2, icon: 'building-2' },
  { label: 'Monthly Revenue', value: '$142,820', change: 3.8, icon: 'dollar-sign' },
  { label: 'Occupancy Rate', value: '94.2%', change: 1.4, icon: 'users' },
  { label: 'Open Tickets', value: '18', change: -12.0, icon: 'wrench' },
];

export const financialKpis: Kpi[] = [
  { label: 'YTD Revenue', value: '$428,460', change: 8.4, icon: 'trending-up' },
  { label: 'YTD Expenses', value: '$124,280', change: 4.2, icon: 'receipt' },
  { label: 'Net Operating Income', value: '$304,180', change: 10.1, icon: 'piggy-bank' },
  { label: 'Collection Rate', value: '98.6%', change: 0.4, icon: 'check-circle' },
];

/* ── Properties ── */

export const properties: Property[] = [
  { id: 'prop-1', name: 'The Meridian', address: '412 Oakwood Avenue', city: 'Portland, OR', type: 'Multifamily', units: 24, occupiedUnits: 23, monthlyRevenue: 48600, status: 'partial-vacancy', image: 'ME', yearBuilt: 2018, sqft: 28400, acquired: '2021-03-14', manager: 'David Park' },
  { id: 'prop-2', name: 'Maple Grove Apartments', address: '88 Maple Street', city: 'Seattle, WA', type: 'Multifamily', units: 16, occupiedUnits: 16, monthlyRevenue: 32400, status: 'fully-occupied', image: 'MG', yearBuilt: 2015, sqft: 18200, acquired: '2020-07-22', manager: 'David Park' },
  { id: 'prop-3', name: 'Cedar Heights', address: '201 Cedar Ridge Rd', city: 'Denver, CO', type: 'Multifamily', units: 12, occupiedUnits: 11, monthlyRevenue: 22800, status: 'partial-vacancy', image: 'CH', yearBuilt: 2012, sqft: 14600, acquired: '2019-11-08', manager: 'Sarah Mitchell' },
  { id: 'prop-4', name: 'Birchwood Estates', address: '345 Birchwood Lane', city: 'Austin, TX', type: 'Multifamily', units: 18, occupiedUnits: 17, monthlyRevenue: 34200, status: 'partial-vacancy', image: 'BE', yearBuilt: 2020, sqft: 22100, acquired: '2022-01-30', manager: 'Sarah Mitchell' },
  { id: 'prop-5', name: '742 Elmwood Cottage', address: '742 Elmwood Drive', city: 'Portland, OR', type: 'Single Family', units: 1, occupiedUnits: 1, monthlyRevenue: 2800, status: 'fully-occupied', image: 'EC', yearBuilt: 1998, sqft: 2200, acquired: '2018-05-12', manager: 'David Park' },
  { id: 'prop-6', name: 'Willow Creek Townhomes', address: '1200 Willow Creek Blvd', city: 'Boston, MA', type: 'Multifamily', units: 8, occupiedUnits: 7, monthlyRevenue: 18400, status: 'partial-vacancy', image: 'WC', yearBuilt: 2017, sqft: 12800, acquired: '2021-09-18', manager: 'Marcus Chen' },
  { id: 'prop-7', name: 'Riverside Lofts', address: '55 Riverside Way', city: 'Minneapolis, MN', type: 'Multifamily', units: 20, occupiedUnits: 18, monthlyRevenue: 38200, status: 'maintenance', image: 'RL', yearBuilt: 2016, sqft: 24600, acquired: '2020-02-14', manager: 'Marcus Chen' },
  { id: 'prop-8', name: 'Harbor View Commercial', address: '900 Harbor Drive', city: 'San Diego, CA', type: 'Commercial', units: 6, occupiedUnits: 5, monthlyRevenue: 28600, status: 'partial-vacancy', image: 'HV', yearBuilt: 2014, sqft: 16800, acquired: '2019-06-04', manager: 'David Park' },
];

/* ── Units ── */

export const units: Unit[] = [
  { id: 'u-1', propertyId: 'prop-1', number: '101', bedrooms: 1, bathrooms: 1, sqft: 720, rent: 1850, status: 'occupied', tenantId: 't-1', leaseEnd: '2026-08-31' },
  { id: 'u-2', propertyId: 'prop-1', number: '102', bedrooms: 2, bathrooms: 1, sqft: 920, rent: 2200, status: 'occupied', tenantId: 't-2', leaseEnd: '2026-06-14' },
  { id: 'u-3', propertyId: 'prop-1', number: '103', bedrooms: 1, bathrooms: 1, sqft: 720, rent: 1850, status: 'vacant', lastTurn: '2026-03-28' },
  { id: 'u-4', propertyId: 'prop-1', number: '201', bedrooms: 2, bathrooms: 2, sqft: 1080, rent: 2450, status: 'occupied', tenantId: 't-3', leaseEnd: '2026-11-30' },
  { id: 'u-5', propertyId: 'prop-1', number: '202', bedrooms: 1, bathrooms: 1, sqft: 720, rent: 1850, status: 'turning', lastTurn: '2026-04-01' },
  { id: 'u-6', propertyId: 'prop-1', number: '203', bedrooms: 2, bathrooms: 1, sqft: 920, rent: 2200, status: 'occupied', tenantId: 't-4', leaseEnd: '2026-09-15' },
  { id: 'u-7', propertyId: 'prop-1', number: '301', bedrooms: 3, bathrooms: 2, sqft: 1320, rent: 2850, status: 'occupied', tenantId: 't-5', leaseEnd: '2027-01-31' },
  { id: 'u-8', propertyId: 'prop-1', number: '302', bedrooms: 2, bathrooms: 2, sqft: 1080, rent: 2450, status: 'maintenance' },
];

/* ── Tenants ── */

export const tenants: Tenant[] = [
  { id: 't-1', name: 'Jamie Thornton', avatar: 'JT', email: 'jamie.t@email.com', phone: '+1 503-555-0142', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '101', leaseStart: '2024-09-01', leaseEnd: '2026-08-31', rent: 1850, status: 'active', balance: 0, moveInDate: '2024-09-01', tags: ['long-term'] },
  { id: 't-2', name: 'Priya Raman', avatar: 'PR', email: 'priya.r@email.com', phone: '+1 503-555-0288', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '102', leaseStart: '2025-06-15', leaseEnd: '2026-06-14', rent: 2200, status: 'expiring', balance: 0, moveInDate: '2025-06-15', tags: ['renewal-pending'] },
  { id: 't-3', name: 'Daniel Okonkwo', avatar: 'DO', email: 'daniel.o@email.com', phone: '+1 503-555-0341', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '201', leaseStart: '2024-12-01', leaseEnd: '2026-11-30', rent: 2450, status: 'active', balance: 0, moveInDate: '2024-12-01', tags: [] },
  { id: 't-4', name: 'Sofia Marquez', avatar: 'SM', email: 'sofia.m@email.com', phone: '+1 503-555-0412', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '203', leaseStart: '2025-09-16', leaseEnd: '2026-09-15', rent: 2200, status: 'active', balance: 0, moveInDate: '2025-09-16', tags: [] },
  { id: 't-5', name: 'Henry Oswald', avatar: 'HO', email: 'henry.o@email.com', phone: '+1 503-555-0503', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '301', leaseStart: '2025-02-01', leaseEnd: '2027-01-31', rent: 2850, status: 'active', balance: 0, moveInDate: '2025-02-01', tags: ['family'] },
  { id: 't-6', name: 'Naomi Bridges', avatar: 'NB', email: 'naomi.b@email.com', phone: '+1 206-555-0141', propertyId: 'prop-2', propertyName: 'Maple Grove Apartments', unitNumber: 'A-4', leaseStart: '2023-11-01', leaseEnd: '2025-10-31', rent: 1920, status: 'month-to-month', balance: 0, moveInDate: '2023-11-01', tags: ['long-term'] },
  { id: 't-7', name: 'Evan Ashford', avatar: 'EA', email: 'evan.a@email.com', phone: '+1 206-555-0234', propertyId: 'prop-2', propertyName: 'Maple Grove Apartments', unitNumber: 'B-7', leaseStart: '2025-04-15', leaseEnd: '2026-04-14', rent: 2050, status: 'active', balance: 1025, moveInDate: '2025-04-15', tags: ['partial-payment'] },
  { id: 't-8', name: 'Lucia Ferrante', avatar: 'LF', email: 'lucia.f@email.com', phone: '+1 303-555-0182', propertyId: 'prop-3', propertyName: 'Cedar Heights', unitNumber: '2B', leaseStart: '2024-07-01', leaseEnd: '2026-06-30', rent: 1980, status: 'active', balance: 0, moveInDate: '2024-07-01', tags: [] },
  { id: 't-9', name: 'Theo Marchetti', avatar: 'TM', email: 'theo.m@email.com', phone: '+1 512-555-0340', propertyId: 'prop-4', propertyName: 'Birchwood Estates', unitNumber: '12', leaseStart: '2025-01-01', leaseEnd: '2026-12-31', rent: 2100, status: 'active', balance: 0, moveInDate: '2025-01-01', tags: [] },
  { id: 't-10', name: 'Rachel Yamada', avatar: 'RY', email: 'rachel.y@email.com', phone: '+1 512-555-0489', propertyId: 'prop-4', propertyName: 'Birchwood Estates', unitNumber: '14', leaseStart: '2024-03-15', leaseEnd: '2026-03-14', rent: 2000, status: 'notice-given', balance: 0, moveInDate: '2024-03-15', tags: ['moving-out'] },
  { id: 't-11', name: 'Gabriel Santos', avatar: 'GS', email: 'gabriel.s@email.com', phone: '+1 617-555-0118', propertyId: 'prop-6', propertyName: 'Willow Creek Townhomes', unitNumber: '3', leaseStart: '2023-08-01', leaseEnd: '2025-07-31', rent: 2600, status: 'month-to-month', balance: 0, moveInDate: '2023-08-01', tags: ['long-term'] },
  { id: 't-12', name: 'Isla Pemberton', avatar: 'IP', email: 'isla.p@email.com', phone: '+1 612-555-0244', propertyId: 'prop-7', propertyName: 'Riverside Lofts', unitNumber: '8C', leaseStart: '2025-07-01', leaseEnd: '2026-06-30', rent: 2180, status: 'active', balance: 0, moveInDate: '2025-07-01', tags: [] },
];

/* ── Maintenance Tickets ── */

export const maintenanceTickets: MaintenanceTicket[] = [
  { id: 'm-1', number: 'MT-1042', title: 'Kitchen faucet leak', description: 'Slow drip from under-sink supply line. Water pooling in cabinet.', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '101', tenantName: 'Jamie Thornton', status: 'new', priority: 'high', category: 'Plumbing', submitted: '12m ago', updated: '12m ago' },
  { id: 'm-2', number: 'MT-1041', title: 'HVAC not cooling', description: 'Thermostat set to 68°F but room temp stays around 76°F.', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '203', tenantName: 'Sofia Marquez', status: 'assigned', priority: 'urgent', category: 'HVAC', assignee: 'Hendricks HVAC', submitted: '2h ago', updated: '1h ago' },
  { id: 'm-3', number: 'MT-1040', title: 'Dishwasher not draining', description: 'Standing water after cycle. Tried cleaning the filter.', propertyId: 'prop-2', propertyName: 'Maple Grove Apartments', unitNumber: 'A-4', tenantName: 'Naomi Bridges', status: 'in-progress', priority: 'medium', category: 'Appliance', assignee: 'David Park', submitted: '1d ago', updated: '3h ago' },
  { id: 'm-4', number: 'MT-1039', title: 'Bathroom light fixture flickering', description: 'Vanity light over sink flickers intermittently.', propertyId: 'prop-3', propertyName: 'Cedar Heights', unitNumber: '2B', tenantName: 'Lucia Ferrante', status: 'assigned', priority: 'low', category: 'Electrical', assignee: 'Ridge Electrical', submitted: '2d ago', updated: '1d ago' },
  { id: 'm-5', number: 'MT-1038', title: 'Garbage disposal jammed', description: 'Disposal hums but does not turn. Reset button does nothing.', propertyId: 'prop-4', propertyName: 'Birchwood Estates', unitNumber: '12', tenantName: 'Theo Marchetti', status: 'in-progress', priority: 'medium', category: 'Appliance', assignee: 'Sarah Mitchell', submitted: '2d ago', updated: '4h ago' },
  { id: 'm-6', number: 'MT-1037', title: 'Broken window latch', description: 'Bedroom window latch broke off during opening. Cannot secure.', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '301', tenantName: 'Henry Oswald', status: 'resolved', priority: 'high', category: 'Structural', assignee: 'Maintenance Team', submitted: '3d ago', updated: '1d ago' },
  { id: 'm-7', number: 'MT-1036', title: 'Washing machine leaking', description: 'Water on floor after wash cycle, from bottom of machine.', propertyId: 'prop-2', propertyName: 'Maple Grove Apartments', unitNumber: 'B-7', tenantName: 'Evan Ashford', status: 'resolved', priority: 'high', category: 'Appliance', assignee: 'Hendricks HVAC', submitted: '4d ago', updated: '2d ago' },
  { id: 'm-8', number: 'MT-1035', title: 'Smoke detector chirping', description: 'Hallway detector chirps every 30 seconds.', propertyId: 'prop-6', propertyName: 'Willow Creek Townhomes', unitNumber: '3', tenantName: 'Gabriel Santos', status: 'new', priority: 'medium', category: 'Electrical', submitted: '4h ago', updated: '4h ago' },
  { id: 'm-9', number: 'MT-1034', title: 'Roof leak, living room ceiling', description: 'Brown water stain spreading on ceiling after recent rain.', propertyId: 'prop-7', propertyName: 'Riverside Lofts', unitNumber: '8C', tenantName: 'Isla Pemberton', status: 'in-progress', priority: 'urgent', category: 'Structural', assignee: 'Hendricks HVAC', submitted: '6h ago', updated: '2h ago' },
  { id: 'm-10', number: 'MT-1033', title: 'Refrigerator too warm', description: 'Fridge compartment holding at 52°F, not cooling.', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '102', tenantName: 'Priya Raman', status: 'assigned', priority: 'high', category: 'Appliance', assignee: 'Maintenance Team', submitted: '8h ago', updated: '6h ago' },
  { id: 'm-11', number: 'MT-1032', title: 'Clogged bathtub drain', description: 'Tub drains slowly, standing water during shower.', propertyId: 'prop-4', propertyName: 'Birchwood Estates', unitNumber: '14', tenantName: 'Rachel Yamada', status: 'resolved', priority: 'low', category: 'Plumbing', assignee: 'Ridge Plumbing', submitted: '5d ago', updated: '3d ago' },
  { id: 'm-12', number: 'MT-1031', title: 'Front door lock sticking', description: 'Deadbolt hard to turn, especially in cold weather.', propertyId: 'prop-1', propertyName: 'The Meridian', unitNumber: '201', tenantName: 'Daniel Okonkwo', status: 'new', priority: 'medium', category: 'Other', submitted: '1h ago', updated: '1h ago' },
];

/* ── Payments ── */

export const payments: Payment[] = [
  { id: 'pay-1', tenantId: 't-1', tenantName: 'Jamie Thornton', propertyName: 'The Meridian', unitNumber: '101', amount: 1850, dueDate: '2026-04-01', paidDate: '2026-03-28', method: 'ACH', status: 'paid', reference: 'ACH-40821' },
  { id: 'pay-2', tenantId: 't-2', tenantName: 'Priya Raman', propertyName: 'The Meridian', unitNumber: '102', amount: 2200, dueDate: '2026-04-01', paidDate: '2026-04-01', method: 'ACH', status: 'paid', reference: 'ACH-40822' },
  { id: 'pay-3', tenantId: 't-3', tenantName: 'Daniel Okonkwo', propertyName: 'The Meridian', unitNumber: '201', amount: 2450, dueDate: '2026-04-01', paidDate: '2026-03-31', method: 'ACH', status: 'paid', reference: 'ACH-40823' },
  { id: 'pay-4', tenantId: 't-4', tenantName: 'Sofia Marquez', propertyName: 'The Meridian', unitNumber: '203', amount: 2200, dueDate: '2026-04-01', paidDate: '2026-04-02', method: 'Card', status: 'paid', reference: 'CC-40824' },
  { id: 'pay-5', tenantId: 't-5', tenantName: 'Henry Oswald', propertyName: 'The Meridian', unitNumber: '301', amount: 2850, dueDate: '2026-04-01', paidDate: '2026-03-30', method: 'ACH', status: 'paid', reference: 'ACH-40825' },
  { id: 'pay-6', tenantId: 't-6', tenantName: 'Naomi Bridges', propertyName: 'Maple Grove Apartments', unitNumber: 'A-4', amount: 1920, dueDate: '2026-04-01', paidDate: '2026-03-29', method: 'ACH', status: 'paid', reference: 'ACH-40826' },
  { id: 'pay-7', tenantId: 't-7', tenantName: 'Evan Ashford', propertyName: 'Maple Grove Apartments', unitNumber: 'B-7', amount: 2050, dueDate: '2026-04-01', paidDate: '2026-04-03', method: 'Check', status: 'partial', reference: 'CHK-40827' },
  { id: 'pay-8', tenantId: 't-8', tenantName: 'Lucia Ferrante', propertyName: 'Cedar Heights', unitNumber: '2B', amount: 1980, dueDate: '2026-04-01', paidDate: '2026-04-01', method: 'ACH', status: 'paid', reference: 'ACH-40828' },
  { id: 'pay-9', tenantId: 't-9', tenantName: 'Theo Marchetti', propertyName: 'Birchwood Estates', unitNumber: '12', amount: 2100, dueDate: '2026-04-01', paidDate: '2026-04-01', method: 'ACH', status: 'paid', reference: 'ACH-40829' },
  { id: 'pay-10', tenantId: 't-10', tenantName: 'Rachel Yamada', propertyName: 'Birchwood Estates', unitNumber: '14', amount: 2000, dueDate: '2026-04-01', method: 'ACH', status: 'late', reference: 'ACH-40830' },
  { id: 'pay-11', tenantId: 't-11', tenantName: 'Gabriel Santos', propertyName: 'Willow Creek Townhomes', unitNumber: '3', amount: 2600, dueDate: '2026-04-01', paidDate: '2026-03-31', method: 'ACH', status: 'paid', reference: 'ACH-40831' },
  { id: 'pay-12', tenantId: 't-12', tenantName: 'Isla Pemberton', propertyName: 'Riverside Lofts', unitNumber: '8C', amount: 2180, dueDate: '2026-04-01', method: 'ACH', status: 'pending', reference: 'ACH-40832' },
];

/* ── Charts ── */

export const ownerCharts: ChartDef[] = [
  {
    title: 'Portfolio Revenue (12mo)',
    type: 'area',
    labels: ['May', 'Jul', 'Sep', 'Nov', 'Jan', 'Mar'],
    series: [
      { label: 'Revenue', values: [128400, 134800, 138200, 140100, 141200, 142820], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Occupancy Trend',
    type: 'line',
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Occupancy %', values: [92.1, 93.4, 93.8, 94.0, 94.2, 94.2], color: 'var(--d-secondary)' },
    ],
  },
];

export const financialCharts: ChartDef[] = [
  {
    title: 'Income vs Expenses (YTD)',
    type: 'bar',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Income', values: [142820, 142820, 142820, 142820], color: 'var(--d-secondary)' },
    ],
  },
  {
    title: 'Expense Breakdown',
    type: 'bar',
    labels: ['Maint.', 'Utils', 'Mgmt', 'Ins.', 'Taxes', 'Other'],
    series: [
      { label: 'Expenses', values: [42600, 18400, 24200, 12800, 18600, 7680], color: 'var(--d-primary)' },
    ],
  },
  {
    title: 'Net Operating Income',
    type: 'area',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'NOI', values: [74200, 76100, 76800, 77080], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Collection Rate',
    type: 'bar',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Rate %', values: [97.8, 98.2, 98.4, 98.6], color: 'var(--d-success)' },
    ],
  },
];

/* ── Expenses ── */

export interface Expense {
  id: string;
  date: string;
  category: string;
  vendor: string;
  property: string;
  description: string;
  amount: number;
  status: 'posted' | 'pending' | 'disputed';
}

export const expenses: Expense[] = [
  { id: 'e-1', date: '2026-04-02', category: 'Maintenance', vendor: 'Hendricks HVAC', property: 'The Meridian', description: 'Emergency HVAC repair — Unit 203', amount: 840, status: 'posted' },
  { id: 'e-2', date: '2026-04-01', category: 'Utilities', vendor: 'PGE', property: 'Maple Grove Apartments', description: 'Common area electricity — March', amount: 412, status: 'posted' },
  { id: 'e-3', date: '2026-03-31', category: 'Management', vendor: 'Cornerstone Admin', property: 'Portfolio-wide', description: 'Management fee — March (8%)', amount: 11426, status: 'posted' },
  { id: 'e-4', date: '2026-03-28', category: 'Maintenance', vendor: 'Ridge Electrical', property: 'Cedar Heights', description: 'Lighting repair — Unit 2B', amount: 180, status: 'posted' },
  { id: 'e-5', date: '2026-03-25', category: 'Insurance', vendor: 'Summit Insurance', property: 'The Meridian', description: 'Quarterly premium', amount: 3200, status: 'posted' },
  { id: 'e-6', date: '2026-03-22', category: 'Maintenance', vendor: 'Ridge Plumbing', property: 'Birchwood Estates', description: 'Drain clearing — Unit 14', amount: 220, status: 'posted' },
  { id: 'e-7', date: '2026-03-20', category: 'Taxes', vendor: 'Multnomah County', property: 'The Meridian', description: 'Q1 property tax', amount: 4650, status: 'posted' },
  { id: 'e-8', date: '2026-03-18', category: 'Utilities', vendor: 'Seattle Water', property: 'Maple Grove Apartments', description: 'Water/sewer — March', amount: 628, status: 'pending' },
  { id: 'e-9', date: '2026-03-15', category: 'Maintenance', vendor: 'TurnPro Cleaning', property: 'The Meridian', description: 'Turnover — Unit 103', amount: 480, status: 'posted' },
  { id: 'e-10', date: '2026-03-12', category: 'Other', vendor: 'GreenLeaf Landscaping', property: 'Portfolio-wide', description: 'Monthly grounds maintenance', amount: 1240, status: 'posted' },
];

/* ── Activity ── */

export const activityEvents: ActivityEvent[] = [
  { id: 'ev-1', actor: 'System', actorAvatar: 'SY', action: 'payment received', target: '$2,850 from Henry Oswald', timestamp: '12m ago', type: 'payment' },
  { id: 'ev-2', actor: 'Jamie Thornton', actorAvatar: 'JT', action: 'submitted ticket', target: 'MT-1042 — Kitchen faucet leak', timestamp: '12m ago', type: 'maintenance' },
  { id: 'ev-3', actor: 'David Park', actorAvatar: 'DP', action: 'assigned', target: 'MT-1041 to Hendricks HVAC', timestamp: '1h ago', type: 'maintenance' },
  { id: 'ev-4', actor: 'System', actorAvatar: 'SY', action: 'rent due reminder', target: 'Isla Pemberton (8C) — $2,180', timestamp: '2h ago', type: 'payment' },
  { id: 'ev-5', actor: 'Rachel Yamada', actorAvatar: 'RY', action: 'gave notice', target: 'vacating Birchwood Estates 14', timestamp: '4h ago', type: 'lease' },
  { id: 'ev-6', actor: 'Elena Whitfield', actorAvatar: 'EW', action: 'uploaded', target: 'signed lease — Sofia Marquez', timestamp: '6h ago', type: 'tenant' },
  { id: 'ev-7', actor: 'System', actorAvatar: 'SY', action: 'lease expiring', target: 'Priya Raman — 60 days out', timestamp: '1d ago', type: 'lease' },
  { id: 'ev-8', actor: 'Sarah Mitchell', actorAvatar: 'SM', action: 'closed ticket', target: 'MT-1032 — Bathtub drain resolved', timestamp: '3d ago', type: 'maintenance' },
  { id: 'ev-9', actor: 'Elena Whitfield', actorAvatar: 'EW', action: 'added property', target: 'Harbor View Commercial', timestamp: '1w ago', type: 'property' },
  { id: 'ev-10', actor: 'System', actorAvatar: 'SY', action: 'new tenant onboarded', target: 'Isla Pemberton — Riverside Lofts 8C', timestamp: '2w ago', type: 'tenant' },
];

/* ── Sessions ── */

export const sessions: Session[] = [
  { id: 's-1', device: 'MacBook Pro · Chrome', location: 'Portland, OR', ip: '73.140.22.18', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15 · Safari', location: 'Portland, OR', ip: '73.140.22.18', lastActive: '42m ago', current: false },
  { id: 's-3', device: 'iPad · Safari', location: 'Seattle, WA', ip: '98.176.44.21', lastActive: '5d ago', current: false },
];

/* ── Kanban columns ── */

export const ticketColumns: { key: TicketStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'var(--d-warning)' },
  { key: 'assigned', label: 'Assigned', color: 'var(--d-info)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--d-primary)' },
  { key: 'resolved', label: 'Resolved', color: 'var(--d-success)' },
];

/* ── Documents (for tenant portal) ── */

export interface Document {
  id: string;
  name: string;
  type: 'Lease' | 'Addendum' | 'Receipt' | 'Notice' | 'Policy';
  size: string;
  uploaded: string;
}

export const tenantDocuments: Document[] = [
  { id: 'd-1', name: 'Lease Agreement 2024-2026.pdf', type: 'Lease', size: '284 KB', uploaded: '2024-08-28' },
  { id: 'd-2', name: 'Pet Addendum.pdf', type: 'Addendum', size: '64 KB', uploaded: '2024-08-28' },
  { id: 'd-3', name: 'March 2026 Receipt.pdf', type: 'Receipt', size: '48 KB', uploaded: '2026-03-28' },
  { id: 'd-4', name: 'February 2026 Receipt.pdf', type: 'Receipt', size: '48 KB', uploaded: '2026-02-28' },
  { id: 'd-5', name: 'Community Policies.pdf', type: 'Policy', size: '128 KB', uploaded: '2024-09-01' },
  { id: 'd-6', name: 'Annual Rent Adjustment Notice.pdf', type: 'Notice', size: '38 KB', uploaded: '2026-07-01' },
];

/* ── Quick stats for tenant portal ── */

export const currentTenant = tenants[0];

/* ── Team (about) ── */

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export const team: TeamMember[] = [
  { name: 'Elena Whitfield', role: 'Founder & CEO', avatar: 'EW', bio: 'Former REIT analyst with 18 years in portfolio management.' },
  { name: 'David Park', role: 'Head of Operations', avatar: 'DP', bio: 'Oversees day-to-day operations across 40+ properties.' },
  { name: 'Sarah Mitchell', role: 'Senior Property Manager', avatar: 'SM', bio: 'Specializes in resident retention and turn efficiency.' },
  { name: 'Marcus Chen', role: 'Financial Controller', avatar: 'MC', bio: 'Keeps owner statements and P&L reporting on schedule.' },
];

export const values = [
  { title: 'Transparent', description: 'Owners see every dollar. Tenants see every update. No hidden fees, no surprises.' },
  { title: 'Responsive', description: 'Maintenance tickets acknowledged within 2 hours. Urgent issues addressed same-day.' },
  { title: 'Stewardship', description: 'We treat every property like a long-term asset — not a short-term line item.' },
  { title: 'Human', description: 'Real people on call. Real conversations about your home or your investment.' },
];
