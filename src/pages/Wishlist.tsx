import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSEO } from '@/lib/seo'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function Wishlist() {
  useSEO('Wishlist', 'Your saved VOLTERRA products, all in one place.')
  const { wishlistIds, toggleWishlist, addToCart, toast } = useStore()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const all = await api.getProducts({})
      if (!cancelled) {
        setProducts(all.filter((p) => wishlistIds.includes(p.id)))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wishlistIds])

  const total = useMemo(() => products.reduce((s, p) => s + p.price, 0), [products])

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
        <h1 className="display text-4xl sm:text-6xl">Wishlist</h1>
        <div className="mt-10"><ProductGridSkeleton count={8} /></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-24">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart on any product to save it here for later."
          action={() => navigate('/shop')}
          actionLabel="Discover products"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl sm:text-6xl">Wishlist</h1>
          <p className="mt-3 text-sm text-volt-graphite/70">
            {products.length} {products.length === 1 ? 'item' : 'items'} · {formatPrice(total)} total
          </p>
        </div>
        <Button onClick={() => navigate('/shop')}>Shop more</Button>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const inStock = p.sizes.some((s) => s.stock > 0)
          const inStockSize = p.sizes.find((s) => s.stock > 0)
          return (
            <li key={p.id} className="group">
              <div className="relative overflow-hidden bg-volt-mist">
                <Link to={`/product/${p.slug}`} className="block">
                  <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWishlist(p)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="absolute right-2 top-2 flex size-9 items-center justify-center bg-volt-orange text-white"
                >
                  <Heart className="size-4 fill-current" />
                </button>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-display font-bold uppercase tracking-[0.12em] text-volt-graphite/60">{p.categoryName}</p>
                  <Link to={`/product/${p.slug}`} className="mt-0.5 block text-sm font-semibold hover:underline">{p.name}</Link>
                  <p className="mt-1 text-sm font-semibold">{formatPrice(p.price)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  fullWidth
                  disabled={!inStock}
                  onClick={() => {
                    if (inStockSize) {
                      addToCart(p, inStockSize.size, p.colors[0]?.name ?? 'One', 1)
                      toast(`${p.name} added to bag`)
                    }
                  }}
                >
                  <ShoppingBag className="size-3.5" /> {inStock ? 'Add to bag' : 'Out of stock'}
                </Button>
                <Button size="sm" variant="outline" aria-label={`Remove ${p.name}`} onClick={() => toggleWishlist(p)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
