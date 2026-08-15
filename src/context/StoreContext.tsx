import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { CartItem, Product, UserProfile } from '@/lib/types'
import { api } from '@/lib/api'
import { cartStorage } from '@/lib/api'
import { makeId } from '@/lib/demo/db'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface StoreContextValue {
  user: UserProfile | null
  cart: CartItem[]
  saved: CartItem[]
  wishlistIds: string[]
  cartCount: number
  cartOpen: boolean
  searchOpen: boolean
  toasts: Toast[]
  authLoading: boolean
  setCartOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  toast: (message: string, type?: Toast['type']) => void
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void
  updateCartQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  moveToSaved: (id: string) => void
  moveToCart: (id: string) => void
  removeSaved: (id: string) => void
  clearCart: () => void
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  refreshSession: () => Promise<void>
  signOut: () => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

function wishlistKey(userId: string | null): string {
  return `volterra:wishlist:${userId ?? 'guest'}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Hydrate cart/saved/wishlist synchronously from localStorage so the
  // first persist pass writes real data instead of the initial empty state.
  const [user, setUser] = useState<UserProfile | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => cartStorage.load())
  const [saved, setSaved] = useState<CartItem[]>(() => cartStorage.loadSaved())
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(wishlistKey(null))
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const wishlistKeyRef = useRef(wishlistKey(null))
  const skipWishlistPersist = useRef(true)

  /* ---------- init ---------- */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await api.getSession()
      if (!cancelled) {
        setUser(session)
        setAuthLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /* ---------- persist cart ---------- */
  useEffect(() => {
    cartStorage.save(cart)
  }, [cart])

  useEffect(() => {
    cartStorage.saveSaved(saved)
  }, [saved])

  /* ---------- wishlist persistence (keyed by user) ---------- */
  useEffect(() => {
    const key = wishlistKey(user?.id ?? null)
    wishlistKeyRef.current = key
    try {
      const raw = localStorage.getItem(key)
      setWishlistIds(raw ? (JSON.parse(raw) as string[]) : [])
    } catch {
      setWishlistIds([])
    }
  }, [user?.id])

  useEffect(() => {
    // Skip the very first run so we never overwrite storage with the
    // pre-hydration value when the user key changes (e.g. on mount/login).
    if (skipWishlistPersist.current) {
      skipWishlistPersist.current = false
      return
    }
    try {
      localStorage.setItem(wishlistKeyRef.current, JSON.stringify(wishlistIds))
    } catch {
      /* noop */
    }
  }, [wishlistIds])

  /* ---------- toasts ---------- */
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = makeId('toast')
    setToasts((t) => [...t, { id, message, type }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  /* ---------- cart operations ---------- */
  const addToCart = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((it) => it.productId === product.id && it.size === size && it.color === color)
        if (existing) {
          return prev.map((it) =>
            it.id === existing.id ? { ...it, quantity: Math.min(it.quantity + quantity, Math.max(it.stock, 1)) } : it,
          )
        }
        return [
          ...prev,
          {
            id: makeId('ci'),
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            price: product.price,
            size,
            color,
            quantity,
            stock: product.sizes.find((s) => s.size === size)?.stock ?? 0,
          },
        ]
      })
      toast(`${product.name} added to bag`)
    },
    [toast],
  )

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const max = Math.max(it.stock, 1)
        return { ...it, quantity: Math.max(1, Math.min(quantity, max)) }
      }),
    )
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const moveToSaved = useCallback((id: string) => {
    setCart((prev) => {
      const item = prev.find((it) => it.id === id)
      if (item) setSaved((s) => [...s, item])
      return prev.filter((it) => it.id !== id)
    })
  }, [])

  const moveToCart = useCallback((id: string) => {
    setSaved((prev) => {
      const item = prev.find((it) => it.id === id)
      if (item) setCart((c) => [...c, item])
      return prev.filter((it) => it.id !== id)
    })
  }, [])

  const removeSaved = useCallback((id: string) => {
    setSaved((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  /* ---------- wishlist ---------- */
  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  )

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlistIds((prev) => {
        if (prev.includes(product.id)) {
          toast(`${product.name} removed from wishlist`, 'info')
          return prev.filter((id) => id !== product.id)
        }
        toast(`${product.name} added to wishlist`)
        return [...prev, product.id]
      })
    },
    [toast],
  )

  /* ---------- auth ---------- */
  const refreshSession = useCallback(async () => {
    const session = await api.getSession()
    setUser(session)
    setAuthLoading(false)
  }, [])

  const signOut = useCallback(async () => {
    await api.signOut()
    setUser(null)
    toast('Signed out', 'info')
  }, [toast])

  const value = useMemo<StoreContextValue>(
    () => ({
      user,
      cart,
      saved,
      wishlistIds,
      cartCount: cart.reduce((s, it) => s + it.quantity, 0),
      cartOpen,
      searchOpen,
      toasts,
      authLoading,
      setCartOpen,
      setSearchOpen,
      toast,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      moveToSaved,
      moveToCart,
      removeSaved,
      clearCart,
      isWishlisted,
      toggleWishlist,
      refreshSession,
      signOut,
    }),
    [user, cart, saved, wishlistIds, cartOpen, searchOpen, toasts, authLoading, toast, addToCart, updateCartQuantity, removeFromCart, moveToSaved, moveToCart, removeSaved, clearCart, isWishlisted, toggleWishlist, refreshSession, signOut],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
