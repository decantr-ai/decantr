/* -- Mock Data: Fractional Ownership (Fractionel) -- */

export interface Kpi {
  label: string;
  value: string;
  change: number;
  changeAbs?: string;
  icon: string;
}

export interface ShareClass {
  id: string;
  name: string;
  type: 'common' | 'preferred' | 'founder' | 'advisor';
  authorised: number;
  issued: number;
  pricePerShare: number;
  votingRights: boolean;
  liquidationPref: number;
  color: string;
}

export interface Shareholder {
  id: string;
  name: string;
  avatar: string;
  shareClass: string;
  shares: number;
  ownership: number;
  invested: number;
  currentValue: number;
  gain: number;
  vestingPct: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'real-estate' | 'private-equity' | 'art' | 'infrastructure';
  valuation: number;
  totalShares: number;
  pricePerShare: number;
  returnPct: number;
  occupancy?: number;
  irr: number;
  status: 'active' | 'pending' | 'closed';
  sparkline: number[];
  location?: string;
}

export interface ValuationPoint {
  date: string;
  value: number;
  low: number;
  high: number;
}

export interface OrderBookEntry {
  id: string;
  side: 'bid' | 'ask';
  price: number;
  shares: number;
  total: number;
  trader: string;
  timestamp: string;
}

export interface Ballot {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  deadline: string;
  proposer: string;
  category: 'distribution' | 'governance' | 'capital' | 'operational';
}

export interface DividendEntry {
  id: string;
  date: string;
  asset: string;
  amount: number;
  perShare: number;
  shares: number;
  status: 'paid' | 'pending' | 'scheduled';
  type: 'quarterly' | 'special' | 'annual';
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

export interface Allocation {
  label: string;
  value: number;
  pct: number;
  color: string;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface Trade {
  id: string;
  date: string;
  asset: string;
  side: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  status: 'filled' | 'partial' | 'cancelled';
  counterparty: string;
}

/* -- Share Classes -- */

export const shareClasses: ShareClass[] = [
  { id: 'sc-1', name: 'Series A Preferred', type: 'preferred', authorised: 10000000, issued: 7840000, pricePerShare: 4.20, votingRights: true, liquidationPref: 1.0, color: 'var(--d-primary)' },
  { id: 'sc-2', name: 'Common Stock', type: 'common', authorised: 50000000, issued: 32180000, pricePerShare: 2.84, votingRights: true, liquidationPref: 0, color: 'var(--d-secondary)' },
  { id: 'sc-3', name: 'Founder Shares', type: 'founder', authorised: 20000000, issued: 20000000, pricePerShare: 0.001, votingRights: true, liquidationPref: 0, color: 'var(--d-accent)' },
  { id: 'sc-4', name: 'Advisor Pool', type: 'advisor', authorised: 5000000, issued: 2400000, pricePerShare: 0.001, votingRights: false, liquidationPref: 0, color: 'var(--d-warning)' },
];

/* -- Cap Table / Shareholders -- */

export const shareholders: Shareholder[] = [
  { id: 'sh-1', name: 'Cassandra Voss', avatar: 'CV', shareClass: 'Founder Shares', shares: 12000000, ownership: 19.22, invested: 12000, currentValue: 34080000, gain: 283900.00, vestingPct: 100 },
  { id: 'sh-2', name: 'Marcus Okonkwo', avatar: 'MO', shareClass: 'Founder Shares', shares: 8000000, ownership: 12.82, invested: 8000, currentValue: 22720000, gain: 283900.00, vestingPct: 100 },
  { id: 'sh-3', name: 'Horizon Ventures', avatar: 'HV', shareClass: 'Series A Preferred', shares: 4200000, ownership: 6.73, invested: 17640000, currentValue: 17640000, gain: 0.00, vestingPct: 100 },
  { id: 'sh-4', name: 'Apex Capital', avatar: 'AC', shareClass: 'Series A Preferred', shares: 2800000, ownership: 4.49, invested: 11760000, currentValue: 11760000, gain: 0.00, vestingPct: 100 },
  { id: 'sh-5', name: 'Lumen Partners', avatar: 'LP', shareClass: 'Series A Preferred', shares: 840000, ownership: 1.35, invested: 3528000, currentValue: 3528000, gain: 0.00, vestingPct: 100 },
  { id: 'sh-6', name: 'Employee Pool', avatar: 'EP', shareClass: 'Common Stock', shares: 18200000, ownership: 29.17, invested: 0, currentValue: 51688000, gain: 0.00, vestingPct: 62 },
  { id: 'sh-7', name: 'Public Float', avatar: 'PF', shareClass: 'Common Stock', shares: 13980000, ownership: 22.41, invested: 39703200, currentValue: 39703200, gain: 0.00, vestingPct: 100 },
  { id: 'sh-8', name: 'Advisor Grants', avatar: 'AG', shareClass: 'Advisor Pool', shares: 2400000, ownership: 3.85, invested: 0, currentValue: 6816000, gain: 0.00, vestingPct: 48 },
];

/* -- Fractional Assets -- */

export const assets: Asset[] = [
  { id: 'a-1', name: 'Marina Tower — Unit 42A', type: 'real-estate', valuation: 4820000, totalShares: 48200, pricePerShare: 100.00, returnPct: 8.42, occupancy: 96, irr: 12.4, status: 'active', sparkline: [94, 96, 97, 98, 99, 100, 99, 100, 101, 100, 100, 100], location: 'Miami, FL' },
  { id: 'a-2', name: 'Apex Growth Fund III', type: 'private-equity', valuation: 18400000, totalShares: 184000, pricePerShare: 100.00, returnPct: 14.82, irr: 18.6, status: 'active', sparkline: [82, 86, 88, 90, 92, 94, 96, 97, 98, 99, 100, 100], location: 'Delaware' },
  { id: 'a-3', name: 'Rothko Estate — No. 14', type: 'art', valuation: 2840000, totalShares: 28400, pricePerShare: 100.00, returnPct: 6.18, irr: 8.2, status: 'active', sparkline: [92, 93, 94, 94, 95, 96, 97, 97, 98, 99, 100, 100], location: 'Geneva' },
  { id: 'a-4', name: 'Nordic Wind Portfolio', type: 'infrastructure', valuation: 32600000, totalShares: 326000, pricePerShare: 100.00, returnPct: 11.24, irr: 14.8, status: 'active', sparkline: [88, 90, 91, 93, 94, 95, 96, 97, 98, 99, 100, 100], location: 'Oslo, Norway' },
  { id: 'a-5', name: 'Cascade Office Campus', type: 'real-estate', valuation: 9200000, totalShares: 92000, pricePerShare: 100.00, returnPct: 7.84, occupancy: 88, irr: 10.2, status: 'active', sparkline: [96, 97, 97, 98, 98, 99, 99, 100, 100, 100, 100, 100], location: 'Portland, OR' },
  { id: 'a-6', name: 'Meridian Logistics Hub', type: 'infrastructure', valuation: 14200000, totalShares: 142000, pricePerShare: 100.00, returnPct: 9.62, irr: 13.1, status: 'pending', sparkline: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], location: 'Houston, TX' },
];

/* -- Valuation History -- */

export const valuationHistory: ValuationPoint[] = [
  { date: 'May', value: 68400000, low: 64200000, high: 72800000 },
  { date: 'Jun', value: 70200000, low: 66100000, high: 74600000 },
  { date: 'Jul', value: 69800000, low: 65800000, high: 74200000 },
  { date: 'Aug', value: 72400000, low: 68200000, high: 76800000 },
  { date: 'Sep', value: 74200000, low: 70000000, high: 78600000 },
  { date: 'Oct', value: 73800000, low: 69400000, high: 78400000 },
  { date: 'Nov', value: 76400000, low: 72000000, high: 81200000 },
  { date: 'Dec', value: 78200000, low: 73800000, high: 83000000 },
  { date: 'Jan', value: 79800000, low: 75200000, high: 84800000 },
  { date: 'Feb', value: 80400000, low: 76000000, high: 85200000 },
  { date: 'Mar', value: 81200000, low: 76800000, high: 86000000 },
  { date: 'Apr', value: 82060000, low: 77600000, high: 86800000 },
];

/* -- Order Book -- */

export const orderBook: OrderBookEntry[] = [
  { id: 'ob-1', side: 'bid', price: 99.80, shares: 1200, total: 119760, trader: 'Apex Capital', timestamp: '14:32:18' },
  { id: 'ob-2', side: 'bid', price: 99.60, shares: 2400, total: 239040, trader: 'Lumen Partners', timestamp: '14:31:04' },
  { id: 'ob-3', side: 'bid', price: 99.40, shares: 800, total: 79520, trader: 'Nordic Fund', timestamp: '14:28:42' },
  { id: 'ob-4', side: 'bid', price: 99.20, shares: 3600, total: 357120, trader: 'Cascade Inv.', timestamp: '14:26:18' },
  { id: 'ob-5', side: 'bid', price: 99.00, shares: 5200, total: 514800, trader: 'Market Maker', timestamp: '14:24:02' },
  { id: 'ob-6', side: 'bid', price: 98.80, shares: 4000, total: 395200, trader: 'Voss Family', timestamp: '14:22:14' },
  { id: 'ob-7', side: 'ask', price: 100.20, shares: 1800, total: 180360, trader: 'Horizon Ven.', timestamp: '14:32:42' },
  { id: 'ob-8', side: 'ask', price: 100.40, shares: 600, total: 60240, trader: 'Retail Pool', timestamp: '14:31:18' },
  { id: 'ob-9', side: 'ask', price: 100.60, shares: 3200, total: 321920, trader: 'Employee Sale', timestamp: '14:29:04' },
  { id: 'ob-10', side: 'ask', price: 100.80, shares: 2800, total: 282240, trader: 'Apex Capital', timestamp: '14:27:42' },
  { id: 'ob-11', side: 'ask', price: 101.00, shares: 4400, total: 444400, trader: 'Market Maker', timestamp: '14:25:18' },
  { id: 'ob-12', side: 'ask', price: 101.20, shares: 1600, total: 161920, trader: 'Lumen Part.', timestamp: '14:23:04' },
];

/* -- Governance Ballots -- */

export const ballots: Ballot[] = [
  { id: 'b-1', title: 'Q2 2026 Dividend Distribution', description: 'Approve $0.42 per share quarterly dividend from Marina Tower rental income.', status: 'active', votesFor: 42800000, votesAgainst: 4200000, votesAbstain: 2400000, quorum: 50, deadline: '2026-04-15', proposer: 'Board of Directors', category: 'distribution' },
  { id: 'b-2', title: 'Amend Voting Rights — Advisor Shares', description: 'Grant limited voting rights to advisor pool shares for operational decisions only.', status: 'active', votesFor: 28400000, votesAgainst: 18200000, votesAbstain: 6800000, quorum: 50, deadline: '2026-04-20', proposer: 'Cassandra Voss', category: 'governance' },
  { id: 'b-3', title: 'Series B Fundraise Authorization', description: 'Authorize issuance of up to 15M new preferred shares at $6.00/share for Series B round.', status: 'pending', votesFor: 0, votesAgainst: 0, votesAbstain: 0, quorum: 66, deadline: '2026-05-01', proposer: 'Board of Directors', category: 'capital' },
  { id: 'b-4', title: 'Asset Acquisition — Meridian Hub', description: 'Approve acquisition of Meridian Logistics Hub at $14.2M with fund reserves.', status: 'passed', votesFor: 52400000, votesAgainst: 8200000, votesAbstain: 1800000, quorum: 50, deadline: '2026-03-15', proposer: 'Marcus Okonkwo', category: 'capital' },
  { id: 'b-5', title: 'Management Fee Reduction', description: 'Reduce annual management fee from 2.0% to 1.5% effective Q3 2026.', status: 'rejected', votesFor: 22400000, votesAgainst: 34800000, votesAbstain: 5200000, quorum: 50, deadline: '2026-03-01', proposer: 'Public Float Rep.', category: 'operational' },
  { id: 'b-6', title: 'Annual Auditor Appointment', description: 'Appoint Deloitte as independent auditor for FY2026.', status: 'passed', votesFor: 58200000, votesAgainst: 2400000, votesAbstain: 1800000, quorum: 33, deadline: '2026-02-15', proposer: 'Board of Directors', category: 'operational' },
];

/* -- Dividend Ledger -- */

export const dividends: DividendEntry[] = [
  { id: 'd-1', date: '2026-04-01', asset: 'Marina Tower — Unit 42A', amount: 42840.00, perShare: 0.42, shares: 102000, status: 'pending', type: 'quarterly' },
  { id: 'd-2', date: '2026-04-01', asset: 'Nordic Wind Portfolio', amount: 84200.00, perShare: 0.28, shares: 300714, status: 'pending', type: 'quarterly' },
  { id: 'd-3', date: '2026-03-15', asset: 'Cascade Office Campus', amount: 28400.00, perShare: 0.32, shares: 88750, status: 'paid', type: 'quarterly' },
  { id: 'd-4', date: '2026-01-15', asset: 'Marina Tower — Unit 42A', amount: 41200.00, perShare: 0.40, shares: 103000, status: 'paid', type: 'quarterly' },
  { id: 'd-5', date: '2026-01-15', asset: 'Nordic Wind Portfolio', amount: 82400.00, perShare: 0.26, shares: 316923, status: 'paid', type: 'quarterly' },
  { id: 'd-6', date: '2025-12-20', asset: 'Apex Growth Fund III', amount: 184000.00, perShare: 1.00, shares: 184000, status: 'paid', type: 'special' },
  { id: 'd-7', date: '2025-10-15', asset: 'Marina Tower — Unit 42A', amount: 40200.00, perShare: 0.38, shares: 105789, status: 'paid', type: 'quarterly' },
  { id: 'd-8', date: '2025-10-15', asset: 'Cascade Office Campus', amount: 26800.00, perShare: 0.30, shares: 89333, status: 'paid', type: 'quarterly' },
  { id: 'd-9', date: '2025-07-15', asset: 'Marina Tower — Unit 42A', amount: 38400.00, perShare: 0.36, shares: 106667, status: 'paid', type: 'quarterly' },
  { id: 'd-10', date: '2025-07-15', asset: 'Nordic Wind Portfolio', amount: 78200.00, perShare: 0.24, shares: 325833, status: 'paid', type: 'quarterly' },
];

/* -- Recent Trades -- */

export const recentTrades: Trade[] = [
  { id: 't-1', date: '2026-04-05', asset: 'Marina Tower — Unit 42A', side: 'buy', shares: 400, price: 100.00, total: 40000, status: 'filled', counterparty: 'Retail Pool' },
  { id: 't-2', date: '2026-04-05', asset: 'Nordic Wind Portfolio', side: 'sell', shares: 1200, price: 100.20, total: 120240, status: 'filled', counterparty: 'Horizon Ven.' },
  { id: 't-3', date: '2026-04-04', asset: 'Apex Growth Fund III', side: 'buy', shares: 800, price: 100.40, total: 80320, status: 'filled', counterparty: 'Lumen Partners' },
  { id: 't-4', date: '2026-04-04', asset: 'Cascade Office Campus', side: 'buy', shares: 200, price: 99.80, total: 19960, status: 'partial', counterparty: 'Market Maker' },
  { id: 't-5', date: '2026-04-03', asset: 'Marina Tower — Unit 42A', side: 'sell', shares: 600, price: 100.10, total: 60060, status: 'filled', counterparty: 'Apex Capital' },
  { id: 't-6', date: '2026-04-02', asset: 'Rothko Estate — No. 14', side: 'buy', shares: 100, price: 100.00, total: 10000, status: 'filled', counterparty: 'Retail Pool' },
  { id: 't-7', date: '2026-04-01', asset: 'Nordic Wind Portfolio', side: 'buy', shares: 2000, price: 99.60, total: 199200, status: 'filled', counterparty: 'Employee Sale' },
  { id: 't-8', date: '2026-03-31', asset: 'Marina Tower — Unit 42A', side: 'buy', shares: 300, price: 99.80, total: 29940, status: 'cancelled', counterparty: 'Cascade Inv.' },
];

/* -- Portfolio KPIs -- */

export const portfolioKpis: Kpi[] = [
  { label: 'Portfolio NAV', value: '$82,060,000', change: 4.82, changeAbs: '+$3,774,400', icon: 'wallet' },
  { label: 'Total Shares', value: '62,420,000', change: 1.24, icon: 'layers' },
  { label: 'Yield (TTM)', value: '6.84%', change: 0.42, changeAbs: '+42bps', icon: 'trending-up' },
  { label: 'Active Assets', value: '5', change: 0, icon: 'building' },
];

/* -- Charts -- */

export const portfolioCharts: ChartDef[] = [
  {
    title: 'Portfolio NAV (12 months)',
    type: 'area',
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'NAV', values: [68400000, 70200000, 69800000, 72400000, 74200000, 73800000, 76400000, 78200000, 79800000, 80400000, 81200000, 82060000], color: 'var(--d-primary)' },
    ],
  },
  {
    title: 'Dividend Income (Quarterly)',
    type: 'bar',
    labels: ['Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026 (est)'],
    series: [
      { label: 'Dividends', values: [116600, 251000, 151800, 127040], color: 'var(--d-secondary)' },
    ],
  },
];

/* -- Allocation by Asset Type -- */

export const assetTypeAllocations: Allocation[] = [
  { label: 'Real Estate', value: 14020000, pct: 17.1, color: 'var(--d-primary)' },
  { label: 'Private Equity', value: 18400000, pct: 22.4, color: 'var(--d-accent)' },
  { label: 'Art', value: 2840000, pct: 3.5, color: 'var(--d-warning)' },
  { label: 'Infrastructure', value: 46800000, pct: 57.0, color: 'var(--d-secondary)' },
];

export const shareClassAllocations: Allocation[] = [
  { label: 'Series A Preferred', value: 32928000, pct: 12.6, color: 'var(--d-primary)' },
  { label: 'Common Stock', value: 91391200, pct: 51.5, color: 'var(--d-secondary)' },
  { label: 'Founder Shares', value: 56800000, pct: 32.0, color: 'var(--d-accent)' },
  { label: 'Advisor Pool', value: 6816000, pct: 3.8, color: 'var(--d-warning)' },
];

/* -- Sessions -- */

export const sessions: Session[] = [
  { id: 's-1', device: 'MacBook Pro - Chrome', location: 'San Francisco, CA', ip: '73.140.22.18', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15 - Safari', location: 'San Francisco, CA', ip: '73.140.22.18', lastActive: '18m ago', current: false },
  { id: 's-3', device: 'iPad - Safari', location: 'New York, NY', ip: '98.176.44.21', lastActive: '2d ago', current: false },
];

/* -- Marketing -- */

export const marketingFeatures = [
  { icon: 'layers', title: 'Fractional shares', description: 'Own pieces of premium assets from $100. Real estate, art, infrastructure, and private equity — fractionalized.' },
  { icon: 'bar-chart-3', title: 'Live valuations', description: 'NAV updated daily with institutional-grade appraisals and confidence intervals.' },
  { icon: 'book-open', title: 'Order book trading', description: 'Peer-to-peer secondary market with bid/ask spreads and depth visualization.' },
  { icon: 'vote', title: 'On-chain governance', description: 'Vote on distributions, acquisitions, and fund operations proportional to your holdings.' },
  { icon: 'banknote', title: 'Dividend ledger', description: 'Transparent income tracking per asset. Quarterly distributions with full audit trail.' },
  { icon: 'shield', title: 'Regulated & compliant', description: 'SEC-registered offering. Accredited and qualified investor verification built in.' },
];

export const marketingStats = [
  { label: 'Assets Under Management', value: '$82M' },
  { label: 'Investors', value: '4,200+' },
  { label: 'Avg. IRR', value: '13.4%' },
  { label: 'Distributions Paid', value: '$2.4M' },
];

export const testimonials = [
  { quote: 'Fractionel let me diversify into commercial real estate with a single wire. The cap table transparency is unlike anything in traditional REITs.', author: 'Elena Vasquez', role: 'Family Office CIO', avatar: 'EV' },
  { quote: 'The order book gives real price discovery. I exited my position in the wind portfolio at a 14% premium to NAV.', author: 'Thomas Lindgren', role: 'Accredited Investor', avatar: 'TL' },
  { quote: 'Governance voting on distributions means I have a say in how my capital works. This is what tokenized ownership should look like.', author: 'Dr. Aisha Patel', role: 'LP, Horizon Ventures', avatar: 'AP' },
];

export const pricingTiers = [
  { name: 'Explorer', price: 0, period: '/mo', recommended: false, current: false, features: ['Up to $25K invested', '2 asset positions', 'Basic governance', 'Monthly statements', 'Email support'] },
  { name: 'Investor', price: 29, period: '/mo', recommended: true, current: true, features: ['Unlimited positions', 'Order book access', 'Full governance', 'Tax-ready exports', 'Priority support', 'API access'] },
  { name: 'Institutional', price: 199, period: '/mo', recommended: false, current: false, features: ['Everything in Investor', 'Multi-entity accounts', 'Custom reporting', 'Dedicated advisor', 'White-label portal', 'Bulk trading'] },
];
