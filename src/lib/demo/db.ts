import type {
  Address,
  CartItem,
  Category,
  Collection,
  Order,
  PaymentMethod,
  Product,
  Review,
  UserProfile,
} from '../types'
import { buildSeedReviews, categories as seedCategories, collections as seedCollections, products as seedProducts } from './seed'

const DB_KEY = 'volterra:demo-db:v1'

export interface DemoDB {
  products: Product[]
  categories: Category[]
  collections: Collection[]
  reviews: Review[]
  orders: Order[]
  users: UserProfile[]
}

const DEMO_ADMIN = {
  id: 'user-demo-admin',
  email: 'admin@volterra.com',
  name: 'Volterra Admin',
  provider: 'demo' as const,
  isAdmin: true,
  addresses: [],
  paymentMethods: [],
  createdAt: '2026-01-01T00:00:00Z',
}

function createInitialDB(): DemoDB {
  return {
    products: structuredClone(seedProducts),
    categories: structuredClone(seedCategories),
    collections: structuredClone(seedCollections),
    reviews: buildSeedReviews(),
    orders: seedDemoOrders(),
    users: [DEMO_ADMIN],
  }
}

function seedDemoOrders(): Order[] {
  const orders: Order[] = []
  const names = ['Maya R.', 'Devon K.', 'Priya S.', 'Tom W.', 'Alicia M.', 'Jonah T.', 'Sarah L.', 'Marcus B.', 'Elena V.', 'Chris P.', 'Nadia F.', 'Leo G.']
  const statuses: Order['status'][] = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending']
  const payMethods: Order['paymentMethod'][] = ['card', 'card', 'upi', 'cod']
  const now = Date.now()
  for (let i = 0; i < 42; i++) {
    const count = 1 + Math.floor(Math.random() * 3)
    const chosen: Product[] = []
    for (let c = 0; c < count; c++) chosen.push(seedProducts[Math.floor(Math.random() * seedProducts.length)])
    const items = chosen.map((p) => ({
      productId: p.id,
      name: p.name,
      image: p.images[0],
      price: p.price,
      size: p.sizes[Math.floor(Math.random() * p.sizes.length)].size,
      color: p.colors[0].name,
      quantity: 1 + Math.floor(Math.random() * 2),
    }))
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
    const shipping = subtotal >= 150 ? 0 : 7.5
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const daysAgo = Math.floor(Math.random() * 14)
    orders.push({
      id: `ord-seed-${i + 1}`,
      userId: null,
      email: `${names[i % names.length].split(' ')[0].toLowerCase()}@example.com`,
      items,
      subtotal,
      discount: 0,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      paymentMethod: payMethods[i % payMethods.length],
      status: statuses[i % statuses.length],
      shippingAddress: {
        id: `addr-seed-${i}`,
        fullName: names[i % names.length],
        line1: '1 Runner Lane',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
        country: 'United States',
        phone: '555-0100',
        isDefault: true,
      },
      createdAt: new Date(now - daysAgo * 86400000 - (i % 12) * 3600000).toISOString(),
    })
  }
  orders.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  return orders
}

function readDB(): DemoDB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      const db = createInitialDB()
      localStorage.setItem(DB_KEY, JSON.stringify(db))
      return db
    }
    const parsed = JSON.parse(raw) as Partial<DemoDB>
    // Merge with seed defaults in case the schema evolves
    const base = createInitialDB()
    const users = parsed.users ?? []
    // Ensure the demo admin account is always available
    if (!users.some((u) => u.id === DEMO_ADMIN.id)) users.unshift(DEMO_ADMIN)
    return {
      products: parsed.products?.length ? parsed.products : base.products,
      categories: parsed.categories?.length ? parsed.categories : base.categories,
      collections: parsed.collections?.length ? parsed.collections : base.collections,
      reviews: parsed.reviews ?? base.reviews,
      orders: parsed.orders ?? [],
      users,
    }
  } catch {
    return createInitialDB()
  }
}

function writeDB(db: DemoDB) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // Storage full or unavailable — keep working in-memory
  }
}

export const demoDB = {
  get: readDB,
  save: writeDB,
}

/* ---------- Session (demo auth) ---------- */

const SESSION_KEY = 'volterra:demo-session:v1'

export interface DemoSession {
  user: UserProfile | null
}

export function getDemoSession(): DemoSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return { user: null }
    const parsed = JSON.parse(raw) as DemoSession
    const db = readDB()
    if (!parsed.user) return { user: null }
    const fresh = db.users.find((u) => u.id === parsed.user!.id)
    return fresh ? { user: fresh } : { user: null }
  } catch {
    return { user: null }
  }
}

export function setDemoSession(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

/* ---------- Cart / wishlist persistence ---------- */

const CART_KEY = 'volterra:cart:v1'
const SAVED_KEY = 'volterra:saved:v1'
const WISHLIST_KEY = 'volterra:wishlist:v1'

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    /* noop */
  }
}

export function loadSaved(): CartItem[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveSaved(items: CartItem[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(items))
  } catch {
    /* noop */
  }
}

export function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function saveWishlist(ids: string[]) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
  } catch {
    /* noop */
  }
}

/* ---------- Search history ---------- */

const RECENT_KEY = 'volterra:recent-searches:v1'

export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addRecentSearch(term: string) {
  const current = loadRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase())
  current.unshift(term)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, 6)))
  } catch {
    /* noop */
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    /* noop */
  }
}

/* ---------- Addresses & payment methods helpers ---------- */

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDemoAddress(data: Omit<Address, 'id'>): Address {
  return { ...data, id: makeId('addr') }
}

export function createDemoPayment(data: Omit<PaymentMethod, 'id'>): PaymentMethod {
  return { ...data, id: makeId('pay') }
}
