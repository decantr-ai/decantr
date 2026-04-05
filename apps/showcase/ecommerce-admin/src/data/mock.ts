/* ── Mock Data: Ecommerce Admin (Brightgoods) ── */

export interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export type ProductStatus = 'active' | 'draft' | 'archived';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderAt: number;
  status: ProductStatus;
  stockStatus: StockStatus;
  image: string; // initials
  sales30d: number;
  updated: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  items: OrderItem[];
  placed: string;
  shippedAt?: string;
  deliveredAt?: string;
  tracking?: string;
  shippingAddress: string;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  ltv: number;
  lastOrder: string;
  joined: string;
  tags: string[];
  status: 'active' | 'dormant' | 'vip';
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
  type: 'order' | 'product' | 'customer' | 'payment' | 'inventory' | 'system';
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

export const dashboardKpis: Kpi[] = [
  { label: 'Revenue (30d)', value: '$128,420', change: 14.2, icon: 'dollar-sign' },
  { label: 'Orders (30d)', value: '1,284', change: 9.6, icon: 'shopping-cart' },
  { label: 'AOV', value: '$99.94', change: 4.1, icon: 'trending-up' },
  { label: 'Conversion', value: '3.42%', change: 0.8, icon: 'percent' },
];

export const analyticsKpis: Kpi[] = [
  { label: 'Gross Revenue', value: '$412,890', change: 16.8, icon: 'dollar-sign' },
  { label: 'Net Revenue', value: '$386,240', change: 15.2, icon: 'trending-up' },
  { label: 'Orders', value: '4,128', change: 11.4, icon: 'shopping-bag' },
  { label: 'Refunds', value: '$6,280', change: -8.2, icon: 'rotate-ccw' },
];

/* ── Products ── */

export const products: Product[] = [
  { id: 'p-1', sku: 'BG-AXIS-01', name: 'Axis Wireless Earbuds', category: 'Audio', price: 129.00, stock: 184, reorderAt: 50, status: 'active', stockStatus: 'in-stock', image: 'AX', sales30d: 412, updated: '2h ago' },
  { id: 'p-2', sku: 'BG-LUMI-02', name: 'Lumi Desk Lamp', category: 'Home', price: 68.00, stock: 42, reorderAt: 50, status: 'active', stockStatus: 'low-stock', image: 'LU', sales30d: 186, updated: '5h ago' },
  { id: 'p-3', sku: 'BG-TREK-03', name: 'Trek Backpack 24L', category: 'Outdoor', price: 98.00, stock: 0, reorderAt: 30, status: 'active', stockStatus: 'out-of-stock', image: 'TR', sales30d: 94, updated: '1d ago' },
  { id: 'p-4', sku: 'BG-FLUX-04', name: 'Flux Smart Bottle', category: 'Home', price: 42.00, stock: 312, reorderAt: 100, status: 'active', stockStatus: 'in-stock', image: 'FL', sales30d: 528, updated: '3h ago' },
  { id: 'p-5', sku: 'BG-NOVA-05', name: 'Nova Pocket Speaker', category: 'Audio', price: 58.00, stock: 148, reorderAt: 60, status: 'active', stockStatus: 'in-stock', image: 'NO', sales30d: 274, updated: '6h ago' },
  { id: 'p-6', sku: 'BG-ORBIT-06', name: 'Orbit Travel Pillow', category: 'Outdoor', price: 32.00, stock: 28, reorderAt: 40, status: 'active', stockStatus: 'low-stock', image: 'OR', sales30d: 112, updated: '12h ago' },
  { id: 'p-7', sku: 'BG-PULSE-07', name: 'Pulse Fitness Band', category: 'Wearables', price: 89.00, stock: 96, reorderAt: 40, status: 'active', stockStatus: 'in-stock', image: 'PU', sales30d: 312, updated: '2d ago' },
  { id: 'p-8', sku: 'BG-HAZE-08', name: 'Haze Scented Candle', category: 'Home', price: 24.00, stock: 408, reorderAt: 100, status: 'active', stockStatus: 'in-stock', image: 'HA', sales30d: 642, updated: '1d ago' },
  { id: 'p-9', sku: 'BG-VERT-09', name: 'Vert Yoga Mat', category: 'Fitness', price: 52.00, stock: 74, reorderAt: 50, status: 'active', stockStatus: 'in-stock', image: 'VE', sales30d: 188, updated: '3d ago' },
  { id: 'p-10', sku: 'BG-ECHO-10', name: 'Echo Notebook Set', category: 'Office', price: 18.00, stock: 0, reorderAt: 80, status: 'draft', stockStatus: 'out-of-stock', image: 'EC', sales30d: 0, updated: '5d ago' },
  { id: 'p-11', sku: 'BG-GLOW-11', name: 'Glow LED Strip', category: 'Home', price: 38.00, stock: 212, reorderAt: 80, status: 'active', stockStatus: 'in-stock', image: 'GL', sales30d: 296, updated: '4h ago' },
  { id: 'p-12', sku: 'BG-TIDE-12', name: 'Tide Ocean Tumbler', category: 'Home', price: 28.00, stock: 36, reorderAt: 60, status: 'active', stockStatus: 'low-stock', image: 'TI', sales30d: 148, updated: '8h ago' },
];

/* ── Orders ── */

export const orders: Order[] = [
  { id: 'o-1', number: '#BG-10482', customerId: 'c-1', customerName: 'Riley Parker', customerEmail: 'riley.p@email.com', total: 187.00, status: 'pending', payment: 'paid', placed: '3m ago', shippingAddress: '142 Oak St, Portland OR 97204', items: [{ productId: 'p-1', name: 'Axis Wireless Earbuds', sku: 'BG-AXIS-01', qty: 1, price: 129.00 }, { productId: 'p-6', name: 'Orbit Travel Pillow', sku: 'BG-ORBIT-06', qty: 1, price: 32.00 }, { productId: 'p-8', name: 'Haze Scented Candle', sku: 'BG-HAZE-08', qty: 1, price: 24.00 }] },
  { id: 'o-2', number: '#BG-10481', customerId: 'c-2', customerName: 'Jordan Hayes', customerEmail: 'jhayes@email.com', total: 98.00, status: 'processing', payment: 'paid', placed: '18m ago', shippingAddress: '88 Pine Ave, Denver CO 80203', items: [{ productId: 'p-3', name: 'Trek Backpack 24L', sku: 'BG-TREK-03', qty: 1, price: 98.00 }] },
  { id: 'o-3', number: '#BG-10480', customerId: 'c-3', customerName: 'Samira Okafor', customerEmail: 'samira.o@email.com', total: 258.00, status: 'processing', payment: 'paid', placed: '42m ago', shippingAddress: '501 Birch Rd, Austin TX 78701', items: [{ productId: 'p-1', name: 'Axis Wireless Earbuds', sku: 'BG-AXIS-01', qty: 2, price: 129.00 }] },
  { id: 'o-4', number: '#BG-10479', customerId: 'c-4', customerName: 'Marcus Chen', customerEmail: 'mchen@email.com', total: 89.00, status: 'shipped', payment: 'paid', placed: '2h ago', shippedAt: '1h ago', tracking: '1Z999AA10123456784', shippingAddress: '22 Maple Dr, Seattle WA 98101', items: [{ productId: 'p-7', name: 'Pulse Fitness Band', sku: 'BG-PULSE-07', qty: 1, price: 89.00 }] },
  { id: 'o-5', number: '#BG-10478', customerId: 'c-5', customerName: 'Aisha Patel', customerEmail: 'aisha.p@email.com', total: 146.00, status: 'shipped', payment: 'paid', placed: '4h ago', shippedAt: '2h ago', tracking: '1Z999AA10123456785', shippingAddress: '17 Cedar Ln, Boston MA 02116', items: [{ productId: 'p-2', name: 'Lumi Desk Lamp', sku: 'BG-LUMI-02', qty: 1, price: 68.00 }, { productId: 'p-11', name: 'Glow LED Strip', sku: 'BG-GLOW-11', qty: 1, price: 38.00 }, { productId: 'p-4', name: 'Flux Smart Bottle', sku: 'BG-FLUX-04', qty: 1, price: 42.00 }] },
  { id: 'o-6', number: '#BG-10477', customerId: 'c-6', customerName: 'David Kim', customerEmail: 'dkim@email.com', total: 52.00, status: 'delivered', payment: 'paid', placed: '1d ago', shippedAt: '22h ago', deliveredAt: '2h ago', tracking: '1Z999AA10123456786', shippingAddress: '9 Elm St, San Diego CA 92101', items: [{ productId: 'p-9', name: 'Vert Yoga Mat', sku: 'BG-VERT-09', qty: 1, price: 52.00 }] },
  { id: 'o-7', number: '#BG-10476', customerId: 'c-7', customerName: 'Emma Larsen', customerEmail: 'emma.l@email.com', total: 116.00, status: 'delivered', payment: 'paid', placed: '2d ago', shippedAt: '1d ago', deliveredAt: '6h ago', tracking: '1Z999AA10123456787', shippingAddress: '314 Willow Ct, Minneapolis MN 55401', items: [{ productId: 'p-5', name: 'Nova Pocket Speaker', sku: 'BG-NOVA-05', qty: 2, price: 58.00 }] },
  { id: 'o-8', number: '#BG-10475', customerId: 'c-8', customerName: 'Carlos Rivera', customerEmail: 'carlos.r@email.com', total: 42.00, status: 'cancelled', payment: 'refunded', placed: '2d ago', shippingAddress: '77 Bay St, Miami FL 33101', items: [{ productId: 'p-4', name: 'Flux Smart Bottle', sku: 'BG-FLUX-04', qty: 1, price: 42.00 }] },
  { id: 'o-9', number: '#BG-10474', customerId: 'c-1', customerName: 'Riley Parker', customerEmail: 'riley.p@email.com', total: 166.00, status: 'delivered', payment: 'paid', placed: '4d ago', shippedAt: '3d ago', deliveredAt: '1d ago', tracking: '1Z999AA10123456788', shippingAddress: '142 Oak St, Portland OR 97204', items: [{ productId: 'p-8', name: 'Haze Scented Candle', sku: 'BG-HAZE-08', qty: 4, price: 24.00 }, { productId: 'p-9', name: 'Vert Yoga Mat', sku: 'BG-VERT-09', qty: 1, price: 52.00 }, { productId: 'p-6', name: 'Orbit Travel Pillow', sku: 'BG-ORBIT-06', qty: 1, price: 32.00 }] },
  { id: 'o-10', number: '#BG-10473', customerId: 'c-9', customerName: 'Lin Wei', customerEmail: 'lin.w@email.com', total: 89.00, status: 'refunded', payment: 'refunded', placed: '5d ago', shippingAddress: '201 River Rd, Chicago IL 60601', items: [{ productId: 'p-7', name: 'Pulse Fitness Band', sku: 'BG-PULSE-07', qty: 1, price: 89.00 }] },
  { id: 'o-11', number: '#BG-10472', customerId: 'c-2', customerName: 'Jordan Hayes', customerEmail: 'jhayes@email.com', total: 184.00, status: 'pending', payment: 'pending', placed: '5h ago', shippingAddress: '88 Pine Ave, Denver CO 80203', items: [{ productId: 'p-1', name: 'Axis Wireless Earbuds', sku: 'BG-AXIS-01', qty: 1, price: 129.00 }, { productId: 'p-12', name: 'Tide Ocean Tumbler', sku: 'BG-TIDE-12', qty: 2, price: 28.00 }] },
  { id: 'o-12', number: '#BG-10471', customerId: 'c-10', customerName: 'Priya Sharma', customerEmail: 'priya.s@email.com', total: 52.00, status: 'processing', payment: 'paid', placed: '1h ago', shippingAddress: '55 Park Ave, New York NY 10016', items: [{ productId: 'p-9', name: 'Vert Yoga Mat', sku: 'BG-VERT-09', qty: 1, price: 52.00 }] },
];

/* ── Customers ── */

export const customers: Customer[] = [
  { id: 'c-1', name: 'Riley Parker', avatar: 'RP', email: 'riley.p@email.com', phone: '+1 503-555-0142', city: 'Portland, OR', orders: 14, ltv: 2480.00, lastOrder: '3m ago', joined: '2024-03-12', tags: ['vip', 'repeat'], status: 'vip' },
  { id: 'c-2', name: 'Jordan Hayes', avatar: 'JH', email: 'jhayes@email.com', phone: '+1 303-555-0188', city: 'Denver, CO', orders: 8, ltv: 1120.00, lastOrder: '18m ago', joined: '2024-05-04', tags: ['repeat'], status: 'active' },
  { id: 'c-3', name: 'Samira Okafor', avatar: 'SO', email: 'samira.o@email.com', phone: '+1 512-555-0214', city: 'Austin, TX', orders: 6, ltv: 980.00, lastOrder: '42m ago', joined: '2024-07-18', tags: ['repeat'], status: 'active' },
  { id: 'c-4', name: 'Marcus Chen', avatar: 'MC', email: 'mchen@email.com', phone: '+1 206-555-0341', city: 'Seattle, WA', orders: 3, ltv: 342.00, lastOrder: '2h ago', joined: '2024-11-22', tags: ['new'], status: 'active' },
  { id: 'c-5', name: 'Aisha Patel', avatar: 'AP', email: 'aisha.p@email.com', phone: '+1 617-555-0122', city: 'Boston, MA', orders: 12, ltv: 1840.00, lastOrder: '4h ago', joined: '2024-02-08', tags: ['vip', 'repeat'], status: 'vip' },
  { id: 'c-6', name: 'David Kim', avatar: 'DK', email: 'dkim@email.com', phone: '+1 619-555-0278', city: 'San Diego, CA', orders: 4, ltv: 412.00, lastOrder: '1d ago', joined: '2024-09-30', tags: ['repeat'], status: 'active' },
  { id: 'c-7', name: 'Emma Larsen', avatar: 'EL', email: 'emma.l@email.com', phone: '+1 612-555-0401', city: 'Minneapolis, MN', orders: 9, ltv: 1280.00, lastOrder: '2d ago', joined: '2024-04-15', tags: ['repeat'], status: 'active' },
  { id: 'c-8', name: 'Carlos Rivera', avatar: 'CR', email: 'carlos.r@email.com', phone: '+1 305-555-0189', city: 'Miami, FL', orders: 2, ltv: 110.00, lastOrder: '2d ago', joined: '2025-01-20', tags: ['new'], status: 'active' },
  { id: 'c-9', name: 'Lin Wei', avatar: 'LW', email: 'lin.w@email.com', phone: '+1 312-555-0366', city: 'Chicago, IL', orders: 1, ltv: 0.00, lastOrder: '5d ago', joined: '2025-03-02', tags: ['refund'], status: 'dormant' },
  { id: 'c-10', name: 'Priya Sharma', avatar: 'PS', email: 'priya.s@email.com', phone: '+1 212-555-0523', city: 'New York, NY', orders: 5, ltv: 680.00, lastOrder: '1h ago', joined: '2024-08-11', tags: ['repeat'], status: 'active' },
  { id: 'c-11', name: 'Hassan Ali', avatar: 'HA', email: 'hassan.a@email.com', phone: '+1 718-555-0612', city: 'Brooklyn, NY', orders: 22, ltv: 4120.00, lastOrder: '8d ago', joined: '2023-11-04', tags: ['vip', 'wholesale'], status: 'vip' },
  { id: 'c-12', name: 'Nora Bennett', avatar: 'NB', email: 'nora.b@email.com', phone: '+1 415-555-0187', city: 'San Francisco, CA', orders: 0, ltv: 0.00, lastOrder: 'never', joined: '2026-03-28', tags: ['new'], status: 'active' },
];

/* ── Charts ── */

export const dashboardCharts: ChartDef[] = [
  {
    title: 'Revenue (30d)',
    type: 'area',
    labels: ['Mar 7', 'Mar 14', 'Mar 21', 'Mar 28', 'Apr 4'],
    series: [
      { label: 'Revenue', values: [22400, 24100, 26800, 28900, 31200], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Orders by Day (7d)',
    type: 'bar',
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    series: [
      { label: 'Orders', values: [42, 58, 61, 54, 72, 88, 76], color: 'var(--d-primary)' },
    ],
  },
];

export const analyticsCharts: ChartDef[] = [
  {
    title: 'Revenue (14d)',
    type: 'area',
    labels: ['1', '3', '5', '7', '9', '11', '13'],
    series: [
      { label: 'Revenue', values: [9200, 10400, 11800, 12200, 13800, 14200, 15400], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Orders by Category',
    type: 'bar',
    labels: ['Audio', 'Home', 'Outdoor', 'Fitness', 'Wearables', 'Office'],
    series: [
      { label: 'Orders', values: [684, 1242, 412, 388, 604, 128], color: 'var(--d-primary)' },
    ],
  },
  {
    title: 'AOV Trend (weekly)',
    type: 'line',
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    series: [
      { label: 'AOV', values: [87, 91, 88, 94, 96, 99], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Refund Rate',
    type: 'bar',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Refunds %', values: [2.4, 2.1, 1.8, 1.5], color: 'var(--d-warning)' },
    ],
  },
];

export const revenueTrends: { label: string; value: string; change: number; data: number[] }[] = [
  { label: 'Audio', value: '$68,420', change: 18.2, data: [12, 14, 11, 16, 18, 14, 22, 19, 24, 21, 28, 32] },
  { label: 'Home', value: '$52,180', change: 12.4, data: [18, 19, 17, 21, 20, 22, 24, 23, 25, 26, 24, 28] },
  { label: 'Outdoor', value: '$28,940', change: 6.8, data: [8, 9, 7, 11, 10, 12, 14, 13, 15, 16, 14, 18] },
  { label: 'Fitness', value: '$24,210', change: 8.2, data: [6, 8, 9, 10, 9, 11, 12, 11, 13, 12, 14, 15] },
  { label: 'Wearables', value: '$31,560', change: -3.2, data: [14, 13, 15, 12, 13, 11, 12, 10, 11, 10, 9, 10] },
  { label: 'Office', value: '$8,140', change: 4.1, data: [3, 4, 3, 4, 5, 4, 5, 5, 6, 5, 6, 7] },
];

/* ── Activity Feed ── */

export const activityEvents: ActivityEvent[] = [
  { id: 'ev-1', actor: 'System', actorAvatar: 'SY', action: 'new order', target: '#BG-10482 ($187.00)', timestamp: '3m ago', type: 'order' },
  { id: 'ev-2', actor: 'Morgan Rivera', actorAvatar: 'MR', action: 'shipped', target: '#BG-10479 via UPS', timestamp: '1h ago', type: 'order' },
  { id: 'ev-3', actor: 'System', actorAvatar: 'SY', action: 'low stock alert', target: 'Lumi Desk Lamp (42 left)', timestamp: '2h ago', type: 'inventory' },
  { id: 'ev-4', actor: 'Morgan Rivera', actorAvatar: 'MR', action: 'restocked', target: 'Flux Smart Bottle (+200)', timestamp: '3h ago', type: 'inventory' },
  { id: 'ev-5', actor: 'System', actorAvatar: 'SY', action: 'payment received', target: '#BG-10481 ($98.00)', timestamp: '4h ago', type: 'payment' },
  { id: 'ev-6', actor: 'Morgan Rivera', actorAvatar: 'MR', action: 'updated', target: 'Axis Wireless Earbuds pricing', timestamp: '5h ago', type: 'product' },
  { id: 'ev-7', actor: 'System', actorAvatar: 'SY', action: 'out of stock', target: 'Trek Backpack 24L', timestamp: '1d ago', type: 'inventory' },
  { id: 'ev-8', actor: 'System', actorAvatar: 'SY', action: 'refund processed', target: '#BG-10473 ($89.00)', timestamp: '1d ago', type: 'payment' },
  { id: 'ev-9', actor: 'Morgan Rivera', actorAvatar: 'MR', action: 'tagged', target: 'Hassan Ali as wholesale', timestamp: '2d ago', type: 'customer' },
  { id: 'ev-10', actor: 'System', actorAvatar: 'SY', action: 'new customer', target: 'Nora Bennett signed up', timestamp: '8d ago', type: 'customer' },
];

/* ── Sessions ── */

export const sessions: Session[] = [
  { id: 's-1', device: 'MacBook Pro · Chrome', location: 'Portland, OR', ip: '73.140.22.18', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15 · Safari', location: 'Portland, OR', ip: '73.140.22.18', lastActive: '28m ago', current: false },
  { id: 's-3', device: 'iPad · Safari', location: 'Seattle, WA', ip: '98.176.44.21', lastActive: '3d ago', current: false },
];

/* ── Quick Actions ── */

export const quickActions = [
  { id: 'qa-1', icon: 'plus-square', label: 'Add product', description: 'Create a new product listing', route: '/products' },
  { id: 'qa-2', icon: 'package', label: 'Fulfill orders', description: 'Process pending orders', route: '/orders' },
  { id: 'qa-3', icon: 'truck', label: 'Print labels', description: 'Generate shipping labels', route: '/orders' },
  { id: 'qa-4', icon: 'refresh-ccw', label: 'Restock alert', description: 'View low inventory items', route: '/inventory' },
  { id: 'qa-5', icon: 'download', label: 'Export orders', description: 'Download CSV of orders', route: '/orders' },
  { id: 'qa-6', icon: 'users', label: 'Customer list', description: 'Browse all customers', route: '/customers' },
  { id: 'qa-7', icon: 'bar-chart-3', label: 'Revenue report', description: 'View sales analytics', route: '/analytics' },
  { id: 'qa-8', icon: 'settings', label: 'Store settings', description: 'Configure store details', route: '/settings/profile' },
];

/* ── Order status columns for kanban ── */
export const fulfillmentColumns: { key: OrderStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'var(--d-warning)' },
  { key: 'processing', label: 'Processing', color: 'var(--d-info)' },
  { key: 'shipped', label: 'Shipped', color: 'var(--d-primary)' },
  { key: 'delivered', label: 'Delivered', color: 'var(--d-success)' },
];
