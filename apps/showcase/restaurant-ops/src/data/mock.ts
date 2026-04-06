// ── Table & Floor Map ──

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type Table = {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  server?: string;
  partySize?: number;
  guestName?: string;
  seatedAt?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'round';
};

export const tables: Table[] = [
  { id: 't1', number: 1, seats: 2, status: 'occupied', server: 'Maria', partySize: 2, guestName: 'Johnson', seatedAt: '6:15 PM', x: 40, y: 40, width: 70, height: 50, shape: 'rect' },
  { id: 't2', number: 2, seats: 4, status: 'available', x: 140, y: 40, width: 80, height: 60, shape: 'rect' },
  { id: 't3', number: 3, seats: 4, status: 'reserved', guestName: 'Patel', x: 260, y: 40, width: 80, height: 60, shape: 'rect' },
  { id: 't4', number: 4, seats: 6, status: 'occupied', server: 'James', partySize: 5, guestName: 'Kim', seatedAt: '5:45 PM', x: 380, y: 40, width: 100, height: 60, shape: 'rect' },
  { id: 't5', number: 5, seats: 2, status: 'occupied', server: 'Maria', partySize: 2, guestName: 'Garcia', seatedAt: '6:30 PM', x: 40, y: 140, width: 60, height: 60, shape: 'round' },
  { id: 't6', number: 6, seats: 2, status: 'cleaning', x: 140, y: 140, width: 60, height: 60, shape: 'round' },
  { id: 't7', number: 7, seats: 4, status: 'available', x: 240, y: 140, width: 80, height: 60, shape: 'rect' },
  { id: 't8', number: 8, seats: 8, status: 'occupied', server: 'Rosa', partySize: 7, guestName: 'Thompson', seatedAt: '5:30 PM', x: 360, y: 140, width: 130, height: 70, shape: 'rect' },
  { id: 't9', number: 9, seats: 4, status: 'reserved', guestName: 'Chen', x: 40, y: 240, width: 80, height: 60, shape: 'rect' },
  { id: 't10', number: 10, seats: 2, status: 'available', x: 160, y: 240, width: 60, height: 60, shape: 'round' },
  { id: 'bar1', number: 11, seats: 1, status: 'occupied', partySize: 1, seatedAt: '6:45 PM', x: 280, y: 250, width: 40, height: 40, shape: 'round' },
  { id: 'bar2', number: 12, seats: 1, status: 'available', x: 340, y: 250, width: 40, height: 40, shape: 'round' },
  { id: 'bar3', number: 13, seats: 1, status: 'occupied', partySize: 1, seatedAt: '7:00 PM', x: 400, y: 250, width: 40, height: 40, shape: 'round' },
  { id: 'bar4', number: 14, seats: 1, status: 'available', x: 460, y: 250, width: 40, height: 40, shape: 'round' },
];

// ── Reservations ──

export type Reservation = {
  id: string;
  guestName: string;
  partySize: number;
  time: string;
  date: string;
  phone: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'seated';
  tableId?: string;
};

export const reservations: Reservation[] = [
  { id: 'r1', guestName: 'Patel Family', partySize: 4, time: '7:00 PM', date: '2026-04-06', phone: '555-0102', notes: 'Anniversary dinner', status: 'confirmed', tableId: 't3' },
  { id: 'r2', guestName: 'Chen Party', partySize: 4, time: '7:30 PM', date: '2026-04-06', phone: '555-0203', status: 'confirmed', tableId: 't9' },
  { id: 'r3', guestName: 'Williams', partySize: 2, time: '8:00 PM', date: '2026-04-06', phone: '555-0304', status: 'pending' },
  { id: 'r4', guestName: 'Rodriguez', partySize: 6, time: '8:30 PM', date: '2026-04-06', phone: '555-0405', notes: 'Birthday — bring cake', status: 'confirmed' },
  { id: 'r5', guestName: 'Baker', partySize: 2, time: '6:00 PM', date: '2026-04-06', phone: '555-0506', status: 'seated' },
  { id: 'r6', guestName: 'Liu', partySize: 3, time: '9:00 PM', date: '2026-04-06', phone: '555-0607', status: 'pending' },
  { id: 'r7', guestName: 'Okafor', partySize: 8, time: '7:00 PM', date: '2026-04-07', phone: '555-0708', notes: 'Business dinner, need quiet table', status: 'confirmed' },
  { id: 'r8', guestName: 'Nguyen', partySize: 2, time: '6:30 PM', date: '2026-04-07', phone: '555-0809', status: 'cancelled' },
];

// ── Kitchen / KDS ──

export type TicketPriority = 'normal' | 'rush' | 'fire';
export type TicketStatus = 'new' | 'cooking' | 'plating' | 'done';
export type KDSTicket = {
  id: string;
  tableNumber: number;
  server: string;
  items: { name: string; qty: number; mods?: string }[];
  priority: TicketPriority;
  status: TicketStatus;
  station: string;
  elapsed: number; // seconds
  createdAt: string;
};

export const tickets: KDSTicket[] = [
  { id: 'k1', tableNumber: 1, server: 'Maria', items: [{ name: 'Rigatoni Bolognese', qty: 1 }, { name: 'Caesar Salad', qty: 1 }], priority: 'normal', status: 'cooking', station: 'Saute', elapsed: 420, createdAt: '6:22 PM' },
  { id: 'k2', tableNumber: 4, server: 'James', items: [{ name: 'Grilled Branzino', qty: 2 }, { name: 'Risotto', qty: 1, mods: 'no peas' }, { name: 'Burrata', qty: 1 }], priority: 'normal', status: 'cooking', station: 'Grill', elapsed: 300, createdAt: '6:24 PM' },
  { id: 'k3', tableNumber: 8, server: 'Rosa', items: [{ name: 'Steak Frites', qty: 3, mods: '2 MR, 1 M' }, { name: 'Roast Chicken', qty: 2 }, { name: 'Panna Cotta', qty: 2 }], priority: 'rush', status: 'cooking', station: 'Grill', elapsed: 600, createdAt: '6:18 PM' },
  { id: 'k4', tableNumber: 5, server: 'Maria', items: [{ name: 'Margherita Pizza', qty: 1 }, { name: 'Tiramisu', qty: 1 }], priority: 'normal', status: 'plating', station: 'Pizza', elapsed: 780, createdAt: '6:15 PM' },
  { id: 'k5', tableNumber: 11, server: 'Bar', items: [{ name: 'Truffle Fries', qty: 1 }], priority: 'normal', status: 'new', station: 'Fry', elapsed: 60, createdAt: '6:44 PM' },
  { id: 'k6', tableNumber: 13, server: 'Bar', items: [{ name: 'Bruschetta', qty: 1 }, { name: 'Olives', qty: 1 }], priority: 'normal', status: 'new', station: 'Cold', elapsed: 30, createdAt: '6:45 PM' },
  { id: 'k7', tableNumber: 1, server: 'Maria', items: [{ name: 'Tiramisu', qty: 2 }], priority: 'fire', status: 'new', station: 'Pastry', elapsed: 15, createdAt: '6:46 PM' },
];

export const stations = ['All', 'Saute', 'Grill', 'Pizza', 'Fry', 'Cold', 'Pastry'];

// ── Menus ──

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  popularity: number; // 1-100
  active: boolean;
};

export type Menu = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  active: boolean;
};

export const menus: Menu[] = [
  { id: 'dinner', name: 'Dinner', description: 'Full evening service menu', itemCount: 28, active: true },
  { id: 'lunch', name: 'Lunch', description: 'Weekday lunch specials', itemCount: 16, active: true },
  { id: 'brunch', name: 'Weekend Brunch', description: 'Saturday & Sunday brunch', itemCount: 20, active: true },
  { id: 'happy-hour', name: 'Happy Hour', description: 'Bar bites & drink specials', itemCount: 12, active: false },
  { id: 'dessert', name: 'Dessert', description: 'Evening dessert menu', itemCount: 8, active: true },
];

export const menuItems: MenuItem[] = [
  { id: 'mi1', name: 'Rigatoni Bolognese', description: 'Slow-cooked beef ragu, parmigiano, basil', price: 24, cost: 6.20, category: 'Pasta', popularity: 92, active: true },
  { id: 'mi2', name: 'Grilled Branzino', description: 'Whole fish, lemon, capers, herb oil', price: 36, cost: 14.50, category: 'Fish', popularity: 78, active: true },
  { id: 'mi3', name: 'Steak Frites', description: '12oz NY strip, truffle fries, bearnaise', price: 42, cost: 16.80, category: 'Meat', popularity: 88, active: true },
  { id: 'mi4', name: 'Roast Chicken', description: 'Half chicken, rosemary jus, roast potatoes', price: 28, cost: 7.40, category: 'Meat', popularity: 85, active: true },
  { id: 'mi5', name: 'Margherita Pizza', description: 'San Marzano, fresh mozzarella, basil', price: 18, cost: 3.60, category: 'Pizza', popularity: 95, active: true },
  { id: 'mi6', name: 'Caesar Salad', description: 'Romaine, anchovy dressing, croutons, parmigiano', price: 14, cost: 2.80, category: 'Salad', popularity: 74, active: true },
  { id: 'mi7', name: 'Burrata', description: 'Heirloom tomatoes, basil oil, grilled bread', price: 16, cost: 5.20, category: 'Appetizer', popularity: 82, active: true },
  { id: 'mi8', name: 'Risotto', description: 'Seasonal mushroom, parmigiano, truffle oil', price: 26, cost: 6.80, category: 'Pasta', popularity: 70, active: true },
  { id: 'mi9', name: 'Truffle Fries', description: 'Parmesan, truffle oil, rosemary salt', price: 12, cost: 2.40, category: 'Side', popularity: 90, active: true },
  { id: 'mi10', name: 'Tiramisu', description: 'Classic mascarpone, espresso, cocoa', price: 14, cost: 3.10, category: 'Dessert', popularity: 86, active: true },
  { id: 'mi11', name: 'Panna Cotta', description: 'Vanilla bean, seasonal fruit compote', price: 12, cost: 2.50, category: 'Dessert', popularity: 68, active: true },
  { id: 'mi12', name: 'Bruschetta', description: 'Tomato, garlic, basil, extra virgin olive oil', price: 10, cost: 1.80, category: 'Appetizer', popularity: 76, active: true },
  { id: 'mi13', name: 'Olives', description: 'Marinated Castelvetrano & Kalamata', price: 8, cost: 2.10, category: 'Appetizer', popularity: 52, active: true },
  { id: 'mi14', name: 'Lobster Linguine', description: 'Half lobster, cherry tomato, white wine', price: 38, cost: 18.50, category: 'Pasta', popularity: 64, active: true },
];

// ── Inventory ──

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  parLevel: number;
  cost: number;
  supplier: string;
  lastOrdered: string;
};

export const ingredients: Ingredient[] = [
  { id: 'ing1', name: 'San Marzano Tomatoes', category: 'Canned', unit: 'case', currentStock: 8, parLevel: 12, cost: 32.00, supplier: 'Roma Foods', lastOrdered: '2026-04-01' },
  { id: 'ing2', name: 'Fresh Mozzarella', category: 'Dairy', unit: 'lb', currentStock: 15, parLevel: 20, cost: 8.50, supplier: 'Dairy Direct', lastOrdered: '2026-04-05' },
  { id: 'ing3', name: 'NY Strip Steak', category: 'Protein', unit: 'lb', currentStock: 22, parLevel: 40, cost: 24.00, supplier: 'Prime Meats', lastOrdered: '2026-04-04' },
  { id: 'ing4', name: '00 Flour', category: 'Dry', unit: 'bag', currentStock: 6, parLevel: 8, cost: 12.00, supplier: 'Roma Foods', lastOrdered: '2026-04-02' },
  { id: 'ing5', name: 'Branzino (whole)', category: 'Protein', unit: 'each', currentStock: 4, parLevel: 10, cost: 18.00, supplier: 'Harbor Fish', lastOrdered: '2026-04-05' },
  { id: 'ing6', name: 'Truffle Oil', category: 'Oil', unit: 'bottle', currentStock: 3, parLevel: 4, cost: 28.00, supplier: 'Roma Foods', lastOrdered: '2026-03-28' },
  { id: 'ing7', name: 'Parmigiano Reggiano', category: 'Dairy', unit: 'wheel', currentStock: 2, parLevel: 3, cost: 85.00, supplier: 'Roma Foods', lastOrdered: '2026-03-30' },
  { id: 'ing8', name: 'Mascarpone', category: 'Dairy', unit: 'lb', currentStock: 5, parLevel: 8, cost: 7.50, supplier: 'Dairy Direct', lastOrdered: '2026-04-03' },
  { id: 'ing9', name: 'Arborio Rice', category: 'Dry', unit: 'bag', currentStock: 10, parLevel: 6, cost: 9.00, supplier: 'Roma Foods', lastOrdered: '2026-04-01' },
  { id: 'ing10', name: 'Espresso Beans', category: 'Beverage', unit: 'lb', currentStock: 12, parLevel: 8, cost: 16.00, supplier: 'Bean & Brew', lastOrdered: '2026-04-02' },
  { id: 'ing11', name: 'Mixed Greens', category: 'Produce', unit: 'case', currentStock: 2, parLevel: 5, cost: 22.00, supplier: 'Farm Fresh', lastOrdered: '2026-04-05' },
  { id: 'ing12', name: 'Lobster', category: 'Protein', unit: 'each', currentStock: 3, parLevel: 6, cost: 32.00, supplier: 'Harbor Fish', lastOrdered: '2026-04-04' },
];

export type PurchaseOrder = {
  id: string;
  supplier: string;
  items: number;
  total: number;
  status: 'draft' | 'submitted' | 'received' | 'partial';
  date: string;
};

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'po1', supplier: 'Roma Foods', items: 6, total: 428.00, status: 'submitted', date: '2026-04-06' },
  { id: 'po2', supplier: 'Prime Meats', items: 3, total: 720.00, status: 'submitted', date: '2026-04-06' },
  { id: 'po3', supplier: 'Harbor Fish', items: 2, total: 320.00, status: 'received', date: '2026-04-05' },
  { id: 'po4', supplier: 'Farm Fresh', items: 8, total: 186.00, status: 'partial', date: '2026-04-05' },
  { id: 'po5', supplier: 'Dairy Direct', items: 4, total: 142.00, status: 'draft', date: '2026-04-06' },
];

// ── Staff / Shift / Tips ──

export type Server = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  activeTables: number;
  covers: number;
  sales: number;
  tips: number;
  shiftStart: string;
};

export const servers: Server[] = [
  { id: 's1', name: 'Maria Santos', avatar: 'MS', role: 'Lead Server', activeTables: 3, covers: 12, sales: 680, tips: 142, shiftStart: '4:00 PM' },
  { id: 's2', name: 'James Porter', avatar: 'JP', role: 'Server', activeTables: 2, covers: 9, sales: 520, tips: 104, shiftStart: '4:00 PM' },
  { id: 's3', name: 'Rosa Chen', avatar: 'RC', role: 'Server', activeTables: 2, covers: 14, sales: 890, tips: 178, shiftStart: '3:00 PM' },
  { id: 's4', name: 'Alex Kim', avatar: 'AK', role: 'Bartender', activeTables: 0, covers: 8, sales: 420, tips: 96, shiftStart: '5:00 PM' },
  { id: 's5', name: 'Sam Rivera', avatar: 'SR', role: 'Server', activeTables: 0, covers: 0, sales: 0, tips: 0, shiftStart: '6:00 PM' },
];

export type TipRecord = {
  id: string;
  date: string;
  totalTips: number;
  serverCount: number;
  poolMethod: 'equal' | 'hours' | 'sales';
  distributed: boolean;
};

export const tipHistory: TipRecord[] = [
  { id: 'tip1', date: '2026-04-05', totalTips: 1840, serverCount: 5, poolMethod: 'hours', distributed: true },
  { id: 'tip2', date: '2026-04-04', totalTips: 1620, serverCount: 4, poolMethod: 'hours', distributed: true },
  { id: 'tip3', date: '2026-04-03', totalTips: 2210, serverCount: 6, poolMethod: 'hours', distributed: true },
  { id: 'tip4', date: '2026-04-02', totalTips: 980, serverCount: 3, poolMethod: 'equal', distributed: true },
  { id: 'tip5', date: '2026-04-01', totalTips: 1540, serverCount: 4, poolMethod: 'hours', distributed: true },
];

// ── Customers / Loyalty ──

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastVisit: string;
  favoriteItems: string[];
  notes?: string;
};

export const customers: Customer[] = [
  { id: 'c1', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', visits: 42, totalSpent: 4280, tier: 'platinum', lastVisit: '2026-04-06', favoriteItems: ['Rigatoni Bolognese', 'Tiramisu'], notes: 'Prefers window table' },
  { id: 'c2', name: 'David Kim', email: 'david.k@email.com', phone: '555-0203', visits: 28, totalSpent: 3120, tier: 'gold', lastVisit: '2026-04-05', favoriteItems: ['Steak Frites', 'Caesar Salad'] },
  { id: 'c3', name: 'Priya Patel', email: 'priya@email.com', phone: '555-0304', visits: 15, totalSpent: 1860, tier: 'silver', lastVisit: '2026-04-06', favoriteItems: ['Margherita Pizza', 'Burrata'], notes: 'Anniversary tonight' },
  { id: 'c4', name: 'Marcus Thompson', email: 'mthompson@email.com', phone: '555-0405', visits: 52, totalSpent: 7840, tier: 'platinum', lastVisit: '2026-04-06', favoriteItems: ['Grilled Branzino', 'Risotto'] },
  { id: 'c5', name: 'Elena Garcia', email: 'elena.g@email.com', phone: '555-0506', visits: 8, totalSpent: 640, tier: 'bronze', lastVisit: '2026-04-04', favoriteItems: ['Truffle Fries'] },
  { id: 'c6', name: 'Tom Chen', email: 'tom.chen@email.com', phone: '555-0607', visits: 19, totalSpent: 2240, tier: 'silver', lastVisit: '2026-04-03', favoriteItems: ['Lobster Linguine'] },
  { id: 'c7', name: 'Amy Williams', email: 'amy.w@email.com', phone: '555-0708', visits: 35, totalSpent: 3890, tier: 'gold', lastVisit: '2026-04-02', favoriteItems: ['Roast Chicken', 'Panna Cotta'] },
  { id: 'c8', name: 'Jake Rodriguez', email: 'jake.r@email.com', phone: '555-0809', visits: 5, totalSpent: 380, tier: 'bronze', lastVisit: '2026-03-28', favoriteItems: ['Margherita Pizza'] },
];

export const loyaltyTiers = [
  { name: 'Bronze', minSpent: 0, discount: 0, perks: 'Birthday dessert', members: 124, color: '#CD7F32' },
  { name: 'Silver', minSpent: 1000, discount: 5, perks: 'Priority reservations, 5% off', members: 68, color: '#A0A0A0' },
  { name: 'Gold', minSpent: 2500, discount: 10, perks: 'Complimentary appetizer, 10% off', members: 32, color: '#D4A017' },
  { name: 'Platinum', minSpent: 5000, discount: 15, perks: "Chef's table access, 15% off, exclusive events", members: 12, color: '#8B7D6B' },
];

// ── Daily Operations / Reports ──

export const dailyKpis = {
  covers: 86,
  coversGoal: 120,
  revenue: 4280,
  revenueGoal: 6000,
  avgCheck: 49.77,
  laborCostPct: 28.4,
  foodCostPct: 31.2,
  tablesTurned: 2.1,
  waitTime: 12,
  satisfaction: 4.6,
};

export const hourlySales = [
  { hour: '11 AM', sales: 0 },
  { hour: '12 PM', sales: 480 },
  { hour: '1 PM', sales: 620 },
  { hour: '2 PM', sales: 320 },
  { hour: '3 PM', sales: 80 },
  { hour: '4 PM', sales: 140 },
  { hour: '5 PM', sales: 580 },
  { hour: '6 PM', sales: 920 },
  { hour: '7 PM', sales: 640 },
  { hour: '8 PM', sales: 0 },
];

export const weeklyRevenue = [
  { day: 'Mon', revenue: 4200 },
  { day: 'Tue', revenue: 3800 },
  { day: 'Wed', revenue: 4600 },
  { day: 'Thu', revenue: 5200 },
  { day: 'Fri', revenue: 7800 },
  { day: 'Sat', revenue: 9400 },
  { day: 'Sun', revenue: 6800 },
];

export const reports = [
  { id: 'rpt1', name: 'Daily Sales Summary', type: 'Sales', lastRun: '2026-04-06', frequency: 'Daily' },
  { id: 'rpt2', name: 'Weekly P&L', type: 'Financial', lastRun: '2026-04-05', frequency: 'Weekly' },
  { id: 'rpt3', name: 'Food Cost Analysis', type: 'Operations', lastRun: '2026-04-04', frequency: 'Weekly' },
  { id: 'rpt4', name: 'Labor Cost Report', type: 'HR', lastRun: '2026-04-06', frequency: 'Daily' },
  { id: 'rpt5', name: 'Menu Engineering Report', type: 'Menu', lastRun: '2026-04-03', frequency: 'Monthly' },
  { id: 'rpt6', name: 'Customer Retention', type: 'Marketing', lastRun: '2026-04-01', frequency: 'Monthly' },
  { id: 'rpt7', name: 'Inventory Variance', type: 'Operations', lastRun: '2026-04-05', frequency: 'Weekly' },
];

// ── Helper functions ──

export function getTable(id: string) { return tables.find(t => t.id === id) ?? tables[0]; }
export function getReservation(id: string) { return reservations.find(r => r.id === id) ?? reservations[0]; }
export function getMenuItem(id: string) { return menuItems.find(i => i.id === id) ?? menuItems[0]; }
export function getIngredient(id: string) { return ingredients.find(i => i.id === id) ?? ingredients[0]; }
export function getCustomer(id: string) { return customers.find(c => c.id === id) ?? customers[0]; }

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function stockPercent(current: number, par: number) {
  return Math.min(100, Math.round((current / par) * 100));
}

export function profitMargin(price: number, cost: number) {
  return Math.round(((price - cost) / price) * 100);
}
