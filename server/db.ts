import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const DB_FILE = path.resolve(process.cwd(), 'youth_choice_db.json');

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  google_id?: string;
  role: 'CUSTOMER' | 'ADMIN';
  gender?: string;
  dob?: string;
  profile_img?: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  image_url: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  color?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  price_override?: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  description: string;
  material: string;
  fit: string;
  care_instructions: string;
  mrp: number;
  selling_price: number;
  discount_pct: number;
  sku_prefix: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  brand_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  cod_fee?: number;
  payment_method?: 'ONLINE_UPI' | 'COD';
  coupon_code?: string;
  grand_total: number;
  status: 
    | 'PENDING_CONFIRMATION'
    | 'WHATSAPP_CONTACTED'
    | 'ORDER_CONFIRMED'
    | 'PAYMENT_CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';
  whatsapp_message?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  min_order_amount: number;
  status: 'ACTIVE' | 'INACTIVE';
  usage_count: number;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  banner_url: string;
  discount_tag: string;
  link_url: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  product_id?: string;
  category_id?: string;
  brand_id?: string;
  metadata?: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  addresses: Address[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  cart_items: CartItem[];
  wishlist_items: WishlistItem[];
  orders: Order[];
  order_items: OrderItem[];
  reviews: Review[];
  coupons: Coupon[];
  offers: Offer[];
  notifications: Notification[];
  analytics_events: AnalyticsEvent[];
}

let dbData: DatabaseSchema = {
  users: [],
  addresses: [],
  brands: [],
  categories: [],
  products: [],
  product_images: [],
  product_variants: [],
  cart_items: [],
  wishlist_items: [],
  orders: [],
  order_items: [],
  reviews: [],
  coupons: [],
  offers: [],
  notifications: [],
  analytics_events: []
};

export function saveDatabase() {
  const targetPaths = [
    DB_FILE,
    path.resolve(process.cwd(), 'youth_choice_db.json'),
    '/tmp/youth_choice_db.json'
  ];

  for (const p of targetPaths) {
    try {
      fs.writeFileSync(p, JSON.stringify(dbData, null, 2), 'utf-8');
      break;
    } catch (err) {
      // Continue to next fallback path (e.g. /tmp for serverless Vercel environment)
    }
  }
}

export function loadDatabase() {
  const possiblePaths = [
    '/tmp/youth_choice_db.json',
    DB_FILE,
    path.resolve(process.cwd(), 'youth_choice_db.json'),
    path.resolve(process.cwd(), '../youth_choice_db.json')
  ];

  let loaded = false;
  for (const dbPath of possiblePaths) {
    if (fs.existsSync(dbPath)) {
      try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        dbData = JSON.parse(data);
        console.log('Database loaded successfully from:', dbPath);
        loaded = true;
        break;
      } catch (e) {
        console.error('Failed to parse database JSON at:', dbPath);
      }
    }
  }

  if (!loaded) {
    try {
      const initialDbData = require('../youth_choice_db.json');
      if (initialDbData && typeof initialDbData === 'object' && Array.isArray((initialDbData as any).users)) {
        dbData = JSON.parse(JSON.stringify(initialDbData));
        console.log('Database loaded from initial JSON fallback');
        loaded = true;
      }
    } catch (e) {
      console.warn('Initial JSON require fallback failed:', e);
    }

    if (!loaded) {
      seedDatabase();
    }
  }

  // Ensure Admin User ALWAYS exists in database
  ensureAdminUser();
}

function ensureAdminUser() {
  if (!dbData.users) dbData.users = [];
  const adminEmail = 'youthchoicemenswear@gmail.com';
  const adminPhone = '8522000504';

  let admin = dbData.users.find(u => u.email.trim().toLowerCase() === adminEmail || (u.phone && u.phone.includes(adminPhone)));
  if (!admin) {
    admin = {
      id: 'user-admin-1',
      email: adminEmail,
      password_hash: bcrypt.hashSync('Sai naveen', 10),
      name: 'Youth Choice Admin',
      phone: '+918522000504',
      role: 'ADMIN',
      gender: 'MALE',
      created_at: new Date().toISOString()
    };
    dbData.users.unshift(admin);
  } else {
    admin.role = 'ADMIN';
    admin.email = adminEmail;
    admin.phone = '+918522000504';
    try {
      if (!admin.password_hash || !bcrypt.compareSync('Sai naveen', admin.password_hash)) {
        admin.password_hash = bcrypt.hashSync('Sai naveen', 10);
      }
    } catch (e) {
      admin.password_hash = bcrypt.hashSync('Sai naveen', 10);
    }
  }
}

export function seedDatabase() {
  console.log('Seeding initial Youth Choice The Fashion Store database...');
  const passwordHashAdmin = bcrypt.hashSync('Sai naveen', 10);
  const passwordHashUser = bcrypt.hashSync('customer123', 10);

  const now = new Date().toISOString();

  // 1. Users
  dbData.users = [
    {
      id: 'user-admin-1',
      email: 'youthchoicemenswear@gmail.com',
      password_hash: passwordHashAdmin,
      name: 'Youth Choice Admin',
      phone: '+918522000504',
      role: 'ADMIN',
      gender: 'MALE',
      created_at: now
    },
    {
      id: 'user-customer-1',
      email: 'john@example.com',
      password_hash: passwordHashUser,
      name: 'John Doe',
      phone: '+919123456789',
      role: 'CUSTOMER',
      gender: 'MALE',
      created_at: now
    }
  ];

  // 2. Addresses
  dbData.addresses = [
    {
      id: 'addr-1',
      user_id: 'user-customer-1',
      type: 'HOME',
      recipient_name: 'John Doe',
      phone: '+919123456789',
      street: 'Flat 402, Royal Residency, Road No. 3, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      is_default: true
    }
  ];

  // 3. Brands
  dbData.brands = [
    { id: 'brand-nike', name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80', description: 'World leader in contemporary sportswear and streetwear.', status: 'ACTIVE', created_at: now },
    { id: 'brand-adidas', name: 'Adidas', logo: 'https://images.unsplash.com/photo-1518002171953-a0847b74681d?w=100&auto=format&fit=crop&q=80', description: 'Iconic three stripes casual and sports wear.', status: 'ACTIVE', created_at: now },
    { id: 'brand-puma', name: 'Puma', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100&auto=format&fit=crop&q=80', description: 'Fast, bold, and modern high-fashion apparel.', status: 'ACTIVE', created_at: now },
    { id: 'brand-levis', name: "Levi's", logo: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=100&auto=format&fit=crop&q=80', description: 'The definitive authority in denim and casual jeans.', status: 'ACTIVE', created_at: now },
    { id: 'brand-hm', name: 'H&M', logo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&auto=format&fit=crop&q=80', description: 'Trendy fast-fashion essentials for young trendsetters.', status: 'ACTIVE', created_at: now },
    { id: 'brand-zara', name: 'Zara', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&auto=format&fit=crop&q=80', description: 'High-street European tailored menswear and womenswear.', status: 'ACTIVE', created_at: now },
    { id: 'brand-lp', name: 'Louis Philippe', logo: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=100&auto=format&fit=crop&q=80', description: 'Premium executive formalwear and aristocratic luxury.', status: 'ACTIVE', created_at: now },
    { id: 'brand-allen-solly', name: 'Allen Solly', logo: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=100&auto=format&fit=crop&q=80', description: 'Pioneer of Friday Dressing and vibrant smart casuals.', status: 'ACTIVE', created_at: now },
    { id: 'brand-peter-england', name: 'Peter England', logo: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=100&auto=format&fit=crop&q=80', description: 'Honest value, elegant fitting menswear.', status: 'ACTIVE', created_at: now },
    { id: 'brand-van-heusen', name: 'Van Heusen', logo: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=100&auto=format&fit=crop&q=80', description: 'Power dressing for corporate and formal settings.', status: 'ACTIVE', created_at: now }
  ];

  // 4. Categories
  dbData.categories = [
    // Men Categories
    { id: 'cat-men-tshirts', name: 'T-Shirts', slug: 't-shirts', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-shirts', name: 'Shirts', slug: 'shirts', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-jeans', name: 'Jeans', slug: 'jeans', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-trousers', name: 'Trousers', slug: 'trousers', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-cargo', name: 'Cargo Pants', slug: 'cargo-pants', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-hoodies', name: 'Hoodies', slug: 'hoodies', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-jackets', name: 'Jackets', slug: 'jackets', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-ethnic', name: 'Ethnic Wear', slug: 'ethnic-wear', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-footwear', name: 'Footwear', slug: 'footwear', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-men-accessories', name: 'Accessories', slug: 'accessories', gender: 'MEN', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },

    // Women Categories
    { id: 'cat-women-tops', name: 'Tops', slug: 'women-tops', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-women-dresses', name: 'Dresses', slug: 'women-dresses', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-women-kurtis', name: 'Kurtis', slug: 'women-kurtis', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-women-sarees', name: 'Sarees', slug: 'women-sarees', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-women-jeans', name: 'Jeans', slug: 'women-jeans', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-women-jackets', name: 'Jackets', slug: 'women-jackets', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now },
    { id: 'cat-women-handbags', name: 'Handbags', slug: 'women-handbags', gender: 'WOMEN', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80', status: 'ACTIVE', created_at: now }
  ];

  // 5. Products & Variants & Images
  const rawProducts = [
    {
      id: 'prod-1',
      name: 'Premium Oversized Heavyweight Cotton T-Shirt',
      slug: 'premium-oversized-heavyweight-cotton-t-shirt',
      brand_id: 'brand-hm',
      category_id: 'cat-men-tshirts',
      gender: 'MEN' as const,
      description: 'Crafted from 240 GSM 100% combed cotton, this heavyweight oversized drop-shoulder t-shirt delivers structural relaxed streetwear fitting with supreme breathability.',
      material: '100% Premium Combed Cotton (240 GSM)',
      fit: 'Oversized Fit / Drop Shoulder',
      care_instructions: 'Machine wash cold inside out, iron low, do not tumble dry.',
      mrp: 1999,
      selling_price: 1499,
      discount_pct: 25,
      sku_prefix: 'YCMC-TSH-01',
      rating: 4.8,
      review_count: 42,
      is_featured: true,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', color: 'Black', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80', color: 'White', is_primary: false },
        { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80', color: 'Navy Blue', is_primary: false }
      ],
      colors: ['Black', 'White', 'Navy Blue'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'prod-2',
      name: 'Classic Pique Cotton Slim Polo T-Shirt',
      slug: 'classic-pique-cotton-slim-polo-t-shirt',
      brand_id: 'brand-allen-solly',
      category_id: 'cat-men-tshirts',
      gender: 'MEN' as const,
      description: 'Timeless short-sleeve polo shirt with ribbed collar, 2-button placket, and embroidered chest emblem.',
      material: '95% Pique Cotton, 5% Elastane',
      fit: 'Slim Fit',
      care_instructions: 'Warm machine wash with like colors.',
      mrp: 1799,
      selling_price: 1299,
      discount_pct: 28,
      sku_prefix: 'YCMC-POLO-02',
      rating: 4.6,
      review_count: 28,
      is_featured: true,
      is_trending: true,
      is_new_arrival: false,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80', color: 'Olive', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1625910513413-56360c78f142?w=800&auto=format&fit=crop&q=80', color: 'Beige', is_primary: false }
      ],
      colors: ['Olive', 'Beige'],
      sizes: ['M', 'L', 'XL']
    },
    {
      id: 'prod-3',
      name: '511 Slim Fit Tapered Stretch Denim Jeans',
      slug: '511-slim-fit-tapered-stretch-denim-jeans',
      brand_id: 'brand-levis',
      category_id: 'cat-men-jeans',
      gender: 'MEN' as const,
      description: 'A modern slim with room to move. Designed with iconic 5-pocket styling and comfort stretch technology.',
      material: '98% Cotton, 2% Elastane Denim',
      fit: 'Slim Tapered Fit',
      care_instructions: 'Wash inside out with cold water.',
      mrp: 3999,
      selling_price: 2799,
      discount_pct: 30,
      sku_prefix: 'YCMC-JNS-03',
      rating: 4.9,
      review_count: 64,
      is_featured: true,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80', color: 'Charcoal', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80', color: 'Navy Blue', is_primary: false }
      ],
      colors: ['Charcoal', 'Navy Blue'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'prod-4',
      name: 'Relaxed Tactical Multi-Pocket Cargo Pants',
      slug: 'relaxed-tactical-multi-pocket-cargo-pants',
      brand_id: 'brand-zara',
      category_id: 'cat-men-cargo',
      gender: 'MEN' as const,
      description: 'Urban military-inspired cargo trousers featuring dual snap side pockets, drawcord cuff hem, and articulated knee joints.',
      material: '100% Ripstop Cotton Twill',
      fit: 'Relaxed Tapered',
      care_instructions: 'Machine wash 30°C.',
      mrp: 2999,
      selling_price: 2199,
      discount_pct: 27,
      sku_prefix: 'YCMC-CRG-04',
      rating: 4.7,
      review_count: 35,
      is_featured: false,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80', color: 'Black', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80', color: 'Olive', is_primary: false }
      ],
      colors: ['Black', 'Olive'],
      sizes: ['M', 'L', 'XL', 'XXL']
    },
    {
      id: 'prod-5',
      name: 'Casual Breathable Pure Linen Button-Down Shirt',
      slug: 'casual-breathable-pure-linen-button-down-shirt',
      brand_id: 'brand-lp',
      category_id: 'cat-men-shirts',
      gender: 'MEN' as const,
      description: 'Ultra-lightweight French flax linen tailored for warm weather elegance. Features spread collar and pearlized buttons.',
      material: '100% Pure French Linen',
      fit: 'Regular Fit',
      care_instructions: 'Dry clean or gentle hand wash.',
      mrp: 3499,
      selling_price: 2499,
      discount_pct: 29,
      sku_prefix: 'YCMC-SHRT-05',
      rating: 4.8,
      review_count: 51,
      is_featured: true,
      is_trending: false,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80', color: 'White', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80', color: 'Beige', is_primary: false }
      ],
      colors: ['White', 'Beige'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'prod-6',
      name: 'Essential Fleece Pullover Streetwear Hoodie',
      slug: 'essential-fleece-pullover-streetwear-hoodie',
      brand_id: 'brand-nike',
      category_id: 'cat-men-hoodies',
      gender: 'MEN' as const,
      description: 'Heavy fleece-lined double hoodie with kangaroo pouch pocket, metal aglet drawstrings, and snug rib cuffs.',
      material: '80% Cotton, 20% Polyester Brushed Fleece',
      fit: 'Relaxed Streetwear Fit',
      care_instructions: 'Machine wash cold, tumble dry low.',
      mrp: 3299,
      selling_price: 2399,
      discount_pct: 27,
      sku_prefix: 'YCMC-HD-06',
      rating: 4.9,
      review_count: 89,
      is_featured: true,
      is_trending: true,
      is_new_arrival: false,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', color: 'Black', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80', color: 'Gray', is_primary: false }
      ],
      colors: ['Black', 'Gray'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'prod-7',
      name: 'Vintage Trucker Washed Denim Jacket',
      slug: 'vintage-trucker-washed-denim-jacket',
      brand_id: 'brand-levis',
      category_id: 'cat-men-jackets',
      gender: 'MEN' as const,
      description: 'Classic 90s vintage wash trucker jacket with shank buttons, chest flap pockets, and adjustable side tabs.',
      material: '100% Rigid Heavy Cotton Denim',
      fit: 'Regular Fit',
      care_instructions: 'Wash inside out in cold water.',
      mrp: 4999,
      selling_price: 3499,
      discount_pct: 30,
      sku_prefix: 'YCMC-JKT-07',
      rating: 4.7,
      review_count: 31,
      is_featured: true,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', color: 'Navy Blue', is_primary: true }
      ],
      colors: ['Navy Blue'],
      sizes: ['M', 'L', 'XL']
    },
    {
      id: 'prod-8',
      name: 'Non-Iron Executive Formal Cotton Shirt',
      slug: 'non-iron-executive-formal-cotton-shirt',
      brand_id: 'brand-van-heusen',
      category_id: 'cat-men-shirts',
      gender: 'MEN' as const,
      description: 'Wrinkle-resistant pinpoint oxford weave formal shirt built for 14-hour workday crispness.',
      material: '100% Superfine Compact Cotton',
      fit: 'Structured Slim Fit',
      care_instructions: 'Machine wash warm, tumble dry, warm iron if needed.',
      mrp: 2499,
      selling_price: 1899,
      discount_pct: 24,
      sku_prefix: 'YCMC-FRM-08',
      rating: 4.6,
      review_count: 47,
      is_featured: false,
      is_trending: false,
      is_new_arrival: false,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80', color: 'White', is_primary: true }
      ],
      colors: ['White'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'prod-9',
      name: 'Retro Low-Top Leather Casual Sneakers',
      slug: 'retro-low-top-leather-casual-sneakers',
      brand_id: 'brand-puma',
      category_id: 'cat-men-footwear',
      gender: 'MEN' as const,
      description: 'Heritage court sneakers crafted with genuine leather uppers, cushioned foam footbed, and durable rubber traction sole.',
      material: 'Genuine Leather Upper, Rubber Sole',
      fit: 'True to Size',
      care_instructions: 'Wipe clean with a damp cloth.',
      mrp: 4499,
      selling_price: 3199,
      discount_pct: 29,
      sku_prefix: 'YCMC-SNK-09',
      rating: 4.9,
      review_count: 73,
      is_featured: true,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80', color: 'White', is_primary: true }
      ],
      colors: ['White'],
      sizes: ['S', 'M', 'L', 'XL']
    },

    // Women Products
    {
      id: 'prod-10',
      name: 'Oversized Cotton Casual Drop Top',
      slug: 'women-oversized-cotton-casual-drop-top',
      brand_id: 'brand-hm',
      category_id: 'cat-women-tops',
      gender: 'WOMEN' as const,
      description: 'Chic relaxed drop-shoulder knit top designed for modern casual layering.',
      material: '100% Organic Soft Knit Cotton',
      fit: 'Relaxed Fit',
      care_instructions: 'Machine wash 30°C.',
      mrp: 1499,
      selling_price: 999,
      discount_pct: 33,
      sku_prefix: 'YCMC-WTO-10',
      rating: 4.7,
      review_count: 29,
      is_featured: true,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', color: 'Beige', is_primary: true },
        { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80', color: 'White', is_primary: false }
      ],
      colors: ['Beige', 'White'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 'prod-11',
      name: 'Boho Floral Print Tiered Summer Dress',
      slug: 'boho-floral-print-tiered-summer-dress',
      brand_id: 'brand-zara',
      category_id: 'cat-women-dresses',
      gender: 'WOMEN' as const,
      description: 'Flowy midi summer dress featuring delicate floral botanical prints, waist cinch tie, and breathable fabric.',
      material: '100% Viscose Rayon',
      fit: 'Flowy A-Line Fit',
      care_instructions: 'Hand wash cold.',
      mrp: 2999,
      selling_price: 2199,
      discount_pct: 27,
      sku_prefix: 'YCMC-WDR-11',
      rating: 4.8,
      review_count: 38,
      is_featured: true,
      is_trending: true,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=80', color: 'Red', is_primary: true }
      ],
      colors: ['Red'],
      sizes: ['S', 'M', 'L']
    },
    {
      id: 'prod-12',
      name: 'Handcrafted Chanderi Silk Designer Kurti',
      slug: 'handcrafted-chanderi-silk-designer-kurti',
      brand_id: 'brand-peter-england',
      category_id: 'cat-women-kurtis',
      gender: 'WOMEN' as const,
      description: 'Traditional Chanderi silk straight kurti featuring intricate zari embroidery work along neck and sleeves.',
      material: 'Chanderi Silk Blend with Cotton Lining',
      fit: 'Straight Fit',
      care_instructions: 'Dry clean only.',
      mrp: 3499,
      selling_price: 2399,
      discount_pct: 31,
      sku_prefix: 'YCMC-WKR-12',
      rating: 4.9,
      review_count: 55,
      is_featured: true,
      is_trending: false,
      is_new_arrival: true,
      status: 'ACTIVE' as const,
      created_at: now,
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&auto=format&fit=crop&q=80', color: 'Navy Blue', is_primary: true }
      ],
      colors: ['Navy Blue'],
      sizes: ['S', 'M', 'L', 'XL']
    }
  ];

  dbData.products = [];
  dbData.product_images = [];
  dbData.product_variants = [];
  dbData.reviews = [];

  for (const p of rawProducts) {
    const { images, colors, sizes, ...prodData } = p;
    dbData.products.push(prodData);

    let idx = 0;
    for (const img of images) {
      dbData.product_images.push({
        id: `img-${p.id}-${idx++}`,
        product_id: p.id,
        image_url: img.url,
        color: img.color,
        is_primary: img.is_primary,
        display_order: idx
      });
    }

    for (const color of colors) {
      for (const size of sizes) {
        let stock = 15;
        if (size === 'S' && color === 'Black') stock = 3; // low stock demo
        if (size === 'XXL' && color === 'White') stock = 0; // out of stock demo
        if (p.id === 'prod-3' && size === 'L') stock = 2; // low stock alert demo

        const variantSku = `${p.sku_prefix}-${color.substring(0, 2).toUpperCase()}-${size}`;
        dbData.product_variants.push({
          id: `var-${p.id}-${color}-${size}`,
          product_id: p.id,
          color,
          size,
          sku: variantSku,
          stock,
          created_at: now
        });
      }
    }

    dbData.reviews.push({
      id: `rev-${p.id}`,
      user_id: 'user-customer-1',
      product_id: p.id,
      user_name: 'John Doe',
      rating: Math.floor(p.rating),
      comment: 'Outstanding build quality and fit! Really loved ordering via WhatsApp.',
      is_verified: true,
      created_at: now
    });
  }

  // 6. Cart Items
  const firstVariant = dbData.product_variants.find(v => v.product_id === 'prod-1');
  if (firstVariant) {
    dbData.cart_items = [
      {
        id: 'cart-item-1',
        user_id: 'user-customer-1',
        variant_id: firstVariant.id,
        quantity: 1,
        created_at: now
      }
    ];
  }

  // 7. Wishlist Items
  dbData.wishlist_items = [
    {
      id: 'wish-item-1',
      user_id: 'user-customer-1',
      product_id: 'prod-3',
      created_at: now
    }
  ];

  // 8. Orders & Order Items
  dbData.orders = [
    {
      id: 'ord-demo-10245',
      order_number: 'YC-10245',
      user_id: 'user-customer-1',
      customer_name: 'John Doe',
      customer_phone: '+919123456789',
      delivery_address: 'Flat 402, Royal Residency, Road No. 3, Banjara Hills, Hyderabad, Telangana - 500034',
      subtotal: 2998,
      discount: 300,
      delivery_fee: 0,
      grand_total: 2698,
      status: 'ORDER_CONFIRMED',
      whatsapp_message: 'Hello Youth Choice The Fashion Store!\nI would like to place an order.\nOrder ID: YC-10245...',
      created_at: now,
      updated_at: now
    }
  ];

  dbData.order_items = [
    {
      id: 'orditem-1',
      order_id: 'ord-demo-10245',
      product_id: 'prod-1',
      variant_id: firstVariant ? firstVariant.id : 'var-prod-1-Black-L',
      product_name: 'Premium Oversized Heavyweight Cotton T-Shirt',
      brand_name: 'H&M',
      color: 'Black',
      size: 'L',
      quantity: 2,
      unit_price: 1499,
      total_price: 2998,
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    }
  ];

  // 9. Coupons
  dbData.coupons = [
    { id: 'cpn-1', code: 'WELCOME100', discount_type: 'FIXED', discount_value: 100, min_order_amount: 999, status: 'ACTIVE', usage_count: 14, created_at: now },
    { id: 'cpn-2', code: 'YOUTH20', discount_type: 'PERCENT', discount_value: 20, min_order_amount: 1999, status: 'ACTIVE', usage_count: 38, created_at: now }
  ];

  // 10. Offers
  dbData.offers = [
    { id: 'off-1', title: 'NEW SEASON SALE', subtitle: 'Upgrade your style with contemporary fashion classics.', banner_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80', discount_tag: 'UP TO 50% OFF', link_url: '/products', status: 'ACTIVE', created_at: now },
    { id: 'off-2', title: 'WEEKEND DEALS', subtitle: 'Special discounts on premium denim jeans & polos.', banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80', discount_tag: 'FLAT ₹500 OFF', link_url: '/men', status: 'ACTIVE', created_at: now }
  ];

  // 11. Analytics Events
  dbData.analytics_events = [];
  const eventTypes = ['PRODUCT_VIEW', 'PRODUCT_VIEW', 'SEARCH', 'ADD_TO_CART', 'WISHLIST_ADD', 'CHECKOUT_STARTED', 'WHATSAPP_ORDER', 'ORDER_CONFIRMED'];
  for (let i = 0; i < 60; i++) {
    const et = eventTypes[i % eventTypes.length];
    dbData.analytics_events.push({
      id: `evt-${i}`,
      event_type: et,
      user_id: 'user-customer-1',
      product_id: rawProducts[i % rawProducts.length].id,
      category_id: rawProducts[i % rawProducts.length].category_id,
      brand_id: rawProducts[i % rawProducts.length].brand_id,
      created_at: now
    });
  }

  saveDatabase();
  console.log('Seeding complete!');
}

// Accessor helper for database
export const db = {
  get data() {
    return dbData;
  },
  save: saveDatabase,
  init: loadDatabase
};

// Auto load DB on startup
loadDatabase();
