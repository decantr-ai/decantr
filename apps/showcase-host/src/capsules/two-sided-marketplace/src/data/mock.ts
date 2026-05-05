export interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  sellerId: string;
  featured?: boolean;
  instantBook?: boolean;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  memberSince: string;
  superhost: boolean;
  responseRate: number;
  listingCount: number;
}

export interface Booking {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
}

export interface MessageThread {
  id: string;
  listingId: string;
  withName: string;
  withAvatar: string;
  withRole: 'buyer' | 'seller';
  lastMessage: string;
  lastAt: string;
  unread: number;
  messages: { id: string; from: 'me' | 'them'; body: string; at: string }[];
}

export interface Review {
  id: string;
  listingId: string;
  buyerName: string;
  buyerAvatar: string;
  rating: number;
  body: string;
  date: string;
  photos?: string[];
}

export const categories = [
  { id: 'all', label: 'All', count: 14 },
  { id: 'cabins', label: 'Cabins', count: 4 },
  { id: 'lofts', label: 'Lofts', count: 3 },
  { id: 'beach', label: 'Beachfront', count: 3 },
  { id: 'studios', label: 'Studios', count: 2 },
  { id: 'unique', label: 'Unique', count: 2 },
];

export const sellers: Seller[] = [
  { id: 's1', name: 'Mira Chen', avatar: 'MC', memberSince: '2021', superhost: true, responseRate: 98, listingCount: 4 },
  { id: 's2', name: 'Tom Dalton', avatar: 'TD', memberSince: '2019', superhost: true, responseRate: 96, listingCount: 7 },
  { id: 's3', name: 'Priya Rao', avatar: 'PR', memberSince: '2022', superhost: false, responseRate: 92, listingCount: 2 },
  { id: 's4', name: 'Lucas Vega', avatar: 'LV', memberSince: '2020', superhost: true, responseRate: 99, listingCount: 5 },
];

export const listings: Listing[] = [
  {
    id: 'l01',
    title: 'Cedar A-Frame in the Pines',
    category: 'cabins',
    location: 'Lake Tahoe, CA',
    price: 184,
    priceUnit: 'night',
    rating: 4.92,
    reviews: 214,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    description: 'Hand-built cedar A-frame tucked into old-growth pines. Wood stove, full kitchen, deep soaking tub. Steps from the lakeshore trail.',
    amenities: ['Wood stove', 'Hot tub', 'Wifi', 'Kitchen', 'Parking'],
    sellerId: 's1',
    featured: true,
    instantBook: true,
    lat: 39.0968, lng: -120.0324,
    mapX: 22, mapY: 34,
  },
  {
    id: 'l02',
    title: 'Industrial Brooklyn Loft',
    category: 'lofts',
    location: 'Williamsburg, NY',
    price: 215,
    priceUnit: 'night',
    rating: 4.87,
    reviews: 389,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80',
    ],
    description: 'Sun-drenched top-floor loft with 14-foot ceilings, exposed brick, and a vintage freight elevator. Walk to everything in Williamsburg.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Workspace', 'Rooftop'],
    sellerId: 's2',
    featured: true,
    instantBook: true,
    lat: 40.7128, lng: -73.9496,
    mapX: 68, mapY: 42,
  },
  {
    id: 'l03',
    title: 'Malibu Glass House',
    category: 'beach',
    location: 'Malibu, CA',
    price: 620,
    priceUnit: 'night',
    rating: 4.96,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    description: 'Architectural glass house perched above a private cove. Infinity pool, chef\'s kitchen, ocean view from every room.',
    amenities: ['Pool', 'Beach access', 'Wifi', 'Kitchen', 'Hot tub'],
    sellerId: 's4',
    featured: true,
    instantBook: false,
    lat: 34.0259, lng: -118.7798,
    mapX: 18, mapY: 55,
  },
  {
    id: 'l04',
    title: 'Converted Grain Silo Studio',
    category: 'unique',
    location: 'Hudson Valley, NY',
    price: 142,
    priceUnit: 'night',
    rating: 4.89,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1595514535415-dae8580c416c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595514535415-dae8580c416c?w=800&q=80',
    ],
    description: 'Round metal silo reimagined as a cozy writing retreat. Spiral staircase, wrap-around deck, surrounded by apple orchards.',
    amenities: ['Wifi', 'Kitchenette', 'Fireplace', 'Parking'],
    sellerId: 's3',
    instantBook: true,
    lat: 41.7231, lng: -73.8093,
    mapX: 71, mapY: 38,
  },
  {
    id: 'l05',
    title: 'Coastal Cottage, Outer Cape',
    category: 'beach',
    location: 'Wellfleet, MA',
    price: 278,
    priceUnit: 'night',
    rating: 4.84,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    ],
    description: 'Sun-bleached shingle cottage a five-minute walk from the dunes. Outdoor shower, screened porch, bikes included.',
    amenities: ['Beach access', 'Wifi', 'Kitchen', 'Bikes', 'Outdoor shower'],
    sellerId: 's2',
    instantBook: true,
    lat: 41.9329, lng: -70.0331,
    mapX: 76, mapY: 36,
  },
  {
    id: 'l06',
    title: 'Mountain Modern Cabin',
    category: 'cabins',
    location: 'Aspen, CO',
    price: 395,
    priceUnit: 'night',
    rating: 4.91,
    reviews: 231,
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    ],
    description: 'Glass-walled cabin set against aspen groves. Floor-to-ceiling views, sauna, fire pit, ski-in/ski-out in winter.',
    amenities: ['Sauna', 'Fireplace', 'Wifi', 'Kitchen', 'Ski access'],
    sellerId: 's1',
    instantBook: false,
    lat: 39.1911, lng: -106.8175,
    mapX: 42, mapY: 46,
  },
  {
    id: 'l07',
    title: 'Soho Artist Loft',
    category: 'lofts',
    location: 'Soho, NY',
    price: 340,
    priceUnit: 'night',
    rating: 4.78,
    reviews: 301,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    ],
    description: 'Cast-iron district loft with original hardwood and gallery walls. Perfect for a creative NYC stay.',
    amenities: ['Wifi', 'Kitchen', 'Workspace', 'Washer'],
    sellerId: 's2',
    instantBook: true,
    lat: 40.7233, lng: -74.0030,
    mapX: 69, mapY: 40,
  },
  {
    id: 'l08',
    title: 'Off-Grid Tiny House',
    category: 'unique',
    location: 'Sedona, AZ',
    price: 168,
    priceUnit: 'night',
    rating: 4.94,
    reviews: 184,
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
    ],
    description: 'Solar-powered tiny house on 40 desert acres. Star beds, outdoor kitchen, red rock views in every direction.',
    amenities: ['Solar', 'Outdoor kitchen', 'Stargazing', 'Hiking'],
    sellerId: 's4',
    instantBook: true,
    lat: 34.8697, lng: -111.7610,
    mapX: 32, mapY: 52,
  },
  {
    id: 'l09',
    title: 'Parisian Studio, Le Marais',
    category: 'studios',
    location: 'Paris, FR',
    price: 156,
    priceUnit: 'night',
    rating: 4.81,
    reviews: 442,
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80',
    ],
    description: 'Chic Haussmanian studio with original parquet and iron balcony. Steps from the Picasso museum.',
    amenities: ['Wifi', 'Kitchenette', 'Balcony', 'Elevator'],
    sellerId: 's3',
    instantBook: true,
    lat: 48.8566, lng: 2.3522,
    mapX: 52, mapY: 32,
  },
  {
    id: 'l10',
    title: 'Lakefront Log Cabin',
    category: 'cabins',
    location: 'Lake Placid, NY',
    price: 224,
    priceUnit: 'night',
    rating: 4.88,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
    ],
    description: 'Classic Adirondack log cabin on private lake frontage. Kayaks, canoe, and wood-fired sauna.',
    amenities: ['Lake access', 'Kayaks', 'Sauna', 'Fireplace', 'Wifi'],
    sellerId: 's1',
    instantBook: false,
    lat: 44.2795, lng: -73.9799,
    mapX: 72, mapY: 28,
  },
  {
    id: 'l11',
    title: 'Mid-Century Palm Springs',
    category: 'studios',
    location: 'Palm Springs, CA',
    price: 248,
    priceUnit: 'night',
    rating: 4.85,
    reviews: 273,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    description: 'Fully restored 1960s mid-century with butterfly roof, kidney pool, and breezeblock walls.',
    amenities: ['Pool', 'Wifi', 'Kitchen', 'Parking', 'Patio'],
    sellerId: 's4',
    instantBook: true,
    lat: 33.8303, lng: -116.5453,
    mapX: 20, mapY: 58,
  },
  {
    id: 'l12',
    title: 'Seaside Bungalow',
    category: 'beach',
    location: 'Tulum, MX',
    price: 198,
    priceUnit: 'night',
    rating: 4.90,
    reviews: 211,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    description: 'Thatched-roof bungalow steps from the beach. Open-air shower, hammock deck, bike included.',
    amenities: ['Beach access', 'Wifi', 'Bike', 'Outdoor shower'],
    sellerId: 's3',
    instantBook: true,
    lat: 20.2114, lng: -87.4654,
    mapX: 44, mapY: 62,
  },
  {
    id: 'l13',
    title: 'Converted Church Loft',
    category: 'unique',
    location: 'Savannah, GA',
    price: 312,
    priceUnit: 'night',
    rating: 4.93,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    ],
    description: 'Historic chapel reimagined as a loft with stained glass and original pews. Unique stay in the heart of Savannah.',
    amenities: ['Wifi', 'Kitchen', 'Workspace', 'Washer'],
    sellerId: 's2',
    instantBook: false,
    lat: 32.0809, lng: -81.0912,
    mapX: 60, mapY: 54,
  },
  {
    id: 'l14',
    title: 'Tribeca Designer Loft',
    category: 'lofts',
    location: 'Tribeca, NY',
    price: 465,
    priceUnit: 'night',
    rating: 4.82,
    reviews: 176,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    ],
    description: 'Curated designer loft with original art, wide-plank oak floors, and downtown skyline views.',
    amenities: ['Wifi', 'Kitchen', 'Doorman', 'Gym'],
    sellerId: 's2',
    instantBook: true,
    lat: 40.7163, lng: -74.0086,
    mapX: 69, mapY: 41,
  },
];

export const bookings: Booking[] = [
  { id: 'b1', listingId: 'l01', checkIn: '2026-04-18', checkOut: '2026-04-22', guests: 3, total: 736, status: 'upcoming' },
  { id: 'b2', listingId: 'l09', checkIn: '2026-05-12', checkOut: '2026-05-16', guests: 2, total: 624, status: 'upcoming' },
  { id: 'b3', listingId: 'l02', checkIn: '2026-03-02', checkOut: '2026-03-05', guests: 2, total: 645, status: 'completed' },
  { id: 'b4', listingId: 'l08', checkIn: '2026-02-14', checkOut: '2026-02-17', guests: 2, total: 504, status: 'completed' },
  { id: 'b5', listingId: 'l05', checkIn: '2026-01-20', checkOut: '2026-01-23', guests: 4, total: 834, status: 'cancelled' },
];

export const favorites: string[] = ['l03', 'l06', 'l08', 'l11'];

export const messageThreads: MessageThread[] = [
  {
    id: 't1',
    listingId: 'l01',
    withName: 'Mira Chen',
    withAvatar: 'MC',
    withRole: 'seller',
    lastMessage: 'The wood stove kit is right by the door — instructions on the fridge.',
    lastAt: '2h ago',
    unread: 1,
    messages: [
      { id: 'm1', from: 'me', body: 'Hi Mira! Excited for our stay next week. Any tips for the area?', at: 'Yesterday 4:12pm' },
      { id: 'm2', from: 'them', body: 'Welcome! The lakeshore trail is 3 mins from the deck, and there\'s a great bakery (Alp Bread) 10 mins down the road.', at: 'Yesterday 5:08pm' },
      { id: 'm3', from: 'me', body: 'Perfect — we\'ll check it out. How does the wood stove work?', at: 'Today 11:30am' },
      { id: 'm4', from: 'them', body: 'The wood stove kit is right by the door — instructions on the fridge.', at: '2h ago' },
    ],
  },
  {
    id: 't2',
    listingId: 'l09',
    withName: 'Priya Rao',
    withAvatar: 'PR',
    withRole: 'seller',
    lastMessage: 'Confirmed! Looking forward to hosting you in Paris.',
    lastAt: '1d ago',
    unread: 0,
    messages: [
      { id: 'm1', from: 'me', body: 'Bonjour! Is early check-in possible?', at: 'Monday 9:15am' },
      { id: 'm2', from: 'them', body: 'Confirmed! Looking forward to hosting you in Paris.', at: '1d ago' },
    ],
  },
  {
    id: 't3',
    listingId: 'l02',
    withName: 'Tom Dalton',
    withAvatar: 'TD',
    withRole: 'seller',
    lastMessage: 'Thanks again — your review means a lot!',
    lastAt: '1w ago',
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', body: 'Thanks again — your review means a lot!', at: '1w ago' },
    ],
  },
];

export const reviews: Review[] = [
  { id: 'r1', listingId: 'l01', buyerName: 'Elena P.', buyerAvatar: 'EP', rating: 5, body: 'Absolute magic. The cabin smelled like cedar and woodsmoke. Mira had fresh flowers waiting.', date: 'Mar 2026' },
  { id: 'r2', listingId: 'l01', buyerName: 'Marcus T.', buyerAvatar: 'MT', rating: 5, body: 'Exactly as pictured — maybe better. The hot tub under the stars was unforgettable.', date: 'Feb 2026' },
  { id: 'r3', listingId: 'l01', buyerName: 'Priya K.', buyerAvatar: 'PK', rating: 4, body: 'Beautiful spot. A little chilly at night but the stove handled it perfectly.', date: 'Jan 2026' },
  { id: 'r4', listingId: 'l02', buyerName: 'Dana R.', buyerAvatar: 'DR', rating: 5, body: 'Dream loft. Tom is incredibly responsive. We\'ll be back.', date: 'Mar 2026' },
  { id: 'r5', listingId: 'l02', buyerName: 'Hugo L.', buyerAvatar: 'HL', rating: 4, body: 'Great space, great location. Minor street noise at night.', date: 'Feb 2026' },
  { id: 'r6', listingId: 'l03', buyerName: 'Sara M.', buyerAvatar: 'SM', rating: 5, body: 'The best view of my life. Worth every dollar.', date: 'Mar 2026' },
];

export function getListing(id: string): Listing | undefined {
  return listings.find(l => l.id === id);
}
export function getSeller(id: string): Seller | undefined {
  return sellers.find(s => s.id === id);
}
export function getThread(id: string): MessageThread | undefined {
  return messageThreads.find(t => t.id === id);
}
export function getBooking(id: string): Booking | undefined {
  return bookings.find(b => b.id === id);
}
export function getListingReviews(listingId: string): Review[] {
  return reviews.filter(r => r.listingId === listingId);
}
