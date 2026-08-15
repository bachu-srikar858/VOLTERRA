import type {
  Address,
  CartItem,
  Category,
  Collection,
  DashboardStats,
  Order,
  OrderStatus,
  Product,
  ProductFilters,
  Review,
  UserProfile,
} from './types'
import { isSupabaseConfigured, supabase } from './supabase'
import { demoDB, getDemoSession, loadCart, loadSaved, loadWishlist, makeId, saveCart, saveSaved, saveWishlist, setDemoSession, type DemoDB } from './demo/db'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from './constants'

/* ================================================================== */
/*  Backend selection: Supabase when configured, demo (localStorage)  */
/*  otherwise. Falls back to demo at runtime if Supabase errors       */
/*  (e.g. tables not yet created).                                    */
/* ================================================================== */

let activeBackend: 'supabase' | 'demo' = isSupabaseConfigured ? 'supabase' : 'demo'

export function backendName(): string {
  return activeBackend
}

export function isDemoMode(): boolean {
  return activeBackend === 'demo'
}

function markDemo(err?: unknown) {
  if (activeBackend !== 'demo') {
    const detail =
      err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err)
    console.warn(`[VOLTERRA] Supabase query failed (${detail}) — falling back to local demo data. Run supabase/schema.sql to enable the database backend.`)
    activeBackend = 'demo'
  }
}

/* ================================================================== */
/*  Demo backend implementation                                       */
/* ================================================================== */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function applyFilters(products: Product[], f: ProductFilters): Product[] {
  let list = [...products]
  if (f.category) list = list.filter((p) => p.categoryName.toLowerCase() === f.category!.toLowerCase() || p.categoryId === f.category)
  if (f.gender) list = list.filter((p) => p.gender === f.gender)
  if (f.sizes?.length) {
    list = list.filter((p) =>
      f.sizes!.some((s) => p.sizes.some((ps) => ps.size === s && ps.stock > 0)),
    )
  }
  if (f.colors?.length) {
    list = list.filter((p) => p.colors.some((c) => f.colors!.includes(c.name)))
  }
  if (f.minPrice != null) list = list.filter((p) => p.price >= f.minPrice!)
  if (f.maxPrice != null) list = list.filter((p) => p.price <= f.maxPrice!)
  if (f.sale) list = list.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price)
  if (f.collection) {
    const col = demoDB.get().collections.find((c) => c.slug === f.collection)
    if (col) {
      const slugs = new Set(col.productSlugs)
      const cats = new Set(col.categorySlugs)
      list = list.filter((p) => slugs.has(p.slug) || cats.has(p.categoryName.toLowerCase()))
    }
  }
  if (f.search || f.query) {
    const q = (f.search || f.query || '').toLowerCase().trim()
    if (q) {
      list = list.filter((p) =>
        [p.name, p.description, p.categoryName, ...p.tags, p.sku]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
  }
  const sort = f.sort || 'featured'
  switch (sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      list.sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
      break
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
  }
  return list
}

/* ---------- Demo: products & categories ---------- */

async function demoGetProducts(filters: ProductFilters = {}): Promise<Product[]> {
  await delay(120)
  return applyFilters(demoDB.get().products, filters)
}

async function demoGetProductBySlug(slug: string): Promise<Product | null> {
  await delay(80)
  return demoDB.get().products.find((p) => p.slug === slug) ?? null
}

async function demoGetProductById(id: string): Promise<Product | null> {
  await delay(80)
  return demoDB.get().products.find((p) => p.id === id) ?? null
}

async function demoGetReviews(productId: string): Promise<Review[]> {
  await delay(80)
  return demoDB.get().reviews.filter((r) => r.productId === productId)
}

async function demoAddReview(productId: string, review: Omit<Review, 'id' | 'productId'>): Promise<Review> {
  const db = demoDB.get()
  const rev: Review = { id: makeId('rev'), productId, ...review }
  db.reviews.unshift(rev)
  const product = db.products.find((p) => p.id === productId)
  if (product) {
    const total = product.rating * product.reviewCount + review.rating
    product.reviewCount += 1
    product.rating = Math.round((total / product.reviewCount) * 10) / 10
  }
  demoDB.save(db)
  return rev
}

async function demoCreateOrder(input: {
  email: string
  userId: string | null
  items: Order['items']
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentMethod: Order['paymentMethod']
  shippingAddress: Address
}): Promise<Order> {
  const db = demoDB.get()
  const order: Order = {
    id: makeId('ord'),
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...input,
  }
  db.orders.unshift(order)
  // Decrement stock
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId)
    if (product) {
      const size = product.sizes.find((s) => s.size === item.size)
      if (size) size.stock = Math.max(0, size.stock - item.quantity)
    }
  }
  demoDB.save(db)
  return order
}

async function demoGetOrders(userId: string | null): Promise<Order[]> {
  await delay(100)
  return demoDB.get().orders.filter((o) => (userId ? o.userId === userId : true))
}

async function demoUpdateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const db = demoDB.get()
  const order = db.orders.find((o) => o.id === id)
  if (order) {
    order.status = status
    demoDB.save(db)
  }
}

/* ---------- Demo: auth ---------- */

async function demoSignUp(email: string, password: string, name: string): Promise<UserProfile> {
  await delay(400)
  const db = demoDB.get()
  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (exists) throw new Error('An account with this email already exists.')
  if (password.length < 6) throw new Error('Password must be at least 6 characters.')
  const user: UserProfile = {
    id: makeId('user'),
    email,
    name: name || email.split('@')[0],
    provider: 'demo',
    isAdmin: false,
    addresses: [],
    paymentMethods: [],
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  demoDB.save(db)
  setDemoSession(user)
  return user
}

async function demoSignIn(email: string, password: string): Promise<UserProfile> {
  await delay(400)
  const db = demoDB.get()
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  // Demo accepts any password ≥ 6 chars for existing accounts; seed admin below.
  if (!user) throw new Error('No account found with this email. Try signing up first.')
  if (!password || password.length < 6) throw new Error('Invalid password.')
  setDemoSession(user)
  return user
}

async function demoSignOut(): Promise<void> {
  setDemoSession(null)
}

async function demoSignInWithGoogle(): Promise<UserProfile> {
  throw new Error('Google sign-in requires Supabase to be configured.')
}

async function demoGetSession(): Promise<UserProfile | null> {
  return getDemoSession().user
}

async function demoResetPassword(email: string): Promise<void> {
  await delay(400)
  const db = demoDB.get()
  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!exists) throw new Error('No account found with this email.')
}

async function demoUpdateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const db = demoDB.get()
  const idx = db.users.findIndex((u) => u.id === userId)
  if (idx === -1) throw new Error('User not found')
  db.users[idx] = { ...db.users[idx], ...data }
  demoDB.save(db)
  setDemoSession(db.users[idx])
  return db.users[idx]
}

/* ---------- Demo: admin ---------- */

async function demoCreateProduct(data: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<Product> {
  const db = demoDB.get()
  const product: Product = {
    ...data,
    id: makeId('p'),
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  }
  db.products.unshift(product)
  demoDB.save(db)
  return product
}

async function demoUpdateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const db = demoDB.get()
  const idx = db.products.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Product not found')
  db.products[idx] = { ...db.products[idx], ...data, id }
  demoDB.save(db)
  return db.products[idx]
}

async function demoDeleteProduct(id: string): Promise<void> {
  const db = demoDB.get()
  db.products = db.products.filter((p) => p.id !== id)
  demoDB.save(db)
}

async function demoCreateCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const db = demoDB.get()
  const cat: Category = { ...data, id: makeId('cat') }
  db.categories.push(cat)
  demoDB.save(db)
  return cat
}

async function demoUpdateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const db = demoDB.get()
  const idx = db.categories.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Category not found')
  db.categories[idx] = { ...db.categories[idx], ...data, id }
  demoDB.save(db)
  return db.categories[idx]
}

async function demoDeleteCategory(id: string): Promise<void> {
  const db = demoDB.get()
  db.categories = db.categories.filter((c) => c.id !== id)
  demoDB.save(db)
}

async function demoCreateCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
  const db = demoDB.get()
  const col: Collection = { ...data, id: makeId('col') }
  db.collections.push(col)
  demoDB.save(db)
  return col
}

async function demoUpdateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
  const db = demoDB.get()
  const idx = db.collections.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Collection not found')
  db.collections[idx] = { ...db.collections[idx], ...data, id }
  demoDB.save(db)
  return db.collections[idx]
}

async function demoDeleteCollection(id: string): Promise<void> {
  const db = demoDB.get()
  db.collections = db.collections.filter((c) => c.id !== id)
  demoDB.save(db)
}

async function demoGetStats(): Promise<DashboardStats> {
  const db = demoDB.get()
  const orders = db.orders
  const totalSales = orders.reduce((s, o) => s + o.total, 0)
  const dayMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dayMap.set(d, { revenue: 0, orders: 0 })
  }
  for (const o of orders) {
    const d = o.createdAt.slice(0, 10)
    if (dayMap.has(d)) {
      dayMap.get(d)!.revenue += o.total
      dayMap.get(d)!.orders += 1
    }
  }
  const sold = new Map<string, number>()
  for (const o of orders) {
    for (const it of o.items) sold.set(it.name, (sold.get(it.name) || 0) + it.quantity)
  }
  const popular = [...sold.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const lowStock = db.products.filter((p) => {
    const total = p.sizes.reduce((s, sz) => s + sz.stock, 0)
    return total > 0 && total <= 10
  }).length
  return {
    totalSales,
    orders: orders.length,
    customers: new Set(orders.map((o) => o.email)).size + db.users.length,
    products: db.products.length,
    lowStock,
    revenueByDay: [...dayMap.entries()].map(([day, v]) => ({ day, revenue: v.revenue })),
    ordersByDay: [...dayMap.entries()].map(([day, v]) => ({ day, orders: v.orders })),
    popularProducts: popular.map(([name, sold]) => ({ name, sold })),
  }
}

/* ================================================================== */
/*  Supabase backend                                                  */
/* ================================================================== */

type SupabaseRow = Record<string, unknown>

function rowToProduct(row: SupabaseRow): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    categoryId: String(row.category_id || ''),
    categoryName: String(row.category_name || ''),
    gender: (row.gender as Product['gender']) || 'unisex',
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    description: String(row.description || ''),
    images: (row.images as string[]) || [],
    colors: (row.colors as Product['colors']) || [],
    sizes: (row.sizes as Product['sizes']) || [],
    sku: String(row.sku || ''),
    technology: (row.technology as string[]) || [],
    materials: String(row.materials || ''),
    fit: String(row.fit || ''),
    care: (row.care as string[]) || [],
    featured: Boolean(row.featured),
    trending: Boolean(row.trending),
    isNew: Boolean(row.is_new),
    collectionIds: (row.collection_ids as string[]) || [],
    tags: (row.tags as string[]) || [],
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

function rowToCategory(row: SupabaseRow): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ''),
    image: String(row.image || ''),
    sortOrder: Number(row.sort_order || 0),
  }
}

function rowToCollection(row: SupabaseRow): Collection {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    tagline: String(row.tagline || ''),
    description: String(row.description || ''),
    image: String(row.image || ''),
    dark: Boolean(row.dark),
    categorySlugs: (row.category_slugs as string[]) || [],
    productSlugs: (row.product_slugs as string[]) || [],
  }
}

async function supabaseGetProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase!.from('products').select('*')
  if (filters.category) {
    query = query.eq('category_name', filters.category.charAt(0).toUpperCase() + filters.category.slice(1))
  }
  if (filters.gender) query = query.eq('gender', filters.gender)
  if (filters.search || filters.query) {
    query = query.ilike('name', `%${filters.search || filters.query}%`)
  }
  if (filters.minPrice != null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice)
  const { data, error } = await query
  if (error) throw error
  let list = (data as SupabaseRow[]).map(rowToProduct)
  // Client-side filtering for the filters Supabase can't do in one query
  if (filters.sizes?.length) {
    list = list.filter((p) => filters.sizes!.some((s) => p.sizes.some((ps) => ps.size === s && ps.stock > 0)))
  }
  if (filters.colors?.length) {
    list = list.filter((p) => p.colors.some((c) => filters.colors!.includes(c.name)))
  }
  if (filters.collection) {
    const { data: col } = await supabase!.from('collections').select('*').eq('slug', filters.collection).single()
    if (col) {
      const c = rowToCollection(col)
      const slugs = new Set(c.productSlugs)
      const cats = new Set(c.categorySlugs)
      list = list.filter((p) => slugs.has(p.slug) || cats.has(p.categoryName.toLowerCase()))
    }
  }
  return applyFilters(list, { ...filters, search: undefined, collection: undefined, category: undefined, gender: undefined, minPrice: undefined, maxPrice: undefined })
}

async function supabaseGetProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase!.from('products').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? rowToProduct(data) : null
}

async function supabaseGetProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase!.from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToProduct(data) : null
}

async function supabaseGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase!.from('categories').select('*').order('sort_order')
  if (error) throw error
  return (data as SupabaseRow[]).map(rowToCategory)
}

async function supabaseGetCollections(): Promise<Collection[]> {
  const { data, error } = await supabase!.from('collections').select('*')
  if (error) throw error
  return (data as SupabaseRow[]).map(rowToCollection)
}

async function supabaseGetReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase!.from('reviews').select('*').eq('product_id', productId).order('date', { ascending: false })
  if (error) throw error
  return (data as SupabaseRow[]).map((r) => ({
    id: String(r.id),
    productId: String(r.product_id),
    userName: String(r.user_name),
    rating: Number(r.rating),
    title: String(r.title || ''),
    body: String(r.body || ''),
    date: String(r.date),
    verified: Boolean(r.verified),
  }))
}

async function supabaseAddReview(productId: string, review: Omit<Review, 'id' | 'productId'>): Promise<Review> {
  const { data, error } = await supabase!
    .from('reviews')
    .insert({ id: makeId('rev'), product_id: productId, ...review })
    .select()
    .single()
  if (error) throw error
  return {
    id: String(data.id),
    productId,
    userName: String(data.user_name),
    rating: Number(data.rating),
    title: String(data.title || ''),
    body: String(data.body || ''),
    date: String(data.date),
    verified: Boolean(data.verified),
  }
}

async function supabaseCreateOrder(input: Parameters<typeof demoCreateOrder>[0]): Promise<Order> {
  const orderId = makeId('ord')
  const { data, error } = await supabase!
    .from('orders')
    .insert({
      id: orderId,
      user_id: input.userId,
      email: input.email,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      tax: input.tax,
      total: input.total,
      payment_method: input.paymentMethod,
      status: 'pending',
      shipping_address: input.shippingAddress,
    })
    .select()
    .single()
  if (error) throw error
  const items = input.items.map((it) => ({ id: makeId('oi'), order_id: orderId, ...it }))
  const { error: itemsError } = await supabase!.from('order_items').insert(items)
  if (itemsError) throw itemsError
  return {
    id: orderId,
    userId: input.userId,
    email: input.email,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    paymentMethod: input.paymentMethod,
    status: 'pending',
    shippingAddress: input.shippingAddress,
    createdAt: String(data.created_at || new Date().toISOString()),
  }
}

async function supabaseGetOrders(userId: string | null): Promise<Order[]> {
  const q = supabase!.from('orders').select('*').order('created_at', { ascending: false })
  const { data, error } = userId ? await q.eq('user_id', userId) : await q
  if (error) throw error
  const orders: Order[] = []
  for (const row of data as SupabaseRow[]) {
    const { data: items } = await supabase!.from('order_items').select('*').eq('order_id', String(row.id))
    orders.push({
      id: String(row.id),
      userId: row.user_id ? String(row.user_id) : null,
      email: String(row.email),
      items: ((items || []) as SupabaseRow[]).map((it) => ({
        productId: String(it.product_id || ''),
        name: String(it.name),
        image: String(it.image || ''),
        price: Number(it.price),
        size: String(it.size || ''),
        color: String(it.color || ''),
        quantity: Number(it.quantity),
      })),
      subtotal: Number(row.subtotal),
      discount: Number(row.discount || 0),
      shipping: Number(row.shipping || 0),
      tax: Number(row.tax || 0),
      total: Number(row.total),
      paymentMethod: row.payment_method as Order['paymentMethod'],
      status: (row.status as OrderStatus) || 'pending',
      shippingAddress: row.shipping_address as Address,
      createdAt: String(row.created_at),
    })
  }
  return orders
}

async function supabaseUpdateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase!.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

async function supabaseGetStats(): Promise<DashboardStats> {
  const { data: orders } = await supabase!.from('orders').select('*')
  const { count: products } = await supabase!.from('products').select('*', { count: 'exact', head: true })
  const { count: customers } = await supabase!.from('profiles').select('*', { count: 'exact', head: true })
  const { data: allProducts } = await supabase!.from('products').select('*')
  const list = (orders || []) as SupabaseRow[]
  const totalSales = list.reduce((s, o) => s + Number(o.total), 0)
  const dayMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dayMap.set(d, { revenue: 0, orders: 0 })
  }
  for (const o of list) {
    const d = String(o.created_at).slice(0, 10)
    if (dayMap.has(d)) {
      dayMap.get(d)!.revenue += Number(o.total)
      dayMap.get(d)!.orders += 1
    }
  }
  const lowStock = (allProducts || []).filter((p) => {
    const sizes = (p as SupabaseRow).sizes as Product['sizes'] | undefined
    const total = sizes ? sizes.reduce((s, sz) => s + sz.stock, 0) : 0
    return total > 0 && total <= 10
  }).length
  return {
    totalSales,
    orders: list.length,
    customers: customers || 0,
    products: products || 0,
    lowStock,
    revenueByDay: [...dayMap.entries()].map(([day, v]) => ({ day, revenue: v.revenue })),
    ordersByDay: [...dayMap.entries()].map(([day, v]) => ({ day, orders: v.orders })),
    popularProducts: [],
  }
}

async function supabaseCreateProduct(data: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<Product> {
  const { data: row, error } = await supabase!
    .from('products')
    .insert({
      id: makeId('p'),
      slug: data.slug,
      name: data.name,
      category_id: data.categoryId,
      category_name: data.categoryName,
      gender: data.gender,
      price: data.price,
      compare_at_price: data.compareAtPrice,
      description: data.description,
      images: data.images,
      colors: data.colors,
      sizes: data.sizes,
      sku: data.sku,
      technology: data.technology,
      materials: data.materials,
      fit: data.fit,
      care: data.care,
      featured: data.featured,
      trending: data.trending,
      is_new: data.isNew,
      collection_ids: data.collectionIds,
      tags: data.tags,
    })
    .select()
    .single()
  if (error) throw error
  return rowToProduct(row)
}

async function supabaseUpdateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const { data: row, error } = await supabase!.from('products').update(mapProductUpdate(data)).eq('id', id).select().single()
  if (error) throw error
  return rowToProduct(row)
}

function mapProductUpdate(data: Partial<Product>): SupabaseRow {
  const m: SupabaseRow = {}
  if (data.slug !== undefined) m.slug = data.slug
  if (data.name !== undefined) m.name = data.name
  if (data.categoryId !== undefined) m.category_id = data.categoryId
  if (data.categoryName !== undefined) m.category_name = data.categoryName
  if (data.gender !== undefined) m.gender = data.gender
  if (data.price !== undefined) m.price = data.price
  if (data.compareAtPrice !== undefined) m.compare_at_price = data.compareAtPrice
  if (data.description !== undefined) m.description = data.description
  if (data.images !== undefined) m.images = data.images
  if (data.colors !== undefined) m.colors = data.colors
  if (data.sizes !== undefined) m.sizes = data.sizes
  if (data.sku !== undefined) m.sku = data.sku
  if (data.technology !== undefined) m.technology = data.technology
  if (data.materials !== undefined) m.materials = data.materials
  if (data.fit !== undefined) m.fit = data.fit
  if (data.care !== undefined) m.care = data.care
  if (data.featured !== undefined) m.featured = data.featured
  if (data.trending !== undefined) m.trending = data.trending
  if (data.isNew !== undefined) m.is_new = data.isNew
  if (data.collectionIds !== undefined) m.collection_ids = data.collectionIds
  if (data.tags !== undefined) m.tags = data.tags
  return m
}

async function supabaseDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase!.from('products').delete().eq('id', id)
  if (error) throw error
}

async function supabaseCreateCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const { data: row, error } = await supabase!.from('categories').insert({ ...data, id: makeId('cat') }).select().single()
  if (error) throw error
  return rowToCategory(row)
}

async function supabaseUpdateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const { data: row, error } = await supabase!.from('categories').update(data).eq('id', id).select().single()
  if (error) throw error
  return rowToCategory(row)
}

async function supabaseDeleteCategory(id: string): Promise<void> {
  const { error } = await supabase!.from('categories').delete().eq('id', id)
  if (error) throw error
}

async function supabaseCreateCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
  const { data: row, error } = await supabase!.from('collections').insert({
    id: makeId('col'),
    name: data.name,
    slug: data.slug,
    tagline: data.tagline,
    description: data.description,
    image: data.image,
    dark: data.dark,
    category_slugs: data.categorySlugs,
    product_slugs: data.productSlugs,
  }).select().single()
  if (error) throw error
  return rowToCollection(row)
}

async function supabaseUpdateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
  const m: SupabaseRow = {}
  if (data.name !== undefined) m.name = data.name
  if (data.slug !== undefined) m.slug = data.slug
  if (data.tagline !== undefined) m.tagline = data.tagline
  if (data.description !== undefined) m.description = data.description
  if (data.image !== undefined) m.image = data.image
  if (data.dark !== undefined) m.dark = data.dark
  if (data.categorySlugs !== undefined) m.category_slugs = data.categorySlugs
  if (data.productSlugs !== undefined) m.product_slugs = data.productSlugs
  const { data: row, error } = await supabase!.from('collections').update(m).eq('id', id).select().single()
  if (error) throw error
  return rowToCollection(row)
}

async function supabaseDeleteCollection(id: string): Promise<void> {
  const { error } = await supabase!.from('collections').delete().eq('id', id)
  if (error) throw error
}

/* ================================================================== */
/*  Auth (Supabase)                                                   */
/* ================================================================== */

function rowToProfile(row: SupabaseRow): UserProfile {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name || String(row.email).split('@')[0]),
    phone: row.phone ? String(row.phone) : undefined,
    provider: 'email',
    isAdmin: Boolean(row.is_admin),
    addresses: [],
    paymentMethods: [],
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

async function supabaseSignUp(email: string, password: string, name: string): Promise<UserProfile> {
  const { data, error } = await supabase!.auth.signUp({ email, password, options: { data: { name } } })
  if (error) throw error
  if (!data.user) throw new Error('Sign up failed.')
  // Create profile row
  await supabase!.from('profiles').upsert({ id: data.user.id, email, name })
  return {
    id: data.user.id,
    email,
    name,
    provider: 'email',
    isAdmin: false,
    addresses: [],
    paymentMethods: [],
    createdAt: new Date().toISOString(),
  }
}

async function supabaseSignIn(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) throw error
  const user = data.user
  const { data: profile } = await supabase!.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (profile) return rowToProfile(profile)
  await supabase!.from('profiles').upsert({ id: user.id, email: user.email || email })
  return {
    id: user.id,
    email: user.email || email,
    name: user.email?.split('@')[0] || 'Athlete',
    provider: 'email',
    isAdmin: false,
    addresses: [],
    paymentMethods: [],
    createdAt: new Date().toISOString(),
  }
}

async function supabaseSignInWithGoogle(): Promise<UserProfile> {
  const { data, error } = await supabase!.auth.signInWithOAuth({ provider: 'google' })
  if (error) throw error
  // OAuth redirects the page; the session is picked up by onAuthStateChange
  return data as unknown as UserProfile
}

async function supabaseSignOut(): Promise<void> {
  await supabase!.auth.signOut()
}

async function supabaseGetSession(): Promise<UserProfile | null> {
  const { data } = await supabase!.auth.getSession()
  const session = data.session
  if (!session?.user) {
    // No Supabase session (e.g. email not yet confirmed). If a demo session
    // exists (created when the app fell back to demo auth), keep the user
    // signed in across page loads instead of silently logging them out.
    return getDemoSession().user
  }
  const { data: profile } = await supabase!.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
  if (profile) return rowToProfile(profile)
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.email?.split('@')[0] || 'Athlete',
    provider: 'email',
    isAdmin: false,
    addresses: [],
    paymentMethods: [],
    createdAt: new Date().toISOString(),
  }
}

async function supabaseResetPassword(email: string): Promise<void> {
  const { error } = await supabase!.auth.resetPasswordForEmail(email)
  if (error) throw error
}

async function supabaseUpdateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const m: SupabaseRow = {}
  if (data.name !== undefined) m.name = data.name
  if (data.phone !== undefined) m.phone = data.phone
  const { data: row, error } = await supabase!.from('profiles').update(m).eq('id', userId).select().single()
  if (error) throw error
  return rowToProfile(row)
}

/* ================================================================== */
/*  Unified API with fallback                                         */
/* ================================================================== */

const SUPABASE_TIMEOUT_MS = 8000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) },
    )
  })
}

function dual<A extends unknown[], R>(
  demo: (...args: A) => Promise<R>,
  supabase: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return async (...args: A) => {
    if (activeBackend === 'supabase') {
      try {
        return await withTimeout(supabase(...args), SUPABASE_TIMEOUT_MS)
      } catch (e) {
        markDemo(e)
        console.warn('[VOLTERRA] Supabase error:', e)
      }
    }
    return demo(...args)
  }
}

export const api = {
  getCategories: dual(demoGetCategories, supabaseGetCategories),
  getCollections: dual(demoGetCollections, supabaseGetCollections),
  getProducts: dual(demoGetProducts, supabaseGetProducts),
  getProductBySlug: dual(demoGetProductBySlug, supabaseGetProductBySlug),
  getProductById: dual(demoGetProductById, supabaseGetProductById),
  getReviews: dual(demoGetReviews, supabaseGetReviews),
  addReview: dual(demoAddReview, supabaseAddReview),
  createOrder: dual(demoCreateOrder, supabaseCreateOrder),
  getOrders: dual(demoGetOrders, supabaseGetOrders),
  updateOrderStatus: dual(demoUpdateOrderStatus, supabaseUpdateOrderStatus),
  getStats: dual(demoGetStats, supabaseGetStats),
  createProduct: dual(demoCreateProduct, supabaseCreateProduct),
  updateProduct: dual(demoUpdateProduct, supabaseUpdateProduct),
  deleteProduct: dual(demoDeleteProduct, supabaseDeleteProduct),
  createCategory: dual(demoCreateCategory, supabaseCreateCategory),
  updateCategory: dual(demoUpdateCategory, supabaseUpdateCategory),
  deleteCategory: dual(demoDeleteCategory, supabaseDeleteCategory),
  createCollection: dual(demoCreateCollection, supabaseCreateCollection),
  updateCollection: dual(demoUpdateCollection, supabaseUpdateCollection),
  deleteCollection: dual(demoDeleteCollection, supabaseDeleteCollection),
  signUp: dual(demoSignUp, supabaseSignUp),
  signIn: dual(demoSignIn, supabaseSignIn),
  signInWithGoogle: dual(demoSignInWithGoogle, supabaseSignInWithGoogle),
  signOut: dual(demoSignOut, supabaseSignOut),
  getSession: dual(demoGetSession, supabaseGetSession),
  resetPassword: dual(demoResetPassword, supabaseResetPassword),
  updateProfile: dual(demoUpdateProfile, supabaseUpdateProfile),
}

/* Demo helpers not in the supabase path */
async function demoGetCategories(): Promise<Category[]> {
  await delay(60)
  return [...demoDB.get().categories].sort((a, b) => a.sortOrder - b.sortOrder)
}

async function demoGetCollections(): Promise<Collection[]> {
  await delay(60)
  return demoDB.get().collections
}

/* ---------- Related products ---------- */

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await api.getProducts({})
  return all
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const score = (p: Product) =>
        (p.categoryName === product.categoryName ? 2 : 0) + (p.gender === product.gender ? 1 : 0) + (p.trending ? 0.5 : 0)
      return score(b) - score(a)
    })
    .slice(0, limit)
}

export async function getProductTotalStock(product: Product): Promise<number> {
  return product.sizes.reduce((s, sz) => s + sz.stock, 0)
}

/* ---------- Cart helpers used by the store ---------- */

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + shipping + tax
  return { subtotal, discount: 0, shipping, tax, total }
}

/* ---------- Cart / wishlist persistence (demo + fallback) ---------- */

export const cartStorage = {
  load: loadCart,
  save: saveCart,
  loadSaved,
  saveSaved,
  loadWishlist,
  saveWishlist,
}

/* ---------- Reviews for display on product pages ---------- */

export async function getReviewStats(reviews: Review[]) {
  const total = reviews.length
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))
  return { total, avg, breakdown }
}

/* ---------- DB access for admin (demo mode) ---------- */

export function demoAdminDB(): DemoDB {
  return demoDB.get()
}

export { demoDB }
