export type Gender = 'men' | 'women' | 'unisex' | 'kids'

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  sortOrder: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  image: string
  dark: boolean
  categorySlugs: string[]
  productSlugs: string[]
}

export interface ProductSize {
  size: string
  stock: number
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  slug: string
  name: string
  categoryId: string
  categoryName: string
  gender: Gender
  price: number
  compareAtPrice: number | null
  rating: number
  reviewCount: number
  description: string
  images: string[]
  colors: ProductColor[]
  sizes: ProductSize[]
  sku: string
  technology: string[]
  materials: string
  fit: string
  care: string[]
  featured: boolean
  trending: boolean
  isNew: boolean
  collectionIds: string[]
  tags: string[]
  createdAt: string
}

export interface Review {
  id: string
  productId: string
  userName: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
}

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  image: string
  price: number
  size: string
  color: string
  quantity: number
  stock: number
}

export interface Address {
  id: string
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  isDefault: boolean
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'upi'
  label: string
  last4?: string
  upiId?: string
}

export interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  size: string
  color: string
  quantity: number
}

export type PaymentMethodType = 'card' | 'upi' | 'cod'
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  userId: string | null
  email: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentMethod: PaymentMethodType
  status: OrderStatus
  shippingAddress: Address
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  provider: 'email' | 'google' | 'demo'
  isAdmin: boolean
  addresses: Address[]
  paymentMethods: PaymentMethod[]
  createdAt: string
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest'
  | 'name-asc'

export interface ProductFilters {
  category?: string
  gender?: Gender | ''
  sizes?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
  sale?: boolean
  search?: string
  sort?: SortOption
  collection?: string
  query?: string
}

export interface DashboardStats {
  totalSales: number
  orders: number
  customers: number
  products: number
  lowStock: number
  revenueByDay: { day: string; revenue: number }[]
  ordersByDay: { day: string; orders: number }[]
  popularProducts: { name: string; sold: number }[]
}

export interface CartTotals {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
}
