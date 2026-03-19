// ─── Products ───────────────────────────────────────────────
export const products = [
  { id: 'PRD-001', name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 79.99, stock: 245, sku: 'WBH-100', status: 'active', image: 'headphones.jpg', rating: 4.5 },
  { id: 'PRD-002', name: 'Organic Cotton T-Shirt', category: 'Clothing', price: 34.99, stock: 812, sku: 'OCT-200', status: 'active', image: 'tshirt.jpg', rating: 4.2 },
  { id: 'PRD-003', name: 'Stainless Steel Water Bottle', category: 'Home & Kitchen', price: 24.99, stock: 156, sku: 'SSW-300', status: 'active', image: 'bottle.jpg', rating: 4.7 },
  { id: 'PRD-004', name: 'Mechanical Keyboard', category: 'Electronics', price: 129.99, stock: 67, sku: 'MKB-400', status: 'active', image: 'keyboard.jpg', rating: 4.8 },
  { id: 'PRD-005', name: 'Yoga Mat Premium', category: 'Sports', price: 49.99, stock: 334, sku: 'YMP-500', status: 'active', image: 'yogamat.jpg', rating: 4.3 },
  { id: 'PRD-006', name: 'LED Desk Lamp', category: 'Home & Kitchen', price: 39.99, stock: 189, sku: 'LDL-600', status: 'active', image: 'lamp.jpg', rating: 4.1 },
  { id: 'PRD-007', name: 'Running Shoes Air Max', category: 'Sports', price: 119.99, stock: 92, sku: 'RSA-700', status: 'active', image: 'shoes.jpg', rating: 4.6 },
  { id: 'PRD-008', name: 'Ceramic Plant Pot Set', category: 'Home & Kitchen', price: 29.99, stock: 0, sku: 'CPP-800', status: 'out-of-stock', image: 'plantpot.jpg', rating: 4.0 },
  { id: 'PRD-009', name: 'Bamboo Cutting Board', category: 'Home & Kitchen', price: 19.99, stock: 445, sku: 'BCB-900', status: 'active', image: 'cuttingboard.jpg', rating: 4.4 },
  { id: 'PRD-010', name: 'Wireless Mouse Ergonomic', category: 'Electronics', price: 44.99, stock: 278, sku: 'WME-010', status: 'active', image: 'mouse.jpg', rating: 4.3 },
  { id: 'PRD-011', name: 'Linen Throw Pillow', category: 'Home & Kitchen', price: 22.99, stock: 523, sku: 'LTP-011', status: 'active', image: 'pillow.jpg', rating: 4.1 },
  { id: 'PRD-012', name: 'USB-C Hub 7-in-1', category: 'Electronics', price: 59.99, stock: 134, sku: 'UCH-012', status: 'active', image: 'usbhub.jpg', rating: 4.5 },
  { id: 'PRD-013', name: 'Canvas Backpack', category: 'Clothing', price: 64.99, stock: 201, sku: 'CBP-013', status: 'active', image: 'backpack.jpg', rating: 4.4 },
  { id: 'PRD-014', name: 'Resistance Bands Set', category: 'Sports', price: 18.99, stock: 670, sku: 'RBS-014', status: 'active', image: 'bands.jpg', rating: 4.2 },
  { id: 'PRD-015', name: 'Scented Candle Collection', category: 'Home & Kitchen', price: 34.99, stock: 389, sku: 'SCC-015', status: 'active', image: 'candles.jpg', rating: 4.6 },
  { id: 'PRD-016', name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 54.99, stock: 178, sku: 'PBS-016', status: 'active', image: 'speaker.jpg', rating: 4.3 },
  { id: 'PRD-017', name: 'Wool Blend Sweater', category: 'Clothing', price: 74.99, stock: 145, sku: 'WBS-017', status: 'active', image: 'sweater.jpg', rating: 4.5 },
  { id: 'PRD-018', name: 'Cast Iron Skillet', category: 'Home & Kitchen', price: 42.99, stock: 98, sku: 'CIS-018', status: 'low-stock', image: 'skillet.jpg', rating: 4.8 },
  { id: 'PRD-019', name: 'Fitness Tracker Band', category: 'Electronics', price: 89.99, stock: 56, sku: 'FTB-019', status: 'low-stock', image: 'fitband.jpg', rating: 4.1 },
  { id: 'PRD-020', name: 'Insulated Lunch Bag', category: 'Home & Kitchen', price: 16.99, stock: 720, sku: 'ILB-020', status: 'active', image: 'lunchbag.jpg', rating: 4.0 },
];

// ─── Orders ─────────────────────────────────────────────────
export const orders = [
  { id: 'ORD-1001', customer: 'Emma Wilson', email: 'emma@example.com', items: 3, total: 189.97, status: 'delivered', date: '2026-03-15', payment: 'credit-card' },
  { id: 'ORD-1002', customer: 'James Chen', email: 'james@example.com', items: 1, total: 129.99, status: 'shipped', date: '2026-03-16', payment: 'paypal' },
  { id: 'ORD-1003', customer: 'Sofia Rodriguez', email: 'sofia@example.com', items: 5, total: 247.95, status: 'processing', date: '2026-03-17', payment: 'credit-card' },
  { id: 'ORD-1004', customer: 'Liam O\'Brien', email: 'liam@example.com', items: 2, total: 94.98, status: 'pending', date: '2026-03-18', payment: 'credit-card' },
  { id: 'ORD-1005', customer: 'Aria Patel', email: 'aria@example.com', items: 1, total: 79.99, status: 'delivered', date: '2026-03-14', payment: 'apple-pay' },
  { id: 'ORD-1006', customer: 'Noah Kim', email: 'noah@example.com', items: 4, total: 312.96, status: 'shipped', date: '2026-03-15', payment: 'credit-card' },
  { id: 'ORD-1007', customer: 'Mia Thompson', email: 'mia@example.com', items: 2, total: 154.98, status: 'processing', date: '2026-03-17', payment: 'paypal' },
  { id: 'ORD-1008', customer: 'Ethan Davis', email: 'ethan@example.com', items: 1, total: 49.99, status: 'pending', date: '2026-03-18', payment: 'credit-card' },
  { id: 'ORD-1009', customer: 'Isabella Martinez', email: 'isabella@example.com', items: 3, total: 179.97, status: 'delivered', date: '2026-03-13', payment: 'credit-card' },
  { id: 'ORD-1010', customer: 'Alexander Lee', email: 'alex@example.com', items: 6, total: 489.94, status: 'shipped', date: '2026-03-16', payment: 'apple-pay' },
  { id: 'ORD-1011', customer: 'Charlotte Brown', email: 'charlotte@example.com', items: 2, total: 69.98, status: 'processing', date: '2026-03-17', payment: 'credit-card' },
  { id: 'ORD-1012', customer: 'William Taylor', email: 'william@example.com', items: 1, total: 119.99, status: 'cancelled', date: '2026-03-12', payment: 'paypal' },
  { id: 'ORD-1013', customer: 'Ava Jackson', email: 'ava@example.com', items: 3, total: 134.97, status: 'delivered', date: '2026-03-11', payment: 'credit-card' },
  { id: 'ORD-1014', customer: 'Benjamin White', email: 'ben@example.com', items: 2, total: 84.98, status: 'pending', date: '2026-03-18', payment: 'credit-card' },
  { id: 'ORD-1015', customer: 'Harper Garcia', email: 'harper@example.com', items: 4, total: 259.96, status: 'shipped', date: '2026-03-15', payment: 'apple-pay' },
  { id: 'ORD-1016', customer: 'Lucas Anderson', email: 'lucas@example.com', items: 1, total: 44.99, status: 'processing', date: '2026-03-17', payment: 'credit-card' },
  { id: 'ORD-1017', customer: 'Amelia Thomas', email: 'amelia@example.com', items: 2, total: 109.98, status: 'delivered', date: '2026-03-10', payment: 'paypal' },
  { id: 'ORD-1018', customer: 'Henry Moore', email: 'henry@example.com', items: 3, total: 174.97, status: 'pending', date: '2026-03-18', payment: 'credit-card' },
  { id: 'ORD-1019', customer: 'Evelyn Clark', email: 'evelyn@example.com', items: 1, total: 89.99, status: 'shipped', date: '2026-03-16', payment: 'credit-card' },
  { id: 'ORD-1020', customer: 'Sebastian Hall', email: 'seb@example.com', items: 5, total: 349.95, status: 'processing', date: '2026-03-17', payment: 'apple-pay' },
  { id: 'ORD-1021', customer: 'Scarlett Young', email: 'scarlett@example.com', items: 2, total: 64.98, status: 'delivered', date: '2026-03-09', payment: 'credit-card' },
  { id: 'ORD-1022', customer: 'Daniel King', email: 'daniel@example.com', items: 1, total: 129.99, status: 'pending', date: '2026-03-18', payment: 'paypal' },
  { id: 'ORD-1023', customer: 'Chloe Wright', email: 'chloe@example.com', items: 4, total: 199.96, status: 'shipped', date: '2026-03-15', payment: 'credit-card' },
  { id: 'ORD-1024', customer: 'Matthew Lopez', email: 'matt@example.com', items: 2, total: 99.98, status: 'processing', date: '2026-03-17', payment: 'credit-card' },
  { id: 'ORD-1025', customer: 'Zoey Hill', email: 'zoey@example.com', items: 3, total: 224.97, status: 'delivered', date: '2026-03-08', payment: 'apple-pay' },
  { id: 'ORD-1026', customer: 'Jackson Scott', email: 'jackson@example.com', items: 1, total: 34.99, status: 'cancelled', date: '2026-03-14', payment: 'credit-card' },
  { id: 'ORD-1027', customer: 'Lily Green', email: 'lily@example.com', items: 2, total: 144.98, status: 'pending', date: '2026-03-18', payment: 'paypal' },
  { id: 'ORD-1028', customer: 'Owen Adams', email: 'owen@example.com', items: 1, total: 59.99, status: 'shipped', date: '2026-03-16', payment: 'credit-card' },
  { id: 'ORD-1029', customer: 'Ella Nelson', email: 'ella@example.com', items: 3, total: 169.97, status: 'processing', date: '2026-03-17', payment: 'credit-card' },
  { id: 'ORD-1030', customer: 'Ryan Carter', email: 'ryan@example.com', items: 2, total: 114.98, status: 'delivered', date: '2026-03-07', payment: 'apple-pay' },
];

// ─── Customers ──────────────────────────────────────────────
export const customers = [
  { id: 'CUS-001', name: 'Emma Wilson', email: 'emma@example.com', orders: 12, lifetime: 1847.88, joined: '2025-06-15', status: 'active', city: 'Portland' },
  { id: 'CUS-002', name: 'James Chen', email: 'james@example.com', orders: 8, lifetime: 1234.92, joined: '2025-08-22', status: 'active', city: 'San Francisco' },
  { id: 'CUS-003', name: 'Sofia Rodriguez', email: 'sofia@example.com', orders: 15, lifetime: 2456.85, joined: '2025-03-10', status: 'active', city: 'Miami' },
  { id: 'CUS-004', name: 'Liam O\'Brien', email: 'liam@example.com', orders: 3, lifetime: 289.97, joined: '2026-01-05', status: 'active', city: 'Boston' },
  { id: 'CUS-005', name: 'Aria Patel', email: 'aria@example.com', orders: 22, lifetime: 3678.78, joined: '2024-11-20', status: 'vip', city: 'New York' },
  { id: 'CUS-006', name: 'Noah Kim', email: 'noah@example.com', orders: 6, lifetime: 892.94, joined: '2025-09-14', status: 'active', city: 'Seattle' },
  { id: 'CUS-007', name: 'Mia Thompson', email: 'mia@example.com', orders: 19, lifetime: 2987.81, joined: '2025-01-28', status: 'vip', city: 'Chicago' },
  { id: 'CUS-008', name: 'Ethan Davis', email: 'ethan@example.com', orders: 1, lifetime: 49.99, joined: '2026-03-10', status: 'new', city: 'Austin' },
  { id: 'CUS-009', name: 'Isabella Martinez', email: 'isabella@example.com', orders: 10, lifetime: 1567.90, joined: '2025-05-03', status: 'active', city: 'Denver' },
  { id: 'CUS-010', name: 'Alexander Lee', email: 'alex@example.com', orders: 25, lifetime: 4234.75, joined: '2024-09-07', status: 'vip', city: 'Los Angeles' },
  { id: 'CUS-011', name: 'Charlotte Brown', email: 'charlotte@example.com', orders: 4, lifetime: 312.96, joined: '2025-12-01', status: 'active', city: 'Nashville' },
  { id: 'CUS-012', name: 'William Taylor', email: 'william@example.com', orders: 7, lifetime: 987.93, joined: '2025-07-19', status: 'inactive', city: 'Phoenix' },
  { id: 'CUS-013', name: 'Ava Jackson', email: 'ava@example.com', orders: 14, lifetime: 2189.86, joined: '2025-02-14', status: 'active', city: 'Philadelphia' },
  { id: 'CUS-014', name: 'Benjamin White', email: 'ben@example.com', orders: 2, lifetime: 169.98, joined: '2026-02-20', status: 'new', city: 'Minneapolis' },
  { id: 'CUS-015', name: 'Harper Garcia', email: 'harper@example.com', orders: 11, lifetime: 1789.89, joined: '2025-04-22', status: 'active', city: 'San Diego' },
];

// ─── Inventory ──────────────────────────────────────────────
export const inventory = products.map(p => ({
  ...p,
  reorderPoint: Math.floor(p.stock * 0.2) + 10,
  reorderQty: 100,
  warehouse: ['West', 'East', 'Central'][Math.floor(Math.random() * 3)],
  lastRestocked: '2026-03-' + String(Math.floor(Math.random() * 15) + 1).padStart(2, '0'),
}));

// ─── Promotions ─────────────────────────────────────────────
export const promotions = [
  { id: 'PROMO-001', code: 'SPRING25', type: 'percentage', discount: 25, usageCount: 342, maxUses: 1000, expiry: '2026-04-30', status: 'active', minOrder: 50 },
  { id: 'PROMO-002', code: 'FREESHIP', type: 'free-shipping', discount: 0, usageCount: 1205, maxUses: null, expiry: '2026-12-31', status: 'active', minOrder: 30 },
  { id: 'PROMO-003', code: 'WELCOME10', type: 'percentage', discount: 10, usageCount: 567, maxUses: null, expiry: null, status: 'active', minOrder: 0 },
  { id: 'PROMO-004', code: 'FLASH50', type: 'fixed', discount: 50, usageCount: 89, maxUses: 100, expiry: '2026-03-20', status: 'active', minOrder: 200 },
  { id: 'PROMO-005', code: 'VIP30', type: 'percentage', discount: 30, usageCount: 45, maxUses: 200, expiry: '2026-06-30', status: 'active', minOrder: 100 },
  { id: 'PROMO-006', code: 'HOLIDAY15', type: 'percentage', discount: 15, usageCount: 892, maxUses: 1000, expiry: '2026-01-15', status: 'expired', minOrder: 25 },
];

// ─── Support Tickets ────────────────────────────────────────
export const tickets = [
  { id: 'TKT-001', customer: 'Emma Wilson', subject: 'Order not received after 7 days', status: 'open', priority: 'high', created: '2026-03-17', category: 'shipping', body: 'I placed order ORD-1001 on March 10th and it still hasn\'t arrived. The tracking number shows no updates since March 12th. Can you please look into this?' },
  { id: 'TKT-002', customer: 'James Chen', subject: 'Request for product exchange', status: 'pending', priority: 'medium', created: '2026-03-16', category: 'returns', body: 'The keyboard I received (ORD-1002) has a different switch type than what was listed. I\'d like to exchange it for the correct model.' },
  { id: 'TKT-003', customer: 'Sofia Rodriguez', subject: 'Promo code not working', status: 'resolved', priority: 'low', created: '2026-03-15', category: 'billing', body: 'I\'m trying to apply SPRING25 to my cart but it says the code is invalid. My cart total is $89.97.' },
  { id: 'TKT-004', customer: 'Liam O\'Brien', subject: 'Wrong item in package', status: 'open', priority: 'high', created: '2026-03-17', category: 'orders', body: 'I ordered a yoga mat but received resistance bands instead. Order number ORD-1004.' },
  { id: 'TKT-005', customer: 'Aria Patel', subject: 'Bulk order inquiry', status: 'pending', priority: 'medium', created: '2026-03-16', category: 'sales', body: 'We\'re interested in placing a bulk order of 50 water bottles for our company. Do you offer volume discounts?' },
  { id: 'TKT-006', customer: 'Noah Kim', subject: 'Damaged product on arrival', status: 'open', priority: 'high', created: '2026-03-18', category: 'shipping', body: 'The LED desk lamp arrived with a cracked base. The packaging looked damaged too. Order ORD-1006.' },
  { id: 'TKT-007', customer: 'Mia Thompson', subject: 'Account login issues', status: 'resolved', priority: 'low', created: '2026-03-14', category: 'account', body: 'I can\'t log into my account. I\'ve tried resetting my password but the email never arrives.' },
  { id: 'TKT-008', customer: 'Charlotte Brown', subject: 'Refund not received', status: 'pending', priority: 'high', created: '2026-03-16', category: 'billing', body: 'I returned my order 2 weeks ago and the refund still hasn\'t been processed. Return tracking shows it was received on March 3rd.' },
  { id: 'TKT-009', customer: 'Isabella Martinez', subject: 'Product availability question', status: 'resolved', priority: 'low', created: '2026-03-13', category: 'products', body: 'When will the ceramic plant pot set be back in stock? I\'d like to order 3 sets.' },
  { id: 'TKT-010', customer: 'Alexander Lee', subject: 'Subscription billing issue', status: 'open', priority: 'medium', created: '2026-03-18', category: 'billing', body: 'I was charged twice for my VIP membership this month. Can you please review and refund the duplicate charge?' },
];

// ─── Sales Data ─────────────────────────────────────────────
export const salesByMonth = [
  { month: 'Oct', revenue: 45200, orders: 312 },
  { month: 'Nov', revenue: 67800, orders: 489 },
  { month: 'Dec', revenue: 89400, orders: 634 },
  { month: 'Jan', revenue: 52100, orders: 378 },
  { month: 'Feb', revenue: 61300, orders: 445 },
  { month: 'Mar', revenue: 74600, orders: 521 },
];

export const salesByCategory = [
  { category: 'Electronics', revenue: 48200, percentage: 38 },
  { category: 'Home & Kitchen', revenue: 31400, percentage: 25 },
  { category: 'Clothing', revenue: 22800, percentage: 18 },
  { category: 'Sports', revenue: 15600, percentage: 12 },
  { category: 'Other', revenue: 8900, percentage: 7 },
];

export const trafficSources = [
  { source: 'Organic Search', visits: 34200, conversion: 3.8, revenue: 48100 },
  { source: 'Direct', visits: 22100, conversion: 4.5, revenue: 36800 },
  { source: 'Social Media', visits: 18900, conversion: 2.1, revenue: 14700 },
  { source: 'Email', visits: 12400, conversion: 5.8, revenue: 26600 },
  { source: 'Paid Ads', visits: 28300, conversion: 3.2, revenue: 33500 },
  { source: 'Referral', visits: 8700, conversion: 4.1, revenue: 13200 },
];

// ─── Media Files ────────────────────────────────────────────
export const mediaFiles = [
  { name: 'Product Photos', type: 'folder', items: 48, modified: '2026-03-17' },
  { name: 'Banners', type: 'folder', items: 12, modified: '2026-03-15' },
  { name: 'Category Icons', type: 'folder', items: 24, modified: '2026-03-10' },
  { name: 'hero-banner-spring.jpg', type: 'image', size: '2.4 MB', modified: '2026-03-17' },
  { name: 'logo-dark.svg', type: 'image', size: '12 KB', modified: '2026-03-01' },
  { name: 'logo-light.svg', type: 'image', size: '12 KB', modified: '2026-03-01' },
  { name: 'product-template.psd', type: 'file', size: '18.6 MB', modified: '2026-02-20' },
  { name: 'size-guide.pdf', type: 'file', size: '340 KB', modified: '2026-02-15' },
  { name: 'shipping-policy.pdf', type: 'file', size: '128 KB', modified: '2026-01-20' },
  { name: 'promo-video-spring.mp4', type: 'file', size: '45.2 MB', modified: '2026-03-16' },
  { name: 'email-templates', type: 'folder', items: 8, modified: '2026-03-12' },
  { name: 'social-media-assets', type: 'folder', items: 36, modified: '2026-03-14' },
];
