export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  wasPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  emoji: string;
  description: string;
  tags: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: { productId: string; quantity: number; price: number }[];
  shipTo: string;
  tracking?: string;
}

export const categories = [
  { id: 'all', label: 'All', count: 14 },
  { id: 'apparel', label: 'Apparel', count: 4 },
  { id: 'home', label: 'Home', count: 4 },
  { id: 'accessories', label: 'Accessories', count: 3 },
  { id: 'kitchen', label: 'Kitchen', count: 3 },
];

export const products: Product[] = [
  {
    id: 'p01',
    name: 'Linen Weekend Tote',
    category: 'apparel',
    price: 68,
    wasPrice: 85,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    emoji: '👜',
    description: 'Hand-stitched natural linen tote with leather handles. Roomy enough for weekend adventures, refined enough for city runs.',
    tags: ['bestseller', 'sustainable'],
    inStock: true,
    featured: true,
  },
  {
    id: 'p02',
    name: 'Ceramic Pour-Over Set',
    category: 'kitchen',
    price: 42,
    rating: 4.9,
    reviews: 287,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    emoji: '☕',
    description: 'Slow-crafted stoneware pour-over with bamboo filter. Brews a quiet ritual into every morning.',
    tags: ['new'],
    inStock: true,
    featured: true,
  },
  {
    id: 'p03',
    name: 'Oak Bedside Lamp',
    category: 'home',
    price: 124,
    rating: 4.7,
    reviews: 58,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    emoji: '💡',
    description: 'Turned oak base with warm linen shade. Casts a soft glow for late-night reads.',
    tags: [],
    inStock: true,
  },
  {
    id: 'p04',
    name: 'Merino Crew Sweater',
    category: 'apparel',
    price: 118,
    rating: 4.6,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80',
    emoji: '🧥',
    description: 'Ethically sourced merino wool crew neck. Naturally temperature-regulating, softer with every wear.',
    tags: ['sustainable'],
    inStock: true,
    featured: true,
  },
  {
    id: 'p05',
    name: 'Hand-Blown Glass Carafe',
    category: 'kitchen',
    price: 56,
    rating: 4.9,
    reviews: 91,
    image: 'https://images.unsplash.com/photo-1600454504261-48dfa1ed9e75?w=600&q=80',
    emoji: '🍶',
    description: 'Artisan-blown borosilicate carafe. A quiet companion for water, wine, or wildflowers.',
    tags: ['handmade'],
    inStock: true,
  },
  {
    id: 'p06',
    name: 'Leather Card Wallet',
    category: 'accessories',
    price: 48,
    wasPrice: 60,
    rating: 4.5,
    reviews: 412,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    emoji: '💳',
    description: 'Vegetable-tanned leather slim wallet. Patinas beautifully over years of daily carry.',
    tags: ['bestseller'],
    inStock: true,
  },
  {
    id: 'p07',
    name: 'Linen Throw Blanket',
    category: 'home',
    price: 92,
    rating: 4.8,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1580301762395-83fca1d2ea9e?w=600&q=80',
    emoji: '🛋️',
    description: 'Stonewashed French linen throw. Drapes softly over couches and cool evenings.',
    tags: ['sustainable'],
    inStock: true,
  },
  {
    id: 'p08',
    name: 'Brass Candle Holder',
    category: 'home',
    price: 34,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1602607298718-0ac3bbd23ef7?w=600&q=80',
    emoji: '🕯️',
    description: 'Solid brass candlestick with weighted base. Ages into a warm heirloom patina.',
    tags: [],
    inStock: true,
  },
  {
    id: 'p09',
    name: 'Cotton Oxford Shirt',
    category: 'apparel',
    price: 78,
    rating: 4.6,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    emoji: '👔',
    description: 'Garment-washed organic cotton oxford. A timeless essential for any wardrobe.',
    tags: ['new'],
    inStock: true,
  },
  {
    id: 'p10',
    name: 'Walnut Cutting Board',
    category: 'kitchen',
    price: 62,
    rating: 4.9,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80',
    emoji: '🪵',
    description: 'End-grain walnut board finished with beeswax. Self-healing surface kind to knives.',
    tags: ['handmade'],
    inStock: true,
  },
  {
    id: 'p11',
    name: 'Canvas Field Cap',
    category: 'accessories',
    price: 38,
    rating: 4.4,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    emoji: '🧢',
    description: 'Waxed canvas five-panel cap. Weathers beautifully through every season.',
    tags: [],
    inStock: true,
  },
  {
    id: 'p12',
    name: 'Terracotta Planter Trio',
    category: 'home',
    price: 52,
    rating: 4.8,
    reviews: 194,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&q=80',
    emoji: '🪴',
    description: 'Set of three hand-thrown terracotta planters. Perfect for herbs on a sunny sill.',
    tags: ['bestseller'],
    inStock: true,
  },
  {
    id: 'p13',
    name: 'Wool Felt Slippers',
    category: 'apparel',
    price: 64,
    rating: 4.7,
    reviews: 321,
    image: 'https://images.unsplash.com/photo-1617006897372-3f7e1fa68e7c?w=600&q=80',
    emoji: '🥿',
    description: 'Boiled wool slippers with leather soles. Cozy, breathable, made to last.',
    tags: ['sustainable'],
    inStock: false,
  },
  {
    id: 'p14',
    name: 'Silk Neck Scarf',
    category: 'accessories',
    price: 58,
    rating: 4.6,
    reviews: 102,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
    emoji: '🧣',
    description: 'Screen-printed silk scarf in botanical motif. A quiet flourish for any outfit.',
    tags: ['new'],
    inStock: true,
  },
];

export const initialCart: CartItem[] = [
  { productId: 'p01', quantity: 1 },
  { productId: 'p02', quantity: 2 },
  { productId: 'p06', quantity: 1 },
];

export const orders: Order[] = [
  {
    id: 'VIN-2841',
    date: '2026-03-28',
    total: 184,
    status: 'delivered',
    items: [
      { productId: 'p01', quantity: 1, price: 68 },
      { productId: 'p07', quantity: 1, price: 92 },
      { productId: 'p08', quantity: 1, price: 34 },
    ],
    shipTo: '1428 Willow Lane, Brooklyn NY 11201',
    tracking: '1Z999AA10123456784',
  },
  {
    id: 'VIN-2902',
    date: '2026-03-30',
    total: 160,
    status: 'shipped',
    items: [
      { productId: 'p04', quantity: 1, price: 118 },
      { productId: 'p08', quantity: 1, price: 34 },
    ],
    shipTo: '1428 Willow Lane, Brooklyn NY 11201',
    tracking: '1Z999AA10123456785',
  },
  {
    id: 'VIN-3011',
    date: '2026-04-02',
    total: 94,
    status: 'processing',
    items: [
      { productId: 'p02', quantity: 1, price: 42 },
      { productId: 'p05', quantity: 1, price: 56 },
    ],
    shipTo: '1428 Willow Lane, Brooklyn NY 11201',
  },
  {
    id: 'VIN-3044',
    date: '2026-04-04',
    total: 62,
    status: 'processing',
    items: [
      { productId: 'p10', quantity: 1, price: 62 },
    ],
    shipTo: '1428 Willow Lane, Brooklyn NY 11201',
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getOrder(id: string): Order | undefined {
  return orders.find(o => o.id === id);
}
