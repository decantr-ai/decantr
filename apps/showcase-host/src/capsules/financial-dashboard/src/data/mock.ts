/* ── Mock Data: Financial Dashboard (Atlas Wealth) ── */

export interface Kpi {
  label: string;
  value: string;
  change: number;
  changeAbs?: string;
  icon: string;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  shares: number;
  avgCost: number;
  price: number;
  marketValue: number;
  costBasis: number;
  gainAbs: number;
  gainPct: number;
  allocation: number;
  sparkline: number[];
  dayChange: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  category: string;
  account: string;
  amount: number; // positive = income, negative = expense
  status: 'posted' | 'pending' | 'cleared';
  note?: string;
}

export interface BudgetCategory {
  id: string;
  category: string;
  icon: string;
  budgeted: number;
  spent: number;
  remaining: number;
  trend: number[];
}

export interface Allocation {
  label: string;
  value: number;
  pct: number;
  color: string;
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

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

/* ── Portfolio KPIs ── */

export const portfolioKpis: Kpi[] = [
  { label: 'Net Worth', value: '$1,284,392.18', change: 3.42, changeAbs: '+$42,184.92', icon: 'wallet' },
  { label: 'Total Assets', value: '$1,492,018.00', change: 2.84, changeAbs: '+$41,208.00', icon: 'trending-up' },
  { label: 'Liabilities', value: '$207,625.82', change: -0.48, changeAbs: '-$1,004.20', icon: 'trending-down' },
  { label: 'YTD Return', value: '+12.84%', change: 12.84, changeAbs: '+$146,218.00', icon: 'percent' },
];

/* ── Portfolio Charts ── */

export const portfolioCharts: ChartDef[] = [
  {
    title: 'Net Worth (12 months)',
    type: 'area',
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Net Worth', values: [1098420, 1112840, 1089200, 1124180, 1156420, 1148920, 1182400, 1201840, 1218400, 1242180, 1268420, 1284392], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Portfolio Performance (YTD)',
    type: 'line',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Portfolio', values: [100, 103.2, 108.6, 112.84], color: 'var(--d-accent)' },
      { label: 'S&P 500', values: [100, 101.4, 104.2, 106.18], color: 'var(--d-secondary)' },
    ],
  },
];

/* ── Allocations ── */

export const assetAllocations: Allocation[] = [
  { label: 'US Equities', value: 624820.18, pct: 48.6, color: 'var(--d-accent)' },
  { label: 'Intl Equities', value: 218492.44, pct: 17.0, color: 'var(--d-primary)' },
  { label: 'Fixed Income', value: 182184.00, pct: 14.2, color: 'var(--d-secondary)' },
  { label: 'Real Estate', value: 128440.56, pct: 10.0, color: 'var(--d-info)' },
  { label: 'Commodities', value: 64220.00, pct: 5.0, color: 'var(--d-warning)' },
  { label: 'Cash', value: 66235.00, pct: 5.2, color: 'var(--d-text-muted)' },
];

export const sectorAllocations: Allocation[] = [
  { label: 'Technology', value: 284920.00, pct: 22.2, color: 'var(--d-accent)' },
  { label: 'Healthcare', value: 168420.00, pct: 13.1, color: 'var(--d-primary)' },
  { label: 'Financials', value: 148240.00, pct: 11.5, color: 'var(--d-secondary)' },
  { label: 'Consumer Disc.', value: 124180.00, pct: 9.7, color: 'var(--d-info)' },
  { label: 'Industrials', value: 98420.00, pct: 7.7, color: 'var(--d-warning)' },
  { label: 'Energy', value: 64180.00, pct: 5.0, color: 'var(--d-success)' },
  { label: 'Other', value: 396032.18, pct: 30.8, color: 'var(--d-text-muted)' },
];

/* ── Holdings / Investments ── */

export const holdings: Holding[] = [
  { id: 'h-1', symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', shares: 420, avgCost: 142.18, price: 218.42, marketValue: 91736.40, costBasis: 59715.60, gainAbs: 32020.80, gainPct: 53.62, allocation: 7.14, sparkline: [208, 212, 215, 211, 214, 218, 216, 218, 220, 219, 221, 218], dayChange: 1.24 },
  { id: 'h-2', symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', shares: 210, avgCost: 312.40, price: 424.18, marketValue: 89077.80, costBasis: 65604.00, gainAbs: 23473.80, gainPct: 35.78, allocation: 6.93, sparkline: [412, 418, 415, 420, 422, 424, 421, 424, 426, 425, 423, 424], dayChange: 0.72 },
  { id: 'h-3', symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', shares: 340, avgCost: 98.20, price: 168.42, marketValue: 57262.80, costBasis: 33388.00, gainAbs: 23874.80, gainPct: 71.50, allocation: 4.46, sparkline: [162, 165, 168, 166, 170, 172, 168, 169, 171, 168, 167, 168], dayChange: -0.48 },
  { id: 'h-4', symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', shares: 180, avgCost: 124.80, price: 482.18, marketValue: 86792.40, costBasis: 22464.00, gainAbs: 64328.40, gainPct: 286.36, allocation: 6.75, sparkline: [462, 474, 480, 478, 484, 490, 488, 486, 482, 480, 478, 482], dayChange: 0.84 },
  { id: 'h-5', symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', shares: 120, avgCost: 342.18, price: 418.42, marketValue: 50210.40, costBasis: 41061.60, gainAbs: 9148.80, gainPct: 22.28, allocation: 3.91, sparkline: [410, 412, 415, 414, 416, 418, 420, 419, 418, 420, 421, 418], dayChange: -0.18 },
  { id: 'h-6', symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', shares: 240, avgCost: 142.80, price: 208.42, marketValue: 50020.80, costBasis: 34272.00, gainAbs: 15748.80, gainPct: 45.96, allocation: 3.89, sparkline: [202, 204, 206, 205, 207, 208, 210, 209, 208, 206, 207, 208], dayChange: 0.42 },
  { id: 'h-7', symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', shares: 85, avgCost: 482.18, price: 518.42, marketValue: 44065.70, costBasis: 40985.30, gainAbs: 3080.40, gainPct: 7.52, allocation: 3.43, sparkline: [514, 516, 518, 520, 522, 519, 518, 516, 518, 520, 518, 518], dayChange: -0.32 },
  { id: 'h-8', symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', shares: 160, avgCost: 158.42, price: 162.18, marketValue: 25948.80, costBasis: 25347.20, gainAbs: 601.60, gainPct: 2.37, allocation: 2.02, sparkline: [160, 161, 162, 163, 162, 161, 162, 163, 164, 163, 162, 162], dayChange: 0.12 },
  { id: 'h-9', symbol: 'VTI', name: 'Vanguard Total Stock', sector: 'ETF', shares: 480, avgCost: 218.40, price: 264.82, marketValue: 127113.60, costBasis: 104832.00, gainAbs: 22281.60, gainPct: 21.26, allocation: 9.89, sparkline: [258, 260, 262, 261, 263, 264, 266, 265, 264, 263, 264, 264], dayChange: 0.24 },
  { id: 'h-10', symbol: 'BND', name: 'Vanguard Total Bond', sector: 'Fixed Income', shares: 2200, avgCost: 78.42, price: 72.18, marketValue: 158796.00, costBasis: 172524.00, gainAbs: -13728.00, gainPct: -7.96, allocation: 12.36, sparkline: [73, 72, 72, 73, 72, 71, 72, 72, 73, 72, 72, 72], dayChange: -0.08 },
  { id: 'h-11', symbol: 'VXUS', name: 'Vanguard Intl Stock', sector: 'ETF', shares: 1800, avgCost: 52.18, price: 58.42, marketValue: 105156.00, costBasis: 93924.00, gainAbs: 11232.00, gainPct: 11.96, allocation: 8.19, sparkline: [56, 57, 58, 57, 58, 59, 58, 58, 57, 58, 58, 58], dayChange: 0.14 },
  { id: 'h-12', symbol: 'VNQ', name: 'Vanguard Real Estate', sector: 'Real Estate', shares: 640, avgCost: 84.20, price: 92.18, marketValue: 58995.20, costBasis: 53888.00, gainAbs: 5107.20, gainPct: 9.48, allocation: 4.59, sparkline: [90, 91, 92, 91, 92, 93, 92, 91, 92, 93, 92, 92], dayChange: 0.22 },
];

/* ── Transactions ── */

export const transactions: Transaction[] = [
  { id: 'tx-1', date: '2026-04-05', description: 'Salary Deposit', merchant: 'Atlas Wealth Payroll', category: 'Income', account: 'Checking · 4821', amount: 8420.00, status: 'posted' },
  { id: 'tx-2', date: '2026-04-05', description: 'Whole Foods Market', merchant: 'Whole Foods', category: 'Groceries', account: 'Credit · 9102', amount: -184.22, status: 'posted' },
  { id: 'tx-3', date: '2026-04-04', description: 'Rent Payment', merchant: 'Meridian Properties', category: 'Housing', account: 'Checking · 4821', amount: -3200.00, status: 'posted' },
  { id: 'tx-4', date: '2026-04-04', description: 'Dividend — VTI', merchant: 'Vanguard', category: 'Investment Income', account: 'Brokerage · 8842', amount: 428.18, status: 'cleared' },
  { id: 'tx-5', date: '2026-04-03', description: 'Shell Gas Station', merchant: 'Shell', category: 'Transportation', account: 'Credit · 9102', amount: -62.40, status: 'posted' },
  { id: 'tx-6', date: '2026-04-03', description: 'Netflix Subscription', merchant: 'Netflix', category: 'Entertainment', account: 'Credit · 9102', amount: -22.99, status: 'posted' },
  { id: 'tx-7', date: '2026-04-02', description: 'Transfer to Savings', merchant: 'Internal Transfer', category: 'Transfer', account: 'Checking · 4821', amount: -2000.00, status: 'posted' },
  { id: 'tx-8', date: '2026-04-02', description: 'Blue Bottle Coffee', merchant: 'Blue Bottle', category: 'Dining', account: 'Credit · 9102', amount: -8.40, status: 'posted' },
  { id: 'tx-9', date: '2026-04-01', description: 'Comcast Internet', merchant: 'Comcast', category: 'Utilities', account: 'Checking · 4821', amount: -94.20, status: 'posted' },
  { id: 'tx-10', date: '2026-04-01', description: 'PG&E Electric', merchant: 'PG&E', category: 'Utilities', account: 'Checking · 4821', amount: -148.62, status: 'posted' },
  { id: 'tx-11', date: '2026-03-31', description: 'Uber Ride', merchant: 'Uber', category: 'Transportation', account: 'Credit · 9102', amount: -18.40, status: 'posted' },
  { id: 'tx-12', date: '2026-03-31', description: 'Freelance Payment', merchant: 'Crescent Studio', category: 'Income', account: 'Checking · 4821', amount: 2400.00, status: 'cleared' },
  { id: 'tx-13', date: '2026-03-30', description: 'Amazon Purchase', merchant: 'Amazon', category: 'Shopping', account: 'Credit · 9102', amount: -142.18, status: 'posted' },
  { id: 'tx-14', date: '2026-03-30', description: 'Sweetgreen Lunch', merchant: 'Sweetgreen', category: 'Dining', account: 'Credit · 9102', amount: -16.80, status: 'posted' },
  { id: 'tx-15', date: '2026-03-29', description: 'Gym Membership', merchant: 'Equinox', category: 'Health & Fitness', account: 'Credit · 9102', amount: -220.00, status: 'posted' },
  { id: 'tx-16', date: '2026-03-28', description: 'Chase Auto Loan', merchant: 'Chase', category: 'Debt', account: 'Checking · 4821', amount: -482.40, status: 'posted' },
  { id: 'tx-17', date: '2026-03-28', description: 'Dividend — AAPL', merchant: 'Apple Inc.', category: 'Investment Income', account: 'Brokerage · 8842', amount: 100.80, status: 'cleared' },
  { id: 'tx-18', date: '2026-03-27', description: 'Trader Joes', merchant: 'Trader Joes', category: 'Groceries', account: 'Credit · 9102', amount: -78.42, status: 'posted' },
  { id: 'tx-19', date: '2026-03-27', description: 'Spotify Premium', merchant: 'Spotify', category: 'Entertainment', account: 'Credit · 9102', amount: -11.99, status: 'posted' },
  { id: 'tx-20', date: '2026-03-26', description: 'Delta Airlines', merchant: 'Delta', category: 'Travel', account: 'Credit · 9102', amount: -482.18, status: 'pending' },
  { id: 'tx-21', date: '2026-03-26', description: 'Hotel — Marriott', merchant: 'Marriott', category: 'Travel', account: 'Credit · 9102', amount: -340.40, status: 'pending' },
  { id: 'tx-22', date: '2026-03-25', description: 'CVS Pharmacy', merchant: 'CVS', category: 'Health & Fitness', account: 'Credit · 9102', amount: -42.18, status: 'posted' },
  { id: 'tx-23', date: '2026-03-25', description: 'Stock Sale — TSLA', merchant: 'Vanguard', category: 'Investment Income', account: 'Brokerage · 8842', amount: 4820.00, status: 'cleared' },
  { id: 'tx-24', date: '2026-03-24', description: 'Starbucks', merchant: 'Starbucks', category: 'Dining', account: 'Credit · 9102', amount: -6.80, status: 'posted' },
];

/* ── Budget ── */

export const budgetCategories: BudgetCategory[] = [
  { id: 'b-1', category: 'Housing', icon: 'home', budgeted: 3400.00, spent: 3200.00, remaining: 200.00, trend: [3200, 3200, 3200, 3200, 3200, 3200] },
  { id: 'b-2', category: 'Groceries', icon: 'shopping-cart', budgeted: 800.00, spent: 624.82, remaining: 175.18, trend: [640, 720, 580, 648, 702, 624] },
  { id: 'b-3', category: 'Dining', icon: 'utensils', budgeted: 400.00, spent: 342.80, remaining: 57.20, trend: [320, 380, 410, 290, 360, 342] },
  { id: 'b-4', category: 'Transportation', icon: 'car', budgeted: 300.00, spent: 218.40, remaining: 81.60, trend: [180, 220, 240, 190, 260, 218] },
  { id: 'b-5', category: 'Utilities', icon: 'zap', budgeted: 350.00, spent: 284.82, remaining: 65.18, trend: [240, 260, 280, 290, 284, 284] },
  { id: 'b-6', category: 'Entertainment', icon: 'film', budgeted: 150.00, spent: 148.98, remaining: 1.02, trend: [120, 140, 128, 145, 132, 148] },
  { id: 'b-7', category: 'Health & Fitness', icon: 'heart', budgeted: 300.00, spent: 382.18, remaining: -82.18, trend: [220, 262, 248, 298, 320, 382] },
  { id: 'b-8', category: 'Travel', icon: 'plane', budgeted: 600.00, spent: 822.58, remaining: -222.58, trend: [80, 120, 180, 240, 600, 822] },
  { id: 'b-9', category: 'Shopping', icon: 'shopping-bag', budgeted: 400.00, spent: 284.18, remaining: 115.82, trend: [380, 420, 310, 290, 340, 284] },
  { id: 'b-10', category: 'Debt', icon: 'credit-card', budgeted: 500.00, spent: 482.40, remaining: 17.60, trend: [482, 482, 482, 482, 482, 482] },
];

/* ── Sessions ── */

export const sessions: Session[] = [
  { id: 's-1', device: 'MacBook Pro · Chrome', location: 'San Francisco, CA', ip: '73.140.22.18', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15 · Safari', location: 'San Francisco, CA', ip: '73.140.22.18', lastActive: '32m ago', current: false },
  { id: 's-3', device: 'iPad · Safari', location: 'Los Angeles, CA', ip: '98.176.44.21', lastActive: '4d ago', current: false },
];

/* ── Marketing ── */

export const marketingFeatures = [
  { icon: 'trending-up', title: 'Portfolio tracking', description: 'Every holding, every sector, every dollar. Real-time pricing with cost basis, gains, and sparklines inline.' },
  { icon: 'pie-chart', title: 'Allocation views', description: 'See your asset allocation by class, sector, and region. Rebalance with confidence.' },
  { icon: 'list', title: 'Transaction ledger', description: 'Filterable, searchable, and fast. Categorize income and expenses across every account.' },
  { icon: 'target', title: 'Budget planning', description: 'Set budgets by category, track actuals, and spot overruns before they compound.' },
  { icon: 'shield', title: 'Bank-grade security', description: '256-bit encryption, biometric auth, and MFA. Your data, your vault.' },
  { icon: 'download', title: 'Tax-ready exports', description: 'Export transactions and realized gains in CSV, PDF, or Form 1099-ready formats.' },
];

export const marketingStats = [
  { label: 'Tracked', value: '$4.2B' },
  { label: 'Accounts', value: '18K+' },
  { label: 'Uptime', value: '99.99%' },
  { label: 'Institutions', value: '12K+' },
];

export const testimonials = [
  { quote: 'Atlas Wealth consolidated six brokerage statements into one dashboard. My quarterly review now takes fifteen minutes.', author: 'Eleanor Whitfield', role: 'CFP, Whitfield Advisory', avatar: 'EW' },
  { quote: 'The sparkline columns in the holdings table are the detail nobody else gets right. I scan the portfolio in seconds.', author: 'Dr. Marcus Reid', role: 'Private Investor', avatar: 'MR' },
  { quote: 'Budget categories sync with transactions automatically. I stopped maintaining spreadsheets in month one.', author: 'Priya Anand', role: 'Head of Finance, Crestline', avatar: 'PA' },
];

export const pricingTiers = [
  { name: 'Personal', price: 0, period: '/mo', recommended: false, current: false, features: ['2 linked accounts', 'Portfolio tracking', 'Basic budgets', 'Monthly exports', 'Email support'] },
  { name: 'Plus', price: 12, period: '/mo', recommended: true, current: true, features: ['Unlimited accounts', 'Real-time pricing', 'Advanced budgets', 'Tax-ready exports', 'Priority support', 'Custom categories'] },
  { name: 'Advisor', price: 48, period: '/mo', recommended: false, current: false, features: ['Everything in Plus', 'Client portfolios', 'Performance reports', 'White-label branding', 'API access', 'Dedicated CSM'] },
];
