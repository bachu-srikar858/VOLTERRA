import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useStore } from '@/context/StoreContext'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { Price } from '@/components/ui/Price'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
  index?: number
}

export function ProductCard({ product, onQuickView, index = 0 }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, toast } = useStore()
  const [imgError, setImgError] = useState(false)
  const wished = isWishlisted(product.id)
  const totalStock = useMemo(() => product.sizes.reduce((s, sz) => s + sz.stock, 0), [product])
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price
  const secondImage = product.images[1] ?? product.images[0]

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const inStockSize = product.sizes.find((s) => s.stock > 0)
    if (!inStockSize) {
      toast(`${product.name} is out of stock`, 'error')
      return
    }
    addToCart(product, inStockSize.size, product.colors[0]?.name ?? 'One', 1)
  }

  return (
    <article
      className="group relative flex flex-col"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="relative overflow-hidden bg-volt-mist">
        <Link to={`/product/${product.slug}`} className="block" aria-label={product.name}>
          {imgError ? (
            <div className="flex aspect-[4/5] w-full items-center justify-center bg-volt-mist text-volt-graphite/40">
              <span className="font-display text-sm font-bold uppercase">VOLTERRA</span>
            </div>
          ) : (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              width={600}
              height={750}
              onError={() => setImgError(true)}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          )}
        </Link>

        {/* Hover second image */}
        {!imgError && secondImage !== product.images[0] && (
          <img
            src={secondImage}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {onSale && <Badge tone="orange">Sale</Badge>}
          {product.isNew && <Badge tone="black">New</Badge>}
          {totalStock === 0 && <Badge tone="danger">Out of stock</Badge>}
          {totalStock > 0 && totalStock <= 5 && <Badge tone="danger">Only {totalStock} left</Badge>}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product)
          }}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className={cn(
            'absolute right-2 top-2 flex size-9 items-center justify-center transition-all duration-300',
            wished ? 'bg-volt-orange text-white' : 'bg-white/90 text-volt-black hover:bg-white',
          )}
        >
          <Heart className={cn('size-4', wished && 'fill-current')} />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-2 bottom-2 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onQuickView(product)
              }}
              className="flex flex-1 items-center justify-center gap-1.5 bg-white py-2.5 text-[11px] font-display font-bold uppercase tracking-[0.1em] text-volt-black transition-colors hover:bg-volt-black hover:text-white"
            >
              <Eye className="size-3.5" /> Quick view
            </button>
          )}
          <button
            type="button"
            onClick={quickAdd}
            disabled={totalStock === 0}
            aria-label={`Quick add ${product.name} to bag`}
            className="flex items-center justify-center gap-1.5 bg-volt-black px-4 py-2.5 text-[11px] font-display font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-volt-orange disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="size-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-display font-bold uppercase tracking-[0.12em] text-volt-graphite/60">
            {product.categoryName}
          </p>
          <Link to={`/product/${product.slug}`} className="mt-0.5 block truncate text-sm font-semibold text-volt-black hover:underline">
            {product.name}
          </Link>
          <div className="mt-1 flex items-center gap-1.5">
            <Rating value={product.rating} showValue />
            <span className="text-[11px] text-volt-graphite/50">({product.reviewCount})</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 pt-4">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="size-3.5 rounded-full border border-volt-black/15"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </article>
  )
}
